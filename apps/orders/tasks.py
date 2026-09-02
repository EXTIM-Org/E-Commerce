from celery import shared_task
import time

@shared_task
def send_order_confirmation(order_id):
    """
    Simulates sending an order confirmation email.
    In a real app, this would use django.core.mail.send_mail 
    and perhaps generate a PDF invoice.
    """
    time.sleep(5) # Simulate heavy lifting (SMTP connection, PDF generation)
    print(f"✅ [CELERY] Order confirmation email successfully sent for Order ID: {order_id}")
    return f"Order {order_id} email sent"
