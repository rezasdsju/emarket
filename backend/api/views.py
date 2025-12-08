from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, Order, OrderItem
from .serializers import (
    CategorySerializer, 
    ProductSerializer, 
    OrderSerializer, 
    OrderItemSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products
    """
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'available']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created', 'name']
    ordering = ['-created']
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_context(self):
        """Add request to serializer context for image URL"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get products by category slug
        Example: /api/products/by_category/?category_slug=electronics
        """
        category_slug = request.query_params.get('category_slug')
        if not category_slug:
            return Response(
                {"error": "category_slug parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category = get_object_or_404(Category, slug=category_slug)
        products = Product.objects.filter(category=category, available=True)
        
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured products (newest 8 products)
        """
        featured_products = Product.objects.filter(available=True).order_by('-created')[:8]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for orders
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def perform_create(self, serializer):
        """Calculate total price before saving"""
        order = serializer.save()
        
        # Calculate total price from items
        total = 0
        items_data = self.request.data.get('items', [])
        
        for item_data in items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            product = get_object_or_404(Product, id=product_id)
            price = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                price=price,
                quantity=quantity
            )
            
            total += price * quantity
            
            # Update product stock
            if product.stock >= quantity:
                product.stock -= quantity
                if product.stock == 0:
                    product.available = False
                product.save()
        
        order.total_price = total
        order.save()


class OrderItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for order items
    """
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer





















from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, Order, OrderItem, Payment  # Payment যোগ করুন
from .serializers import (
    CategorySerializer, 
    ProductSerializer, 
    OrderSerializer, 
    OrderItemSerializer,
    PaymentSerializer  # PaymentSerializer যোগ করুন
)

import uuid  # transaction ID এর জন্য

# ... আপনার আগের CategoryViewSet, ProductViewSet, OrderViewSet, OrderItemViewSet ...

# ✅ PaymentViewSet যোগ করুন (views.py-এর শেষে)
class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for payments
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    
    def perform_create(self, serializer):
        """Create payment with unique transaction ID"""
        # Unique transaction ID তৈরি
        transaction_id = f"TXN{str(uuid.uuid4())[:8].upper()}"
        
        payment = serializer.save(
            transaction_id=transaction_id,
            status='pending'
        )
        
        # Log payment creation
        print(f"Payment created: {transaction_id} for Order #{payment.order.id}")
        
        # এখানে bKash/Rocket API কল করতে হবে (পরে যোগ করব)
        # payment.payment_method অনুযায়ী আলাদা API কল হবে