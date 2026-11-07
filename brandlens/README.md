# BrandLens — AI-Powered Brand Governance & Content Compliance Platform

> **"Catch Brand Mistakes Before Content Goes Live."**  
> **Inkloom AI | CodeNexus India 2026 | Round 2 | Team V4Vantage**

---

## 1. Product Vision & Overview

In modern enterprises and agile marketing teams, multiple employees, agency partners, freelancers, and generative AI tools create content across blogs, Instagram, LinkedIn, paid ads, and emails. Consequently, marketing materials frequently contain:
- Unapproved or exaggerated curative claims (e.g. *"cures acne in 7 days"*).
- Prohibited absolute guarantees (e.g. *"guaranteed results"*).
- Outdated or expired factual statistics.
- Deviant brand tone and voice.
- WCAG contrast and visual color inconsistencies.

**BrandLens** solves this by creating an automated, closed-loop pre-publication governance workspace. Organisations define their official **Brand Kit** (identity, tone, prohibited terminology, verified facts, approved regulatory claims, and visual palettes). When creators upload marketing copy or creative assets, BrandLens inspects the content against the Brand Kit, highlights violations with page-numbered guideline citations, suggests verified fixes, and facilitates human manager sign-off.

### Core Product Principle
> **AI finds the issue.**  
> **AI explains the issue.**  
> **AI suggests the fix.**  
> **Humans make the final decision.**  
> *Nothing is silently modified or published automatically.*

---

## 2. System Architecture & 3-Layer Hybrid AI Review Engine

BrandLens implements a 3-layer hybrid AI governance engine:

```
┌─────────────────────────────────────────────────────────────┐
│                      SUBMITTED CONTENT                      │
│             (Direct Text, PDF, DOCX, PNG, JPG)              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: DETERMINISTIC RULE ENGINE                          │
│ • High-precision regex with word boundaries                 │
│ • Prohibited / preferred terminology enforcement            │
│ • Mandatory marketing disclaimer detection                  │
│ • Expired approved fact checks                              │
│ • 100% reliable offline operation (zero hallucinations)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: RAG VECTOR RETRIEVAL (STRICT TENANT ISOLATION)     │
│ • Chunks official Brand Guidelines PDF/DOCX                 │
│ • Ingests approved regulatory claims and clinical facts     │
│ • TF-IDF / pgvector cosine similarity retrieval             │
│ • Extracts exact source citations (doc, section, page, id)  │
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
│ HUMAN-IN-THE-LOOP APPROVAL WORKFLOW                         │
│ • Split-Screen findings workspace                           │
│ • Accept (applies only to working copy; never touches orig)  │
│ • Edit, Dismiss (with reason), Dispute (logs for insights)  │
│ • Reviewer sign-off (Approve, Reject, Request Changes)      │
│ • Formula Compliance Score (Base 100, weighted deductions)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **React 18** with **TypeScript** and **Vite**
- **Watermelon UI Design System** (`https://ui.watermelon.sh/`):
  - Soft lavender (`#FAF8FF`) and off-white background canvas with atmospheric mesh gradients
  - Crisp white frosted glass surfaces (`.glass-panel`, backdrop-blur)
  - Indigo/violet primary accents (`#6366F1`, `#8B5CF6`) with glowing borders (`glow-sm`, `glow-md`, `card-hover`)
  - Bento grid cards with animated hover states and radial metric rings
  - Micro-interactions (animated pill indicators, status dot pulses, button shimmers)
- **Lucide React** for enterprise iconography
- **React Router v6** for client-side routing and protected routes
- **Axios** with Bearer token interceptor and CSRF mitigation

### Backend
- **Python 3.11+ / 3.14** with **FastAPI**
- **SQLAlchemy 2.0** ORM (multi-dialect: SQLite for instant zero-dependency local runs, PostgreSQL + pgvector for production)
- **Pydantic v2** for request/response validation
- **Bcrypt** native password hashing
- **PyJWT / python-jose** for short-lived access and refresh tokens
- **Pillow & OpenCV** for image palette extraction and WCAG 2.1 contrast calculations
- **ReportLab & OpenXML Zip Extractor** for PDF and DOCX document ingestion

