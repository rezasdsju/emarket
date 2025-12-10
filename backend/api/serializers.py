from rest_framework import serializers
from .models import Category, Product, Order, OrderItem, Payment
from django.utils import timezone

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'product_count']
    
    def get_product_count(self, obj):
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    # For reading - shows category details
    category = CategorySerializer(read_only=True)
    
    # For writing - accepts category ID
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=True,
        help_text="Category ID (required)"
    )
    
    # Custom image URL field
    image_url = serializers.SerializerMethodField()
    
    # Discount display fields
    has_discount = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
    discount_badge = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 
            'name', 
            'slug', 
            'category', 
            'category_id', 
            'image', 
            'image_url',
            'price', 
            'quantity_unit',
            'description', 
            'stock', 
            'available',
            'featured',
            'created', 
            'updated',
            # Discount fields
            'discount_type',
            'discount_value',
            'discount_price',
            'discount_start_date',
            'discount_end_date',
            'discount_active',
            # Calculated fields
            'has_discount',
            'discount_percentage',
            'original_price',
            'final_price',
            'discount_badge'
        ]
        read_only_fields = [
            'created', 'updated', 'image_url', 'discount_price',
            'has_discount', 'discount_percentage', 'original_price',
            'final_price', 'discount_badge'
        ]
        extra_kwargs = {
            'slug': {'required': False},
            'image': {'required': False},
            'quantity_unit': {'required': False, 'default': '1 kg'},
            'discount_type': {'required': False, 'default': 'none'},
            'discount_value': {'required': False, 'default': 0},
            'discount_active': {'required': False, 'default': True},
        }
    
    def get_image_url(self, obj):
        """Return full URL for image"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_has_discount(self, obj):
        """Check if product has active discount"""
        return obj.is_discount_valid()
    
    def get_discount_percentage(self, obj):
        """Get discount percentage"""
        return obj.get_discount_percentage()
    
    def get_original_price(self, obj):
        """Get original price"""
        return obj.price
    
    def get_final_price(self, obj):
        """Get final price after discount"""
        return obj.get_final_price()
    
    def get_discount_badge(self, obj):
        """Get discount badge for display"""
        if not obj.is_discount_valid():
            return None
        
        if obj.discount_type == 'percentage':
            return f"-{int(obj.discount_value)}%"
        elif obj.discount_type == 'fixed':
            return f"-৳{obj.discount_value}"
        return None
    
    def validate(self, data):
        """Validate discount data"""
        discount_type = data.get('discount_type')
        discount_value = data.get('discount_value', 0)
        discount_active = data.get('discount_active', False)
        
        if discount_type != 'none' and discount_active:
            if discount_type == 'percentage' and (discount_value <= 0 or discount_value > 100):
                raise serializers.ValidationError({
                    'discount_value': 'Percentage discount must be between 0 and 100'
                })
            elif discount_type == 'fixed' and discount_value <= 0:
                raise serializers.ValidationError({
                    'discount_value': 'Fixed discount must be greater than 0'
                })
        
        # Calculate discount price before saving
        product = Product(**data)
        product.calculate_discount_price()
        data['discount_price'] = product.discount_price
        
        return data


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'price', 'quantity', 'discount_applied']
    
    def to_representation(self, instance):
        """Modify representation to include discounted price"""
        data = super().to_representation(instance)
        product = instance.product
        
        if product.is_discount_valid():
            data['price_before_discount'] = float(product.price)
            data['final_price'] = float(product.get_final_price())
        
        return data


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 
            'user', 
            'name', 
            'email', 
            'phone', 
            'address', 
            'total_price', 
            'discount_applied',
            'created', 
            'paid', 
            'items'
        ]
        read_only_fields = ['created', 'total_price', 'discount_applied']


class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(),
        source='order',
        write_only=True
    )
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_id', 'transaction_id', 
            'amount', 'payment_method', 'status',
            'mobile_number', 'created', 'updated'
        ]
        read_only_fields = ['transaction_id', 'created', 'updated']