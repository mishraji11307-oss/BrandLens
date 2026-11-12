# BrandLens — AI-Powered Brand Governance & Content Compliance Platform

> **"Catch Brand Mistakes Before Content Goes Live."**  
> **Inkloom AI | CodeNexus India 2026 | Round 3: The Finish | Team V4Vantage**

---

## 👥 Team V4Vantage
- **Kushagra Mishra** — AI & Architecture Lead
- **Priyanshu Mishra** — Full-Stack Engineer & Product
- **Prajjval Khare** — Backend & Regulatory Systems
- **Saumy Agrahari** — Frontend & UI/UX Design

---

## 1. Product Vision & Overview

In modern enterprises and agile marketing teams, multiple employees, agency partners, freelancers, and generative AI tools create content across blogs, Instagram, LinkedIn, paid ads, and packaging. Consequently, marketing materials frequently contain:
- Unapproved or exaggerated curative claims (e.g. *"cures acne in 7 days"*).
- Prohibited absolute guarantees (e.g. *"guaranteed results"*).
- Missing mandatory commercial disclosures (e.g. missing `#Ad`, `#Sponsored` per ASCI & FTC rules).
- Unsubstantiated superlatives (e.g. *"#1 in India"*, *"best sunscreen in the world"*).
- Outdated or expired clinical study citations.
- Deviant brand tone, voice, and WCAG visual color contrast failures.

**BrandLens** solves this by creating an automated, closed-loop pre-publication governance workspace. Organisations define their official **Brand Kit** (identity, tone, prohibited terminology, verified facts, approved regulatory claims, active regulatory packs, and visual palettes). When creators upload marketing copy or creative assets, BrandLens inspects the content against the Brand Kit, highlights violations with page-numbered guideline citations, suggests verified fixes, and facilitates human manager sign-off with cryptographic PDF clearance certificates.

### Core Product Principle
> **AI finds the issue.**  
> **AI explains the issue.**  
> **AI suggests the fix.**  
> **Humans make the final decision.**  
> *Nothing is silently modified or published automatically.*

---

## 2. Round 3 Promised Features & Implementation Matrix

All promised features from the pitch deck (Slides 8, 9, 11, 14, and 19) are fully built, tested, and integrated:

| Slide | Promised Feature | Technical Implementation | Status |
|---|---|---|:---:|
| **Slide 9** | **Visual Redline Diff** (v1 vs v2 with Score Delta) | Word-level LCS diff algorithm with color-coded strike-through deletions (red) and insertions (green), audited modifications ledger, and dynamic score delta (`+15 pts Score Change`). | ✅ Complete |
| **Slide 9** | **Disclosure Guard** (ASCI & FTC Rule Packs) | Automated pattern detection for commercial/influencer posts lacking `#Ad`, `#Sponsored`, or `#Collab`. Flags unverified superlatives (`#1 in India`). 1-click automatic tag injection. | ✅ Complete |
| **Slide 9 & 11** | **Multimodal Image OCR Scanner** | Extracts printed text from physical packaging and social banner creatives with an interactive **Creator Confirmation Canvas** (Step 2) before initiating review. | ✅ Complete |
| **Slide 14 & 19** | **Cryptographic Clearance Certificate** | Downloadable tamper-evident PDF certificate generated via ReportLab with SHA-256 integrity hash, reviewer sign-off block, and active regulatory packs. | ✅ Complete |
| **Slide 11 & 14** | **Claim Evidence Dossier Linking** | Approved claims (e.g., AC-12, FACT-02) link directly to clinical trials, methodology, and external regulatory documentation. | ✅ Complete |
| **Slide 11 & 14** | **Social Ad Simulator (Instagram + LinkedIn + Google Ads)** | Real-time multi-channel creative simulator with sponsored labels, headline, URL breadcrumb, and violation indicators. | ✅ Complete |
| **Slide 14** | **Live In-App Notification Drawer** | Real-time bell notification drawer displaying high-risk findings, review assignments, and approval decisions with unread counters. | ✅ Complete |
| **Slide 11** | **Interactive 7-Step Judge Demo Flow** | Guided walkthrough in the top navigation covering every step of the pitch deck journey. | ✅ Complete |

