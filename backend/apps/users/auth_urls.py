from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    LogoutView,
    SendPasswordResetOTPView,
    VerifyPasswordResetOTPView,
)

app_name = 'auth'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/send-otp/', SendPasswordResetOTPView.as_view(), name='password_reset_send_otp'),
    path('password-reset/verify-otp/', VerifyPasswordResetOTPView.as_view(), name='password_reset_verify_otp'),
]
