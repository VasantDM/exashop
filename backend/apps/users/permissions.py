from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users or staff members.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )


class IsCustomer(permissions.BasePermission):
    """
    Allows access only to authenticated customer users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'customer'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to allow owners of an object or admins to view/edit it.
    Assumes the model instance has a `user` attribute or is the user instance itself.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser:
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user

        return obj == request.user
