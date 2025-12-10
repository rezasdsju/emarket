from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
import json
from django.utils import timezone

# Admin permission class
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

# Admin views
class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user and user.is_staff:
            from rest_framework.authtoken.models import Token
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'message': 'Login successful'
            })
        return Response({
            'success': False,
            'error': 'Invalid credentials or not an admin user'
        }, status=status.HTTP_401_UNAUTHORIZED)

class ChangePasswordView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not user.check_password(old_password):
            return Response({
                'success': False,
                'error': 'Wrong old password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({
                'success': False,
                'error': 'New passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({
                'success': False,
                'error': 'Password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        })

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Category.objects.all().order_by('-id')

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Product.objects.all().order_by('-created')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(quantity_unit__icontains=search)
            )
        
        # Filter by discount
        discount_filter = self.request.query_params.get('discount_filter', None)
        if discount_filter:
            if discount_filter == 'with_discount':
                queryset = queryset.exclude(discount_type='none').filter(discount_active=True)
            elif discount_filter == 'without_discount':
                queryset = queryset.filter(Q(discount_type='none') | Q(discount_active=False))
            elif discount_filter == 'expired_discount':
                now = timezone.now()
                queryset = queryset.filter(
                    Q(discount_end_date__lt=now) & Q(discount_active=True)
                )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def discount_stats(self, request):
        """Get discount statistics"""
        total_products = Product.objects.count()
        with_discount = Product.objects.exclude(discount_type='none').filter(discount_active=True).count()
        without_discount = Product.objects.filter(Q(discount_type='none') | Q(discount_active=False)).count()
        
        # Active discounts
        now = timezone.now()
        active_discounts = Product.objects.filter(
            discount_type__in=['percentage', 'fixed'],
            discount_active=True,
            discount_start_date__lte=now,
            discount_end_date__gte=now
        ).count()
        
        # Expired discounts
        expired_discounts = Product.objects.filter(
            discount_type__in=['percentage', 'fixed'],
            discount_active=True,
            discount_end_date__lt=now
        ).count()
        
        # Calculate average discount
        discounted_products = Product.objects.filter(
            discount_type__in=['percentage', 'fixed'],
            discount_active=True
        )
        total_discount = 0
        for product in discounted_products:
            total_discount += product.get_discount_percentage()
        
        avg_discount = total_discount / discounted_products.count() if discounted_products.count() > 0 else 0
        
        return Response({
            'success': True,
            'stats': {
                'total_products': total_products,
                'with_discount': with_discount,
                'without_discount': without_discount,
                'active_discounts': active_discounts,
                'expired_discounts': expired_discounts,
                'avg_discount': round(avg_discount, 2)
            }
        })
    
    @action(detail=False, methods=['post'])
    def bulk_discount_update(self, request):
        """Apply bulk discount to selected products"""
        product_ids = request.data.get('product_ids', [])
        discount_type = request.data.get('discount_type', 'percentage')
        discount_value = request.data.get('discount_value', 0)
        discount_active = request.data.get('discount_active', True)
        
        if not product_ids:
            return Response({
                'success': False,
                'error': 'No products selected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate discount value
        if discount_type == 'percentage' and (discount_value < 0 or discount_value > 100):
            return Response({
                'success': False,
                'error': 'Percentage discount must be between 0 and 100'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if discount_type == 'fixed' and discount_value < 0:
            return Response({
                'success': False,
                'error': 'Fixed discount must be greater than 0'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update products
        updated_count = 0
        products = Product.objects.filter(id__in=product_ids)
        
        for product in products:
            product.discount_type = discount_type
            product.discount_value = discount_value
            product.discount_active = discount_active
            product.calculate_discount_price()
            product.save()
            updated_count += 1
        
        return Response({
            'success': True,
            'message': f'Discount applied to {updated_count} products',
            'updated_count': updated_count
        })
    
    @action(detail=True, methods=['post'])
    def toggle_discount(self, request, pk=None):
        """Toggle discount active status for a product"""
        product = self.get_object()
        product.discount_active = not product.discount_active
        product.save()
        
        return Response({
            'success': True,
            'message': f'Discount {"activated" if product.discount_active else "deactivated"}',
            'discount_active': product.discount_active
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'success': True,
                'message': 'Product created successfully',
                'product': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                'success': True,
                'message': 'Product updated successfully',
                'product': serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Product deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Dashboard statistics
        total_products = Product.objects.count()
        total_categories = Category.objects.count()
        active_products = Product.objects.filter(available=True).count()
        featured_products = Product.objects.filter(featured=True).count()
        
        # Discount statistics
        discounted_products = Product.objects.filter(
            discount_type__in=['percentage', 'fixed'],
            discount_active=True
        ).count()
        
        # Recent products with discount info
        recent_products = Product.objects.all().order_by('-created')[:10]
        recent_serializer = ProductSerializer(recent_products, many=True, context={'request': request})
        
        # Top discounted products
        top_discounted = Product.objects.filter(
            discount_type__in=['percentage', 'fixed'],
            discount_active=True
        ).order_by('-discount_value')[:5]
        
        top_discounted_serializer = ProductSerializer(top_discounted, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'stats': {
                'total_products': total_products,
                'total_categories': total_categories,
                'active_products': active_products,
                'featured_products': featured_products,
                'discounted_products': discounted_products,
                'discount_percentage': round((discounted_products / total_products * 100) if total_products > 0 else 0, 1)
            },
            'recent_products': recent_serializer.data,
            'top_discounted': top_discounted_serializer.data,
            'user': {
                'username': request.user.username,
                'email': request.user.email,
                'last_login': request.user.last_login
            }
        })

class AdminUserView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'date_joined': user.date_joined,
            'last_login': user.last_login
        })

class AdminLogoutView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        # Invalidate token if using token authentication
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        })