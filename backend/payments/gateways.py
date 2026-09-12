"""
Structural Razorpay integration. No secrets are read from anywhere but
settings (which reads them from the environment), and nothing here trusts
a client-submitted "it succeeded" flag — real verification happens against
Razorpay's API/webhook signature once credentials are configured.
"""
from django.conf import settings


def is_razorpay_configured() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def create_order(amount_rupees, receipt: str):
    """Future: use the `razorpay` SDK —
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    return client.order.create({'amount': int(amount_rupees * 100), 'currency': 'INR', 'receipt': receipt})
    """
    if not is_razorpay_configured():
        return None
    raise NotImplementedError('Configure RAZORPAY_KEY_ID/SECRET and implement create_order with the razorpay SDK.')


def verify_payment_signature(order_id, payment_id, signature) -> bool:
    """Future: client.utility.verify_payment_signature({...}) — returns True/False."""
    if not is_razorpay_configured():
        return False
    raise NotImplementedError('Configure RAZORPAY_KEY_ID/SECRET and implement signature verification.')
