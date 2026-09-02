document.addEventListener('DOMContentLoaded', function() {
    // Remove novalidate attribute from all forms in Django admin
    // to enable HTML5 frontend validation and prevent file input clearing on error
    var forms = document.querySelectorAll('form[novalidate]');
    forms.forEach(function(form) {
        form.removeAttribute('novalidate');
    });
});
