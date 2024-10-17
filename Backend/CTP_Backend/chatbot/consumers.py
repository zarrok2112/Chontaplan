import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from CTP_Backend.utils.pento import LdaPento
from .models import ChatToken, Message, Chat


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.token = self.scope['url_route']['kwargs']['token']
        self.chat = await self.get_chat_by_token(self.token)

        if self.chat:
            # Aceptar la conexión WebSocket
            await self.accept()

            # Saludar al usuario si es la primera vez que se conecta
            if not self.chat.has_been_greeted:
                await self.send(text_data=json.dumps({
                    'message': '¡Hola! Bienvenido al chat.',
                    'sender': 'Chatbot'
                }))
                await self.mark_chat_as_greeted(self.chat)

        else:
            # Cerrar la conexión si el chat no es válido
            await self.close()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON received'
            }))
            return

        message = text_data_json.get('message')
        sender = text_data_json.get('sender')

        if message and sender:
            # Guardar el mensaje en la base de datos
            await self.save_message(self.chat, sender, message)
            api_key = "1c8d9b79243d21c40bb1534f7e59ac765a57182ae6efa5af199524915a098ecc"

            pento = LdaPento(api_key=api_key)
            # Responder con "dijiste..."
            response_message = pento.insights_pipeline(text=message)
            print(response_message)
            await self.send(text_data=json.dumps({
                'message': response_message,
                'sender': 'Chatbot'
            }))
        else:
            await self.send(text_data=json.dumps({
                'error': 'Missing message or sender in JSON'
            }))

    @database_sync_to_async
    def get_chat_by_token(self, token):
        try:
            return ChatToken.objects.get(token=token).chat
        except ChatToken.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, chat, sender, message):
        Message.objects.create(chat=chat, sender=sender, text=message)

    @database_sync_to_async
    def mark_chat_as_greeted(self, chat):
        chat.has_been_greeted = True
        chat.save()


class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Acepta la conexión WebSocket
        await self.accept()

        # Enviar un mensaje de bienvenida al cliente
        await self.send(text_data=json.dumps({
            'message': 'Conexión establecida exitosamente!',
        }))

    async def disconnect(self, close_code):
        # Este método se llama cuando el WebSocket se desconecta
        pass

    async def receive(self, text_data):
        # Este método se llama cuando se recibe un mensaje desde el WebSocket
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Enviar un mensaje de vuelta al cliente
        await self.send(text_data=json.dumps({
            'message': f'Has enviado: {message}',
        }))