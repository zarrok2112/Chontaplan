from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from . import views


urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('signup/confirmed/', views.ActivateAccountView.as_view(), name='signup-confirm'),
    path('create-chat/', views.CreateChatView.as_view(), name='create-chat'),
    path('send-message/', views.SendMessageView.as_view(), name='send-message'),
    path('chatbot-webhook/', views.ChatbotWebhookView.as_view(), name='chatbot-webhook'),
    path('get-messages/', views.GetMessagesView.as_view(), name='get-messages'),
    path('events/', views.EventView.as_view(), name='event-list'),
    path('events/<int:pk>/', views.EventView.as_view(), name='event-detail'),
]