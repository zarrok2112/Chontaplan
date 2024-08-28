from abc import ABC

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import(
    Chat,
    Message,
    ChatToken
)


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
