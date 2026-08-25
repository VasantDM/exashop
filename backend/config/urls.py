from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from config.views import health_check

api_v1_patterns = [
    path('health/', health_check, name='health-check'),
    path('auth/', include('apps.users.auth_urls')),
    path('users/', include('apps.users.urls')),
    path('products/', include('apps.products.urls')),
    path('categories/', include('apps.categories.urls')),
    path('cart/', include('apps.cart.urls')),
    path('orders/', include('apps.orders.urls')),
    path('payments/', include('apps.payments.urls')),
    path('reviews/', include('apps.reviews.urls')),
    path('admin/', include('apps.admin_dashboard.urls')),
    path('admin-dashboard/', include('apps.admin_dashboard.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include((api_v1_patterns, 'v1'))),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
