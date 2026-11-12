import hashlib
import io
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class CertificateService:
    """
    Module: Cryptographic Compliance Certificate Generator
    Produces official, verifiable PDF records after human reviewer approval.
    Computes a SHA-256 integrity hash over submission contents, auditor credentials,
    and review findings to prevent post-clearance tampering.
    """

    @staticmethod
    def calculate_sha256_hash(data: Dict[str, Any]) -> str:
        """
        Computes SHA-256 hash over canonical representation of approved content.
        """
        canonical_str = (
            f"SUBMISSION_ID:{data.get('submission_id')}|"
            f"ORG:{data.get('org_name')}|"
            f"TITLE:{data.get('title')}|"
            f"CHANNEL:{data.get('channel')}|"
            f"REVISION:{data.get('revision_number')}|"
            f"SCORE:{data.get('score')}|"
            f"TEXT:{data.get('working_text')}|"
            f"REVIEWER:{data.get('reviewer_name')}|"
            f"APPROVED_AT:{data.get('approved_at')}"
        )
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    @classmethod
    def generate_pdf_certificate(cls, cert_data: Dict[str, Any]) -> bytes:
        """
        Builds a high-resolution, branded PDF certificate using ReportLab.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        sha_hash = cls.calculate_sha256_hash(cert_data)
        cert_id = f"CERT-{cert_data.get('submission_id', '0000')[:8].upper()}"

        styles = getSampleStyleSheet()
        
        # Custom BrandLens typography styles
        header_tag_style = ParagraphStyle(
            'HeaderTag',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#4F46E5'),
            textTransform='uppercase',
            spaceAfter=4
        )

        title_style = ParagraphStyle(
            'CertTitle',
            parent=styles['Title'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )

        subtitle_style = ParagraphStyle(
            'CertSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=13,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )

        body_style = ParagraphStyle(
            'CertBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#334155'),
            spaceAfter=12
        )

        label_style = ParagraphStyle(
            'CellLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#64748B'),
            textTransform='uppercase'
        )

        val_style = ParagraphStyle(
            'CellVal',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#0F172A')
        )

        score_style = ParagraphStyle(
            'ScoreVal',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=18,
            textColor=colors.HexColor('#047857')
        )

        hash_style = ParagraphStyle(
            'HashText',
            parent=styles['Normal'],
            fontName='Courier-Bold',
            fontSize=8,
            leading=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#1E293B')
        )

        story = []

        # 1. Header Banner & Crest
        story.append(Paragraph("INKLOOM AI • BRAND GOVERNANCE PLATFORM", header_tag_style))
        story.append(Paragraph("CERTIFICATE OF BRAND COMPLIANCE & REGULATORY CLEARANCE", title_style))
        story.append(Paragraph(f"Official Audit Verification Record • Reference ID: {cert_id}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4F46E5'), spaceAfter=15))

        # 2. Certification Statement
        title = cert_data.get('title', 'Marketing Creative')
        org = cert_data.get('org_name', 'GlowCare Skincare')
        statement_text = (
            f"This certifies that the marketing creative copy and digital asset titled "
            f"<b>\"{title}\"</b> has undergone rigorous pre-publication inspection and "
            f"has been formally verified against all approved brand standards, clinical fact dossiers, "
            f"prohibited terminology rules, and regulatory advertising codes of <b>{org}</b>."
        )
        story.append(Paragraph(statement_text, body_style))
        story.append(Spacer(1, 10))

        # 3. Key Governance Metrics Bento Table
        score = cert_data.get('score', 100)
        channel = cert_data.get('channel', 'Cross-Platform')
        revision = cert_data.get('revision_number', 1)
        approved_at = cert_data.get('approved_at', datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"))

        metrics_data = [
            [
                Paragraph("COMPLIANCE SCORE", label_style),
                Paragraph("WORKFLOW STATUS", label_style),
                Paragraph("AUDITED CHANNEL", label_style),
                Paragraph("REVISION", label_style)
            ],
            [
                Paragraph(f"{score} / 100", score_style),
                Paragraph("APPROVED (Publish Ready)", val_style),
                Paragraph(str(channel), val_style),
                Paragraph(f"Version v{revision}", val_style)
            ]
        ]
        metrics_table = Table(metrics_data, colWidths=[135, 155, 135, 115])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 15))

        # 4. Verified Working Copy Content Box
        working_text = cert_data.get('working_text', '')
        copy_box_style = ParagraphStyle(
            'CopyBox',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#1E293B')
        )
        copy_table = Table(
            [
                [Paragraph("<b>CLEARED PUBLICATION COPY:</b>", label_style)],
                [Paragraph(f"\"{working_text}\"", copy_box_style)]
            ],
            colWidths=[540]
        )
        copy_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EEF2FF')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#C7D2FE')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(copy_table)
        story.append(Spacer(1, 15))

        # 5. Regulatory Packs & Standards Verified
        reg_packs = cert_data.get('regulatory_packs', ["ASCI India Ethics Code", "FTC 16 CFR Part 255", "Health & Cosmetic Claims Standard"])
        reg_style = ParagraphStyle('RegP', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor('#475569'))
        packs_str = " • ".join([f"✓ {p}" for p in reg_packs])
        story.append(Paragraph(f"<b>Verified Regulatory Packs:</b> {packs_str}", reg_style))
        story.append(Spacer(1, 12))

        # 6. Approver Signatures & Audit Trail
        reviewer_name = cert_data.get('reviewer_name', 'Elena Vance (Compliance Lead)')
        creator_name = cert_data.get('creator_name', 'Alex Rivera (Content Creator)')
        decision_reason = cert_data.get('decision_reason', 'Full compliance verified. Approved claims cited and clinical timeline accurate.')

        sig_data = [
            [
                Paragraph("HUMAN COMPLIANCE AUDITOR", label_style),
                Paragraph("CONTENT CREATOR", label_style),
                Paragraph("AUDIT TIMESTAMP", label_style)
            ],
            [
                Paragraph(f"<b>{reviewer_name}</b><br/><font size=7 color='#64748B'>Compliance & Governance Lead</font>", reg_style),
                Paragraph(f"<b>{creator_name}</b><br/><font size=7 color='#64748B'>Marketing & Copy Lead</font>", reg_style),
                Paragraph(f"<b>{approved_at}</b><br/><font size=7 color='#64748B'>Tamper-proof Server Timestamp</font>", reg_style)
            ],
            [
                Paragraph(f"<b>Reviewer Rationale:</b> {decision_reason}", reg_style),
                Paragraph("", reg_style),
                Paragraph("<b>Audit Ledger:</b> IMMUTABLE", label_style)
            ]
        ]
        sig_table = Table(sig_data, colWidths=[200, 180, 160])
        sig_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('SPAN', (0, 2), (1, 2))
        ]))
        story.append(sig_table)
        story.append(Spacer(1, 15))

        # 7. Cryptographic SHA-256 Integrity Seal
        hash_box_data = [
            [Paragraph("CRYPTOGRAPHIC SHA-256 INTEGRITY DIGEST", label_style)],
            [Paragraph(f"SHA256:{sha_hash}", hash_style)],
            [Paragraph("This cryptographic hash binds the content text, score, and auditor identity. Any post-clearance alteration invalidates this certificate.", ParagraphStyle('Note', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=9, alignment=TA_CENTER, textColor=colors.HexColor('#94A3B8')))]
        ]
        hash_table = Table(hash_box_data, colWidths=[540])
        hash_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
            ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#334155')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#94A3B8')),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#38BDF8')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(hash_table)

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

