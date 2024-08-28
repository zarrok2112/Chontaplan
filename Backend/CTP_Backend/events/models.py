from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.text import slugify

from api.models import User

# Create your models here.

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

    _old_values = {}

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.pk:
            # Si el evento ya existe (es decir, no es una creación), guarda los valores antiguos
            old_instance = Event.objects.get(pk=self.pk)
            self._old_values = {
                'name': old_instance.name,
                'description': old_instance.description,
                'event_type': old_instance.event_type,
                'location': old_instance.location,
                'brief_description': old_instance.brief_description,
                'event_start_datetime': old_instance.event_start_datetime,
                'event_end_datetime': old_instance.event_end_datetime,
                'status': old_instance.status,
            }
        super().save(*args, **kwargs)