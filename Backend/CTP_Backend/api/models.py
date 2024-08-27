import uuid

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.text import slugify
from .data import USER_ROLE_CHOICES


# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email must be provided')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    email = models.EmailField(
        max_length=255,
        unique=True
    )
    name = models.CharField(
        max_length=255
    )
    is_staff = models.BooleanField(
        default=False
    )
    is_active = models.BooleanField(
        default=True
    )
    role = models.PositiveSmallIntegerField(
        choices=USER_ROLE_CHOICES,
        verbose_name='Role',
        null=True
    )


    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
        verbose_name='Registration date'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        null=True,
        verbose_name='Last Update'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [
        'password'
    ]

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.email
    
class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat {self.id} for {self.user.username}"

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=255)  # Could be 'user' or 'bot'
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"

class ChatToken(models.Model):
    chat = models.OneToOneField(Chat, on_delete=models.CASCADE, related_name='token')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"Token {self.token} for Chat {self.chat.id}"
    
class EventType(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    
class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    event_type = models.ForeignKey(EventType, on_delete=models.CASCADE, related_name='events')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    location = models.TextField()
    brief_description = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    event_start_datetime = models.DateTimeField()
    event_end_datetime = models.DateTimeField()
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return self.name