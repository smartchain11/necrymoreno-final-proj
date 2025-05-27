document.addEventListener('DOMContentLoaded', function() {
    initCartSystem();
    initTestimonials();
    initNewsletter();
    initProductGrid();
    initLiveChat();
    initProductFilters();
    initHeroSlider();
});

const products = [
    {
        id: 1,
        name: 'ROG Strix G16 (2023) G614JU-DS53',
        price: 129000,
        category: 'computers',
        rating: 4.5,
        image: 'https://dlcdnwebimgs.asus.com/gain/50E7C82B-1054-4678-926B-B9FC0EF4D75D/w717/h525',
        description: 'Windows 11 Home, NVIDIA® GeForce RTX™ 4050, Intel® Core™ i5-13450HX, 16" FHD+ 165Hz, 512GB SSD',
        badge: 'BESTSELLER'
    },
    {
        id: 2,
        name: 'ROG Strix G16 (2023) G614JU-NS73',
        price: 149999,
        category: 'computers',
        rating: 4.8,
        image: 'https://dlcdnwebimgs.asus.com/gain/50E7C82B-1054-4678-926B-B9FC0EF4D75D/w717/h525',
        description: 'Windows 11 Home, NVIDIA® GeForce RTX™ 4050, Intel® Core™ i7-13650HX, 16" FHD+ 165Hz, 512GB SSD',
        badge: 'NEW'
    },
    {
        id: 3,
        name: 'ROG Strix G16 (2023) G614JU-IS76',
        price: 159999,
        category: 'computers',
        rating: 4.2,
        image: 'https://dlcdnwebimgs.asus.com/gain/50E7C82B-1054-4678-926B-B9FC0EF4D75D/w717/h525',
        description: 'Windows 11 Home, NVIDIA® GeForce RTX™ 4050, Intel® Core™ i7-13650HX, 16" FHD+ 165Hz, 1TB SSD'
    },
    {
        id: 4,
        name: 'ROG Strix G16 (2023) G614JU-NS54',
        price: 119999,
        category: 'computers',
        rating: 3.9,
        image: 'https://dlcdnwebimgs.asus.com/gain/50E7C82B-1054-4678-926B-B9FC0EF4D75D/w717/h525',
        description: 'Windows 11 Home, NVIDIA® GeForce RTX™ 4050, Intel® Core™ i5-13450HX, 16" FHD+ 165Hz, 1TB SSD',
        badge: 'SALE',
        originalPrice: 124999
    }
];

