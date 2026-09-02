document.addEventListener('DOMContentLoaded', function() {
    // Select all table rows in the result list (works for standard Django admin and Unfold)
    const rows = document.querySelectorAll('#result_list tbody tr');
    
    rows.forEach(row => {
        // Find the first link in the row which usually points to the change form
        const changeLink = row.querySelector('th a, td a');
        
        if (changeLink) {
            // Make the row look clickable
            row.style.cursor = 'pointer';
            
            // Add hover effect if not already present by Tailwind/Unfold
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            });
            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });

            row.addEventListener('click', function(e) {
                // If the user clicked on a checkbox, an input, a button, or an existing link, let it behave normally
                const targetTag = e.target.tagName.toLowerCase();
                if (e.target.closest('a') || targetTag === 'input' || targetTag === 'button' || targetTag === 'label') {
                    return;
                }
                
                // Otherwise, navigate to the change link
                window.location.href = changeLink.href;
            });
        }
    });
});
