import posthog

from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from .models import User
from .serializers import UserSerializer, SignupSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        # Guardar en la base de datos de APIs
        res = serializer.save()
        if res is None:
            return Response(
                {'message': 'Error al crear el usuario y la organización.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {'message': 'Usuario y organización creados exitosamente.'},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Llamar al método post original de TokenObtainPairView
        print("Request Data:", request.data)  # Depuración: Ver datos de la solicitud
        response = super().post(request, *args, **kwargs)
        print("Response Status Code:", response.status_code)  # Depuración: Ver el código de estado de la respuesta

        if response.status_code == 200:
            user_email = request.data.get("email")
            print("User Email:", user_email)  # Depuración: Verificar el correo electrónico del usuario

            if user_email:
                try:
                    user = get_user_model().objects.get(email=user_email)
                    print("User Found:", user)  # Depuración: Verificar el usuario encontrado

                    posthog.capture(
                        str(user.id),  # Corregido para obtener el ID del usuario
                        'user_logged_in',
                        {'email': user_email}
                    )
                    print("PostHog Event Sent")  # Depuración: Confirmar que el evento se envió a PostHog
                except get_user_model().DoesNotExist:
                    print("User Does Not Exist")  # Depuración: Usuario no encontrado
                except Exception as e:
                    print("Unexpected Error:", str(e))  # Depuración: Cualquier otro error inesperado

        return response
