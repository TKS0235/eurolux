// Cart functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    init() {
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
        this.showCartAddedFeedback();
    }

    handleProductDetailAdd() {
        const product = this.extractProductFromDetail();
        const quantity = parseInt(document.querySelector('.product-detail__quantity-input')?.value || 1);
        this.addToCart(product, quantity);
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
            return;
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
