from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.cart.models import Cart
from apps.inventory.models import StockReservation

class Command(BaseCommand):
    help = 'Cleans up abandoned carts older than specified hours and expired stock reservations.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=48,
            help='Number of hours before a cart is considered abandoned (default: 48)',
        )

    def handle(self, *args, **options):
        hours = options['hours']
        cutoff_time = timezone.now() - timedelta(hours=hours)

        # 1. Clean up abandoned carts
        # We delete carts that have NOT been updated in the last X hours
        old_carts = Cart.objects.filter(updated_at__lt=cutoff_time)
        carts_count = old_carts.count()
        old_carts.delete()
        
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {carts_count} abandoned carts older than {hours} hours.'))

        # 2. Clean up expired stock reservations
        # Reservations that have expired (meaning user never completed checkout)
        expired_reservations = StockReservation.objects.filter(expires_at__lt=timezone.now())
        res_count = expired_reservations.count()
        expired_reservations.delete()

        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {res_count} expired stock reservations.'))
