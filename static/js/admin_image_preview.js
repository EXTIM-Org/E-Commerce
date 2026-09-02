// static/js/admin_image_preview.js

document.addEventListener("change", function(e) {
    const inputElement = e.target;
    
    // Check if the changed element is a file input
    if (inputElement.tagName && inputElement.tagName.toLowerCase() === 'input' && inputElement.type === 'file') {
        if (inputElement.files && inputElement.files[0]) {
            const file = inputElement.files[0];
            
            // Only process image files
            if (!file.type.startsWith('image/')) return;
            
            // UI File size validation
            const currentUrl = window.location.href.toLowerCase();
            let maxSizeMB = null;
            let errorMsg = "";
            
            if (currentUrl.includes('promotions/herobanner')) {
                maxSizeMB = 3;
                errorMsg = "حجم فایل انتخابی بیشتر از حد مجاز است. حداکثر حجم مجاز برای بنر ۳ مگابایت است.";
            } else if (currentUrl.includes('catalog/product')) {
                maxSizeMB = 2;
                errorMsg = "حجم فایل انتخابی بیشتر از حد مجاز است. حداکثر حجم مجاز برای عکس محصول ۲ مگابایت است.";
            }
            
            if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
                alert(errorMsg);
                inputElement.value = ''; // Clear the input
                
                // Remove existing preview if user had a valid file before and now chose an invalid one
                let oldPreview = inputElement.parentElement.querySelector('.live-preview-img');
                if (oldPreview) {
                    oldPreview.remove();
                }
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Remove any previously created live preview for this specific input
                let oldPreview = inputElement.parentElement.querySelector('.live-preview-img');
                if (oldPreview) {
                    oldPreview.remove();
                }
                
                let previewImg = document.createElement('img');
                previewImg.classList.add('live-preview-img');
                previewImg.src = e.target.result;
                previewImg.style.maxWidth = '300px';
                previewImg.style.maxHeight = '300px';
                previewImg.style.objectFit = 'contain';
                previewImg.style.borderRadius = '8px';
                previewImg.style.border = '3px solid #10b981';
                previewImg.style.marginTop = '15px';
                previewImg.style.marginBottom = '15px';
                previewImg.style.display = 'block';
                previewImg.style.position = 'relative';
                previewImg.style.zIndex = '9999';
                previewImg.title = 'پیش‌نمایش زنده (ذخیره نشده)';
                
                // Find a safe place to append the image so it doesn't get hidden by overflow
                let appendTarget = inputElement.parentElement;
                
                // If it's inside a label (very common in Tailwind/Unfold), go up one level
                while (appendTarget && (appendTarget.tagName.toLowerCase() === 'label' || window.getComputedStyle(appendTarget).overflow === 'hidden')) {
                    appendTarget = appendTarget.parentElement;
                    if (appendTarget === document.body) {
                        appendTarget = inputElement.parentElement;
                        break;
                    }
                }
                
                appendTarget.appendChild(previewImg);
                
                // Dim existing read-only image previews in the same form row
                const row = inputElement.closest('.form-row') || inputElement.closest('div.flex');
                if (row) {
                    const existingPreviews = row.querySelectorAll('img:not(.live-preview-img)');
                    existingPreviews.forEach(el => {
                        el.style.opacity = '0.2';
                        el.style.filter = 'grayscale(100%)';
                    });
                }
            }
            
            reader.readAsDataURL(file);
        }
    }
}, true);
