from abc import ABC
import os

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from .models import (
    Chat,
    Message,
    ChatToken,
    User,
    Event,
    EventType
)


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
    

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'text', 'timestamp']

class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'user', 'created_at', 'messages']

class ChatTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatToken
        fields = ['chat', 'token']

class EventSerializer(serializers.ModelSerializer):
    event_type = serializers.PrimaryKeyRelatedField(queryset=EventType.objects.all())
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Event
        fields = [
            'id', 'name', 'description', 'event_type', 'created_by', 
            'location', 'brief_description', 'created_at', 
            'event_start_datetime', 'event_end_datetime', 'status'
        ]
