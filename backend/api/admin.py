from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem, Payment
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'order_link', 'amount_display', 'payment_method', 'status', 'created')
    list_filter = ('status', 'payment_method', 'created')
    search_fields = ('transaction_id', 'order__name', 'mobile_number')
    date_hierarchy = 'created'
    ordering = ('-created',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('transaction_id', 'order', 'status')
        }),
        ('Payment Details', {
            'fields': ('amount', 'payment_method', 'payment_details')
        }),
        ('Customer Info', {
            'fields': ('mobile_number', 'email')
        }),
    )
    
    def order_link(self, obj):
        if obj.order:
            url = reverse("admin:api_order_change", args=[obj.order.id])
            return format_html('<a href="{}">{}</a>', url, f"Order #{obj.order.id}")
        return "-"
    order_link.short_description = 'Order'
    
    def amount_display(self, obj):
        return format_html('<strong>৳{}</strong>', obj.amount)
    amount_display.short_description = 'Amount'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'product_count', 'active_product_count')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    
    def product_count(self, obj):
        count = obj.products.count()
        url = reverse("admin:api_product_changelist") + f"?category__id__exact={obj.id}"
        return format_html('<a href="{}">{}</a>', url, count)
    product_count.short_description = 'Total Products'
    
    def active_product_count(self, obj):
        count = obj.products.filter(available=True).count()
        url = reverse("admin:api_product_changelist") + f"?category__id__exact={obj.id}&available__exact=1"
        return format_html('<a href="{}">{}</a>', url, count)
    active_product_count.short_description = 'Active Products'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ('product',)
    extra = 0
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ('item_total',)
        return ()
    
    def item_total(self, obj):
        if obj.product and obj.quantity:
            return f"৳{obj.product.price * obj.quantity}"
        return "৳0"
    item_total.short_description = 'Total'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'image_preview_small',
        'name', 
        'category', 
        'price_display',
        'discount_display',
        'final_price',
        'quantity_unit',
        'stock',
        'available',
        'featured',
        'discount_active',
        'discount_type',
        'discount_value',
        'created_short',
    )
    
    list_filter = (
        'available', 
        'featured', 
        'category', 
        'discount_active',
        'discount_type',
        'quantity_unit',
    )
    
    list_editable = (
        'stock', 
        'available', 
        'featured',
        'discount_active',
        'discount_type',
        'discount_value',
        'quantity_unit',
    )
    
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description', 'quantity_unit', 'category__name')
    raw_id_fields = ('category',)
    date_hierarchy = 'created'
    ordering = ('-created',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Image', {
            'fields': ('image', 'image_preview_large'),
        }),
        ('Price & Quantity', {
            'fields': ('price', 'quantity_unit', 'stock', 'discount_price')
        }),
        ('Discount Settings', {
            'fields': (
                'discount_active',
                'discount_type',
                'discount_value',
                'discount_start_date',
                'discount_end_date',
            ),
        }),
        ('Status', {
            'fields': ('available', 'featured')
        }),
    )
    
    readonly_fields = ('image_preview_large', 'discount_price')
    
    # Bulk actions
    actions = ['activate_discounts', 'deactivate_discounts', 'apply_percentage_discount', 'make_available', 'make_unavailable']
    
    def activate_discounts(self, request, queryset):
        updated = queryset.update(discount_active=True)
        self.message_user(request, f'{updated} products discount activated.')
    activate_discounts.short_description = "Activate discount"
    
    def deactivate_discounts(self, request, queryset):
        updated = queryset.update(discount_active=False)
        self.message_user(request, f'{updated} products discount deactivated.')
    deactivate_discounts.short_description = "Deactivate discount"
    
    def apply_percentage_discount(self, request, queryset):
        """Apply 10% discount to selected products"""
        for product in queryset:
            if product.discount_type == 'none':
                product.discount_type = 'percentage'
                product.discount_value = 10
                product.discount_active = True
                # Calculate discount price
                if product.discount_type == 'percentage':
                    discount_amount = product.price * (product.discount_value / 100)
                    product.discount_price = product.price - discount_amount
                product.save()
        self.message_user(request, f'Applied 10% discount to {queryset.count()} products.')
    apply_percentage_discount.short_description = "Apply 10% discount"
    
    def make_available(self, request, queryset):
        updated = queryset.update(available=True)
        self.message_user(request, f'{updated} products marked as available.')
    make_available.short_description = "Mark as available"
    
    def make_unavailable(self, request, queryset):
        updated = queryset.update(available=False)
        self.message_user(request, f'{updated} products marked as unavailable.')
    make_unavailable.short_description = "Mark as unavailable"
    
    # Custom methods for display
    def image_preview_small(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px; border-radius: 4px;" />',
                obj.image.url
            )
        return format_html(
            '<div style="width: 50px; height: 50px; background: #f5f5f5; '
            'display: flex; align-items: center; justify-content: center; '
            'border-radius: 4px; color: #999;">No Image</div>'
        )
    image_preview_small.short_description = 'Image'
    
    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 300px; max-width: 300px;" />',
                obj.image.url
            )
        return "No image uploaded"
    image_preview_large.short_description = 'Image Preview'
    
    def price_display(self, obj):
        return format_html('<strong>৳{}</strong>', obj.price)
    price_display.short_description = 'Price'
    
    def discount_display(self, obj):
        if obj.discount_active and obj.discount_type != 'none':
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
    discount_display.short_description = 'Discount'
    
    def final_price(self, obj):
        if obj.discount_price and obj.discount_price < obj.price:
            return format_html(
                '<span style="color: #f44336; font-weight: bold;">৳{}</span>',
                obj.discount_price
            )
        return format_html('<span>৳{}</span>', obj.price)
    final_price.short_description = 'Final Price'
    
    def created_short(self, obj):
        return obj.created.strftime('%b %d, %Y')
    created_short.short_description = 'Created'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_id_display',
        'customer_info',
        'items_count',
        'total_price_display',
        'discount_display',
        'payment_status',
        'created_date',
    )
    
    list_filter = (
        'paid', 
        'created',
    )
    
    search_fields = (
        'name', 
        'email', 
        'phone', 
        'address',
        'id',
    )
    
    inlines = [OrderItemInline]
    date_hierarchy = 'created'
    ordering = ('-created',)
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('name', 'email', 'phone', 'address')
        }),
        ('Order Details', {
            'fields': ('total_price', 'discount_applied', 'notes')
        }),
        ('Status', {
            'fields': ('paid',)
        }),
    )
    
    def order_id_display(self, obj):
        return format_html(
            '<strong>#{}</strong>',
            str(obj.id).zfill(6)
        )
    order_id_display.short_description = 'Order ID'
    
    def customer_info(self, obj):
        return format_html(
            '{}<br/><small>{}</small><br/><small>{}</small>',
            obj.name,
            obj.email,
            obj.phone
        )
    customer_info.short_description = 'Customer'
    
    def items_count(self, obj):
        count = obj.items.count()
        return format_html(
            '<span style="font-weight: bold;">{} items</span>',
            count
        )
    items_count.short_description = 'Items'
    
    def total_price_display(self, obj):
        if obj.discount_applied and obj.discount_applied > 0:
            original = obj.total_price + obj.discount_applied
            return format_html(
                '<span>৳{}<br/><small style="color: #999; text-decoration: line-through;">৳{}</small></span>',
                obj.total_price,
                original
            )
        return format_html(
            '<span>৳{}</span>',
            obj.total_price
        )
    total_price_display.short_description = 'Total'
    
    def discount_display(self, obj):
        if obj.discount_applied and obj.discount_applied > 0:
            return format_html(
                '<span style="color: #4caf50; font-weight: bold;">-৳{}</span>',
                obj.discount_applied
            )
        return format_html('<span style="color: #999;">-</span>')
    discount_display.short_description = 'Discount'
    
    def payment_status(self, obj):
        if obj.paid:
            return format_html(
                '<span style="color: #4caf50; font-weight: bold;">✓ Paid</span>'
            )
        return format_html(
            '<span style="color: #f44336;">✗ Unpaid</span>'
        )
    payment_status.short_description = 'Payment'
    
    def created_date(self, obj):
        return obj.created.strftime('%b %d, %Y %I:%M %p')
    created_date.short_description = 'Order Date'


# User Admin Customization
class UserAdmin(BaseUserAdmin):
    list_display = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'is_staff', 
        'is_superuser',
        'date_joined_short'
    )
    
    list_filter = (
        'is_staff', 
        'is_superuser', 
        'is_active', 
        'groups',
        'date_joined'
    )
    
    search_fields = (
        'username', 
        'first_name', 
        'last_name', 
        'email'
    )
    
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    readonly_fields = ('last_login', 'date_joined')
    
    def date_joined_short(self, obj):
        return obj.date_joined.strftime('%b %d, %Y')
    date_joined_short.short_description = 'Joined'


# Unregister and re-register User with custom admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# Admin site customization
admin.site.site_header = "🥦 Organic Bazar Admin Panel"
admin.site.site_title = "Organic Bazar"
admin.site.index_title = "Welcome to Organic Bazar Administration"