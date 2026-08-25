from django.urls import path
from .views import (
    UserProfileView,
    ChangePasswordView,
    AddressListCreateView,
    AddressDetailView,
    UserListView,
)

app_name = 'users'

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    path('admin/all/', UserListView.as_view(), name='admin-user-list'),
]
