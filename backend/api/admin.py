from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem, Payment

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
    list_display = ('name', 'quantity_unit', 'category', 'price', 'stock', 'available', 'featured', 'created', 'image_preview')
    list_filter = ('available', 'featured', 'created', 'category')
    list_editable = ('price', 'quantity_unit', 'stock', 'available', 'featured')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description', 'quantity_unit')
    raw_id_fields = ('category',)
    date_hierarchy = 'created'
    ordering = ('-created',)
    
    # ✅ Option 1: সব ফিল্ড একসাথে
    fields = ('name', 'slug', 'category', 'image', 'price', 'quantity_unit', 
              'description', 'stock', 'available', 'featured')
    
    # ✅ Option 2: ফিল্ডসেট ব্যবহার
    """
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Image', {
            'fields': ('image',)
        }),
        ('Price & Quantity', {
            'fields': ('price', 'quantity_unit', 'stock')
        }),
        ('Status', {
            'fields': ('available', 'featured')
        }),
    )
    """
    
    # ✅ Optional: Image preview in list view
    def image_preview(self, obj):
        if obj.image:
            return f'✅ Image Uploaded'
        return '❌ No Image'
    image_preview.short_description = 'Image Status'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'total_price', 'paid', 'created')
    list_filter = ('paid', 'created')
    search_fields = ('name', 'email', 'phone', 'address')
    inlines = [OrderItemInline]
    date_hierarchy = 'created'
    ordering = ('-created',)


# ✅ User Admin Customization for password change
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

# Unregister and re-register User with custom admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# ✅ Admin site customization (ঐচ্ছিক)
admin.site.site_header = "Organic Bazar Admin Panel"
admin.site.site_title = "Organic Bazar Admin"
admin.site.index_title = "Welcome to Organic Bazar Admin"






