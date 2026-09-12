from django.urls import re_path

from assistance.consumers import TrackingConsumer

websocket_urlpatterns = [
    re_path(r'^ws/requests/(?P<request_id>[\w-]+)/tracking/$', TrackingConsumer.as_asgi()),
]
