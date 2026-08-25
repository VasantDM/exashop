from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import Address
from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    AddressSerializer,
    AdminUserSerializer,
)
from .permissions import IsAdmin, IsCustomer, IsOwnerOrAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Register a new user account.
    Returns the created user object and a pair of JWT tokens (access & refresh)
    for immediate authentication.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for instant auto-login
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['username'] = user.username
        refresh['role'] = user.role

        user_data = UserProfileSerializer(user, context={'request': request}).data

        return Response({
            'message': 'Account registered successfully.',
            'user': user_data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Authenticate a user with either Email or Username + Password.
    Returns JWT access & refresh tokens along with complete user details.
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Change password for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class AddressListCreateView(generics.ListCreateAPIView):
    """
    List all addresses for the authenticated user or create a new address.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific address belonging to the authenticated user.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            return Address.objects.all()
        return Address.objects.filter(user=self.request.user)


class UserListView(generics.ListAPIView):
    """
    Admin-only endpoint to list all registered users with role and status details.
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    search_fields = ['username', 'email', 'first_name', 'last_name']


class LogoutView(APIView):
    """
    Blacklist the refresh token to revoke user session upon logout.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({'message': 'Successfully logged out and token revoked.'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': 'Invalid or already blacklisted token.', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Client session cleared.'}, status=status.HTTP_200_OK)
