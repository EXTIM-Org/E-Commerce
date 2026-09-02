from import_export import resources
from import_export.admin import ImportExportModelAdmin
from django.core.exceptions import FieldDoesNotExist
from import_export.resources import modelresource_factory

class LocalizedModelResource(resources.ModelResource):
    """
    A ModelResource that uses verbose_name for column headers 
    and get_FOO_display() for choice fields during export.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure column_name matches verbose_name so import expects Persian headers too.
        for field in self.fields.values():
            try:
                model_field = self.Meta.model._meta.get_field(field.attribute)
                field.column_name = str(model_field.verbose_name)
            except FieldDoesNotExist:
                pass

    def before_import(self, dataset, **kwargs):
        super().before_import(dataset, **kwargs)
        # Strip UTF-8 BOM from headers to prevent matching issues
        if dataset.headers:
            dataset.headers = [
                str(h).lstrip('\ufeff').strip() if h else h
                for h in dataset.headers
            ]

    def get_export_headers(self, *args, **kwargs):
        headers = []
        for field in self.get_export_fields(*args, **kwargs):
            try:
                # Use the underlying model field's verbose_name if available
                model_field = self.Meta.model._meta.get_field(field.column_name)
                headers.append(str(model_field.verbose_name))
            except FieldDoesNotExist:
                headers.append(field.column_name)
        return headers

    def export_field(self, field, obj, *args, **kwargs):
        field_name = self.get_field_name(field)
        method = getattr(self, 'dehydrate_%s' % field_name, None)
        if method is not None:
            return method(obj)
        
        try:
            model_field = self.Meta.model._meta.get_field(field_name)
            # If the field has choices, try to get the display value
            if getattr(model_field, 'choices', None):
                display_method = getattr(obj, f'get_{field_name}_display', None)
                if display_method:
                    return display_method()
                    
            # Export string representation for relational fields (ForeignKey, OneToOne, etc.)
            if model_field.is_relation:
                val = getattr(obj, field_name, None)
                if val is not None:
                    return str(val)
        except FieldDoesNotExist:
            pass
            
        return field.export(obj)

class LocalizedImportExportModelAdmin(ImportExportModelAdmin):
    """
    Admin class that automatically uses LocalizedModelResource 
    for exports to ensure Persian headers and choice display values.
    """
    def get_import_resource_classes(self, request=None):
        if getattr(self, 'import_resource_classes', None):
            return self.import_resource_classes
        if getattr(self, 'resource_classes', None):
            return self.resource_classes
            
        return [modelresource_factory(self.model, resource_class=LocalizedModelResource)]
        
    def get_export_resource_classes(self, request=None):
        if getattr(self, 'export_resource_classes', None):
            return self.export_resource_classes
        if getattr(self, 'resource_classes', None):
            return self.resource_classes
            
        # Dynamically create a resource class that inherits from LocalizedModelResource
        return [modelresource_factory(self.model, resource_class=LocalizedModelResource)]
