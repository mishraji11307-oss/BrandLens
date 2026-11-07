import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

logger = logging.getLogger("brandlens.security")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Implements enterprise-grade HTTP response security headers adhering to OWASP recommendations.
    """
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.time()
        
        try:
            response: Response = await call_next(request)
            process_time = time.time() - start_time
            
            # Security Headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "img-src 'self' data: blob: https:; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com data:; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "connect-src 'self' *;"
            )
            response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
            response.headers["X-Process-Time"] = f"{process_time:.4f}s"
            
            return response
        except Exception as exc:
            logger.error(f"Unhandled exception [req_id: {request_id}]: {str(exc)}", exc_info=True)
            # Never leak internal stack traces to the outside caller
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "An internal server error occurred. Please contact BrandLens support.",
                    "request_id": request_id
                }
            )

