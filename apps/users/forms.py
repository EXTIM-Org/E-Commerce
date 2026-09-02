from django.contrib.auth.forms import UserCreationForm, UserChangeForm, AuthenticationForm
from .models import User

class CustomUserCreationForm(UserCreationForm):
    """
    Custom form for user registration using email instead of username.
    Applies custom CSS classes and HTML5 validation attributes to inputs.
    """
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:border-primary transition-all text-left', 'dir': 'ltr'})
            if 'email' in field_name or 'username' in field_name:
                field.widget.attrs.update({
                    'type': 'email',
                    'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                    'title': 'لطفا یک ایمیل معتبر وارد کنید (مثال: user@example.com)',
                    'placeholder': 'user@example.com'
                })
            elif 'password' in field_name:
                field.widget.attrs.update({
                    'minlength': '8',
                    'title': 'رمز عبور باید حداقل ۸ کاراکتر باشد',
                    'placeholder': '••••••••'
                })

class CustomAuthForm(AuthenticationForm):
    """
    Custom authentication form for user login.
    Applies Tailwind CSS classes and specific placeholder text for email login.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:border-primary transition-all text-left', 'dir': 'ltr'})
            if 'username' in field_name:
                field.widget.attrs.update({
                    'type': 'email',
                    'title': 'آدرس ایمیل خود را وارد کنید',
                    'placeholder': 'user@example.com'
                })
            elif 'password' in field_name:
                field.widget.attrs.update({
                    'placeholder': '••••••••'
                })

class CustomUserChangeForm(UserChangeForm):
    """
    Custom form for editing users in the Django Admin interface.
    """
    class Meta:
        model = User
        fields = ('email',)
