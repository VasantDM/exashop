import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.categories.models import Category
from apps.products.models import Brand, Product, ProductImage, ProductVariant

def seed_clothing():
    # 1. Create Apparel & Fashion Categories
    fashion_cat, _ = Category.objects.get_or_create(
        slug='fashion-apparel',
        defaults={
            'name': 'Fashion & Apparel',
            'description': 'Premium streetwear, minimal classics, and bespoke everyday essentials.',
            'icon': 'Sparkles'
        }
    )

    mens_cat, _ = Category.objects.get_or_create(
        slug='mens-clothing',
        defaults={
            'name': "Men's Clothing",
            'parent': fashion_cat,
            'description': 'Elevated menswear essentials and tailored fits.'
        }
    )

    # 2. Fashion Brands
    aura_brand, _ = Brand.objects.get_or_create(
        slug='aura-studio',
        defaults={
            'name': 'Aura Studio',
            'description': 'Minimalist luxury and heavy cotton staples.'
        }
    )

    nordic_brand, _ = Brand.objects.get_or_create(
        slug='nordic-threads',
        defaults={
            'name': 'Nordic Threads',
            'description': 'Scandinavian inspired functional street apparel.'
        }
    )

    # 3. Product 1: Oversized Heavyweight Cotton Hoodie
    hoodie, _ = Product.objects.get_or_create(
        slug='oversized-heavyweight-hoodie',
        defaults={
            'name': 'Oversized Heavyweight Cotton Hoodie',
            'sku': 'APP-HOOD-001',
            'short_description': '480 GSM French Terry Cotton, dropped shoulders, relaxed boxy silhouette.',
            'description': (
                'Engineered from 100% sustainably sourced 480 GSM organic French Terry cotton. '
                'Features a double-layered hood without drawstrings for a clean contemporary aesthetic, '
                'heavyweight 2x2 ribbing at the cuffs and hem, and a structured oversized drape that holds its form.'
            ),
            'price': 2999.00,
            'discount_price': 2499.00,
            'category': mens_cat,
            'brand': aura_brand,
            'stock': 45,
            'is_available': True,
            'is_featured': True,
            'average_rating': 4.90,
            'reviews_count': 128
        }
    )

    # Gallery Images for Hoodie
    ProductImage.objects.get_or_create(
        product=hoodie,
        image_url='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        defaults={'alt_text': 'Oversized Heavyweight Hoodie Black', 'is_primary': True}
    )
    ProductImage.objects.get_or_create(
        product=hoodie,
        image_url='https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
        defaults={'alt_text': 'Oversized Heavyweight Hoodie Navy', 'is_primary': False}
    )
    ProductImage.objects.get_or_create(
        product=hoodie,
        image_url='https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
        defaults={'alt_text': 'Oversized Heavyweight Hoodie Sage', 'is_primary': False}
    )

    # Variants for Hoodie (3 Colors x 4 Sizes = 12 Variants)
    hoodie_variants_data = [
        # Onyx Black
        {'color': 'Onyx Black', 'hex': '#111827', 'size': 'S', 'sku': 'HD-BLK-S', 'stock': 8, 'img': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Onyx Black', 'hex': '#111827', 'size': 'M', 'sku': 'HD-BLK-M', 'stock': 15, 'img': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Onyx Black', 'hex': '#111827', 'size': 'L', 'sku': 'HD-BLK-L', 'stock': 12, 'img': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Onyx Black', 'hex': '#111827', 'size': 'XL', 'sku': 'HD-BLK-XL', 'stock': 5, 'img': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'},
        # Midnight Navy
        {'color': 'Midnight Navy', 'hex': '#1e3a8a', 'size': 'S', 'sku': 'HD-NVY-S', 'stock': 6, 'img': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Midnight Navy', 'hex': '#1e3a8a', 'size': 'M', 'sku': 'HD-NVY-M', 'stock': 10, 'img': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Midnight Navy', 'hex': '#1e3a8a', 'size': 'L', 'sku': 'HD-NVY-L', 'stock': 0, 'img': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'}, # Out of stock demo!
        {'color': 'Midnight Navy', 'hex': '#1e3a8a', 'size': 'XL', 'sku': 'HD-NVY-XL', 'stock': 4, 'img': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'},
        # Sage Green
        {'color': 'Sage Green', 'hex': '#4d7c0f', 'size': 'S', 'sku': 'HD-SGE-S', 'stock': 7, 'img': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Sage Green', 'hex': '#4d7c0f', 'size': 'M', 'sku': 'HD-SGE-M', 'stock': 9, 'img': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Sage Green', 'hex': '#4d7c0f', 'size': 'L', 'sku': 'HD-SGE-L', 'stock': 6, 'img': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Sage Green', 'hex': '#4d7c0f', 'size': 'XL', 'sku': 'HD-SGE-XL', 'stock': 3, 'img': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80'},
    ]

    for v in hoodie_variants_data:
        ProductVariant.objects.update_or_create(
            product=hoodie,
            sku=v['sku'],
            defaults={
                'color_name': v['color'],
                'color_code': v['hex'],
                'size': v['size'],
                'stock': v['stock'],
                'image_url': v['img'],
                'is_active': True
            }
        )

    # 4. Product 2: Relaxed Heavyweight Boxy Tee
    tee, _ = Product.objects.get_or_create(
        slug='relaxed-heavyweight-boxy-tee',
        defaults={
            'name': 'Relaxed Heavyweight Boxy T-Shirt',
            'sku': 'APP-TEE-002',
            'short_description': '260 GSM combed cotton, drop shoulder cut, pre-shrunk finish.',
            'description': (
                'A core essential staple tee crafted from combed 260 GSM single jersey cotton. '
                'Pre-shrunk and silicone washed for ultra-soft hand feel and zero wash shrinkage. '
                'Features a thick 1.25" bound collar and clean double needle hems.'
            ),
            'price': 1499.00,
            'discount_price': 1199.00,
            'category': mens_cat,
            'brand': nordic_brand,
            'stock': 60,
            'is_available': True,
            'is_featured': True,
            'average_rating': 4.85,
            'reviews_count': 94
        }
    )

    ProductImage.objects.get_or_create(
        product=tee,
        image_url='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        defaults={'alt_text': 'Relaxed Boxy Tee White', 'is_primary': True}
    )
    ProductImage.objects.get_or_create(
        product=tee,
        image_url='https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
        defaults={'alt_text': 'Relaxed Boxy Tee Black', 'is_primary': False}
    )

    tee_variants_data = [
        # Pure White
        {'color': 'Pure White', 'hex': '#f8fafc', 'size': 'S', 'sku': 'TEE-WHT-S', 'stock': 12, 'img': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Pure White', 'hex': '#f8fafc', 'size': 'M', 'sku': 'TEE-WHT-M', 'stock': 20, 'img': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Pure White', 'hex': '#f8fafc', 'size': 'L', 'sku': 'TEE-WHT-L', 'stock': 14, 'img': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Pure White', 'hex': '#f8fafc', 'size': 'XL', 'sku': 'TEE-WHT-XL', 'stock': 8, 'img': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'},
        # Vintage Black
        {'color': 'Vintage Black', 'hex': '#1e293b', 'size': 'S', 'sku': 'TEE-BLK-S', 'stock': 10, 'img': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Vintage Black', 'hex': '#1e293b', 'size': 'M', 'sku': 'TEE-BLK-M', 'stock': 18, 'img': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Vintage Black', 'hex': '#1e293b', 'size': 'L', 'sku': 'TEE-BLK-L', 'stock': 15, 'img': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80'},
        {'color': 'Vintage Black', 'hex': '#1e293b', 'size': 'XL', 'sku': 'TEE-BLK-XL', 'stock': 6, 'img': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80'},
    ]

    for v in tee_variants_data:
        ProductVariant.objects.update_or_create(
            product=tee,
            sku=v['sku'],
            defaults={
                'color_name': v['color'],
                'color_code': v['hex'],
                'size': v['size'],
                'stock': v['stock'],
                'image_url': v['img'],
                'is_active': True
            }
        )

    print("[SUCCESS] Successfully seeded Fashion Apparel & Clothing Variants with Colors, Sizes, and Stock!")

if __name__ == '__main__':
    seed_clothing()
