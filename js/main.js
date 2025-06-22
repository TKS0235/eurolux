// DOM Elements
const menuBtn = document.querySelector('.header__menu-btn');
const searchIcon = document.querySelector('.header__icon .fa-search');
const searchBar = document.getElementById('searchBar');
const searchClear = document.querySelector('.search-bar__clear');
const sortByBtn = document.querySelector('.sort-btn');
const filterModal = document.getElementById('filterModal');
const filterCloseBtn = document.querySelector('.filter-modal__close');
const filterApplyBtn = document.querySelector('.filter-modal__apply');
const filterClearBtn = document.querySelector('.filter-modal__clear');
const quantityBtns = document.querySelectorAll('.product-detail__quantity-btn');
const quantityInput = document.querySelector('.product-detail__quantity-input');
const addToCartBtn = document.querySelector('.product-detail__add-to-cart');
const productTabs = document.querySelectorAll('.product-detail__tab');
const wishlistBtns = document.querySelectorAll('.product-card__wishlist, .product-detail__wishlist');
const cartBtns = document.querySelectorAll('.product-card__cart-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search functionality
    if (searchIcon) {
        searchIcon.addEventListener('click', toggleSearch);
    }
    
    if (searchClear) {
        searchClear.addEventListener('click', clearSearch);
    }
    
    // Sort and Filter functionality
    if (sortByBtn) {
        sortByBtn.addEventListener('click', toggleFilterModal);
    }
    
    if (filterCloseBtn) {
        filterCloseBtn.addEventListener('click', closeFilterModal);
    }
    
    if (filterApplyBtn) {
        filterApplyBtn.addEventListener('click', applyFilters);
    }
    
    if (filterClearBtn) {
        filterClearBtn.addEventListener('click', clearFilters);
    }
    
    // Product detail functionality
    if (quantityBtns.length > 0) {
        quantityBtns.forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
    
    if (productTabs.length > 0) {
        productTabs.forEach(tab => {
            tab.addEventListener('click', switchTab);
        });
    }
    
    // Wishlist functionality
    if (wishlistBtns.length > 0) {
        wishlistBtns.forEach(btn => {
            btn.addEventListener('click', toggleWishlist);
        });
    }
    
    // Cart functionality
    if (cartBtns.length > 0) {
        cartBtns.forEach(btn => {
            btn.addEventListener('click', quickAddToCart);
        });
    }

    // Initialize carousel only if carousel elements exist
    const track = document.querySelector('.carousel__track');
    const dotsContainer = document.querySelector('.carousel__dots');
    
    // Exit early if carousel elements don't exist (not on homepage)
    if (!track || !dotsContainer) {
        console.log('Carousel elements not found - likely not on homepage');
        return;
    }
    
    const slides = Array.from(track.children);
    const dots = Array.from(dotsContainer.children);

    if (slides.length === 0) {
        console.warn('No slides found in the carousel.');
        return;
    }

    let currentSlideIndex = 0;
    const slideWidth = slides[0].getBoundingClientRect().width; // Get width of a single slide

    const moveToSlide = (targetIndex) => {
        if (!track || !slides[targetIndex]) return;
        track.style.transform = 'translateX(-' + targetIndex * 100 + '%)';
        
        // Update dots
        if (dots.length > 0) {
            const currentDot = dots[currentSlideIndex];
            const targetDot = dots[targetIndex];

            if (currentDot) {
                currentDot.classList.remove('carousel__dot--active');
            }
            if (targetDot) {
                targetDot.classList.add('carousel__dot--active');
            }
        }
        currentSlideIndex = targetIndex;
    };

    const nextSlide = () => {
        let nextIndex = currentSlideIndex + 1;
        if (nextIndex >= slides.length) {
            nextIndex = 0; // Loop back to the first slide
        }
        moveToSlide(nextIndex);
    };

    // Initialize first slide and dot
    if (slides.length > 0) {
        moveToSlide(0); // Set initial position and active dot
    }


    // Auto-scroll every 3 seconds
    setInterval(nextSlide, 3000);

    // Optional: Add event listeners to dots for manual navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            moveToSlide(index);
        });
    });
});

// Functions
function toggleSearch(e) {
    e.preventDefault();
    if (searchBar) {
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchBar.querySelector('input').focus();
        }
    }
}

function clearSearch(e) {
    e.preventDefault();
    if (searchBar) {
        const input = searchBar.querySelector('input');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function toggleFilterModal(e) {
    e.preventDefault();
    if (filterModal) {
        filterModal.classList.toggle('hidden');
    }
}

function closeFilterModal() {
    if (filterModal) {
        filterModal.classList.add('hidden');
    }
}

function applyFilters() {
    // Apply filter logic
    closeFilterModal();
}

function clearFilters() {
    // Clear filter logic
    const checkboxes = filterModal.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset radio to default (Newest)
    const newestRadio = document.getElementById('newest');
    if (newestRadio) {
        newestRadio.checked = true;
    }
}

function handleQuantityChange(e) {
    if (!quantityInput) return;
    
    const currentValue = parseInt(quantityInput.value) || 1;
    const isIncrement = e.currentTarget.textContent.includes('+');
    
    if (isIncrement) {
        quantityInput.value = currentValue + 1;
    } else if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

function addToCart(e) {
    e.preventDefault();
    // Add product to cart and redirect to cart page
    const detail = document.querySelector('.product-detail');
    if (!detail) return;
    const id = detail.dataset.id || window.location.pathname;
    const name = document.querySelector('.product-detail__title')?.textContent.trim();
    const priceText = document.querySelector('.product-detail__price')?.textContent.replace(/[^0-9.]/g, '');
    const price = parseFloat(priceText) || 0;
    const qty = parseInt(document.querySelector('.product-detail__quantity-input')?.value) || 1;
    // Add to cart
    cartManager.addItem({ id, name, price, qty });
    // Redirect
    window.location.href = 'cart.html';
}

function quickAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    // Quick add from listing and render badge
    const card = e.currentTarget.closest('.product-card');
    if (!card) return;
    const id = card.dataset.id;
    const name = card.querySelector('.product-card__title')?.textContent.trim();
    const price = parseFloat(card.querySelector('.product-card__price')?.textContent.replace(/[^0-9.]/g, '')) || 0;
    cartManager.addItem({ id, name, price, qty: 1 });
    cartManager.init(); // update badge
}

function switchTab(e) {
    e.preventDefault();
    
    // Remove active class from all tabs
    productTabs.forEach(tab => {
        tab.classList.remove('product-detail__tab--active');
    });
    
    // Add active class to clicked tab
    e.currentTarget.classList.add('product-detail__tab--active');
    
    // Tab content switching logic
}

function toggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const heartIcon = e.currentTarget.querySelector('i');
    if (heartIcon) {
        heartIcon.classList.toggle('far');
        heartIcon.classList.toggle('fas');
    }
}
