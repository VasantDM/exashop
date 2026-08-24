import time
from django.db import connection
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify backend system status and PostgreSQL database connectivity.
    """
    start_time = time.time()
    db_status = "unreachable"
    db_engine = connection.settings_dict.get('ENGINE', 'unknown').split('.')[-1]
    db_name = connection.settings_dict.get('NAME', 'unknown')

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            row = cursor.fetchone()
            if row and row[0] == 1:
                db_status = "connected"
    except Exception as exc:
        db_status = f"error: {str(exc)}"

    latency_ms = round((time.time() - start_time) * 1000, 2)
    is_healthy = (db_status == "connected")

    payload = {
        "status": "healthy" if is_healthy else "unhealthy",
        "api_version": "v1",
        "timestamp": timezone.now().isoformat(),
        "database": {
            "status": db_status,
            "engine": db_engine,
            "name": db_name,
            "latency_ms": latency_ms,
        },
        "services": {
            "auth": "ready",
            "rest_framework": "active",
            "cors": "configured",
        }
    }

    return Response(
        payload,
        status=status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    )
