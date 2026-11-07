from fastapi import APIRouter
from app.api import auth, organisations, brand_kits, content, findings, approvals, insights, audit, visual

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(organisations.router)
api_router.include_router(brand_kits.router)
api_router.include_router(content.router)
api_router.include_router(findings.router)
api_router.include_router(approvals.router)
api_router.include_router(insights.router)
api_router.include_router(audit.router)
api_router.include_router(visual.router)

