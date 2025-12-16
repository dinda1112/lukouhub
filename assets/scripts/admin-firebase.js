/* ============================================
   ADMIN PANEL JAVASCRIPT - FIREBASE VERSION
   ============================================ */

// Import Firebase functions
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from './firebase-config.js';

// Default admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'lukouhub2024';

// Global variables
let allProducts = [];
let allOrders = [];

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn');
  if (isLoggedIn === 'true') {
    showAdminPanel();
  }
});

// ============ LOGIN/LOGOUT ============

function adminLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem('adminLoggedIn', 'true');
    showAdminPanel();
    showNotification('Login successful!', 'success');
  } else {
    showNotification('Invalid username or password', 'error');
  }
}

window.adminLogin = adminLogin;

function adminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
    showNotification('Logged out successfully', 'success');
  }
}

window.adminLogout = adminLogout;

async function showAdminPanel() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  
  // Initialize default products if none exist
  await initializeDefaultProducts();
  
  // Load all data
  await loadDashboard();
  await loadProducts();
  await loadOrders();
}

// ============ INITIALIZE DEFAULT PRODUCTS ============

async function initializeDefaultProducts() {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    // If no products exist, add default products
    if (productsSnapshot.empty) {
      console.log('No products found. Adding default products...');
      
      const defaultProducts = [
        {
          id: 1,
          name: "Nutella Banana",
          price: 8.90,
          category: "Solo Delight",
          description: "Indulge in our signature Nutella Banana donut - a heavenly combination of premium Nutella chocolate spread and fresh banana slices.",
          image: "",
          badge: "BESTSELLER",
          calories: 320
        },
        {
          id: 2,
          name: "Berry Matcha",
          price: 9.90,
          category: "Solo Delight",
          description: "Experience the perfect fusion of East meets West with our Berry Matcha donut. Premium Japanese matcha cream paired with fresh mixed berries.",
          image: "",
          badge: "NEW",
          badgeClass: "new",
          calories: 280
        },
        {
          id: 3,
          name: "Cookie O'Clock",
          price: 8.90,
          category: "Solo Delight",
          description: "For all cookie lovers! Our Cookie O'Clock donut is packed with crushed Oreo cookies and smooth cookies & cream filling.",
          image: "",
          calories: 340
        },
        {
          id: 4,
          name: "Strawberry Bliss Duo",
          price: 15.90,
          category: "Couple Set",
          description: "Share the love with our Strawberry Bliss Duo! Two perfectly crafted donuts filled with fresh strawberry cream.",
          image: "",
          badge: "POPULAR",
          badgeClass: "popular",
          calories: 280
        },
        {
          id: 5,
          name: "Blueberry Lemon Pair",
          price: 16.90,
          category: "Couple Set",
          description: "A refreshing combination that's perfect for any time of day. Our Blueberry Lemon Pair features one blueberry-filled and one lemon-filled donut.",
          image: "",
          calories: 260
        },
        {
          id: 6,
          name: "Tropical Family Box",
          price: 35.90,
          category: "Family Pack",
          description: "Bring tropical vibes to your family gathering! This box contains 6 delicious donuts with exotic mango and coconut flavors.",
          image: "",
          calories: 250
        },
        {
          id: 7,
          name: "Mocha Madness Pack",
          price: 42.90,
          category: "Family Pack",
          description: "For coffee lovers! Our Mocha Madness Pack includes 8 donuts filled with rich coffee and premium chocolate.",
          image: "",
          calories: 310
        },
        {
          id: 8,
          name: "Spicy Chocolate",
          price: 9.90,
          category: "Solo Delight",
          description: "For the adventurous! Our Spicy Chocolate donut combines dark chocolate with a subtle hint of chili.",
          image: "",
          badge: "NEW",
          badgeClass: "new",
          calories: 290
        },
        {
          id: 9,
          name: "Ultimate Party Box",
          price: 89.90,
          category: "Party Box",
          description: "Make your celebration unforgettable! Our Ultimate Party Box includes 20 assorted donuts with various flavors.",
          image: "",
          badge: "BESTSELLER",
          calories: 280
        },
        {
          id: 10,
          name: "Classic Vanilla Dream",
          price: 7.90,
          category: "Solo Delight",
          description: "Sometimes simple is best. Our Classic Vanilla Dream features premium Madagascar vanilla cream in a perfectly fluffy donut.",
          image: "",
          calories: 240
        },
        {
          id: 11,
          name: "Birthday Celebration Box",
          price: 79.90,
          category: "Party Box",
          description: "Perfect for birthday parties! 18 colorful donuts with rainbow sprinkles, chocolate drizzle, and vanilla glaze.",
          image: "",
          badge: "POPULAR",
          badgeClass: "popular",
          calories: 300
        },
        {
          id: 12,
          name: "Office Meeting Box",
          price: 69.90,
          category: "Party Box",
          description: "Ideal for office meetings and events! 15 assorted donuts including classic glazed, chocolate, and specialty flavors.",
          image: "",
          calories: 270
        }
      ];

      // Add each product to Firebase
      for (const product of defaultProducts) {
        await addDoc(collection(db, 'products'), product);
      }
      
      console.log('Default products added successfully!');
    }
  } catch (error) {
    console.error('Error initializing products:', error);
  }
}

