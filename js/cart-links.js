// This script ensures all cart buttons lead to cart.html
document.addEventListener('DOMContentLoaded', function() {
    // Handle header cart icon
    const headerCartIcon = document.querySelector('.header__icon--cart');
    if (headerCartIcon && headerCartIcon.getAttribute('href') !== 'cart.html') {
        headerCartIcon.setAttribute('href', 'cart.html');
    }
    
    // Note: Product cart button functionality is now handled by cart.js
    // This ensures the header cart icon always links to cart.html
});
