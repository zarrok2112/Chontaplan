from abc import ABC
import os

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from .models import(
    Event,
    EventType,
    EventSuscriptions
)


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

class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSuscriptions
        fields = ['evento_id']