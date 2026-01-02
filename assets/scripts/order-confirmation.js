/* ============================================
   ORDER CONFIRMATION PAGE
   ============================================ */

// Import Firebase functions
import { db, collection, getDocs, query, where } from './firebase-config.js';

// Get order ID from URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  if (!orderId) {
    // No order ID, redirect to home
    window.location.href = 'index.html';
    return;
  }
  
  // Display order ID
  document.getElementById('order-id').textContent = orderId;
  
  // Load order details from Firebase
  await loadOrderDetails(orderId);
  
  // Update cart count (should be 0 after order)
  updateCartCount();
});

// Load order details from Firebase
async function loadOrderDetails(orderId) {
  try {
    console.log('Loading order:', orderId);
    
    // Query Firebase for this order
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Order not found');
      displayOrderNotFound();
      return;
    }
    
    // Get order data
    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data();
    
    console.log('Order data:', orderData);
    
    // Display order details
    displayOrderDetails(orderData);
    
  } catch (error) {
    console.error('Error loading order:', error);
    displayOrderError();
  }
}

// Display order details
function displayOrderDetails(order) {
  const detailsContainer = document.getElementById('order-details-content');
  
  detailsContainer.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Customer:</span>
      <span class="detail-value">${order.customerName}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Phone:</span>
      <span class="detail-value">${order.phone}</span>
    </div>
    ${order.email ? `
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${order.email}</span>
      </div>
    ` : ''}
    <div class="detail-row">
      <span class="detail-label">Delivery Method:</span>
      <span class="detail-value">${order.deliveryOption === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</span>
    </div>
    ${order.address ? `
      <div class="detail-row">
        <span class="detail-label">Address:</span>
        <span class="detail-value">${order.address}</span>
      </div>
    ` : ''}
    <div class="detail-row">
      <span class="detail-label">Payment:</span>
      <span class="detail-value">${formatPaymentMethod(order.paymentMethod)}</span>
    </div>
    
    <div class="order-items-list">
      <h4>Items Ordered:</h4>
      ${order.items.map(item => `
        <div class="order-item-row">
          <span>${item.name} x ${item.quantity}</span>
          <span>RM ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="order-total-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>RM ${order.subtotal.toFixed(2)}</span>
      </div>
      ${order.delivery > 0 ? `
        <div class="summary-row">
          <span>Delivery Fee:</span>
          <span>RM ${order.delivery.toFixed(2)}</span>
        </div>
      ` : ''}
      ${order.discount > 0 ? `
        <div class="summary-row discount">
          <span>Discount:</span>
          <span>- RM ${order.discount.toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="summary-row total">
        <span>Total:</span>
        <span>RM ${order.total.toFixed(2)}</span>
      </div>
    </div>
  `;
  
  // Update ready message based on delivery option
  if (order.deliveryOption === 'delivery') {
    document.getElementById('ready-message').textContent = 'On the way to you';
  } else {
    document.getElementById('ready-message').textContent = 'Ready for pickup at our store';
  }
}

// Format payment method
function formatPaymentMethod(method) {
  const methods = {
    'cash': '💵 Cash on Delivery/Pickup',
    'card': '💳 Credit/Debit Card',
    'ewallet': '📱 E-Wallet'
  };
  return methods[method] || method;
}

// Display order not found
function displayOrderNotFound() {
  const detailsContainer = document.getElementById('order-details-content');
  detailsContainer.innerHTML = `
    <p style="text-align: center; color: #e63946;">
      Order not found. Please check your order ID or contact support.
    </p>
  `;
}

// Display error
function displayOrderError() {
  const detailsContainer = document.getElementById('order-details-content');
  detailsContainer.innerHTML = `
    <p style="text-align: center; color: #e63946;">
      Error loading order details. Please try again later.
    </p>
  `;
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}