// ============ NAVIGATION ============

function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(section => section.classList.remove('active'));
  
  // Remove active from all nav buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected section
  document.getElementById('section-' + sectionName).classList.add('active');
  
  // Activate clicked button
  event.target.classList.add('active');
  
  // Load data for the section
  if (sectionName === 'dashboard') {
    loadDashboard();
  } else if (sectionName === 'products') {
    loadProducts();
  } else if (sectionName === 'orders') {
    loadOrders();
  }
}

window.showSection = showSection;

// ============ DASHBOARD ============

async function loadDashboard() {
  try {
    // Get products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    allProducts = productsSnapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));
    
    // Get orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    allOrders = ordersSnapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));
    
    // Update stats
    document.getElementById('stat-products').textContent = allProducts.length;
    document.getElementById('stat-orders').textContent = allOrders.length;
    
    // Calculate revenue
    const revenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('stat-revenue').textContent = `RM ${revenue.toFixed(2)}`;
    
    // Count pending orders
    const pending = allOrders.filter(order => order.status === 'pending').length;
    document.getElementById('stat-pending').textContent = pending;
    
    // Show recent orders (last 5)
    const recentOrders = allOrders.slice(-5).reverse();
    const recentOrdersList = document.getElementById('recent-orders-list');
    
    if (recentOrders.length === 0) {
      recentOrdersList.innerHTML = '<p class="no-data">No orders yet</p>';
    } else {
      recentOrdersList.innerHTML = recentOrders.map(order => `
        <div style="padding: 15px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${order.orderId}</strong> - ${order.customerName}
            <br><small style="color: #999;">${new Date(order.date).toLocaleDateString()}</small>
          </div>
          <div>
            <span class="status-badge ${order.status}">${order.status}</span>
            <strong style="margin-left: 15px;">RM ${order.total.toFixed(2)}</strong>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showNotification('Error loading dashboard data', 'error');
  }
}

// ============ PRODUCTS MANAGEMENT ============

async function loadProducts() {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    allProducts = productsSnapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));
    
    const tbody = document.getElementById('products-table-body');
    
    if (allProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">No products yet. Add your first product!</td></tr>';
      return;
    }
    
    tbody.innerHTML = allProducts.map(product => `
      <tr>
        <td>${product.id}</td>
        <td>
          <div class="product-cell">
            <div>
              <div class="product-name">${product.name}</div>
              <div class="product-desc">${product.category}</div>
            </div>
          </div>
        </td>
        <td>${product.category}</td>
        <td>RM ${product.price.toFixed(2)}</td>
        <td>
          ${product.badge ? `<span class="badge ${product.badgeClass || product.badge.toLowerCase()}">${product.badge}</span>` : '-'}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="editProduct('${product.firestoreId}')">Edit</button>
            <button class="btn-delete" onclick="deleteProduct('${product.firestoreId}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    showNotification('Error loading products', 'error');
  }
}

function showAddProductForm() {
  document.getElementById('product-form-container').style.display = 'block';
  document.getElementById('form-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('edit-product-id').value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.showAddProductForm = showAddProductForm;

function editProduct(firestoreId) {
  const product = allProducts.find(p => p.firestoreId === firestoreId);
  
  if (!product) return;
  
  // Show form
  document.getElementById('product-form-container').style.display = 'block';
  document.getElementById('form-title').textContent = 'Edit Product';
  
  // Fill form
  document.getElementById('edit-product-id').value = product.firestoreId;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-image').value = product.image || '';
  document.getElementById('product-calories').value = product.calories || '';
  document.getElementById('product-badge').value = product.badge || '';
  document.getElementById('product-description').value = product.description;
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.editProduct = editProduct;

async function saveProduct(event) {
  event.preventDefault();
  
  try {
    const editId = document.getElementById('edit-product-id').value;
    
    // Generate next numeric ID for new products
    const maxId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id || 0)) : 0;
    const nextId = editId ? allProducts.find(p => p.firestoreId === editId).id : maxId + 1;
    
    const productData = {
      id: nextId,
      name: document.getElementById('product-name').value,
      price: parseFloat(document.getElementById('product-price').value),
      category: document.getElementById('product-category').value,
      image: document.getElementById('product-image').value || '',
      calories: parseInt(document.getElementById('product-calories').value) || 250,
      badge: document.getElementById('product-badge').value,
      badgeClass: getBadgeClass(document.getElementById('product-badge').value),
      description: document.getElementById('product-description').value
    };
    
    if (editId) {
      // Update existing product in Firebase
      await updateDoc(doc(db, 'products', editId), productData);
      showNotification('Product updated successfully!', 'success');
    } else {
      // Add new product to Firebase
      await addDoc(collection(db, 'products'), productData);
      showNotification('Product added successfully!', 'success');
    }
    
    // Reload products table
    await loadProducts();
    await loadDashboard();
    
    // Hide form
    cancelProductForm();
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('Error saving product: ' + error.message, 'error');
  }
}

window.saveProduct = saveProduct;

async function deleteProduct(firestoreId) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }
  
  try {
    await deleteDoc(doc(db, 'products', firestoreId));
    await loadProducts();
    await loadDashboard();
    showNotification('Product deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('Error deleting product: ' + error.message, 'error');
  }
}

window.deleteProduct = deleteProduct;

function cancelProductForm() {
  document.getElementById('product-form-container').style.display = 'none';
  document.getElementById('product-form').reset();
}

window.cancelProductForm = cancelProductForm;

function getBadgeClass(badge) {
  if (badge === 'NEW') return 'new';
  if (badge === 'POPULAR') return 'popular';
  return '';
}

// ============ ORDERS MANAGEMENT ============

async function loadOrders() {
  try {
    const ordersSnapshot = await getDocs(query(collection(db, 'orders'), orderBy('date', 'desc')));
    allOrders = ordersSnapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));
    
    const tbody = document.getElementById('orders-table-body');
    
    if (allOrders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = allOrders.map(order => `
      <tr data-status="${order.status}">
        <td><strong>${order.orderId}</strong></td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td>
          <div>${order.customerName}</div>
          <small style="color: #999;">${order.phone}</small>
        </td>
        <td>${order.items.length} items</td>
        <td><strong>RM ${order.total.toFixed(2)}</strong></td>
        <td>
          <select class="status-badge ${order.status}" onchange="updateOrderStatus('${order.firestoreId}', this.value)" style="border: none; background: transparent; font-weight: 600; cursor: pointer;">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <button class="btn-view" onclick="viewOrderDetails('${order.firestoreId}')">View</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    showNotification('Error loading orders', 'error');
  }
}

function filterOrders(status) {
  // Update active button
  const filterButtons = document.querySelectorAll('.filter-buttons .filter-btn');
  filterButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Filter table rows
  const rows = document.querySelectorAll('#orders-table-body tr');
  rows.forEach(row => {
    const rowStatus = row.getAttribute('data-status');
    if (status === 'all' || rowStatus === status) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

window.filterOrders = filterOrders;

async function updateOrderStatus(firestoreId, newStatus) {
  try {
    await updateDoc(doc(db, 'orders', firestoreId), {
      status: newStatus
    });
    
    await loadOrders();
    await loadDashboard();
    
    const order = allOrders.find(o => o.firestoreId === firestoreId);
    showNotification(`Order ${order.orderId} status updated to ${newStatus}`, 'success');
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('Error updating order status', 'error');
  }
}

window.updateOrderStatus = updateOrderStatus;

function viewOrderDetails(firestoreId) {
  const order = allOrders.find(o => o.firestoreId === firestoreId);
  
  if (!order) return;
  
  const modalBody = document.getElementById('order-modal-body');
  modalBody.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3>Order ID: ${order.orderId}</h3>
      <p style="color: #666;">Date: ${new Date(order.date).toLocaleString()}</p>
      <span class="status-badge ${order.status}">${order.status}</span>
    </div>
    
    <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 10px;">
      <h4 style="margin-bottom: 10px;">Customer Information</h4>
      <p><strong>Name:</strong> ${order.customerName}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
      <p><strong>Delivery:</strong> ${order.deliveryOption || 'Pickup'}</p>
      ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
    </div>
    
    <div style="margin-bottom: 20px;">
      <h4 style="margin-bottom: 10px;">Order Items</h4>
      ${order.items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e0e0e0;">
          <div>
            <strong>${item.name}</strong>
            <br><small style="color: #999;">Quantity: ${item.quantity}</small>
          </div>
          <div><strong>RM ${(item.price * item.quantity).toFixed(2)}</strong></div>
        </div>
      `).join('')}
    </div>
    
    <div style="padding-top: 15px; border-top: 2px solid #e0e0e0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Subtotal:</span>
        <span>RM ${order.subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Delivery:</span>
        <span>RM ${order.delivery.toFixed(2)}</span>
      </div>
      ${order.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #3cb371;">
          <span>Discount:</span>
          <span>- RM ${order.discount.toFixed(2)}</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 12px;">
        <span>Total:</span>
        <span>RM ${order.total.toFixed(2)}</span>
      </div>
    </div>
  `;
  
  document.getElementById('order-modal').classList.add('active');
}

window.viewOrderDetails = viewOrderDetails;

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('active');
}

window.closeOrderModal = closeOrderModal;

// ============ NOTIFICATIONS ============

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
