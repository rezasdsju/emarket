from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem, Payment
from django.utils.html import format_html
from django.utils import timezone

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'order', 'amount', 'payment_method', 'status', 'created')
    list_filter = ('status', 'payment_method', 'created')
    search_fields = ('transaction_id', 'order__name', 'mobile_number')
    date_hierarchy = 'created'
    ordering = ('-created',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'get_product_count')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    
    def get_product_count(self, obj):
        return obj.products.count()
    get_product_count.short_description = 'Product Count'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ('product',)
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'category', 
        'get_price_display', 
        'get_discount_display', 
        'get_final_price',
        'quantity_unit',
        'stock', 
        'available', 
        'featured', 
        'discount_active',
        'created'
    )
    list_filter = (
        'available', 
        'featured', 
        'created', 
        'category', 
        'discount_active',
        'discount_type'
    )
    list_editable = (
        'price', 
        'quantity_unit',
        'stock', 
        'available', 
        'featured',
        'discount_active',
        'discount_type',
        'discount_value'
    )
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description', 'quantity_unit')
    raw_id_fields = ('category',)
    date_hierarchy = 'created'
    ordering = ('-created',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Image', {
            'fields': ('image', 'image_preview')
        }),
        ('Price & Quantity', {
            'fields': ('price', 'quantity_unit', 'stock')
        }),
        ('Discount Settings', {
            'fields': (
                'discount_type',
                'discount_value',
                'discount_active',
                'discount_start_date',
                'discount_end_date',
                'discount_price'
            ),
            'classes': ('collapse', 'wide'),
        }),
        ('Status', {
            'fields': ('available', 'featured')
        }),
    )
    
    readonly_fields = ('image_preview', 'discount_price')
    
    # Custom methods for display
    def get_price_display(self, obj):
        if obj.discount_type != 'none' and obj.discount_active and obj.discount_price:
            return format_html(
                '<span style="text-decoration: line-through; color: #999;">৳{}</span>',
                obj.price
            )
        return f"৳{obj.price}"
    get_price_display.short_description = 'Price'
    get_price_display.admin_order_field = 'price'
    
    def get_discount_display(self, obj):
        if obj.discount_type == 'none' or not obj.discount_active:
            return format_html('<span style="color: #999;">No Discount</span>')
        
        now = timezone.now()
        is_valid = True
        
        if obj.discount_start_date and now < obj.discount_start_date:
            is_valid = False
        if obj.discount_end_date and now > obj.discount_end_date:
            is_valid = False
        
        if not is_valid:
            return format_html('<span style="color: #ff9800;">Expired</span>')
        
        if obj.discount_type == 'percentage':
            return format_html(
                '<span style="color: #4caf50; font-weight: bold;">{}% OFF</span>',
                obj.discount_value
            )
        elif obj.discount_type == 'fixed':
            return format_html(
                '<span style="color: #4caf50; font-weight: bold;">৳{} OFF</span>',
                obj.discount_value
            )
        return format_html('<span style="color: #999;">No Discount</span>')
    get_discount_display.short_description = 'Discount'
    
    def get_final_price(self, obj):
        if obj.discount_type != 'none' and obj.discount_active and obj.discount_price:
            return format_html(
                '<span style="color: #f44336; font-weight: bold;">৳{}</span>',
                obj.discount_price
            )
        return f"৳{obj.price}"
    get_final_price.short_description = 'Final Price'
    get_final_price.admin_order_field = 'price'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No Image</span>')
    image_preview.short_description = 'Image Preview'
    
    # Bulk actions
    actions = ['activate_discounts', 'deactivate_discounts', 'apply_percentage_discount']
    
    def activate_discounts(self, request, queryset):
        updated = queryset.update(discount_active=True)
        self.message_user(request, f'{updated} products discount activated.')
    activate_discounts.short_description = "Activate discount for selected products"
    
    def deactivate_discounts(self, request, queryset):
        updated = queryset.update(discount_active=False)
        self.message_user(request, f'{updated} products discount deactivated.')
    deactivate_discounts.short_description = "Deactivate discount for selected products"
    
    def apply_percentage_discount(self, request, queryset):
        """Apply 10% discount to selected products"""
        for product in queryset:
            if product.discount_type == 'none':
                product.discount_type = 'percentage'
                product.discount_value = 10
                product.discount_active = True
                product.calculate_discount_price()
                product.save()
        self.message_user(request, f'Applied 10% discount to {queryset.count()} products.')
    apply_percentage_discount.short_description = "Apply 10% discount to selected products"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'name', 
        'email', 
        'phone', 
        'get_total_price_display', 
        'discount_applied',
        'paid', 
        'created'
    )
    list_filter = ('paid', 'created')
    search_fields = ('name', 'email', 'phone', 'address')
    inlines = [OrderItemInline]
    date_hierarchy = 'created'
    ordering = ('-created',)
    
    def get_total_price_display(self, obj):
        if obj.discount_applied > 0:
            return format_html(
                '<span>৳{} <small style="color: #4caf50;">(-৳{})</small></span>',
                obj.total_price,
                obj.discount_applied
            )
        return f"৳{obj.total_price}"
    get_total_price_display.short_description = 'Total Price'


# User Admin Customization
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

# Unregister and re-register User with custom admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Admin site customization
admin.site.site_header = "Organic Bazar Admin Panel"
admin.site.site_title = "Organic Bazar Admin"
admin.site.index_title = "Welcome to Organic Bazar Admin"