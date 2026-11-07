import json
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.brand_kit import BrandKit, BrandAsset, BrandRule
from app.visual.brand_visual_checker import BrandVisualChecker
from app.services.ocr_service import ImageOcrService
from app.rules.engine import DeterministicRuleEngine
from app.core.config import settings

router = APIRouter(prefix="/visual", tags=["Visual Brand Checker"])

@router.post("/check")
async def check_visual_compliance(
    text_color: str = Form("#0F172A"),
    background_color: str = Form("#F8FAFC"),
    brand_kit_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Module 10: Smart Brand Visual & WCAG Accessibility Checker + Multimodal Label OCR.
    Calculates exact WCAG 2.1 contrast ratio, verifies colors against Brand Kit,
    and inspects packaging text printed on product images.
    """
    # Fetch approved brand palette & rules
    kit = db.query(BrandKit).filter(BrandKit.id == brand_kit_id).first() if brand_kit_id else db.query(BrandKit).first()
    palette = [
        {"name": "Sky Primary", "hex": "#0284C7"},
        {"name": "Teal Botanical", "hex": "#0D9488"},
        {"name": "Slate Navy", "hex": "#0F172A"},
        {"name": "Soft Clean White", "hex": "#F8FAFC"},
        {"name": "Amber Alert", "hex": "#F59E0B"}
    ]
    rules = []
    if kit:
        rules = db.query(BrandRule).filter(BrandRule.brand_kit_id == kit.id, BrandRule.is_active == True).all()
        palette_asset = db.query(BrandAsset).filter(
            BrandAsset.brand_kit_id == kit.id,
            BrandAsset.asset_type == "color_palette"
        ).first()
        if palette_asset and palette_asset.value:
            try:
                palette = json.loads(palette_asset.value)
            except Exception:
                pass

    temp_path = "uploads/temp_visual_audit.png"
    ocr_result = None
    if file:
        file_bytes = await file.read()
        with open(temp_path, "wb") as f:
            f.write(file_bytes)
        # Run multimodal OCR on uploaded product image
        ocr_result = ImageOcrService.extract_text_from_image(temp_path)

    audit_result = BrandVisualChecker.audit_image(
        image_path=temp_path,
        approved_palette=palette,
        text_color_hex=text_color,
        bg_color_hex=background_color
    )

    # If OCR detected label text, run deterministic rule engine on packaging text
    if ocr_result and ocr_result.get("text"):
        packaging_findings = DeterministicRuleEngine.run_checks(ocr_result["text"], rules)
        audit_result["packaging_ocr"] = ocr_result
        audit_result["packaging_text"] = ocr_result["text"]
        
        # Merge packaging findings
        for pf in packaging_findings:
            audit_result["findings"].append({
                "type": "packaging_claim_violation",
                "severity": pf.get("severity", "high"),
                "title": f"Packaging Label Violation: {pf.get('title')}",
                "expected": "Compliant packaging claims verified against brand dossier",
                "actual": f"Detected printed claim '{pf.get('original_text')}' on packaging label",
                "confidence": pf.get("confidence", 0.95),
                "suggestion": pf.get("suggested_fix", "Remove or rephrase printed claim.")
            })

    return audit_result

