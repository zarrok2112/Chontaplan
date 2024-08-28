import json
from channels.generic.websocket import AsyncWebsocketConsumer

class EventConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "event_updates",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "event_updates",
            self.channel_name
        )

    async def receive(self, text_data):
        pass  # No necesitamos manejar mensajes entrantes por ahora

    async def created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'created',
            'message': f'Event "{event["name"]}" has been created.',
            'data': event['data']  # Incluye los datos completos del evento
        }))

    async def updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'updated',
            'message': f'Event "{event["name"]}" has been updated.',
            'changes': event['changes'],  # Incluye los cambios específicos
            'data': event['data']  # Incluye los datos completos del evento
        }))

    async def deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'deleted',
            'message': f'Event "{event["name"]}" with ID {event["id"]} has been deleted.',
            'id': event['id']  # Incluye el ID del evento eliminado
        }))