### Production Infrastructure
- **Docker & Docker Compose** multi-container setup (Nginx + FastAPI + PostgreSQL pg16 pgvector)
- OWASP security headers (CSP, HSTS, X-Frame-Options DENY, nosniff)

---

## 4. End-to-End Workflow Demonstration

For Round 2 competition evaluation, BrandLens includes a pre-seeded public demo organization: **GlowCare Skincare**.

### 1-Click Judge Access
1. Launch the platform (either via Docker or local runner).
2. Click **"Launch Live Demo"** on the landing page or **"Creator Mode"** / **"Reviewer Mode"** on the login page.
3. No registration required.

### The 10-Step Verifiable Review Cycle
1. **Admin Brand Kit**: Inspect the GlowCare Master Brand Kit with active rules, tone guidelines, clinical facts (`FACT-01`, `FACT-02`), approved claims (`AC-12`), and color palette.
2. **Submit Content**: Click *"1-Click Demo Review"* or paste the sample copy:  
   `"Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula."`
3. **Hybrid AI Analysis**: The backend executes Layer 1 deterministic rules, Layer 2 RAG citation matching, and Layer 3 contextual analysis.
4. **Findings Generated**:
   - `cures acne` flagged as an unsupported curative medical claim (Rule `RULE-TERM-001`, Section 4.1).
   - `guaranteed results` flagged as a prohibited absolute guarantee (Rule `RULE-TERM-002`, Section 3.2, Severity: Critical).
   - `in 7 days` flagged for unsubstantiated rapid clinical timeline (guidelines require 14-day evaluation).
5. **Interactive Split-Screen**: The left panel displays the copy with color-coded severity highlights.
6. **Creator Action**: Click **"Accept Fix"** on `cures acne`. Notice:
   - The fix (`helps reduce the appearance of blemishes`) is applied **ONLY** to the working revision copy.
   - The original draft is preserved intact.
   - The compliance score increases dynamically (+80% recovery).
7. **Smart Rewrite Assistant**: Click *"Smart Rewrite Assistant"* to view 4 AI-generated alternatives (Professional, Conversational, Compliant, Concise).
8. **Submit for Approval**: Creator clicks *"Submit for Approval"* with an optional note. Status transitions to `Pending Approval`.
9. **Manager Approval**: Switch role to **Reviewer** via the top nav bar. Open the **Approval Centre**, inspect the working copy, and click **"Approve"**. Content status becomes **Publish Ready**.
10. **Governance Insights & Audit History**: Open **Governance Insights** and **Review History** to view the updated compliance charts and immutable audit log entry.

---

## 5. Formula-Based Brand Compliance Score (Section 15)

BrandLens does **NOT** ask an LLM to guess a compliance score. Instead, it computes an auditable score using a documented mathematical formula:

$$\text{Base Score} = 100$$

$$\text{Deductions} = \sum (\text{Unresolved Violations} \times \text{Weight})$$

| Severity | Deduction per Open Finding | Recovered on Accepted Fix |
| :--- | :--- | :--- |
| **Critical** | -25 points | +20.0 points (net -5) |
| **High** | -15 points | +12.0 points (net -3) |
| **Medium** | -8 points | +6.4 points (net -1.6) |
| **Low** | -3 points | +2.4 points (net -0.6) |

**Critical Issue Cap Constraint**: If any Critical violation remains open, the maximum possible compliance score is capped at **69** (blocking "Publish Ready" status $\ge 85$).

---

## 6. Smart Brand Visual Checker (Section 10)

BrandLens includes image and color compliance audit tools:
- **Dominant Color Extraction**: Quantized histogram analysis via Pillow extracts dominant canvas colors.
- **WCAG 2.1 Contrast Ratio**:
  $$L = 0.2126 \cdot R + 0.7152 \cdot G + 0.0722 \cdot B$$
  $$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$
  Evaluates compliance against AA (4.5:1 normal, 3.0:1 large) and AAA (7.0:1).
