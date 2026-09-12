import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

# Imported after django_asgi_app is created so app registry is ready.
from assistance.routing import websocket_urlpatterns  # noqa: E402
from common.jwt_ws_auth import JWTAuthMiddlewareStack  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddlewareStack(
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    ),
})
