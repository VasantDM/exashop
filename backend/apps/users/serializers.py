from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Address, PasswordResetOTP

User = get_user_model()


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for user address book."""

    class Meta:
        model = Address
        fields = (
            'id',
            'address_type',
            'full_name',
            'phone_number',
            'street_address',
            'apartment_suite',
            'city',
            'state',
            'postal_code',
            'country',
            'is_default',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        # Automatically attach the authenticated user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for retrieving and updating user profile information."""

    addresses = AddressSerializer(many=True, read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'avatar',
            'role',
            'is_verified',
            'is_staff',
            'addresses',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'is_staff', 'created_at', 'updated_at')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password validation."""

    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True, min_length=6)
    role = serializers.CharField(default='customer', read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'password',
            'confirm_password',
            'role',
        )
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError('A user with this email address already exists.')
        return normalized_email

    def validate_username(self, value):
        normalized_username = value.strip()
        if User.objects.filter(username__iexact=normalized_username).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return normalized_username

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        validated_data.pop('role', None)
        password = validated_data.pop('password')
        
        # Public storefront registration strictly defaults to 'customer' role
        user = User.objects.create_user(
            email=validated_data.pop('email'),
            username=validated_data.pop('username'),
            password=password,
            role='customer',
            **validated_data
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Serializer supporting dual login (Email OR Username)
    and including full user profile payload in the token response.
    """
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.username_field in self.fields:
            self.fields[self.username_field].required = False

    def validate(self, attrs):
        # Support both 'username' or 'email' field in request body
        login_input = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')

        if not login_input or not password:
            raise serializers.ValidationError('Must include username/email and password.')

        user = None
        # Attempt to find user by email first, then username
        if '@' in login_input:
            user = User.objects.filter(email__iexact=login_input.strip()).first()
        if not user:
            user = User.objects.filter(username__iexact=login_input.strip()).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError('No active account found with the given credentials.')

        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')

        # Generate tokens
        refresh = self.get_token(user)
        refresh['email'] = user.email
        refresh['username'] = user.username
        refresh['role'] = user.role

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.full_name,
                'role': user.role,
                'phone_number': user.phone_number,
                'avatar': user.avatar.url if user.avatar else None,
                'is_staff': user.is_staff,
                'is_verified': user.is_verified,
            }
        }


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for authenticated password change."""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)
    confirm_new_password = serializers.CharField(required=True, write_only=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is not correct.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'New passwords do not match.'})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for Admin management of users."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'role',
            'is_active',
            'is_staff',
            'is_superuser',
            'is_verified',
            'created_at',
            'updated_at',
        )


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer for Admin registering new users with any role (customer, admin, staff)."""

    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True, min_length=6)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='customer', required=False)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'password',
            'confirm_password',
            'role',
            'is_active',
            'is_verified',
            'created_at',
        )
        read_only_fields = ('id', 'created_at')
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError('A user with this email address already exists.')
        return normalized_email

    def validate_username(self, value):
        normalized_username = value.strip()
        if User.objects.filter(username__iexact=normalized_username).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return normalized_username

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        role = validated_data.pop('role', 'customer')
        password = validated_data.pop('password')
        is_active = validated_data.pop('is_active', True)
        is_verified = validated_data.pop('is_verified', True)

        is_staff = role in ('admin', 'staff')
        is_superuser = (role == 'admin')

        user = User.objects.create_user(
            email=validated_data.pop('email'),
            username=validated_data.pop('username'),
            password=password,
            role=role,
            is_active=is_active,
            is_verified=is_verified,
            is_staff=is_staff,
            is_superuser=is_superuser,
            **validated_data
        )
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for Admin updating existing user details and role."""

    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'role',
            'is_active',
            'is_verified',
        )
        read_only_fields = ('id', 'username', 'email')

    def update(self, instance, validated_data):
        role = validated_data.get('role')
        if role:
            instance.role = role
            instance.is_staff = role in ('admin', 'staff')
            if role == 'admin':
                instance.is_superuser = True
            elif role == 'customer':
                instance.is_superuser = False
        return super().update(instance, validated_data)


class SendPasswordResetOTPSerializer(serializers.Serializer):
    """Serializer to validate email for password reset OTP generation."""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if not User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError('No registered account found with this email address.')
        return normalized_email


class VerifyPasswordResetOTPSerializer(serializers.Serializer):
    """Serializer to verify 6-digit OTP code and set new password."""
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, max_length=6, min_length=6)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)
    confirm_password = serializers.CharField(required=True, write_only=True, min_length=6)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        otp = attrs.get('otp', '').strip()
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        if new_password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})

        otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).order_by('-created_at').first()
        if not otp_record:
            raise serializers.ValidationError({'otp': 'Invalid OTP code.'})

        if not otp_record.is_valid:
            raise serializers.ValidationError({'otp': 'This OTP code has expired. Please request a new one.'})

        attrs['user'] = user
        attrs['otp_record'] = otp_record
        return attrs