---

## 3. The 7-Step Judge Demo Flow (Slide 11 Walkthrough)

Judges can click the **"Judge 7-Step Tour"** pill in the top navigation at any time to follow this exact sequence:

1. **Step 1: Upload Packaging Image / Banner Creative**: Creator uploads packaging image (e.g., GlowCare Sunscreen Packaging) or clicks the quick-test preset.
2. **Step 2: Multimodal OCR Extraction & Creator Confirmation**: System extracts text from packaging into an editable confirmation canvas, allowing creator review before submission.
3. **Step 3: Layer 1 Deterministic Flagging**: Rule engine instantly catches prohibited terms (`cures acne`, `guaranteed results`, `#1 in India`) and missing disclosures (`#Ad`).
4. **Step 4: Layer 2 Regulatory RAG Citation**: Every finding cites the official source (ASCI Code Sec 1.4, FTC Endorsement Guides, Brand Guidelines pg. 14) and links to Clinical Trial Dossiers.
5. **Step 5: Split-Screen Redline Diff Review & 1-Click Fix**: Creator reviews findings side-by-side, clicks "Apply Fix" or uses Disclosure Guard to add `#Ad`, and resubmits as **v2** to see the word-level redline diff and score delta (+15 pts).
6. **Step 6: Social Ad Simulator Live Preview**: Preview the ad across Instagram, LinkedIn, and Google Ads Search formats to ensure layout integrity and compliance.
7. **Step 7: Manager Approval & Cryptographic PDF Certificate**: Compliance manager signs off with rationale, generating a downloadable tamper-evident PDF certificate with SHA-256 hash.

---

