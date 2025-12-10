from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVector, SearchVectorField

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Category Name")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Category Slug")
    
    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='products',
        verbose_name="Product Category"
    )
    name = models.CharField(max_length=200, verbose_name="Product Name")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="Product Slug")
    image = models.ImageField(
        upload_to='products/%Y/%m/%d/', 
        blank=True, 
        null=True,
        verbose_name="Product Image"
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Price"
    )
    
    # ✅ FIXED: blank=True যোগ করা হয়েছে
    quantity_unit = models.CharField(
        max_length=50, 
        default="1 kg",
        verbose_name="পরিমাণের একক",
        help_text="যেমন: 1 kg, 500 gm, 250 ml, 1 পিস ইত্যাদি",
        blank=True  # ✅ এই লাইন যোগ করুন
    )
    
    description = models.TextField(blank=True, verbose_name="Description")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock Quantity")
    available = models.BooleanField(default=True, verbose_name="Is Available?")
    featured = models.BooleanField(default=False, verbose_name="Featured Product")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    # সার্চ অপটিমাইজেশনের জন্য নতুন ফিল্ড (সিম্পল ভার্সন)
    search_vector = SearchVectorField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created']
        verbose_name = "Product"
        verbose_name_plural = "Products"
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['featured']),
            models.Index(fields=['available']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.quantity_unit})"
    
    def get_image_url(self):
        """Return full image URL"""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None
    
    def update_search_vector(self):
        """Search vector আপডেট করার মেথড"""
        try:
            from django.contrib.postgres.search import SearchVector
            Product.objects.filter(pk=self.pk).update(
                search_vector=SearchVector('name', weight='A') +
                              SearchVector('description', weight='B') +
                              SearchVector('quantity_unit', weight='C')
            )
        except Exception:
            pass


class Order(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="User"
    )
    name = models.CharField(max_length=100, verbose_name="Customer Name")
    email = models.EmailField(verbose_name="Customer Email")
    phone = models.CharField(max_length=15, verbose_name="Phone Number")
    address = models.TextField(verbose_name="Delivery Address")
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Total Price"
    )
    created = models.DateTimeField(auto_now_add=True, verbose_name="Order Date")
    paid = models.BooleanField(default=False, verbose_name="Payment Status")
    
    class Meta:
        ordering = ['-created']
        verbose_name = "Order"
        verbose_name_plural = "Orders"
    
    def __str__(self):
        return f"Order #{self.id} - {self.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='items',
        verbose_name="Order"
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        verbose_name="Product"
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Price at Purchase"
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name="Quantity")
    
    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    def get_total_price(self):
        return self.price * self.quantity


class Payment(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=[
        ('bkash', 'bKash'),
        ('rocket', 'Rocket'),
        ('nagad', 'Nagad'),
        ('card', 'Card'),
        ('cod', 'Cash on Delivery'),
    ])
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created']
    
    def __str__(self):
        return f"Payment #{self.transaction_id} - {self.order.name}"