document.addEventListener("DOMContentLoaded", function() {
    // Unique key for this specific URL
    const storageKey = 'adminScrollPosition_' + window.location.pathname;

    // Check if we have a saved scroll position for this URL
    const savedScroll = sessionStorage.getItem(storageKey);
    if (savedScroll) {
        // Restore scroll position
        window.scrollTo(0, parseInt(savedScroll, 10));
        // Remove it so it doesn't persist forever
        sessionStorage.removeItem(storageKey);
    }

    // Save scroll position when the user submits a form
    // Specially targetting "Save and continue editing" buttons (_continue)
    const forms = document.querySelectorAll("form");
    forms.forEach(function(form) {
        form.addEventListener("submit", function() {
            sessionStorage.setItem(storageKey, window.scrollY);
        });
    });
});
