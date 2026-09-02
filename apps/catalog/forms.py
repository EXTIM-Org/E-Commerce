from django import forms
from .models import Review

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['rating', 'comment', 'recommend']
        widgets = {
            'rating': forms.NumberInput(attrs={'min': 1, 'max': 5, 'type': 'hidden'}),
            'comment': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'نظر خود را در مورد این محصول بنویسید...',
                'rows': 4,
                'style': 'width: 100%; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;'
            }),
        }
