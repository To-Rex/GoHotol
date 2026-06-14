from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import decode_token
from app.core.config import settings


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        public_paths = [
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/health",
            "/docs",
            "/openapi.json",
            "/redoc",
        ]

        if request.url.path in public_paths or request.url.path.startswith("/docs") or request.url.path.startswith("/openapi") or request.url.path.startswith("/redoc"):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")

        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

        request.state.user_id = int(payload.get("sub"))
        request.state.company_id = payload.get("company_id")
        return await call_next(request)
