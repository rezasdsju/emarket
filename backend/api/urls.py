from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'order-items', views.OrderItemViewSet)


router.register(r'payments', views.PaymentViewSet)  # এই লাইন যোগ করুন


urlpatterns = [
    path('', include(router.urls)),
]