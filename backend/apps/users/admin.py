from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address


class AddressInline(admin.StackedInline):
    model = Address
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_staff', 'created_at')
    list_filter = ('role', 'is_verified', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-created_at',)
    inlines = [AddressInline]

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'avatar')}),
        ('Role & Permissions', {
            'fields': ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'address_type', 'city', 'state', 'country', 'is_default', 'created_at')
    list_filter = ('address_type', 'is_default', 'country', 'state')
    search_fields = ('full_name', 'street_address', 'city', 'user__email', 'user__username')
    ordering = ('-created_at',)
