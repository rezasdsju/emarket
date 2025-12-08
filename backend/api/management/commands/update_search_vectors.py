# emarket/backend/api/management/commands/update_search_vectors.py

from django.core.management.base import BaseCommand
from django.contrib.postgres.search import SearchVector
from django.db.models import F
from api.models import Product


class Command(BaseCommand):
    help = 'Update search vectors for all products'
    
    def handle(self, *args, **options):
        self.stdout.write('🔄 সার্চ ভেক্টর আপডেট শুরু হচ্ছে...')
        
        # মোট পণ্য সংখ্যা
        total_products = Product.objects.count()
        self.stdout.write(f'📊 মোট পণ্য: {total_products}')
        
        if total_products == 0:
            self.stdout.write(self.style.WARNING('⚠️ কোনো পণ্য পাওয়া যায়নি'))
            return
        
        try:
            # সব পণ্যের search vector আপডেট
            updated_count = Product.objects.update(
                search_vector=SearchVector('name', weight='A') +
                              SearchVector('description', weight='B') +
                              SearchVector('category__name', weight='C')
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ সফলভাবে {updated_count} টি পণ্যের সার্চ ভেক্টর আপডেট হয়েছে'
                )
            )
            
            # কিছু স্যাম্পল ডাটা দেখান
            sample_products = Product.objects.filter(search_vector__isnull=False)[:3]
            if sample_products:
                self.stdout.write('\n📋 স্যাম্পল আপডেটেড পণ্য:')
                for product in sample_products:
                    self.stdout.write(f'   • {product.name}')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ এরর: {str(e)}'))
            self.stdout.write(
                self.style.WARNING(
                    '⚠️ ফুল-টেক্সট সার্চ কাজ নাও করতে পারে। '
                    'সাধারণ সার্চ ব্যবহার করা হবে।'
                )
            )