- **Brand Palette Distance**: Computes color divergence between creative dominants and official Brand Kit hex values.

---

## 7. Local Setup & Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Method 1: All-in-One Python Runner (Instant Start)
The backend is already configured to serve the production frontend bundle directly:
```bash
# 1. Navigate to backend
cd brandlens/backend

# 2. Run automated test suite
python run_tests.py

# 3. Start BrandLens server
python run.py
```
Open your browser to: **`http://localhost:8000`**

### Method 2: Dual Development Mode (Vite Hot-Reload)
**Terminal 1 — Backend:**
```bash
cd brandlens/backend
python run.py
```
*(Runs on http://localhost:8000)*

**Terminal 2 — Frontend:**
```bash
cd brandlens/frontend
npm run dev
```
*(Runs on http://localhost:5173 with automatic API proxy)*

### Method 3: Docker Compose
```bash
cd brandlens
docker-compose up --build
```
*(Frontend on http://localhost:80, Backend on http://localhost:8000, PostgreSQL on 5432)*

---

## 8. REST API Documentation

Interactive OpenAPI Swagger UI is available at **`/docs`** (or **`/redoc`**).

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/demo-login` | 1-Click judge demo login (Creator, Reviewer, Admin) | Public |
| `POST` | `/api/auth/login` | Email/password authentication | Public |
| `POST` | `/api/auth/register` | Create user and organization | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | Any |
| `GET` | `/api/brand-kits` | List active organization brand kits | Any |
| `POST` | `/api/brand-kits/{id}/rules` | Add prohibited or preferred term rule | Admin |
| `POST` | `/api/brand-kits/{id}/documents`| Upload & chunk guideline PDF/DOCX for RAG | Admin |
| `POST` | `/api/content/upload` | Upload text or document (PDF/DOCX/PNG) | Creator |
| `POST` | `/api/content/review/{id}` | Run 3-layer hybrid AI review engine | Creator |
| `POST` | `/api/content/rewrite` | Smart Rewrite Assistant (4 variations) | Creator |
| `POST` | `/api/findings/{id}/accept` | Accept fix (updates working revision) | Creator |
| `POST` | `/api/findings/{id}/edit` | Apply custom phrasing fix | Creator |
| `POST` | `/api/findings/{id}/dismiss`| Dismiss finding with justification | Creator |
| `POST` | `/api/findings/{id}/dispute`| Dispute rule (logs for intelligence) | Creator |
| `POST` | `/api/content/{id}/submit-approval`| Submit content to manager queue | Creator |
| `GET` | `/api/approvals/pending` | List pending approval queue | Reviewer / Admin |
| `POST` | `/api/approvals/{id}/approve` | Sign-off content (Publish Ready) | Reviewer / Admin |
| `POST` | `/api/approvals/{id}/reject` | Reject content with rationale | Reviewer / Admin |
| `GET` | `/api/insights/overview` | Governance metrics and Smart Insights | Any |
| `POST` | `/api/visual/check` | Dominant colors & WCAG contrast audit | Any |
| `GET` | `/api/audit-logs` | Immutable event audit trail | Any |

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
- **Safe Error Handling**: Internal stack traces are never leaked to external API responses; sensitive credentials are never written to logs.

---

## 10. Round 3 Roadmap & Meaningful Improvements

1. **Enterprise Workflow Integrations**: Native Google Docs add-on, Slack pre-publication bot, and Figma/WordPress plugins to govern content within existing creation workflows.
2. **Multimodal & Multilingual Governance**: Expansion to video frame logo clear-space inspection, audio transcription tone verification, and multilingual brand checks across 12+ languages.
3. **Intelligent Guideline Improvement Engine**: Machine learning analysis of repeated creator disputes and common violations to automatically recommend clearer, less ambiguous brand guideline rules to leadership.

---

*BrandLens — Built with pride by Team V4Vantage for Inkloom AI @ CodeNexus India 2026.*

