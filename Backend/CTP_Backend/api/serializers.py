from abc import ABC
import os

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import User



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name' , 'password', 'role']

    @staticmethod
    def validate_email(value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value


class SignupSerializer(serializers.Serializer):
    user_info = UserSerializer()

    def create(self, validated_data):
        # Obtener datos de los modelos
        user_data = validated_data.pop('user_info')

        # Crear Usuario
        password = user_data.pop('password', None)

        # Establecer is_active = False
        user = User(**user_data)
        user.is_active = False
        if password is not None:
            user.set_password(password)
        user.save()

        return {'id': user.id, 'email': user.email}
