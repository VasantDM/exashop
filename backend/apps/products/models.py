from django.db import models
from django.utils.text import slugify


class Brand(models.Model):
    """Product Brand entity model."""

    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def display_logo(self):
        if self.logo:
            return self.logo.url
        if self.logo_url:
            return self.logo_url
        return None


class Product(models.Model):
    """Product Catalog Item model."""

    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=280, unique=True, db_index=True)
    sku = models.CharField(max_length=64, unique=True, db_index=True)
    short_description = models.CharField(max_length=350, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    stock = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    reviews_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (${self.price})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def in_stock(self):
        return self.stock > 0 and self.is_available

    @property
    def current_price(self):
        return self.discount_price if self.discount_price and self.discount_price < self.price else self.price

    @property
    def has_discount(self):
        return bool(self.discount_price and self.discount_price < self.price)

    @property
    def discount_percentage(self):
        if self.has_discount and self.price > 0:
            savings = ((self.price - self.discount_price) / self.price) * 100
            return int(round(savings))
        return 0

    @property
    def primary_image(self):
        first_img = self.images.filter(is_primary=True).first() or self.images.first()
        if first_img:
            return first_img.display_image
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'

    @property
    def has_variants(self):
        return self.variants.filter(is_active=True).exists()

    @property
    def available_colors(self):
        """Distinct active colors with name, hex code, and sample preview photo."""
        colors = []
        seen = set()
        for v in self.variants.filter(is_active=True):
            if v.color_name and v.color_name not in seen:
                seen.add(v.color_name)
                colors.append({
                    'name': v.color_name,
                    'code': v.color_code or '#6366f1',
                    'image_url': v.image_url or self.primary_image
                })
        return colors

    @property
    def available_sizes(self):
        """Distinct active sizes for this product."""
        sizes = []
        seen = set()
        for v in self.variants.filter(is_active=True):
            if v.size and v.size not in seen:
                seen.add(v.size)
                sizes.append(v.size)
        return sizes


class ProductImage(models.Model):
    """Product Image Gallery model."""

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'
        ordering = ['-is_primary', 'id']

    def __str__(self):
        return f"Image for {self.product.name} ({'Primary' if self.is_primary else 'Gallery'})"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        if self.image_url:
            return self.image_url
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    """Product SKU Variant entity representing Size, Color, and stock variations."""

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=64, unique=True, db_index=True)
    color_name = models.CharField(max_length=64, blank=True, help_text="e.g. Onyx Black, Midnight Navy, Crimson Red")
    color_code = models.CharField(max_length=30, blank=True, help_text="e.g. #111827, #1e3a8a, #dc2626")
    size = models.CharField(max_length=30, blank=True, help_text="e.g. XS, S, M, L, XL, XXL, 30, 32")
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0, help_text="Available inventory units for this specific variant.")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="Optional color-specific photo URL.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Product Variant'
        verbose_name_plural = 'Product Variants'
        ordering = ['color_name', 'size']

    def __str__(self):
        desc = []
        if self.color_name:
            desc.append(f"Color: {self.color_name}")
        if self.size:
            desc.append(f"Size: {self.size}")
        return f"{self.product.name} ({', '.join(desc) or self.sku}) - Stock: {self.stock}"

    @property
    def in_stock(self):
        return self.stock > 0 and self.is_active

    @property
    def current_price(self):
        if self.price_override is not None:
            return self.price_override
        return self.product.current_price
