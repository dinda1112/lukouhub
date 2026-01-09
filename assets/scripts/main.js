/* ============================================
   LUKOUHUB - MAIN JAVASCRIPT
   ============================================ */

// ============ SHARED FUNCTIONS ============

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}

// ============ THEME TOGGLE FUNCTIONALITY ============

function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // 1. Check LocalStorage for saved theme
  const savedTheme = localStorage.getItem('theme');
  
  // 2. Apply theme if it exists
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '☀️'; // Sun icon for dark mode
  } else {
    if (themeToggle) themeToggle.textContent = '🌙'; // Moon icon for light mode
  }

  // 3. Add Click Event Listener
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      
      if (currentTheme === 'dark') {
        // Switch to Light
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
      } else {
        // Switch to Dark
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
      }
    });
  }
}

// ============ CART PAGE FUNCTIONS ============

function showNotification(message, type = 'success') {
  console.log("Notification triggered for:", message);
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.style.background = type === 'success' ? '#3cb371' : '#e63946';
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const container = document.getElementById('cart-items-container');
  if (!container) return;
  
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
    
    container.innerHTML = cart.map((item, index) => {
      const isFilePath = item.image && (item.image.includes('/') || item.image.includes('.'));
      
      let imageHTML;
      if (isFilePath) {
          imageHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else {
          imageHTML = item.image || '🍩';
      }

      const backgroundStyle = isFilePath ? '' : `style="background: linear-gradient(135deg, ${getGradientColors(index)})"`;

      return `
      <div class="cart-item">
        <div class="item-image" ${backgroundStyle}>${imageHTML}</div>
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
    `}).join('');
  }
  
  updateSummary();
}

function getGradientColors(index) {
  const gradients = [
    '#8b4513, #d2691e', '#90ee90, #ffb6c1', '#deb887, #8b4513',
    '#ff69b4, #ffb6c1', '#87ceeb, #4169e1', '#ffd700, #ffed4e'
  ];
  return gradients[index % gradients.length];
}

function updateQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart[index]) return;
  cart[index].quantity += change;
  if (cart[index].quantity < 1) { cart[index].quantity = 1; showNotification('Minimum quantity is 1', 'error'); return; }
  if (cart[index].quantity > 99) { cart[index].quantity = 99; showNotification('Maximum quantity is 99', 'error'); return; }
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  if (change > 0) showNotification(`Added 1 more ${cart[index].name}`, 'success');
  else showNotification(`Removed 1 ${cart[index].name}`, 'success');
}

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

function clearCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cart.length === 0) { showNotification('Cart is already empty', 'error'); return; }
  if (confirm('Clear all items from cart? This cannot be undone.')) {
    localStorage.setItem('cart', '[]');
    localStorage.removeItem('discount');
    localStorage.removeItem('promoCode');
    const promoInput = document.getElementById('promo-input');
    if (promoInput) promoInput.value = '';
    const promoSuccess = document.getElementById('promo-success');
    if (promoSuccess) promoSuccess.style.display = 'none';
    loadCart();
    showNotification('Cart cleared successfully', 'success');
  }
}

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
  updateCartCount();
}

function applyPromo() {
  const promoInput = document.getElementById('promo-input');
  if (!promoInput) return;
  const code = promoInput.value.trim().toUpperCase();
  if (!code) { showNotification('Please enter a promo code', 'error'); return; }
  
  const promoCodes = { 'LUKOU10': 10, 'WELCOME': 5, 'FIRSTORDER': 15, 'NEWUSER': 8, 'SAVE20': 20 };

  if (promoCodes[code]) {
    const discount = promoCodes[code];
    localStorage.setItem('discount', discount);
    localStorage.setItem('promoCode', code);
    const promoSuccess = document.getElementById('promo-success');
    if (promoSuccess) promoSuccess.style.display = 'block';
    showNotification(`✓ Promo code applied! You saved RM ${discount.toFixed(2)}`, 'success');
    updateSummary();
  } else {
    showNotification('Invalid promo code.', 'error');
    const promoSuccess = document.getElementById('promo-success');
    if (promoSuccess) promoSuccess.style.display = 'none';
    localStorage.removeItem('discount');
    localStorage.removeItem('promoCode');
    updateSummary();
  }
}

function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cart.length === 0) { showNotification('Cart is empty!', 'error'); return; }
  localStorage.setItem('checkoutCart', JSON.stringify(cart));
  window.location.href = 'checkout.html';
}

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
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  initializeTheme(); // <--- This line is key!
  
  if (document.getElementById('cart-items-container')) {
    loadCart();
    checkPromoCode();
    const promoInput = document.getElementById('promo-input');
    if (promoInput) {
      promoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyPromo();
      });
    }
  }
  if (document.querySelector('.filter-btn')) initializeFilters();
});