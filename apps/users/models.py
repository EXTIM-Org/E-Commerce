from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from PIL import Image

def validate_image_size(value):
    """
    Validator to ensure the uploaded image file does not exceed 2MB.
    Raises ValidationError if the file is too large.
    """
    filesize = value.size
    if filesize > 2 * 1024 * 1024:
        raise ValidationError("حداکثر حجم مجاز برای عکس ۲ مگابایت است.")

from django.core.validators import RegexValidator, MinLengthValidator

class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('وارد کردن آدرس ایمیل الزامی است.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('سوپریوزر باید is_staff=True داشته باشد.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('سوپریوزر باید is_superuser=True داشته باشد.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Replaces username with email as the primary login field and adds custom
    fields for phone number and avatar.
    """
    username = None
    email = models.EmailField(unique=True, verbose_name="ایمیل")
    
    phone_regex = RegexValidator(
        regex=r'^09\d{9}$',
        message="شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد. (مثال: 09123456789)"
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=11, blank=True, verbose_name="شماره موبایل")
    
    # Overriding first_name and last_name from AbstractUser to add MinLengthValidator
    first_name = models.CharField(verbose_name="نام", max_length=150, blank=True, validators=[MinLengthValidator(2, message="نام باید حداقل ۲ حرف باشد")])
    last_name = models.CharField(verbose_name="نام خانوادگی", max_length=150, blank=True, validators=[MinLengthValidator(2, message="نام خانوادگی باید حداقل ۲ حرف باشد")])
    
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, validators=[validate_image_size], verbose_name="آواتار (تصویر پروفایل)")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"

    def clean(self):
        super().clean()
        # Custom validation to ensure name doesn't contain numbers if provided
        import re
        if self.first_name and re.search(r'\d', self.first_name):
            raise ValidationError({'first_name': 'نام نمی‌تواند شامل عدد باشد.'})
        if self.last_name and re.search(r'\d', self.last_name):
            raise ValidationError({'last_name': 'نام خانوادگی نمی‌تواند شامل عدد باشد.'})

    def save(self, *args, **kwargs):
        self.full_clean() # Force calling clean() on save for admin and other parts
        
        # Optimize avatar before saving
        from django.core.files.uploadedfile import UploadedFile
        trigger_optimize = False
        if self.avatar and hasattr(self.avatar, 'file') and isinstance(self.avatar.file, UploadedFile):
            trigger_optimize = True
            
        super().save(*args, **kwargs)
        
        if trigger_optimize:
            from common.tasks import optimize_image_task
            optimize_image_task.delay('users', 'User', self.pk, 'avatar', 300, 300, 80, 'WEBP')

    def __str__(self):
        return self.email

class Address(models.Model):
    """
    Represents a shipping or billing address for a User.
    Users can have multiple addresses and select one as default.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses', verbose_name="کاربر")
    
    street = models.CharField(
        max_length=255, 
        validators=[MinLengthValidator(10, message="آدرس پستی بسیار کوتاه است. لطفاً خیابان، کوچه و پلاک را کامل وارد کنید.")],
        verbose_name="خیابان و پلاک"
    )
    
    city = models.CharField(
        max_length=100, 
        validators=[MinLengthValidator(2, message="نام شهر نامعتبر است.")],
        verbose_name="شهر"
    )
    
    state = models.CharField(
        max_length=100, 
        validators=[MinLengthValidator(2, message="نام استان نامعتبر است.")],
        verbose_name="استان"
    )
    
    postal_regex = RegexValidator(
        regex=r'^\d{10}$',
        message="کد پستی باید دقیقاً ۱۰ رقم باشد."
    )
    postal_code = models.CharField(
        validators=[postal_regex], 
        max_length=10, 
        blank=True, 
        verbose_name="کد پستی"
    )
    
    country = models.CharField(max_length=100, default='ایران', verbose_name="کشور")
    is_default = models.BooleanField(default=False, verbose_name="آدرس پیش‌فرض")

    class Meta:
        verbose_name = "آدرس"
        verbose_name_plural = "آدرس‌ها"

    def clean(self):
        super().clean()
        import re
        if self.city and re.search(r'\d', self.city):
            raise ValidationError({'city': 'نام شهر نمی‌تواند شامل عدد باشد.'})
        if self.state and re.search(r'\d', self.state):
            raise ValidationError({'state': 'نام استان نمی‌تواند شامل عدد باشد.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.street}, {self.city}, {self.country}"