## 4. System Architecture & 3-Layer Hybrid AI Review Engine

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
│ • Prohibited / preferred terminology enforcement            │
│ • ASCI India Code 2024 & FTC Endorsement Guide Packs        │
│ • Missing commercial disclosure detection (#Ad, #Sponsored) │
│ • 100% reliable offline operation (zero hallucinations)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: RAG VECTOR RETRIEVAL & CLINICAL EVIDENCE DOSSIERS  │
│ • Chunks official Brand Guidelines PDF/DOCX                 │
│ • Ingests approved regulatory claims and clinical facts     │
│ • TF-IDF / pgvector cosine similarity retrieval             │
│ • Extracts exact source citations (doc, section, page, id)  │
│ • Direct links to clinical research dossiers (AC-12, FACT-2)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: CONTEXTUAL AI & REWRITE ASSISTANT                  │
│ • Evaluates brand voice, superlatives, and temporal claims  │
│ • Configurable LLM (OpenAI, Gemini, Anthropic, or Heuristic)│
│ • Smart Rewrite Assistant: Professional, Conversational,    │
│   100% Compliant, and Concise social variations             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ HUMAN-IN-THE-LOOP APPROVAL WORKFLOW & CLEARANCE             │
│ • Split-Screen findings workspace + Visual Redline Diff     │
│ • Accept (applies only to working copy; never touches orig)  │
│ • Edit, Dismiss (with reason), Dispute (logs for insights)  │
│ • Reviewer sign-off (Approve, Reject, Request Changes)      │
│ • Tamper-evident PDF Clearance Certificate + SHA-256 Hash   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

### Frontend
- **React 18** with **TypeScript** and **Vite**
- **Watermelon UI Design System** (`https://ui.watermelon.sh/`):
  - Soft lavender (`#FAF8FF`) canvas with atmospheric mesh gradients
  - Crisp white frosted glass surfaces (`.glass-panel`, backdrop-blur)
  - Indigo/violet primary accents (`#6366F1`, `#8B5CF6`) with glowing borders (`glow-sm`, `glow-md`, `card-hover`)
  - Bento grid cards with animated hover states and radial metric rings
  - Micro-interactions (animated pill indicators, status dot pulses, button shimmers)
- **Visual Redline Diff**: Custom LCS word-level diff renderer with score change tracking
- **Social Ad Simulator**: Instagram feed, LinkedIn sponsored post, and Google Ads search result previews
- **Lucide React** for enterprise iconography
- **React Router v6** for client-side routing
- **Axios** with Bearer token interceptor and CSRF mitigation

### Backend
- **Python 3.11+ / 3.14** with **FastAPI**
- **SQLAlchemy 2.0** ORM (multi-dialect: SQLite for instant zero-dependency local runs, PostgreSQL + pgvector for production)
- **ReportLab 5.0** for Cryptographic PDF Clearance Certificate generation
- **Pillow & OpenCV** for image OCR parsing and WCAG 2.1 contrast calculations
- **Pydantic v2** for request/response validation
- **Bcrypt** native password hashing
- **PyJWT / python-jose** for short-lived access and refresh tokens

---

## 6. Getting Started & Running Locally

### Method 1: Unified Zero-Config Runner (Recommended)
```bash
# 1. Run all automated backend tests
python brandlens/backend/run_tests.py

# 2. Start the unified server
cd brandlens/backend
python run.py
```
Open **`http://localhost:8000`** in your browser.

### Method 2: Separate Frontend Dev Server
```bash
# Backend (Terminal 1)
cd brandlens/backend
python run.py

# Frontend (Terminal 2)
cd brandlens/frontend
npm run dev
```
*(Runs frontend on http://localhost:5173 with automatic API proxy to port 8000)*

### Method 3: Docker Compose
```bash
cd brandlens
docker-compose up --build
```
*(Frontend on http://localhost:80, Backend on http://localhost:8000, PostgreSQL on 5432)*

---

## 7. REST API Documentation

Interactive OpenAPI Swagger UI is available at **`/docs`** (or **`/redoc`**).

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/demo-login` | 1-Click judge demo login (Creator, Reviewer, Admin) | Public |
| `POST` | `/api/auth/login` | Email/password authentication | Public |
| `POST` | `/api/auth/register` | Create user and organization | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | Any |
| `GET` | `/api/brand-kits` | List active organization brand kits | Any |
| `POST` | `/api/brand-kits/{id}/rules` | Add prohibited or preferred term rule | Admin |
| `GET` | `/api/brand-kits/{id}/regulatory-packs` | List active regulatory rule packs (ASCI, FTC, Health) | Any |
| `POST` | `/api/brand-kits/{id}/regulatory-packs/toggle` | Enable or disable regulatory rule pack | Admin |
| `POST` | `/api/brand-kits/{id}/documents`| Upload & chunk guideline PDF/DOCX for RAG | Admin |
| `POST` | `/api/content/upload` | Upload text or document (PDF/DOCX/PNG) | Creator |
| `POST` | `/api/content/ocr-extract` | Multimodal OCR text extraction from packaging/banners | Creator |
| `POST` | `/api/content/review/{id}` | Run 3-layer hybrid AI review engine | Creator |
| `POST` | `/api/content/{id}/resubmit` | Resubmit content as v2 working revision and re-analyze | Creator |
| `GET` | `/api/content/{id}/revisions` | Fetch revision history (v1 original vs v2 working copy) | Creator / Reviewer |
| `POST` | `/api/content/rewrite` | Smart Rewrite Assistant (4 variations) | Creator |
| `POST` | `/api/findings/{id}/accept` | Accept fix (updates working revision) | Creator |
| `POST` | `/api/findings/{id}/edit` | Apply custom phrasing fix | Creator |
| `POST` | `/api/findings/{id}/dismiss`| Dismiss finding with justification | Creator |
| `POST` | `/api/findings/{id}/dispute`| Dispute rule (logs for intelligence) | Creator |
| `POST` | `/api/content/{id}/submit-approval`| Submit content to manager queue | Creator |
| `GET` | `/api/approvals/pending` | List pending approval queue | Reviewer / Admin |
| `POST` | `/api/approvals/{id}/approve` | Sign-off content (Publish Ready) | Reviewer / Admin |
| `POST` | `/api/approvals/{id}/reject` | Reject content with rationale | Reviewer / Admin |
| `GET` | `/api/approvals/{id}/certificate/pdf` | Download Cryptographic Clearance Certificate (PDF + SHA-256) | Creator / Reviewer |
| `GET` | `/api/notifications` | Fetch live in-app notification feed & unread count | Any |
| `POST` | `/api/notifications/{id}/read` | Mark specific notification as read | Any |
| `POST` | `/api/notifications/read-all` | Mark all notifications as read | Any |
| `POST` | `/api/notifications/seed-demo` | Seed realistic demo notifications | Any |
| `GET` | `/api/insights/overview` | Governance metrics and Smart Insights | Any |
| `POST` | `/api/visual/check` | Dominant colors & WCAG contrast audit | Any |
| `GET` | `/api/audit-logs` | Immutable event audit trail | Any |

---

## 8. Verification & Test Results

Run the full automated test suite anytime with:
```bash
python brandlens/backend/run_tests.py
```

### Automated Suite Coverage:
1. **Database & Demo Seeding**: Multi-tenant database initialization & GlowCare Skincare demo seed.
2. **Layer 1 Deterministic Rule Engine**: Regex prohibited term detection (`cures acne`, `guaranteed results`).
3. **Compliance Score Engine**: Exact score deduction formula & high-risk critical issue cap.
4. **Resolution Point Recovery**: Dynamic score recalculation upon accepting fixes.
5. **Security, Hashing & JWT**: Bcrypt salt hashing and JWT token signing.
6. **Visual Brand Checker (WCAG)**: Contrast ratio calculations for AA and AAA compliance.
7. **Frontend Build Integration**: Verification of production distribution bundle (`dist/`).
8. **ASCI Regulatory Guard & Multimodal Image OCR**: ASCI `#Ad` disclosure and `#1 in India` superlative rules verification + smart packaging label parser.
9. **Cryptographic Clearance Certificate & SHA-256**: Tamper-evident PDF generation via ReportLab and SHA-256 integrity hash verification.

**Result: 9 / 9 Suites Passed (100% Pass Rate).**

---

## 9. Advanced Application Security (OWASP Top 10)

- **Authentication Security**: Native Bcrypt hashing with random salt rounds (passwords never stored in plain text). Short-lived JWT access tokens with HMAC-SHA256 signature verification.
- **Role-Based Access Control (RBAC)**: Backend endpoint enforcement prevents creators from executing manager approvals or modifying brand kits.
- **Tenant Isolation**: All queries enforce strict organization-level scoping; cross-organization data retrieval is impossible.
- **Security Headers Middleware**: Implements OWASP response headers:
  - `Content-Security-Policy`: Restricts script and object sources.
  - `X-Frame-Options: DENY`: Blocks clickjacking attacks.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- **Safe File Ingestion**: Validates binary magic signatures (preventing executable upload attacks).
- **Prompt Injection Defense**: Untrusted user and document text is treated strictly as data within system instruction boundaries.
- **Cryptographic Tamper-Evidence**: Published content records carry a SHA-256 hash computed over the approved text, revision number, reviewer identity, timestamp, and active regulatory packs.

---

## 10. License

This project is open-source and licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 Team V4Vantage · Inkloom AI | CodeNexus India 2026.

---

*BrandLens — Built with pride by Team V4Vantage for Inkloom AI @ CodeNexus India 2026.*
