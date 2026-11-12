# BrandLens — Round 3 Official Submission Dossier

> **Event:** CodeNexus India 2026 by We Code Coders  
> **Problem Statement:** Inkloom AI — Brand Governance & Content Compliance  
> **Round:** Round 3: The Finish (72-Hour Final Hackathon Window)  
> **Team Name:** Team V4Vantage  
> **Team Lead:** Priyanshu Mishra (`rogerthat0400@gmail.com`)  
> **Date of Submission:** 12th November 2026  

---

## 📋 Executive Submission Checklist

| Required Submission Item | Document / Artifact Reference | Status |
|---|---|:---:|
| **1. Final Working Project Link** | Local unified server (`http://localhost:8000`), Docker Compose & Render (`render.yaml`) | ✅ Complete |
| **2. Final Source-Code Repository** | Clean Git repository, zero leaked secrets, full history | ✅ Complete |
| **3. Final Product PDF** | [`BrandLens_Round3_Product_Dossier.pdf`](./BrandLens_Round3_Product_Dossier.pdf) | ✅ Complete |
| **4. Complete List of Features Built** | Detailed breakdown of Brand Kit, 3-Layer Engine, Approvals & Visual Audit | ✅ Complete |
| **5. Technical Architecture & Summary** | Full-stack specification (FastAPI, React 18, SQLAlchemy, ReportLab, OpenCV) | ✅ Complete |
| **6. Improvements Completed After Round 2** | The 3 named improvements + 5 enterprise extensions | ✅ Complete |
| **7. Testing Details** | 9/9 automated suites passing (100%), frontend build verified | ✅ Complete |
| **8. Product Roadmap & Future Plan** | 3-phase strategic roadmap (Q1, Q2, Q3 2027) | ✅ Complete |

---

## 1. The Final Working Project Link

### Local Production Server (Zero Setup)
- **Primary Live Link**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Technical Interface**: `http://localhost:8000/redoc`
- **Health Check Endpoint**: `http://localhost:8000/health`

### 1-Click Launch Instructions for Judges:
```powershell
# Windows 1-click execution:
.\start_brandlens.bat
```
*Or manual terminal start:*
```bash
# 1. Run full test suite (100% pass)
python brandlens/backend/run_tests.py

# 2. Launch unified server (FastAPI serves both REST API + Production React SPA)
cd brandlens/backend
python run.py
```
> **Judge Note:** In the top navigation, click **"Judge 7-Step Tour"** to launch an interactive, self-guided tour of the complete submission flow without needing a live walkthrough.

---

## 2. The Final Source-Code Repository

- **Repository Root:** `c:\Users\Lenovo\Documents\CodeNexus`
- **Clean Commits & Branching:** Main branch with clean commit history, `.gitignore` filtering virtual environments, caches, and test artifacts.
- **Zero Secrets Policy:** No API keys or credentials committed; all demo accounts work offline out of the box with SQLite demo data.

---

## 3. The Final Product PDF

- **File Path:** [`BrandLens_Round3_Product_Dossier.pdf`](./BrandLens_Round3_Product_Dossier.pdf)
- **Format:** High-resolution PDF generated via ReportLab containing:
  - Team credentials and participation verification
  - Feature delivery matrix matching Round 2 pitch deck
  - Technical architecture & OWASP security highlights
  - Automated test suite results
  - Product roadmap for 2027 enterprise rollout

---

## 4. Complete List of Features Built

BrandLens is a complete, closed-loop pre-publication governance platform:

### A. Brand Kit & Guideline Management
1. **Multi-Document Ingestion:** Uploads guidelines (PDF, DOCX) and chunks them for semantic vector retrieval.
2. **Deterministic Prohibited Rules:** High-precision regex rules flagging banned terms (e.g., `cures acne`, `guaranteed results`) with page citations.
3. **Regulatory Rule Packs:** 1-click toggle for ASCI India Code 2024, FTC Endorsement Guides, and FDA/CDSCO Health Claims.
4. **Clinical Claim Evidence Dossier:** Approved claims (`AC-12`, `FACT-02`) link directly to verified clinical trial documentation.
5. **Visual Identity Engine:** Palette configuration, hex code extraction, and WCAG 2.1 contrast ratio analysis.

