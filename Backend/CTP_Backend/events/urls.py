

from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from . import views


urlpatterns = [
    path('', views.EventView.as_view(), name='event-list'),
    path('<int:pk>/', views.EventView.as_view(), name='event-detail'),
]