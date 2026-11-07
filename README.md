# BrandLens — AI-Powered Brand Governance & Content Compliance Platform

> **Inkloom AI | CodeNexus India 2026 | Round 2 | Team V4Vantage**  
> *"Catch Brand Mistakes Before Content Goes Live."*

Welcome to **BrandLens**. The complete full-stack SaaS platform is located in the [`brandlens/`](./brandlens) folder.

## 🚀 Quick Start (1-Click Run)

### Windows
Double-click `start_brandlens.bat` or run:
```powershell
.\start_brandlens.ps1
```

Or manually:
```bash
cd brandlens/backend
python run_tests.py
python run.py
```
Open **`http://localhost:8000`** in any web browser (works in private / incognito mode, no login required — click **"Launch Live Demo"**).

---

## 📂 Project Architecture

- **`brandlens/backend/`**: FastAPI REST API, SQLAlchemy ORM, 3-Layer Hybrid AI Review Engine (Deterministic + RAG + Contextual Heuristics / LLM), WCAG visual checker, security middleware.
- **`brandlens/frontend/`**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Split-Screen Workspace, Human Approval Centre, Governance Insights.
- **`brandlens/docker-compose.yml`**: Production PostgreSQL 16 + pgvector container configuration.
- **`brandlens/README.md`**: [Read Full Master Documentation](./brandlens/README.md) for complete technical architecture, OWASP security details, and API references.