function initCartSystem() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelectorAll('.cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const orderFormModal = document.getElementById('order-form-modal');
    const confirmationModal = document.getElementById('order-confirmation-modal');
    const miniCart = document.querySelector('.mini-cart');
    const miniCartItems = document.querySelector('.mini-cart-items');
    const miniCartTotal = document.querySelector('.mini-cart-total');

    updateCartDisplay();

    document.querySelectorAll('.cart-icon').forEach(icon => {
        icon.addEventListener('click', toggleCart);
    });

    document.querySelector('.mini-cart-checkout')?.addEventListener('click', openOrderForm);
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.getElementById('checkout-btn')?.addEventListener('click', openOrderForm);
    document.getElementById('continue-shopping')?.addEventListener('click', continueShopping);
    document.getElementById('order-form')?.addEventListener('submit', submitOrder);

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            removeFromCart(parseInt(e.target.dataset.id));
        } else if (e.target.classList.contains('quantity-decrement')) {
            updateQuantity(parseInt(e.target.dataset.id), -1);
        } else if (e.target.classList.contains('quantity-increment')) {
            updateQuantity(parseInt(e.target.dataset.id), 1);
        }
    });

    function updateCartDisplay() {
        const { totalItems, totalPrice } = calculateCartTotals();
        cartCount.forEach(count => count.textContent = totalItems);
        updateCartModal();
        updateMiniCart();
        saveCartToStorage();
    }

    function calculateCartTotals() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { totalItems, totalPrice };
    }

    function updateCartModal() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = cart.length === 0
            ? '<p>Your cart is empty</p>'
            : cart.map(item => createCartItemElement(item)).join('');
        document.getElementById('checkout-btn').style.display = cart.length ? 'block' : 'none';
        cartTotalElement.textContent = `Total: ₱${calculateCartTotals().totalPrice.toFixed(2)}`;
    }

    function createCartItemElement(item) {
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₱${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-decrement" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" readonly>
                        <button class="quantity-increment" data-id="${item.id}">+</button>
                    </div>
                    <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `;
    }

    function updateMiniCart() {
        const { totalPrice } = calculateCartTotals();
        miniCartItems.innerHTML = cart.length === 0
            ? '<p>Your cart is empty</p>'
            : cart.map(item => `
                <div class="mini-cart-item">
                    <span>${item.name} (${item.quantity})</span>
                    <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
        miniCartTotal.textContent = `Total: ₱${totalPrice.toFixed(2)}`;
    }

    function saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function removeFromCart(productId) {
        const index = cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            cart.splice(index, 1);
            updateCartDisplay();
            showToast('Item removed from cart');
        }
    }

    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            updateCartDisplay();
            showToast(`${item.name} quantity updated`);
        }
    }

    function toggleCart() {
        cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
        document.querySelector('.mini-cart-content').style.display = 'none';
    }

    function openOrderForm() {
        if (cart.length === 0) {
            showToast('Your cart is empty');
            return;
        }
        cartModal.style.display = 'none';
        document.querySelector('.mini-cart-content').style.display = 'none';
        orderFormModal.style.display = 'block';
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    function continueShopping() {
        closeAllModals();
        window.location.href = 'index.html';
    }

    function submitOrder(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData.entries());
        const order = createOrder(formValues);
        saveOrder(order);
        showToast('Order placed successfully!', 'success');
        clearCart();
        showOrderConfirmation(order);
    }

    function createOrder(formValues) {
        return {
            id: Date.now(),
            date: new Date().toLocaleString(),
            customer: {
                name: formValues.name,
                email: formValues.email,
                phone: formValues.phone,
                address: formValues.address,
                notes: formValues.notes || ''
            },
            items: [...cart],
            total: calculateCartTotals().totalPrice,
            status: 'Processing'
        };
    }

    function saveOrder(order) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    function clearCart() {
        cart.length = 0;
        localStorage.removeItem('cart');
        updateCartDisplay();
    }

    function showOrderConfirmation(order) {
        orderFormModal.style.display = 'none';
        confirmationModal.style.display = 'block';
        const orderDetails = document.getElementById('order-details');
        orderDetails.innerHTML = `
            <div class="order-confirmation-content">
                <h3>Thank you for your order, ${order.customer.name}!</h3>
                <div class="order-summary">
                    <p><strong>Order #:</strong> ${order.id}</p>
                    <p><strong>Date:</strong> ${order.date}</p>
                    <p><strong>Total:</strong> ₱${order.total.toFixed(2)}</p>
                </div>
                <div class="delivery-notice">
                    <h4>Delivery Information</h4>
                    <p>Your order will be processed and shipped within 1-2 business days.</p>
                    <div class="delivery-address">
                        <p><strong>Shipping to:</strong></p>
                        <p>${order.customer.address}</p>
                    </div>
                    <p>You'll receive a confirmation email at ${order.customer.email} with tracking information.</p>
                </div>
                <div class="order-items">
                    <h4>Order Summary</h4>
                    <ul>
                        ${order.items.map(item => `
                            <li>${item.name} (Qty: ${item.quantity}) - ₱${(item.price * item.quantity).toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    window.addToCart = function(productId, productName, productPrice) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
        updateCartDisplay();
        showToast(`${productName} added to cart!`);
    };
}

