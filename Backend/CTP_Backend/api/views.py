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
    ChatToken,
    User,
    Event
)
from .serializers import (
    ChatSerializer,
    MessageSerializer,
    ChatTokenSerializer,
    EventSerializer,
    UserSerializer,
    SignupSerializer
    )
from django.contrib.auth.models import User

from CTP_Backend.settings import EMAIL_HOST_USER

token_generator = PasswordResetTokenGenerator()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        res = serializer.save()

        if res is None:
            return Response(
                {'message': 'Error al crear el usuario y la organización.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        # Asumiendo que 'res' contiene el ID del usuario, ahora obtendremos la instancia del usuario
        user = User.objects.get(id=res['id'])
        email = user.email

        token = token_generator.make_token(user)
        reset_url = (
            f"{os.getenv('LINNDA_BASE_URL')}reset-password?token={token}&user_id={user.id}"
        )


        # Guardar en la base de datos de API
        res_send_message = send_mail(
            subject='Password Reset',
            message=f"Use the following link to reset your password: {reset_url}",
            from_email=EMAIL_HOST_USER,
            recipient_list=[email]
        )

        return Response(
            {
                'message': 'Usuario y organización creados exitosamente.' + str(res_send_message),
                'user_id': user.id  # Devolver el ID del nuevo usuario
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Llamar al método post original de TokenObtainPairView
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            user_email = request.data.get("email")

            if user_email:
                try:
                    user = get_user_model().objects.get(email=user_email)

                    posthog.capture(
                        str(user.id),  # Corregido para obtener el ID del usuario
                        'user_logged_in',
                        {'email': user_email}
                    )
                except get_user_model().DoesNotExist:
                    print("User Does Not Exist")  # Depuración: Usuario no encontrado
                except Exception as e:
                    print("Unexpected Error:", str(e))  # Depuración: Cualquier otro error inesperado

        return response
    
class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token')
        user_id = request.query_params.get('user_id')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'message': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': 'Cuenta activada exitosamente.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Token inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)


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

class EventView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        event_id = kwargs.get('pk')
        if event_id:
            try:
                event = Event.objects.get(pk=event_id)
                serializer = EventSerializer(event)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Event.DoesNotExist:
                return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        else:
            events = Event.objects.all()
            serializer = EventSerializer(events, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None, *args, **kwargs):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None, *args, **kwargs):
        try:
            event = Event.objects.get(pk=pk)
            event.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Event.DoesNotExist:
            return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)