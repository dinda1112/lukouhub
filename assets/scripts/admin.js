/* ============================================
   ADMIN PANEL JAVASCRIPT
   ============================================ */

// Default admin credentials (you can change these)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'lukouhub2024';

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn');
  if (isLoggedIn === 'true') {
    showAdminPanel();
  }
  
  // Load dashboard data
  loadDashboard();
  loadProducts();
  loadOrders();
});

// ============ LOGIN/LOGOUT ============

function adminLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem('adminLoggedIn', 'true');
    showAdminPanel();
    showNotification('✓ Login successful!', 'success');
  } else {
    showNotification('✗ Invalid username or password', 'error');
  }
}

function adminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
    showNotification('Logged out successfully', 'success');
  }
}

function showAdminPanel() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
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

// ============ DASHBOARD ============

function loadDashboard() {
  const products = getProducts();
  const orders = getOrders();
  
  // Update stats
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-orders').textContent = orders.length;
  
  // Calculate revenue
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  document.getElementById('stat-revenue').textContent = `RM ${revenue.toFixed(2)}`;
  
  // Count pending orders
  const pending = orders.filter(order => order.status === 'pending').length;
  document.getElementById('stat-pending').textContent = pending;
  
  // Show recent orders (last 5)
  const recentOrders = orders.slice(-5).reverse();
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
}

// ============ PRODUCTS MANAGEMENT ============

function loadProducts() {
  const products = getProducts();
  const tbody = document.getElementById('products-table-body');
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">No products yet. Add your first product!</td></tr>';
    return;
  }
  
  tbody.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td>
        <div class="product-cell">
          <div class="product-emoji">${product.image}</div>
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
          <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function showAddProductForm() {
  document.getElementById('product-form-container').style.display = 'block';
  document.getElementById('form-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('edit-product-id').value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function editProduct(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) return;
  
  // Show form
  document.getElementById('product-form-container').style.display = 'block';
  document.getElementById('form-title').textContent = 'Edit Product';
  
  // Fill form
  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-image').value = product.image;
  document.getElementById('product-calories').value = product.calories || '';
  document.getElementById('product-badge').value = product.badge || '';
  document.getElementById('product-description').value = product.description;
  document.getElementById('product-gradient').value = product.gradient || '';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveProduct(event) {
  event.preventDefault();
  
  const editId = document.getElementById('edit-product-id').value;
  const products = getProducts();
  
  const productData = {
    id: editId ? parseInt(editId) : Date.now(),
    name: document.getElementById('product-name').value,
    price: parseFloat(document.getElementById('product-price').value),
    category: document.getElementById('product-category').value,
    image: document.getElementById('product-image').value,
    calories: parseInt(document.getElementById('product-calories').value) || 250,
    badge: document.getElementById('product-badge').value,
    badgeClass: getBadgeClass(document.getElementById('product-badge').value),
    description: document.getElementById('product-description').value,
    gradient: document.getElementById('product-gradient').value || 'linear-gradient(135deg, #f4a460, #e08040)',
    liked: '#' + products.length + ' Most liked',
    rating: '90% (10)'
  };
  
  if (editId) {
    // Update existing product
    const index = products.findIndex(p => p.id === parseInt(editId));
    if (index !== -1) {
      products[index] = productData;
      showNotification('✓ Product updated successfully!', 'success');
    }
  } else {
    // Add new product
    products.push(productData);
    showNotification('✓ Product added successfully!', 'success');
  }
  
  // Save to localStorage
  saveProducts(products);
  
  // Reload products table
  loadProducts();
  loadDashboard();
  
  // Hide form
  cancelProductForm();
}

function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }
  
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  
  saveProducts(filtered);
  loadProducts();
  loadDashboard();
  
  showNotification('✓ Product deleted successfully!', 'success');
}

function cancelProductForm() {
  document.getElementById('product-form-container').style.display = 'none';
  document.getElementById('product-form').reset();
}

function getBadgeClass(badge) {
  if (badge === 'NEW') return 'new';
  if (badge === 'POPULAR') return 'popular';
  return '';
}

// ============ ORDERS MANAGEMENT ============

function loadOrders() {
  const orders = getOrders();
  const tbody = document.getElementById('orders-table-body');
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = orders.map(order => `
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
        <select class="status-badge ${order.status}" onchange="updateOrderStatus('${order.orderId}', this.value)" style="border: none; background: transparent; font-weight: 600; cursor: pointer;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
          <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
      </td>
      <td>
        <button class="btn-view" onclick="viewOrderDetails('${order.orderId}')">View</button>
      </td>
    </tr>
  `).join('');
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

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.orderId === orderId);
  
  if (order) {
    order.status = newStatus;
    saveOrders(orders);
    loadOrders();
    loadDashboard();
    showNotification(`✓ Order ${orderId} status updated to ${newStatus}`, 'success');
  }
}

function viewOrderDetails(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.orderId === orderId);
  
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

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('active');
}

// ============ DATA STORAGE (LocalStorage) ============

