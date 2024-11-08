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

from .data import USER_ROLE_CHOICES
from .models import User
from .serializers import (
    UserSerializer,
    SignupSerializer
    )


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
            f"{os.getenv('LINNDA_BASE_URL')}confirm_singup?token={token}&user_id={user.id}"
        )


        # Guardar en la base de datos de API
        res_send_message = send_mail(
            subject='Active account',
            message=f"Use the following link to active your acount: {reset_url}",
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

class UserRoleChoicesView(APIView):
    def get(self, request, *args, **kwargs):
        roles_dict = {name: idx  for idx, (code, name) in enumerate(USER_ROLE_CHOICES)}

        filtered_data = {k: v for k, v in roles_dict.items() if v != 0}
        return Response(filtered_data, status=status.HTTP_200_OK)
