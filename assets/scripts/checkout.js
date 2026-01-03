/* ============================================
   CHECKOUT PAGE - FIREBASE VERSION
   ============================================ */

// Import Firebase functions
import { db, collection, addDoc } from './firebase-config.js';

// Load cart data
let cartItems = [];
let subtotal = 0;
let deliveryFee = 0;
let discount = 0;
let total = 0;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadCartItems();
  updateOrderSummary(); // Initial summary with delivery selected
  
  // Add event listeners
  document.getElementById('place-order-btn').addEventListener('click', placeOrder);
  
  // Add delivery option listeners
  const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
  deliveryOptions.forEach(option => {
    option.addEventListener('change', updateOrderSummary);
  });
  
  // Add payment option listeners
  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach(option => {
    option.addEventListener('click', function() {
      paymentOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
      this.querySelector('input[type="radio"]').checked = true;
    });
  });
  
  // Add delivery type listeners
  const deliveryTypeOptions = document.querySelectorAll('.delivery-option');
  deliveryTypeOptions.forEach(option => {
    option.addEventListener('click', function() {
      deliveryTypeOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
      this.querySelector('input[type="radio"]').checked = true;
    });
  });
});

// Load cart items from localStorage
function loadCartItems() {
  cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (cartItems.length === 0) {
    // Redirect to cart if empty
    showNotification('Your cart is empty!', 'error');
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 2000);
    return;
  }
  
  // Display items
  const orderItemsContainer = document.getElementById('order-items');
  orderItemsContainer.innerHTML = cartItems.map(item => `
    <div class="order-item">
      <div class="item-image">${item.image || '🍩'}</div>
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-quantity">Qty: ${item.quantity}</div>
      </div>
      <div class="item-price">RM ${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');
}

// Toggle delivery address fields
window.toggleDeliveryFields = function() {
  const deliveryOption = document.querySelector('input[name="delivery"]:checked').value;
  const addressSection = document.getElementById('delivery-address-section');
  const addressInputs = addressSection.querySelectorAll('input, select');
  
  if (deliveryOption === 'delivery') {
    addressSection.style.display = 'block';
    // Make address fields required
    addressInputs.forEach(input => {
      if (input.id !== 'customer-email') {
        input.required = true;
      }
    });
  } else {
    addressSection.style.display = 'none';
    // Remove required from address fields
    addressInputs.forEach(input => {
      input.required = false;
    });
  }
  
  updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
  // Calculate subtotal
  subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate delivery fee
  const deliveryOption = document.querySelector('input[name="delivery"]:checked').value;
  deliveryFee = deliveryOption === 'delivery' ? 5.00 : 0;
  
  // Get discount from cart (if any promo was applied)
  discount = parseFloat(localStorage.getItem('cartDiscount') || '0');
  
  // Calculate total
  total = subtotal + deliveryFee - discount;
  
  // Update display
  document.getElementById('summary-subtotal').textContent = `RM ${subtotal.toFixed(2)}`;
  document.getElementById('summary-delivery').textContent = `RM ${deliveryFee.toFixed(2)}`;
  document.getElementById('summary-total').textContent = `RM ${total.toFixed(2)}`;
  
  if (discount > 0) {
    document.getElementById('discount-row').style.display = 'flex';
    document.getElementById('summary-discount').textContent = `- RM ${discount.toFixed(2)}`;
  }
}

// Generate order ID
function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LKH-${year}${month}${day}-${random}`;
}

// Place order
async function placeOrder(event) {
  event.preventDefault();
  
  // Validate form
  const form = document.getElementById('checkout-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Get form data
  const customerName = document.getElementById('customer-name').value.trim();
  const customerPhone = document.getElementById('customer-phone').value.trim();
  const customerEmail = document.getElementById('customer-email').value.trim();
  const deliveryOption = document.querySelector('input[name="delivery"]:checked').value;
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const specialInstructions = document.getElementById('special-instructions').value.trim();
  
  // Validate required fields
  if (!customerName || !customerPhone) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Get address if delivery
  let address = '';
  if (deliveryOption === 'delivery') {
    const street = document.getElementById('customer-address').value.trim();
    const city = document.getElementById('customer-city').value.trim();
    const postcode = document.getElementById('customer-postcode').value.trim();
    const state = document.getElementById('customer-state').value;
    
    if (!street || !city || !postcode || !state) {
      showNotification('Please fill in delivery address', 'error');
      return;
    }
    
    address = `${street}, ${postcode} ${city}, ${state}`;
  }
  
  // Disable button to prevent double submission
  const placeOrderBtn = document.getElementById('place-order-btn');
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Processing...';
  
  try {
    // Create order object
    const orderId = generateOrderId();
    const orderData = {
      orderId: orderId,
      customerName: customerName,
      phone: customerPhone,
      email: customerEmail || '',
      deliveryOption: deliveryOption,
      address: address,
      paymentMethod: paymentMethod,
      specialInstructions: specialInstructions,
      items: cartItems,
      subtotal: subtotal,
      delivery: deliveryFee,
      discount: discount,
      total: total,
      status: 'pending',
      date: new Date().toISOString()
    };
    
    console.log('Submitting order:', orderData);
    
    // Save to Firebase
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('Order saved with ID:', docRef.id);
    
    // Show success message
    showNotification('Order placed successfully!', 'success');
    
    // Clear cart
    localStorage.removeItem('cart');
    localStorage.removeItem('cartDiscount');
    
    // Redirect to order success page
    setTimeout(() => {
      window.location.href = `order-success.html?orderId=${orderId}`;
    }, 1500);
    
  } catch (error) {
    console.error('Error placing order:', error);
    showNotification('Error placing order. Please try again.', 'error');
    
    // Re-enable button
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
}

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
