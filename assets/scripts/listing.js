// ==========================================
// LISTING PAGE - FILTER & SEARCH (FIXED MATCHING)
// ==========================================

import { db, collection, getDocs } from './firebase-config.js';

let allProducts = [];
let currentCategory = 'all';
let searchTerm = '';

// ==========================================
// LOAD PRODUCTS FROM FIREBASE
// ==========================================
async function loadProducts() {
  try {
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
        <p style="font-size: 12px; color: #999;">${error.message}</p>
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
      const productCategory = (product.category || '').toLowerCase();
      // FIX: Use .includes() instead of === to match "Solo" with "Solo Delight"
      return productCategory.includes(currentCategory.toLowerCase());
    });
  }
  
  // 2. Filter by search term
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      return name.includes(search) || description.includes(search);
    });
  }
  
  console.log(`🔍 Filtered: ${filteredProducts.length} products (category: ${currentCategory})`);
  return filteredProducts;
}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================
function displayProducts() {
  const grid = document.getElementById('products-grid');
  const filteredProducts = filterProducts();
  
  if (!grid) return;
  
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
    
    // Image Handling Logic
    const isFilePath = product.image && (product.image.includes('/') || product.image.includes('.'));
    let imageHTML;
    if (isFilePath) {
        imageHTML = `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        imageHTML = product.image || '🍩';
    }
    
    // Background Logic
    const bgStyle = isFilePath ? '' : `style="background: linear-gradient(135deg, #f4a460, #e08040);"`;
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
}

// ==========================================
// SETUP CATEGORY FILTER BUTTONS
// ==========================================
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  if (filterButtons.length === 0) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked
      button.classList.add('active');
      
      // Update state and refresh
      currentCategory = button.getAttribute('data-category') || 'all';
      displayProducts();
    });
  });
}

// ==========================================
// SETUP SEARCH FUNCTIONALITY
// ==========================================
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  
  if (!searchInput) return;
  
  // Real-time search
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    displayProducts();
  });
}

// ==========================================
// CHECK URL PARAMETERS (for homepage links)
// ==========================================
function checkURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('cat');
  
  if (category) {
    currentCategory = category.toLowerCase();
    
    // Update UI button state
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-category') === currentCategory) {
        btn.classList.add('active');
      }
    });
  }
}

// ==========================================
// QUICK ADD TO CART
// ==========================================
window.quickAddToCart = function(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showNotification(`${product.name} added to cart!`);
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(el => el.textContent = totalItems);
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.display = 'none'; }, 2000);
  }
}

window.openProductModal = function(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  window.currentModalProduct = product;
  const event = new CustomEvent('openProductModal', { detail: product });
  window.dispatchEvent(event);
};

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  checkURLParams();
  setupFilters();
  setupSearch();
  loadProducts();
  updateCartCount();
});