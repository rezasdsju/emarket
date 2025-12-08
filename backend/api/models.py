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
    description = models.TextField(blank=True, verbose_name="Description")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock Quantity")
    available = models.BooleanField(default=True, verbose_name="Is Available?")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        ordering = ['-created']
        verbose_name = "Product"
        verbose_name_plural = "Products"
    
    def __str__(self):
        return self.name
    
    def get_image_url(self):
        """Return full image URL"""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None


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
    
















# models.py-তে নিচের ক্লাস যোগ করুন (Order মডেলের পরে)
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
    ])
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created']
    
    def __str__(self):
        return f"Payment #{self.transaction_id} - {self.order.name}"
    



















# models.py - Product model-এ যোগ করুন:

from django.db import models
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

class Product(models.Model):
    # ... existing fields ...
    
    # সার্চ অপটিমাইজেশনের জন্য
    search_vector = SearchVectorField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created']
        verbose_name = "Product"
        verbose_name_plural = "Products"
        indexes = [
            GinIndex(fields=['search_vector']),  # ফাস্ট সার্চের জন্য
            models.Index(fields=['name', 'category']),
            models.Index(fields=['available', 'price']),
        ]
    
    def save(self, *args, **kwargs):
        # সার্চ ভেক্টর আপডেট
        super().save(*args, **kwargs)
        Product.objects.filter(pk=self.pk).update(
            search_vector=SearchVector('name', 'description', 'category__name')
        )