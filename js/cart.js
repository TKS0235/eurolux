// Cart functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }    init() {
        this.updateCartBadge();
        this.bindEvents();
    }

    loadCart() {
        const saved = localStorage.getItem('eurolux_cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('eurolux_cart', JSON.stringify(this.cart));
    }

    bindEvents() {
        // Add event listeners for add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.product-card__cart-btn')) {
                e.preventDefault();
                this.handleProductCardAdd(e.target.closest('.product-card'));
            }
            
            if (e.target.closest('.product-detail__add-to-cart')) {
                e.preventDefault();
                this.handleProductDetailAdd();
            }
        });
    }

    handleProductCardAdd(productCard) {
        const product = this.extractProductFromCard(productCard);
        this.addToCart(product);
        this.showCartAddedPopup(product);
    }

    handleProductDetailAdd() {
        const product = this.extractProductFromDetail();
        const quantity = parseInt(document.querySelector('.product-detail__quantity-input')?.value || 1);
        this.addToCart(product, quantity);
        this.showCartAddedPopup(product, quantity);
    }

    createPopupContainer() {
        if (!document.getElementById('cartPopupContainer')) {
            const container = document.createElement('div');
            container.id = 'cartPopupContainer';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;            `;
            document.body.appendChild(container);
        }
    }    showCartAddedPopup(product, quantity = 1) {
        // Create popup container if it doesn't exist
        this.createPopupContainer();
        
        const container = document.getElementById('cartPopupContainer');
        if (!container) return;

        // Remove any existing popup
        const existingPopup = container.querySelector('.cart-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Calculate subtotal for the popup
        const subtotal = product.price * quantity;

        // Get suggested products (example products similar to what's in the screenshot)
        const suggestedProducts = this.getSuggestedProducts(product);

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'cart-popup';
        popup.innerHTML = `
            <div class="cart-popup__content">
                <div class="cart-popup__header">
                    <h3 class="cart-popup__title">Product has been added to your cart</h3>
                    <button class="cart-popup__close" onclick="this.closest('.cart-popup').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="cart-popup__subtotal">
                    <span class="cart-popup__subtotal-text">Subtotal | ${quantity} product${quantity > 1 ? 's' : ''}</span>
                    <span class="cart-popup__subtotal-price">$${subtotal.toFixed(2)}</span>
                </div>

                <div class="cart-popup__suggested">
                    <h4 class="cart-popup__suggested-title">Items purchased together</h4>
                    <div class="cart-popup__suggested-products">
                        ${suggestedProducts.map(suggestedProduct => `
                            <div class="cart-popup__suggested-item">
                                <div class="cart-popup__suggested-image">
                                    <button class="cart-popup__wishlist">
                                        <i class="far fa-heart"></i>
                                    </button>
                                    <img src="${suggestedProduct.image}" alt="${suggestedProduct.title}">
                                </div>
                                <div class="cart-popup__suggested-details">
                                    <h5 class="cart-popup__suggested-name">${suggestedProduct.title}</h5>
                                    <div class="cart-popup__suggested-rating">
                                        <div class="cart-popup__suggested-stars">
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                            <i class="fas fa-star"></i>
                                        </div>
                                        <span class="cart-popup__suggested-reviews">4.9 (No Review)</span>
                                    </div>
                                    <div class="cart-popup__suggested-price-cart">
                                        <span class="cart-popup__suggested-price">$${suggestedProduct.price.toFixed(2)}</span>
                                        <button class="cart-popup__suggested-cart-btn" onclick="cartManager.addToCartFromPopup('${suggestedProduct.id}', '${suggestedProduct.title}', ${suggestedProduct.price}, '${suggestedProduct.image}')">
                                            <i class="fas fa-shopping-cart"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="cart-popup__actions">
                    <button class="cart-popup__view-cart" onclick="window.location.href='cart.html'">
                        View My Cart
                    </button>
                    <button class="cart-popup__continue" onclick="this.closest('.cart-popup').remove()">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;        // Add styles
        popup.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
            pointer-events: all;
            transition: all 0.3s ease;
            width: 95%;
            max-width: 800px;
            min-width: 320px;
        `;

        container.appendChild(popup);

        // Animate in
        setTimeout(() => {
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
            popup.style.opacity = '1';
        }, 10);

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
                popup.style.opacity = '0';
                setTimeout(() => {
                    popup.remove();
                }, 300);
            }
        }, 5000);

        // Also animate cart icon
        this.showCartAddedFeedback();
    }

    showCartAddedFeedback() {
        // Simple visual feedback - animate the cart badge
        const cartIcon = document.querySelector('.header__icon--cart');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2)';
            cartIcon.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 200);
        }
    }

    getSuggestedProducts(product) {
        // Return sample suggested products based on the product type
        const aquaBladeProducts = [
            {
                id: 'aqua-blade-22cm',
                title: 'Aqua Blade',
                price: 39.95,
                image: 'images/products/aqua-blade-22cm-set.webp'
            },
            {
                id: 'aqua-blade-full-set-alt',
                title: 'Aqua Blade',
                price: 39.95,
                image: 'images/products/aqua-blade-full-set.webp'
            }
        ];

        const cookwareProducts = [
            {
                id: 'frying-pan-20cm',
                title: 'Frying Pan 20cm',
                price: 29.95,
                image: 'images/products/frying-pan-20cm.webp'
            },
            {
                id: 'cookware-set',
                title: 'Cookware Set',
                price: 49.95,
                image: 'images/products/frying-pan-20cm.webp'
            }
        ];

        // Return appropriate suggested products based on current product
        if (product.title.toLowerCase().includes('aqua') || product.title.toLowerCase().includes('blade')) {
            return aquaBladeProducts;
        } else if (product.title.toLowerCase().includes('pan') || product.title.toLowerCase().includes('cook')) {
            return cookwareProducts;
        } else {
            // Default suggestions
            return aquaBladeProducts;
        }
    }

    addToCartFromPopup(id, title, price, image) {
        const product = {
            id,
            title,
            price,
            image,
            link: '#'
        };
        this.addToCart(product);
        
        // Update the suggested product button to show it's been added
        const button = event.target;
        if (button) {
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = '#28a745';
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = '';
            }, 1000);
        }
    }

    extractProductFromCard(card) {
        const title = card.querySelector('.product-card__title')?.textContent || 'Product';
        const price = card.querySelector('.product-card__price')?.textContent || '$0.00';
        const image = card.querySelector('.product-card__image')?.src || '';
        const link = card.querySelector('a')?.href || '';
        
        return {
            id: this.generateProductId(title),
            title,
            price: this.parsePrice(price),
            image,
            link
        };
    }

    extractProductFromDetail() {
        const title = document.querySelector('.product-detail__title')?.textContent || 'Product';
        const price = document.querySelector('.product-detail__price')?.textContent || '$0.00';
        const image = document.querySelector('.product-detail__image')?.src || '';
        
        return {
            id: this.generateProductId(title),
            title,
            price: this.parsePrice(price),
            image,
            link: window.location.href
        };
    }

    generateProductId(title) {
        return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    parsePrice(priceString) {
        return parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity
            });
        }
        
        this.saveCart();
        this.updateCartBadge();
        this.renderCartPage();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartBadge();
        this.renderCartPage();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartBadge();
                this.renderCartPage();
            }
        }
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartBadge() {
        const cartIcon = document.querySelector('.header__icon--cart');
        if (!cartIcon) return;

        let badge = cartIcon.querySelector('.cart-badge');
        const totalItems = this.getTotalItems();

        if (totalItems > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                cartIcon.appendChild(badge);
            }
            badge.textContent = totalItems;
            badge.classList.add('show');
        } else if (badge) {
            badge.classList.remove('show');
        }
    }

    renderCartPage() {
        // Only render if we're on the cart page
        if (!window.location.pathname.includes('cart.html')) return;

        const cartItemsContainer = document.getElementById('cartItems');
        const cartItemCount = document.getElementById('cartItemCount');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartSubtotalTotal = document.getElementById('cartSubtotalTotal');
        const cartVAT = document.getElementById('cartVAT');
        const cartOrderTotal = document.getElementById('cartOrderTotal');
        const cartFinalTotal = document.getElementById('cartFinalTotal');
        const cartSummaryDetails = document.getElementById('cartSummaryDetails');
        
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart__empty">
                    <i class="fas fa-shopping-cart" style="font-size: 60px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <a href="index.html" class="btn btn--primary" style="margin-top: 20px; display: inline-block; padding: 12px 24px; background: #0057B8; color: white; text-decoration: none; border-radius: 8px;">Continue Shopping</a>
                </div>
            `;
            // Hide or clear order summary and totals
            if (cartItemCount) cartItemCount.textContent = '';
            if (cartSubtotal) cartSubtotal.textContent = '$0.00';
            if (cartSubtotalTotal) cartSubtotalTotal.textContent = '$0.00';
            if (cartVAT) cartVAT.textContent = '$0';
            if (cartOrderTotal) cartOrderTotal.textContent = '$0.00';
            if (cartFinalTotal) cartFinalTotal.textContent = '$0.00';
            if (cartSummaryDetails) cartSummaryDetails.style.display = 'none';
            return;
        } else {
            if (cartSummaryDetails) cartSummaryDetails.style.display = '';
        }

        // Render cart items
        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item__image-container">
                    <img src="${item.image}" alt="${item.title}" class="cart-item__image">
                </div>
                <div class="cart-item__details">
                    <h3 class="cart-item__title">${item.title}</h3>
                    <div class="cart-item__price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item__quantity">
                        <button class="cart-item__quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                        <input type="text" value="${item.quantity}" class="cart-item__quantity-input" onchange="cartManager.updateQuantity('${item.id}', parseInt(this.value))">
                        <button class="cart-item__quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Update summary
        const totalItems = this.getTotalItems();
        const subtotal = this.getTotalPrice();
        const vatAmount = 2.00; // Fixed VAT
        const orderTotal = subtotal + vatAmount;

        if (cartItemCount) cartItemCount.textContent = `${totalItems} ITEM${totalItems !== 1 ? 'S' : ''}`;
        if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (cartSubtotalTotal) cartSubtotalTotal.textContent = `$${subtotal.toFixed(2)}`;
        if (cartVAT) cartVAT.textContent = `$${vatAmount.toFixed(0)}`;
        if (cartOrderTotal) cartOrderTotal.textContent = `$${orderTotal.toFixed(2)}`;
        if (cartFinalTotal) cartFinalTotal.textContent = `$${orderTotal.toFixed(2)}`;
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
    
    // Render cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        cartManager.renderCartPage();
    }
});
