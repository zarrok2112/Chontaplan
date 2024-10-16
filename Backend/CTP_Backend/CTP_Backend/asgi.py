"""
ASGI config for CTP_Backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""
import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import chatbot.routing
import events.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CTP_Backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chatbot.routing.websocket_urlpatterns +  # Rutas de WebSocket para chatbot
            events.routing.websocket_urlpatterns  # Rutas de WebSocket para events
        )
    ),
})