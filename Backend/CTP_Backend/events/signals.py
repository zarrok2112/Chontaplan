from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Event
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import EventSerializer

@receiver(post_save, sender=Event)
def event_saved(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    serializer = EventSerializer(instance)

    if created:
        # Enviar notificación de creación
        async_to_sync(channel_layer.group_send)(
            "event_updates",
            {
                'type': 'created',
                'name': instance.name,
                'data': serializer.data  # Datos completos del evento
            }
        )
    else:
        # Obtener los cambios específicos
        changes = {field: (getattr(instance, field), instance._old_values[field])
                   for field in instance._old_values
                   if getattr(instance, field) != instance._old_values[field]}

        # Enviar notificación de actualización
        async_to_sync(channel_layer.group_send)(
            "event_updates",
            {
                'type': 'updated',
                'name': instance.name,
                'changes': changes,  # Cambios específicos
                'data': serializer.data  # Datos completos del evento
            }
        )


@receiver(post_delete, sender=Event)
def event_deleted(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "event_updates",
        {
            'type': 'deleted',
            'name': instance.name,
            'id': instance.id  # ID del evento eliminado
        }
    )
