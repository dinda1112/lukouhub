// ==========================================
// LISTING PAGE - FILTER & SEARCH (FIXED)
// ==========================================

import { db } from './firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let allProducts = [];
let currentCategory = 'all';
let searchTerm = '';

// ==========================================
// LOAD PRODUCTS FROM FIREBASE
// ==========================================
async function loadProducts() {
  try {
    console.log('🔄 Loading products from Firebase...');
    const querySnapshot = await getDocs(collection(db, 'products'));
    allProducts = [];
    
    querySnapshot.forEach((doc) => {
      allProducts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('✅ Loaded products:', allProducts.length);
    displayProducts();
    
  } catch (error) {
    console.error('❌ Error loading products:', error);
    document.getElementById('products-grid').innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e63946;">
        <h3>Error loading products</h3>
        <p>Please refresh the page or check your internet connection.</p>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #f4a460; color: white; border: none; border-radius: 20px; cursor: pointer;">Retry</button>
      </div>
    `;
  }
}

// ==========================================
// FILTER PRODUCTS BY CATEGORY & SEARCH
// ==========================================
function filterProducts() {
  let filteredProducts = allProducts;
  
  // 1. Filter by category
  if (currentCategory !== 'all') {
    filteredProducts = filteredProducts.filter(product => {
      const productCategory = (product.category || '').toLowerCase().trim();
      const filterValue = currentCategory.toLowerCase().trim();
      
      // Match if category contains the filter value
      // This allows "Solo Delight" to match "solo"
      return productCategory.includes(filterValue);
    });
  }
  
  // 2. Filter by search term
  if (searchTerm) {
    const search = searchTerm.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      return name.includes(search) || description.includes(search);
    });
  }
  
  console.log(`🔍 Filtered: ${filteredProducts.length} products (category: ${currentCategory}, search: "${searchTerm}")`);
  return filteredProducts;
}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================
function displayProducts() {
  const grid = document.getElementById('products-grid');
  const filteredProducts = filterProducts();
  
  if (!grid) {
    console.error('❌ products-grid element not found!');
    return;
  }
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <div style="font-size: 60px; margin-bottom: 20px;">🍩</div>
        <h3 style="color: #2c1810; margin-bottom: 10px;">No products found</h3>
        <p style="color: #888;">Try adjusting your filters or search terms</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filteredProducts.map(product => {
    const price = parseFloat(product.price || 0).toFixed(2);
    
    // Image handling
    const isFilePath = product.image && (product.image.includes('/') || product.image.includes('.'));
    let imageHTML;
    if (isFilePath) {
      imageHTML = `<img src="${product.image}" alt="${product.name}" onerror="this.parentElement.innerHTML='🍩'" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      imageHTML = product.image || '🍩';
    }
    
    // Background only for emojis
    const bgStyle = isFilePath ? '' : `style="background: linear-gradient(135deg, #f4a460, #e08040);"`;
    
    // Badge
    const badge = product.badge ? `<span class="product-badge ${(product.badge || '').toLowerCase()}">${product.badge}</span>` : '';
    
    return `
      <div class="product-card" onclick="openProductModal('${product.id}')">
        <div class="product-image" ${bgStyle}>
          ${badge}
          ${imageHTML}
        </div>
        <div class="product-info">
          <div class="product-category">${product.category || 'Solo'}</div>
          <h3>${product.name}</h3>
          <p class="description">${product.description || ''}</p>
          <div class="product-price">
            <span class="price">RM ${price}</span>
            <button class="add-cart" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  console.log('✅ Displayed', filteredProducts.length, 'products');
}

// ==========================================
// SETUP CATEGORY FILTER BUTTONS
// ==========================================
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  if (filterButtons.length === 0) {
    console.warn('⚠️ No filter buttons found!');
    return;
  }
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active from all
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active to clicked
      button.classList.add('active');
      
      // Update category and refresh
      currentCategory = button.getAttribute('data-category') || 'all';
      displayProducts();
      
      console.log('🔘 Filter changed to:', currentCategory);
    });
  });
  
  console.log('✅ Filter buttons setup:', filterButtons.length);
}

// ==========================================
// SETUP SEARCH FUNCTIONALITY
// ==========================================
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  
  if (!searchInput) {
    console.warn('⚠️ Search input not found!');
    return;
  }
  
  // Real-time search as you type
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    displayProducts();
    console.log('🔍 Search:', searchTerm);
  });
  
  // Also handle Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchTerm = e.target.value.trim();
      displayProducts();
    }
  });
  
  console.log('✅ Search setup complete');
}

// ==========================================
// CHECK URL PARAMETERS (for homepage links)
// ==========================================
function checkURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('cat');
  
  if (category) {
    currentCategory = category.toLowerCase();
    
    // Update filter button UI
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-category') === currentCategory) {
        btn.classList.add('active');
      }
    });
    
    console.log('🔗 URL category:', currentCategory);
  }
}

// ==========================================
// QUICK ADD TO CART
// ==========================================
window.quickAddToCart = function(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    console.error('❌ Product not found:', productId);
    return;
  }
  
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if product already exists
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
    console.log('📦 Updated quantity for:', product.name);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      quantity: 1
    });
    console.log('➕ Added to cart:', product.name);
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  // Show notification
  showNotification(`${product.name} added to cart!`);
};

// ==========================================
// UPDATE CART COUNT
// ==========================================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(el => el.textContent = totalItems);
}

// ==========================================
// SHOW NOTIFICATION
// ==========================================
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  }
}

// ==========================================
// OPEN PRODUCT MODAL
// ==========================================
window.openProductModal = function(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    console.error('❌ Product not found for modal:', productId);
    return;
  }
  
  // Store product data
  window.currentModalProduct = product;
  
  // Dispatch event for modal
  const event = new CustomEvent('openProductModal', { detail: product });
  window.dispatchEvent(event);
  
  console.log('🔍 Opening modal for:', product.name);
};

// ==========================================
// INITIALIZE ON PAGE LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Listing page initializing...');
  
  // 1. Check URL parameters
  checkURLParams();
  
  // 2. Setup filters
  setupFilters();
  
  // 3. Setup search
  setupSearch();
  
  // 4. Load products from Firebase
  loadProducts();
  
  // 5. Update cart count
  updateCartCount();
  
  console.log('✅ Listing page ready!');
});

// ==========================================
// DEBUG FUNCTION
// ==========================================
window.debugListing = function() {
  console.log('📊 LISTING DEBUG:');
  console.log('Total products:', allProducts.length);
  console.log('Current category:', currentCategory);
  console.log('Search term:', searchTerm);
  console.log('Filtered products:', filterProducts().length);
  console.log('All products:', allProducts);
};
