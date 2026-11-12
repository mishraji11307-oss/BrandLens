# BrandLens — AI-Powered Brand Governance & Content Compliance Platform

> **Inkloom AI | CodeNexus India 2026 | Round 3: The Finish | Team V4Vantage**  
> *"Catch Brand Mistakes Before Content Goes Live."*

Welcome to **BrandLens**. This repository contains the complete full-stack SaaS platform built by **Team V4Vantage** for CodeNexus India 2026.

---

## 👥 Team V4Vantage
- **Kushagra Mishra** — AI & Architecture Lead
- **Priyanshu Mishra** — Full-Stack Engineer & Product
- **Prajjval Khare** — Backend & Regulatory Systems
- **Saumy Agrahari** — Frontend & UI/UX Design

---

## 🚀 Quick Start (1-Click Run)

### Windows
Double-click `start_brandlens.bat` or run:
```powershell
.\start_brandlens.ps1
```

Or manually:
```bash
# 1. Run automated test suite (all 9 suites pass 100%)
python brandlens/backend/run_tests.py

# 2. Start the unified server
cd brandlens/backend
python run.py
```
Open **`http://localhost:8000`** in any web browser (works in private / incognito mode, no login required — click **"Launch Live Demo"** or click **"Judge 7-Step Tour"** in the top navigation).

---

## 🏆 Round 3 Promised Features Implemented

| Slide | Promised Feature | Implementation Details | Status |
|---|---|---|:---:|
| **Slide 9** | **Visual Redline Diff** (v1 vs v2 with Score Delta) | Word-level LCS diff algorithm highlighting additions (green) & deletions (red strikethrough), with live dynamic score delta (+15 pts) and modification ledger. | ✅ Complete |
| **Slide 9** | **Disclosure Guard** (ASCI & FTC Rule Packs) | Flags missing commercial disclosures (`#Ad`, `#Sponsored`, `#Collab`) and unverified superlatives (`#1 in India`). 1-click automatic compliance tag insertion. | ✅ Complete |
| **Slide 9 & 11** | **Multimodal Image OCR Scanner** | Extracts printed text from product packaging & banner creatives with an interactive Creator Confirmation Canvas before analysis. | ✅ Complete |
| **Slide 14 & 19** | **Cryptographic Clearance Certificate** | Downloadable tamper-evident PDF certificate generated via ReportLab with SHA-256 cryptographic integrity hash and reviewer sign-off block. | ✅ Complete |
| **Slide 11 & 14** | **Claim Evidence Dossier Linking** | Approved claims (AC-12, FACT-02) link directly to clinical trials, methodology, and page citations in regulatory bodies. | ✅ Complete |
| **Slide 11 & 14** | **Social Ad Simulator (Instagram + LinkedIn + Google Ads)** | Real-time multi-channel creative simulator with sponsored labels, headline, URL breadcrumb, and violation indicators. | ✅ Complete |
| **Slide 14** | **Live In-App Notification Drawer** | Real-time bell notification drawer displaying high-risk findings, review assignments, and approval decisions. | ✅ Complete |
| **Slide 11** | **Interactive 7-Step Judge Demo Flow** | Guided walkthrough in the top navigation covering every step of the pitch deck journey. | ✅ Complete |

---

## 📂 Project Architecture

- **`brandlens/backend/`**: FastAPI REST API, SQLAlchemy ORM, 3-Layer Hybrid AI Review Engine (Deterministic + RAG + Heuristics/LLM), Multimodal OCR Engine, ReportLab PDF Certificate Generator with SHA-256 verification, WCAG visual checker.
- **`brandlens/frontend/`**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Split-Screen Workspace, Visual Redline Diff, Human Approval Centre, Social Ad Simulator, Regulatory Pack Manager.
- **`brandlens/docker-compose.yml`**: Production PostgreSQL 16 + pgvector container configuration.
- **`brandlens/README.md`**: [Read Full Master Documentation](./brandlens/README.md) for technical architecture, regulatory standards, test results, and API references.
