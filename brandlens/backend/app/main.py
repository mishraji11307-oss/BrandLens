import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.middleware import SecurityHeadersMiddleware
from app.database.session import init_db, SessionLocal
from app.database.seed_demo import seed_demo_data
from app.api.api_router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("brandlens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events.
    Initializes database tables and seeds demo organisation.
    """
    logger.info("Initializing BrandLens database tables...")
    init_db()
    
    # Auto-seed Demo Organization
    if settings.ENABLE_PUBLIC_DEMO:
        logger.info("Checking and seeding GlowCare Skincare Demo Organisation...")
        db = SessionLocal()
        try:
            seed_demo_data(db)
            logger.info("GlowCare Skincare demo seed confirmed ready.")
        except Exception as e:
            logger.error(f"Error seeding demo data: {e}", exc_info=True)
        finally:
            db.close()
            
    yield
    logger.info("BrandLens shutting down gracefully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="BrandLens — AI-Powered Brand Governance & Content Compliance Platform. Built for Inkloom AI / CodeNexus India 2026 Round 2 by Team V4Vantage.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time"]
)

# 3. Mount Static Uploads Directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 4. Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
def health_check():
    """System liveness and configuration health check."""
    return {
        "status": "healthy",
        "product": "BrandLens",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.ENABLE_PUBLIC_DEMO,
        "llm_provider": settings.LLM_PROVIDER,
        "ai_status": "Active (Deterministic Rule Engine + RAG Vector Store + Contextual Heuristics)" if not settings.OPENAI_API_KEY else "Active (OpenAI LLM + RAG Vector Store)"
    }

# 5. Serve Frontend Single-Page App if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    from starlette.responses import FileResponse, JSONResponse
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend_assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_frontend(full_path: str):
        # Exclude API, docs, and health from catch-all
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json") or full_path == "health":
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/", tags=["System"])
    def root():
        return {
            "message": "BrandLens API v2.0 is running. Visit /docs for the interactive Swagger OpenAPI interface.",
            "docs": "/docs",
            "health": "/health"
        }