function initProductGrid() {
    const productGrids = document.querySelectorAll('.product-grid');
    if (!productGrids.length) return;

    productGrids.forEach(grid => {
        const isFeatured = grid.closest('.featured-products');
        renderProducts(grid, isFeatured ? products.slice(0, 2) : products);
    });

    function renderProducts(grid, productsToShow) {
        grid.innerHTML = productsToShow.map(product => `
            <div class="product-card" id="product${product.id}" data-category="${product.category}" data-price="${product.price}" data-rating="${product.rating}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price-rating">
                        <span class="price">₱${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="original-price">₱${product.originalPrice.toFixed(2)}</span>` : ''}
                        <div class="rating">
                            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                            <span class="rating-count">(${Math.floor(Math.random() * 100 + 50)})</span>
                        </div>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
                        <a href="https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2023-series/" class="view-details">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function initProductFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const productGrids = document.querySelectorAll('.product-grid');

    if (categoryFilter && sortBy) {
        categoryFilter.addEventListener('change', filterProducts);
        sortBy.addEventListener('change', filterProducts);
    }

    function filterProducts() {
        const category = categoryFilter.value;
        const sort = sortBy.value;
        let filteredProducts = [...products];

        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }

        if (sort === 'price-low') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sort === 'rating') {
            filteredProducts.sort((a, b) => b.rating - a.rating);
        }

        productGrids.forEach(grid => {
            const isFeatured = grid.closest('.featured-products');
            initProductGrid(grid, isFeatured ? filteredProducts.slice(0, 2) : filteredProducts);
        });
    }
}

function initHeroSlider() {
    const sliders = document.querySelectorAll('.hero-image-slider');
    sliders.forEach(slider => {
        const images = slider.querySelectorAll('.slider-image');
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');
        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => img.classList.toggle('active', i === index));
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });

        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }, 5000);
    });
}

function initTestimonials() {
    const testimonials = [
        {
            text: "Great gaming laptops, super reliable and I'll definitely buy again salamat seller! 😘",
            author: "Hughea T. Francisco",
            role: "Loyalist"
        },
        {
            text: "Super cheap and lakas ng specs sulit aydol sa ulit-ulitin muaw",
            author: "Jover Sabarita III",
            role: "Cute Buyer"
        },
        {
            text: "Got a huge discount Grabi to iba sa nag bebenta lakas, super affordable deal!",
            author: "Crizza FaroFaroG",
            role: "Batak coders"
        },
        {
            text: "Yes my dream laptop I can buy sa mas mura maka laro nadin ako ng summer time saga 2",
            author: "Sandy Icecreaman",
            role: "Gaymer"
        },
        {
            text: "Lupit ng  buyer sobrang mura, mapapa mura ka talaga!",
            author: "Faith Visto II",
            role: "Minecraft Gamer"
        }
    ];

    const container = document.querySelector('.testimonials-container');
    const dotsContainer = document.querySelector('.testimonial-dots');

    if (!container || !dotsContainer) return;

    let currentIndex = 0;

    testimonials.forEach((testimonial, index) => {
        container.appendChild(createTestimonialSlide(testimonial, index));
        dotsContainer.appendChild(createTestimonialDot(index));
    });

    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');

    function createTestimonialSlide(testimonial, index) {
        const slide = document.createElement('div');
        slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
            <p class="testimonial-text">"${testimonial.text}"</p>
            <p class="testimonial-author">${testimonial.author}</p>
            <p class="testimonial-role">${testimonial.role}</p>
        `;
        return slide;
    }

    function createTestimonialDot(index) {
        const dot = document.createElement('div');
        dot.className = `testimonial-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        dot.addEventListener('click', () => goToTestimonial(index));
        return dot;
    }

    function goToTestimonial(index) {
        currentIndex = index;
        updateTestimonialDisplay();
    }

    function updateTestimonialDisplay() {
        slides.forEach((slide, index) => slide.classList.toggle('active', index === currentIndex));
        dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
    }

    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateTestimonialDisplay();
    }, 5000);
}

function initNewsletter() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (validateEmail(email)) {
                showToast('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
            } else {
                showToast('Please enter a valid email address.');
            }
        });
    });

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

function initLiveChat() {
    document.querySelector('.chat-btn')?.addEventListener('click', function() {
        showToast('Connecting you to a customer service representative...');
    });
}

function showToast(message, type = '') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'success' ? 'toast-success' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), type === 'success' ? 4000 : 3000);
}
