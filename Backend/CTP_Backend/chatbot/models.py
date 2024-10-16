import uuid

from django.db import models

from api.models import User


class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')
    created_at = models.DateTimeField(auto_now_add=True)
    has_been_greeted = models.BooleanField(default=False)

    def __str__(self):
        return f"Chat {self.id} for {self.user.email}"


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=255)  # Podría ser 'user' o 'bot'
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"


class ChatToken(models.Model):
    chat = models.OneToOneField(Chat, on_delete=models.CASCADE, related_name='token')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"Token {self.token} for Chat {self.chat.id}"