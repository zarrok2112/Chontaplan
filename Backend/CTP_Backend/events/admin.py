from django.contrib import admin
from .models import  EventType

class EventTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')  # Muestra el ID y el nombre en la lista de tipos de eventos
    search_fields = ('name',)  # Añade la funcionalidad de búsqueda por nombre

admin.site.register(EventType, EventTypeAdmin)