### B. 3-Layer Hybrid AI Review Engine
6. **Layer 1 (Deterministic Rules):** High-speed regex checks operating 100% offline with zero hallucinations.
7. **Layer 2 (RAG Vector Store):** Semantic grounding connecting findings directly to official guidelines.
8. **Layer 3 (Contextual AI & Rewrites):** Evaluates tone, superlatives, and offers 4 rewrite modes (Professional, Conversational, Compliant, Social).

### C. Human-in-the-Loop Review Workspace
9. **Split-Screen Review Workspace:** Synchronized side-by-side view linking original copy to violation findings.
10. **Audited Creator Actions:** Accept (applies only to working copy; never touches original draft), Edit, Dismiss with reason, or Dispute.
11. **Visual Redline Diff (Slide 9 Differentiator):** Word-level LCS comparison with deletions in red strikethrough, additions in emerald green, and dynamic score delta (`+15 pts`).
12. **Social Ad Simulator:** Live multi-channel preview in Instagram Feed, LinkedIn Sponsored Post, and Google Ads Search formats.

### D. Approvals, Certification & Governance
13. **Strict RBAC Manager Queue:** Dedicated Reviewer/Admin view with 1-click role switcher for judges.
14. **Cryptographic PDF Clearance Certificate:** ReportLab PDF certificate with SHA-256 tamper-evident integrity hash.
15. **Live In-App Notification Drawer:** Real-time alerts for high-risk findings, pending approvals, and manager decisions.
16. **Governance Insights Dashboard:** High-frequency mistake analytics, unclear guideline discovery, and compliance health trends.
17. **Immutable Audit Trail:** Append-only event ledger logging every creator and reviewer action.

---

