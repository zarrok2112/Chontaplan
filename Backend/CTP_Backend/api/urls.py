from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('signup/confirmed/', views.ActivateAccountView.as_view(), name='signup-confirm'),
    path('user-role-choices/', views.UserRoleChoicesView.as_view(), name='user-role-choices')
]