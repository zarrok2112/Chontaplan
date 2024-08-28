from django.urls import path
from . import views

urlpatterns = [
    path('create-chat/', views.CreateChatView.as_view(), name='create-chat'),
    path('send-message/', views.SendMessageView.as_view(), name='send-message'),
    path('chatbot-webhook/', views.ChatbotWebhookView.as_view(), name='chatbot-webhook'),
    path('get-messages/', views.GetMessagesView.as_view(), name='get-messages'),
]

# Aquí también podrías incluir otras rutas necesarias para la funcionalidad del chatbota
