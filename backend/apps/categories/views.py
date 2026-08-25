from rest_framework import generics, permissions
from .models import Category
from .serializers import CategorySerializer
from apps.users.permissions import IsAdmin


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and (request.user.is_staff or getattr(request.user, 'role', '') == 'admin'))


class CategoryListView(generics.ListCreateAPIView):
    """
    List all active top-level categories with subcategory hierarchies,
    or create a new category (Admin only).
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Category.objects.filter(is_active=True)
        # If 'top_level=true' or default, only fetch root categories with nested subcategories
        include_all = self.request.query_params.get('all', 'false').lower() in ('true', '1')
        if not include_all:
            queryset = queryset.filter(parent__isnull=True)
        return queryset.order_by('name')


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a category by its slug or ID.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_object(self):
        lookup_val = self.kwargs.get(self.lookup_field)
        if lookup_val and lookup_val.isdigit():
            self.lookup_field = 'pk'
        return super().get_object()
