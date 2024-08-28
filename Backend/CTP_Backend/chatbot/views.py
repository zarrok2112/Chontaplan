import posthog
import os

from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import (
    Chat,
    Message,
    ChatToken
)
from .serializers import (
    ChatSerializer,
    MessageSerializer,
    ChatTokenSerializer,
    )

class CreateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"error": "Usuario no autenticado."}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        chat = Chat.objects.create(user=user)
        chat_token = ChatToken.objects.create(chat=chat)
        return Response(ChatTokenSerializer(chat_token).data, status=status.HTTP_201_CREATED)
    
class SendMessageView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        text = request.data.get('text')
        
        try:
            chat_token = ChatToken.objects.get(token=token)
            chat = chat_token.chat
            sender = 'user'
            message = Message.objects.create(chat=chat, sender=sender, text=text)

            # Aquí es donde se llamaría al chatbot para generar una respuesta.
            # Respuesta del chatbot simulada:
            bot_response = "Esta es una respuesta simulada del chatbot."
            Message.objects.create(chat=chat, sender='bot', text=bot_response)

            return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        except ChatToken.DoesNotExist:
            return Response({"error": "Token no válido."}, status=status.HTTP_400_BAD_REQUEST)
        
class ChatbotWebhookView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        response_text = request.data.get('response_text')

        try:
            chat_token = ChatToken.objects.get(token=token)
            chat = chat_token.chat
            Message.objects.create(chat=chat, sender='bot', text=response_text)
            return Response({"message": "Response saved."}, status=status.HTTP_200_OK)
        
        except ChatToken.DoesNotExist:
            return Response({"error": "Token no válido."}, status=status.HTTP_400_BAD_REQUEST)
        
class GetMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        token = request.query_params.get('token')
        
        if not token:
            return Response({"error": "El parámetro 'token' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            chat_token = ChatToken.objects.get(token=token)
            chat = chat_token.chat
            messages = Message.objects.filter(chat=chat)
            serialized_messages = MessageSerializer(messages, many=True)
            return Response(serialized_messages.data, status=status.HTTP_200_OK)
        
        except ChatToken.DoesNotExist:
            return Response({"error": "Token no válido."}, status=status.HTTP_400_BAD_REQUEST)
