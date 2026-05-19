import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DrawConsumer(AsyncWebsocketConsumer):

    # someone connected
    async def connect(self):
        self.room = 'drawing_room'
        # join a group — everyone in this group gets broadcast messages
        await self.channel_layer.group_add(self.room, self.channel_name)
        await self.accept()

    # someone disconnected
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room, self.channel_name)

    # someone sent a drawing stroke over the socket
    async def receive(self, text_data):
        data = json.loads(text_data)
        # broadcast it to everyone else in the room
        await self.channel_layer.group_send(self.room, {
            'type': 'drawing_message',
            'data': data
        })

    # this gets called when a broadcast arrives
    async def drawing_message(self, event):
        await self.send(text_data=json.dumps(event['data']))