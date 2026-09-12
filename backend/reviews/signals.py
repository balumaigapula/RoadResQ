from django.db.models import Avg, Count
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from providers.models import ProviderProfile
from reviews.models import Review


def _recalculate(provider_id):
    stats = Review.objects.filter(provider_id=provider_id).aggregate(avg=Avg('rating'), total=Count('id'))
    ProviderProfile.objects.filter(pk=provider_id).update(
        rating=round(stats['avg'] or 0, 2), total_reviews=stats['total'] or 0
    )


@receiver(post_save, sender=Review)
def update_rating_on_save(sender, instance, **kwargs):
    _recalculate(instance.provider_id)


@receiver(post_delete, sender=Review)
def update_rating_on_delete(sender, instance, **kwargs):
    _recalculate(instance.provider_id)
