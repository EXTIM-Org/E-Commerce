from celery import shared_task
from django.apps import apps
from django.core.files.base import ContentFile
from PIL import Image
from io import BytesIO
import os

@shared_task
def optimize_image_task(app_label, model_name, instance_id, field_name, max_width=800, max_height=800, quality=80, format='WEBP'):
    Model = apps.get_model(app_label, model_name)
    try:
        instance = Model.objects.get(pk=instance_id)
    except Model.DoesNotExist:
        return f"{model_name} {instance_id} not found."
        
    image_field = getattr(instance, field_name)
    if not image_field or not image_field.name:
        return "No image"

    try:
        img = Image.open(image_field)
        
        if img.mode in ("RGBA", "P") and format == 'JPEG':
            img = img.convert("RGB")
        elif img.mode == "P":
            img = img.convert("RGBA")
            
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        output = BytesIO()
        img.save(output, format=format, quality=quality)
        output.seek(0)
        
        name, _ = os.path.splitext(image_field.name)
        new_filename = f"{os.path.basename(name)}.{format.lower()}"
        
        old_path = image_field.path if hasattr(image_field, 'path') else None
        
        image_field.save(new_filename, ContentFile(output.read()), save=False)
        instance.save(update_fields=[field_name])
        
        if old_path and os.path.exists(old_path) and not old_path.endswith(f".{format.lower()}"):
            try:
                os.remove(old_path)
            except Exception:
                pass
                
        return f"Optimized {field_name} for {model_name} {instance_id}"
    except Exception as e:
        return f"Error: {str(e)}"
