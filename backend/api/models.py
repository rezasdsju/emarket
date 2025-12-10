from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVector, SearchVectorField
from django.core.validators import MinValueValidator, MaxValueValidator

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
    
    # ✅ ডিসকাউন্ট ফিল্ডসমূহ
    discount_type = models.CharField(
        max_length=10,
        choices=[
            ('percentage', 'Percentage (%)'),
            ('fixed', 'Fixed Amount'),
            ('none', 'No Discount')
        ],
        default='none',
        verbose_name="Discount Type"
    )
    
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Discount Value",
        help_text="Percentage or fixed amount based on discount type"
    )
    
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Discounted Price",
        help_text="Auto-calculated final price after discount"
    )
    
    discount_start_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Discount Start Date"
    )
    
    discount_end_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Discount End Date"
    )
    
    discount_active = models.BooleanField(
        default=True,
        verbose_name="Discount Active"
    )
    
    quantity_unit = models.CharField(
        max_length=50, 
        default="1 kg",
        verbose_name="পরিমাণের একক",
        help_text="যেমন: 1 kg, 500 gm, 250 ml, 1 পিস ইত্যাদি",
        blank=True
    )
    
    description = models.TextField(blank=True, verbose_name="Description")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock Quantity")
    available = models.BooleanField(default=True, verbose_name="Is Available?")
    featured = models.BooleanField(default=False, verbose_name="Featured Product")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    # সার্চ অপটিমাইজেশনের জন্য নতুন ফিল্ড
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
            models.Index(fields=['discount_active']),
            models.Index(fields=['discount_type']),
        ]
    
    def __str__(self):
        discount_str = ""
        if self.discount_type != 'none' and self.discount_active:
            if self.discount_type == 'percentage':
                discount_str = f" ({self.discount_value}% off)"
            else:
                discount_str = f" (৳{self.discount_value} off)"
        return f"{self.name} ({self.quantity_unit}){discount_str}"
    
    def save(self, *args, **kwargs):
        # Calculate discount price before saving
        self.calculate_discount_price()
        super().save(*args, **kwargs)
    
    def calculate_discount_price(self):
        """Calculate discounted price based on discount type"""
        if self.discount_type == 'none' or not self.discount_active:
            self.discount_price = self.price
            return
        
        try:
            if self.discount_type == 'percentage':
                discount_amount = (self.price * self.discount_value) / 100
                self.discount_price = self.price - discount_amount
            elif self.discount_type == 'fixed':
                self.discount_price = max(self.price - self.discount_value, 0)
            else:
                self.discount_price = self.price
        except Exception:
            self.discount_price = self.price
    
    def get_image_url(self):
        """Return full image URL"""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None
    
    def is_discount_valid(self):
        """Check if discount is currently valid"""
        if not self.discount_active or self.discount_type == 'none':
            return False
        
        from django.utils import timezone
        now = timezone.now()
        
        if self.discount_start_date and now < self.discount_start_date:
            return False
        
        if self.discount_end_date and now > self.discount_end_date:
            return False
        
        return True
    
    def get_discount_percentage(self):
        """Get discount percentage for display"""
        if not self.is_discount_valid():
            return 0
        
        if self.discount_type == 'percentage':
            return float(self.discount_value)
        elif self.discount_type == 'fixed' and self.price > 0:
            return (float(self.discount_value) / float(self.price)) * 100
        return 0
    
    def get_final_price(self):
        """Get final price after discount"""
        if self.is_discount_valid() and self.discount_price:
            return self.discount_price
        return self.price
    
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
    discount_applied = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Discount Applied"
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
    discount_applied = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Discount Applied"
    )
    
    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    def get_total_price(self):
        return (self.price - self.discount_applied) * self.quantity


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