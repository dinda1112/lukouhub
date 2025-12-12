/* ============================================
   LUKOUHUB - COMBINED JAVASCRIPT
   ============================================ */

// ============ SHARED FUNCTIONS ============

// Update cart count from localStorage (used on all pages)
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}

// ============ CART PAGE FUNCTIONS ============

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.style.background = type === 'success' ? '#3cb371' : '#e63946';
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Load and display cart
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const container = document.getElementById('cart-items-container');
  if (!container) return;
  
  // Update item count
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = cart.length;
  }
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some delicious donuts to get started!</p>
        <a href="listing.html" class="btn-shop">Browse Menu</a>
      </div>
    `;
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    container.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="item-image" style="background: linear-gradient(135deg, ${getGradientColors(index)})">${item.image || '🍩'}</div>
        <div class="item-details">
          <div class="item-category">${item.category || 'Solo Delight'}</div>
          <h3>${item.name}</h3>
          <div class="item-price">RM ${item.price.toFixed(2)} each</div>
        </div>
        <div class="item-actions">
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)" title="Decrease quantity">−</button>
            <input type="number" class="quantity-input" value="${item.quantity}" readonly>
            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)" title="Increase quantity">+</button>
          </div>
          <div class="item-total">RM ${(item.price * item.quantity).toFixed(2)}</div>
          <span class="remove-item" onclick="removeItem(${index})" title="Remove item">🗑️ Remove</span>
        </div>
      </div>
    `).join('');
  }
  
  updateSummary();
}

// Get gradient colors for variety
function getGradientColors(index) {
  const gradients = [
    '#8b4513, #d2691e',
    '#90ee90, #ffb6c1',
    '#deb887, #8b4513',
    '#ff69b4, #ffb6c1',
    '#87ceeb, #4169e1',
    '#ffd700, #ffed4e'
  ];
  return gradients[index % gradients.length];
}

// Update quantity (ADD/REMOVE items)
function updateQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (!cart[index]) return;
  
  cart[index].quantity += change;
  
  // Don't allow quantity to go below 1
  if (cart[index].quantity < 1) {
    cart[index].quantity = 1;
    showNotification('Minimum quantity is 1', 'error');
    return;
  }
  
  // Max quantity limit
  if (cart[index].quantity > 99) {
    cart[index].quantity = 99;
    showNotification('Maximum quantity is 99', 'error');
    return;
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  
  if (change > 0) {
    showNotification(`Added 1 more ${cart[index].name}`, 'success');
  } else {
    showNotification(`Removed 1 ${cart[index].name}`, 'success');
  }
}

// Remove item from cart
function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const itemName = cart[index]?.name || 'item';
  
  if (confirm(`Remove ${itemName} from cart?`)) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    showNotification(`${itemName} removed from cart`, 'success');
  }
}

// Clear entire cart
function clearCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (cart.length === 0) {
    showNotification('Cart is already empty', 'error');
    return;
  }
  
  if (confirm('Clear all items from cart? This cannot be undone.')) {
    localStorage.setItem('cart', '[]');
    localStorage.removeItem('discount');
    const promoInput = document.getElementById('promo-input');
    if (promoInput) promoInput.value = '';
    const promoSuccess = document.getElementById('promo-success');
    if (promoSuccess) promoSuccess.style.display = 'none';
    loadCart();
    showNotification('Cart cleared successfully', 'success');
  }
}

// Update order summary
function updateSummary() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = cart.length > 0 ? 5.00 : 0;
  const discount = parseFloat(localStorage.getItem('discount') || '0');
  const total = Math.max(0, subtotal + delivery - discount);

  const subtotalElement = document.getElementById('subtotal');
  const deliveryElement = document.getElementById('delivery');
  const discountElement = document.getElementById('discount');
  const totalElement = document.getElementById('total');

  if (subtotalElement) subtotalElement.textContent = `RM ${subtotal.toFixed(2)}`;
  if (deliveryElement) deliveryElement.textContent = `RM ${delivery.toFixed(2)}`;
  if (discountElement) discountElement.textContent = `- RM ${discount.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `RM ${total.toFixed(2)}`;

  // Update cart count in navbar
  updateCartCount();
}

// Apply promo code
function applyPromo() {
  const promoInput = document.getElementById('promo-input');
  if (!promoInput) return;
  
  const code = promoInput.value.trim().toUpperCase();
  
  if (!code) {
    showNotification('Please enter a promo code', 'error');
    return;
  }
  
  const promoCodes = {
    'LUKOU10': 10,
    'WELCOME': 5,
    'FIRSTORDER': 15,
    'NEWUSER': 8,
    'SAVE20': 20
  };

  if (promoCodes[code]) {
    const discount = promoCodes[code];
    localStorage.setItem('discount', discount);
    localStorage.setItem('promoCode', code);
    const promoSuccess = document.getElementById('promo-success');
    if (promoSuccess) promoSuccess.style.display = 'block';
    showNotification(`✓ Promo code applied! You saved RM ${discount.toFixed(2)}`, 'success');
    updateSummary();
  } else {
    showNotification('Invalid promo code. Try: LUKOU10, WELCOME, or FIRSTORDER', 'error');
    const promoSuccess = document.getElementById('promo-success');
    if (promoSuccess) promoSuccess.style.display = 'none';
  }
}

// Proceed to checkout
function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (cart.length === 0) {
    showNotification('Your cart is empty! Add items first.', 'error');
    return;
  }
  
  // Save cart state before checkout
  localStorage.setItem('checkoutCart', JSON.stringify(cart));
  
  // Redirect to checkout
  window.location.href = 'checkout.html';
}

// Check for applied promo code on load
function checkPromoCode() {
  const discount = localStorage.getItem('discount');
  const promoCode = localStorage.getItem('promoCode');
  
  if (discount && promoCode) {
    const promoInput = document.getElementById('promo-input');
    const promoSuccess = document.getElementById('promo-success');
    if (promoInput) promoInput.value = promoCode;
    if (promoSuccess) promoSuccess.style.display = 'block';
  }
}

// ============ LISTING PAGE FUNCTIONS ============

// Simple filter functionality
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (filterButtons.length === 0) return;
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ============ PAGE INITIALIZATION ============

// Detect which page we're on and initialize accordingly
document.addEventListener('DOMContentLoaded', function() {
  // Update cart count on all pages
  updateCartCount();
  
  // Check if we're on the cart page
  if (document.getElementById('cart-items-container')) {
    loadCart();
    checkPromoCode();
    
    // Add Enter key listener for promo code
    const promoInput = document.getElementById('promo-input');
    if (promoInput) {
      promoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          applyPromo();
        }
      });
    }
  }
  
  // Check if we're on the listing page
  if (document.querySelector('.filter-btn')) {
    initializeFilters();
  }
});

