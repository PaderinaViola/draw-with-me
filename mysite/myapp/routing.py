from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/draw/', consumers.DrawConsumer.as_asgi()),
]