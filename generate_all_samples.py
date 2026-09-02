import os, sys, django, csv
sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.admin import site
from import_export.admin import ImportExportMixin
from django.core.exceptions import FieldDoesNotExist

# Directory to save samples
out_dir = 'import_samples'
if not os.path.exists(out_dir):
    os.makedirs(out_dir)

for model, admin_class in site._registry.items():
    if issubclass(type(admin_class), ImportExportMixin):
        app_label = model._meta.app_label
        model_name = model.__name__
        
        # Removed the skip condition for Product so it gets generated as well.
        try:
            resources = admin_class.get_import_resource_classes(None)
            for res_class in resources:
                res = res_class()
                
                headers = []
                # First row: Mandatory / Optional indicator
                # Second row: Real headers (used by import)
                # Third row: Empty dummy row or sample data
                
                indicator_row = []
                header_row = []
                dummy_row = []
                
                for field in res.get_import_fields():
                    col_name = str(field.column_name)
                    is_mandatory = True
                    is_readonly = getattr(field, 'readonly', False)
                    
                    # Default assumption based on Django UI: fields without blank=True are mandatory
                    is_mandatory = True
                    is_readonly = getattr(field, 'readonly', False)
                    
                    if field.attribute:
                        try:
                            # If it's a real field on the main model
                            model_field = model._meta.get_field(field.attribute)
                            if model_field.blank:
                                is_mandatory = False
                        except FieldDoesNotExist:
                            # If it's a related field, e.g., product__name
                            if '__' in field.attribute:
                                try:
                                    rel_model = model
                                    parts = field.attribute.split('__')
                                    for part in parts[:-1]:
                                        rel_model = rel_model._meta.get_field(part).related_model
                                    rel_field = rel_model._meta.get_field(parts[-1])
                                    if rel_field.blank:
                                        is_mandatory = False
                                except:
                                    pass
                            elif hasattr(field, 'default'):
                                is_mandatory = False
                    
                    # Hardcoded logic for ProductVariantResource custom fields
                    if model_name in ('Variant', 'Product') and not field.attribute:
                        if col_name == 'شناسه محصول (Slug)':
                            is_mandatory = True # Required for our backend logic
                        elif col_name == 'نام کالا':
                            is_mandatory = True # Matching UI star (blank=False)
                        elif col_name == 'دسته‌بندی':
                            is_mandatory = True # Matching UI star (blank=False)
                        elif col_name == 'برند':
                            is_mandatory = False # brand has blank=True on Product
                        elif col_name == 'موجودی':
                            is_mandatory = False # It is optional in our logic and VariantForm
                    
                    if model_name == 'Product' and field.attribute in ('sku', 'price', 'name'):
                        # These are Variant fields, mapped manually for Product resource
                        if field.attribute == 'sku' or field.attribute == 'price':
                            is_mandatory = True
                        else:
                            is_mandatory = False
                    
                    if is_readonly or field.attribute == 'id' or col_name == 'ID':
                        indicator_row.append('[برای ویرایش اجباری]')
                        dummy_row.append('') # Leave ID empty for new rows
                    elif is_mandatory:
                        indicator_row.append('[اجباری]')
                        dummy_row.append('مقدار نمونه')
                    else:
                        indicator_row.append('[اختیاری]')
                        dummy_row.append('')
                        
                    header_row.append(col_name)
                
                # Write CSV
                file_path = os.path.join(out_dir, f"{model_name.lower()}_sample.csv")
                with open(file_path, 'w', encoding='utf-8-sig', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow(header_row)
                    writer.writerow(indicator_row)
                    writer.writerow(dummy_row)
                    
                print(f"Created {file_path}")
                
        except Exception as e:
            print(f"Error for {model_name}: {e}")