function getProducts() {
  const stored = localStorage.getItem('products');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default products (from product-modal.js)
  const defaultProducts = [
    {
      id: 1,
      name: "Nutella Banana",
      price: 8.90,
      category: "Solo Delight",
      description: "Indulge in our signature Nutella Banana donut - a heavenly combination of premium Nutella chocolate spread and fresh banana slices, all wrapped in our fluffy Greek-style donut.",
      image: "🍫🍌",
      badge: "BESTSELLER",
      gradient: "linear-gradient(135deg, #8b4513, #d2691e)",
      calories: 320,
      liked: "#2 Most liked",
      rating: "85% (7)"
    },
    {
      id: 2,
      name: "Berry Matcha",
      price: 9.90,
      category: "Solo Delight",
      description: "Experience the perfect fusion of East meets West with our Berry Matcha donut. Premium Japanese matcha cream paired with fresh mixed berries creates a unique flavor profile.",
      image: "🍵🍓",
      badge: "NEW",
      badgeClass: "new",
      gradient: "linear-gradient(135deg, #90ee90, #ffb6c1)",
      calories: 280,
      liked: "#5 Most liked",
      rating: "92% (12)"
    },
    {
      id: 3,
      name: "Cookie O'Clock",
      price: 8.90,
      category: "Solo Delight",
      description: "For all cookie lovers! Our Cookie O'Clock donut is packed with crushed Oreo cookies and smooth cookies & cream filling. A crunchy, creamy delight in every bite.",
      image: "🍪",
      gradient: "linear-gradient(135deg, #deb887, #8b4513)",
      calories: 340,
      liked: "#4 Most liked",
      rating: "88% (9)"
    },
    {
      id: 4,
      name: "Strawberry Bliss Duo",
      price: 15.90,
      category: "Couple Set",
      description: "Share the love with our Strawberry Bliss Duo! Two perfectly crafted donuts filled with fresh strawberry cream and topped with real strawberry pieces.",
      image: "🍓",
      badge: "POPULAR",
      badgeClass: "popular",
      gradient: "linear-gradient(135deg, #ff69b4, #ffb6c1)",
      calories: 280,
      liked: "#1 Most liked",
      rating: "95% (18)"
    },
    {
      id: 5,
      name: "Blueberry Lemon Pair",
      price: 16.90,
      category: "Couple Set",
      description: "A refreshing combination that's perfect for any time of day. Our Blueberry Lemon Pair features one blueberry-filled and one lemon-filled donut.",
      image: "🫐🍋",
      gradient: "linear-gradient(135deg, #87ceeb, #4169e1)",
      calories: 260,
      liked: "#7 Most liked",
      rating: "86% (11)"
    },
    {
      id: 6,
      name: "Tropical Family Box",
      price: 35.90,
      category: "Family Pack",
      description: "Bring tropical vibes to your family gathering! This box contains 6 delicious donuts with exotic mango and coconut flavors.",
      image: "🥭🥥",
      gradient: "linear-gradient(135deg, #ffd700, #ffed4e)",
      calories: 250,
      liked: "#6 Most liked",
      rating: "90% (15)"
    },
    {
      id: 7,
      name: "Mocha Madness Pack",
      price: 42.90,
      category: "Family Pack",
      description: "For coffee lovers! Our Mocha Madness Pack includes 8 donuts filled with rich coffee and premium chocolate. Perfect for family gatherings.",
      image: "☕🍫",
      gradient: "linear-gradient(135deg, #8b4513, #a0522d)",
      calories: 310,
      liked: "#8 Most liked",
      rating: "84% (10)"
    },
    {
      id: 8,
      name: "Spicy Chocolate",
      price: 9.90,
      category: "Solo Delight",
      description: "For the adventurous! Our Spicy Chocolate donut combines dark chocolate with a subtle hint of chili, creating an exciting flavor journey.",
      image: "🌶️🍫",
      badge: "NEW",
      badgeClass: "new",
      gradient: "linear-gradient(135deg, #ff6347, #ff4500)",
      calories: 290,
      liked: "#9 Most liked",
      rating: "78% (6)"
    },
    {
      id: 9,
      name: "Ultimate Party Box",
      price: 89.90,
      category: "Party Box",
      description: "Make your celebration unforgettable! Our Ultimate Party Box includes 20 assorted donuts with various flavors - from classic favorites to exotic creations.",
      image: "🎉",
      badge: "BESTSELLER",
      gradient: "linear-gradient(135deg, #ffa500, #ff8c00)",
      calories: 280,
      liked: "#3 Most liked",
      rating: "93% (25)"
    },
    {
      id: 10,
      name: "Classic Vanilla Dream",
      price: 7.90,
      category: "Solo Delight",
      description: "Sometimes simple is best. Our Classic Vanilla Dream features premium Madagascar vanilla cream in a perfectly fluffy donut.",
      image: "🤍",
      gradient: "linear-gradient(135deg, #fff5ee, #ffe4b5)",
      calories: 240,
      liked: "#10 Most liked",
      rating: "87% (14)"
    },
    {
      id: 11,
      name: "Birthday Celebration Box",
      price: 79.90,
      category: "Party Box",
      description: "Perfect for birthday parties! 18 colorful donuts with rainbow sprinkles, chocolate drizzle, and vanilla glaze. Guaranteed to bring smiles!",
      image: "🎂🎈",
      badge: "POPULAR",
      badgeClass: "popular",
      gradient: "linear-gradient(135deg, #ff1493, #ff69b4)",
      calories: 300,
      liked: "#11 Most liked",
      rating: "91% (20)"
    },
    {
      id: 12,
      name: "Office Meeting Box",
      price: 69.90,
      category: "Party Box",
      description: "Ideal for office meetings and events! 15 assorted donuts including classic glazed, chocolate, and specialty flavors. Perfect for sharing!",
      image: "💼☕",
      gradient: "linear-gradient(135deg, #4169e1, #6495ed)",
      calories: 270,
      liked: "#12 Most liked",
      rating: "89% (16)"
    }
  ];
  
  // Save default products to localStorage
  saveProducts(defaultProducts);
  return defaultProducts;
}

function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

function getOrders() {
  const stored = localStorage.getItem('orders');
  return stored ? JSON.parse(stored) : [];
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

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