## 5. Technical Architecture & Implementation Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      SUBMITTED CONTENT                      │
│        (Direct Text, OCR Packaging Image, PDF, DOCX)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: DETERMINISTIC RULE ENGINE + DISCLOSURE GUARD       │
│ • High-precision regex with word boundaries                 │
│ • ASCI India Code 2024 & FTC Endorsement Guide Packs        │
│ • Missing commercial disclosure detection (#Ad, #Sponsored) │
│ • 100% reliable offline operation (zero hallucinations)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: RAG VECTOR RETRIEVAL & CLINICAL EVIDENCE DOSSIERS  │
│ • Chunks official Brand Guidelines PDF/DOCX                 │
│ • TF-IDF / pgvector cosine similarity retrieval             │
│ • Extracts exact source citations (doc, section, page, id)  │
│ • Direct links to clinical research dossiers (AC-12, FACT-2)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: CONTEXTUAL AI & REWRITE ASSISTANT                  │
│ • Evaluates brand voice, superlatives, and temporal claims  │
│ • Smart Rewrite Assistant: Professional, Conversational,    │
│   100% Compliant, and Concise social variations             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ HUMAN-IN-THE-LOOP APPROVAL WORKFLOW & CLEARANCE             │
│ • Split-Screen findings workspace + Visual Redline Diff     │
│ • Reviewer sign-off (Approve, Reject, Request Changes)      │
│ • Tamper-evident PDF Clearance Certificate + SHA-256 Hash   │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18, TypeScript, Vite, Watermelon UI Design System, Tailwind CSS, Lucide Icons, Axios with CSRF mitigation.
- **Backend:** Python 3.11+ / FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2 validation.
- **Data Layer:** SQLite locally (zero config, zero external daemon) with plug-and-play migration to PostgreSQL 16 + pgvector via `DATABASE_URL`.
- **Security:** Bcrypt salted password hashing, short-lived JWT access tokens, OWASP Top 10 middleware (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff).

---

## 6. Improvements Completed After Round 2

### Exactly the Three Committed Improvements (Slide 14 & 19):

1. **Visual Redline Diff (v1 vs v2 with Score Delta)**
   - *Problem:* Reviewers were forced to re-read entire documents on every revision.
   - *Delivered:* Word-level LCS diff algorithm displaying deletions in red strikethrough, additions in emerald green, live dynamic score change badge (`+15 pts Score Change`), and an audited modification ledger.
2. **Disclosure Guard (ASCI & FTC Rule Packs)**
   - *Problem:* Sponsored posts lacking commercial disclosures mislead consumers and trigger regulatory penalties.
   - *Delivered:* Automated rule engine checks commercial copy against ASCI India Code 2024 and FTC Endorsement Guides. Flags missing `#Ad`, `#Sponsored`, `#Collab`, and unverified superlatives (`#1 in India`), with 1-click automatic tag insertion.
3. **Multimodal Image OCR Scanner**
   - *Problem:* Claims on product packaging and ad graphics escape text-only review.
   - *Delivered:* Extracts text from packaging bottles, boxes, and social banners. Features the interactive **Creator Confirmation Canvas** (Step 2) allowing creators to inspect and edit extracted copy before running brand checks.

### Additional Enterprise Features Completed:
- **Cryptographic Clearance Certificate (PDF + SHA-256):** ReportLab server-side PDF generation with cryptographic integrity hash.
- **Claim Evidence Dossier Linking:** Direct modal link to clinical trial reports for approved claims.
- **Social Ad Simulator:** Added Google Ads Search layout alongside Instagram and LinkedIn.
- **Live Notification Drawer:** Real-time bell drawer in top navigation with unread count badges.
- **Interactive 7-Step Judge Demo Tour:** Guided walkthrough modal directly in the application.

---

## 7. Testing Details & Reliability Under Normal Use

Run the complete backend automated test suite:
```bash
python brandlens/backend/run_tests.py
```

### Automated Suite Results (100% Pass Rate):
- `[PASS]` **1. Database & Demo Seeding:** Multi-tenant organization initialization (`GlowCare Skincare`).
- `[PASS]` **2. Layer 1 Deterministic Engine:** Regex prohibited term detection (`cures acne`, `guaranteed results`).
- `[PASS]` **3. Compliance Scoring Formula:** Exact formula calculation with high-risk critical issue cap.
- `[PASS]` **4. Resolution Recovery Points:** Point recovery upon accepting fixes (`+12 pts`).
- `[PASS]` **5. Security, Hashing & JWT:** Bcrypt random salt rounds and JWT signing verification.
- `[PASS]` **6. Visual Brand Checker (WCAG 2.1):** Contrast ratio validation for AA/AAA standards.
- `[PASS]` **7. Frontend Distribution Integration:** Production Vite build verification (`dist/index.html`).
- `[PASS]` **8. ASCI Guard & Image OCR:** ASCI disclosure, superlative rules, and packaging label parser.
- `[PASS]` **9. Cryptographic Certificate & SHA-256:** PDF clearance record generation and SHA-256 verification.

### Interface Tightening & Edge-Case Resilience:
- **Bad Input Handling:** Empty submissions, missing titles, and invalid file uploads trigger clear inline feedback rather than unhandled exceptions.
- **Empty States:** Friendly empty states with clear calls-to-action on Approval Centre, Review Workspace, and History pages.
- **Refresh Resilience:** Direct URL loading (`/review/:id`, `/approvals`) hydrates properly without crashing.
- **Idempotent Actions:** Accepting fixes or approving submissions prevents duplicate submissions through disabled loading states.

---

## 8. Product Roadmap & Future Development Plan

### Phase 1: Workflow Ecosystem (Q1 2027)
- **Google Docs & Microsoft Word Add-ons:** Real-time compliance checking inside authoring software.
- **Slack & Microsoft Teams Bots:** Interactive approval cards allowing managers to sign off directly in team channels.
- **CMS & Design Plugins:** Pre-publication governance plugins for WordPress, Contentful, and Figma.

### Phase 2: Multimodal & Multilingual Scale (Q2 2027)
- **Video Content Governance:** Frame-by-frame logo clear-space detection, banner overlays, and disclaimer duration audit.
- **Audio Tone Analysis:** Podcast and voiceover transcription with acoustic tone & sentiment scoring.
- **Regional Language Compliance:** Rule packs for 12+ Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, etc.).

### Phase 3: Autonomous Intelligence (Q3 2027)
- **Smarter Guidelines Engine:** Machine learning clustering over repeated creator disputes to recommend clearer, less ambiguous brand guidelines.
- **Enterprise SSO & Private VPC:** SAML 2.0 / Okta integrations and on-premises private LLM deployment for banking and healthcare enterprises.

---

## 👥 Team V4Vantage Contact Information
- **Priyanshu Mishra** (Team Lead, AI Engineer) — `rogerthat0400@gmail.com`
- **Kushagra Mishra** (Product & Frontend) — `mkushagra179@gmail.com`
- **Prajjval Khare** (Backend & Workflows) — `saik5162@gmail.com`
- **Saumy Agrahari** (Data, QA & Docs) — `saumyagrahari3@gmail.com`
- **Institution:** BBDNIIT, Lucknow (2nd Year)

