/* ============================================
   LISTING PAGE - FIREBASE VERSION
   Dynamically loads products from Firebase
   ============================================ */

// Import Firebase functions
import { db, collection, getDocs } from './firebase-config.js';

// Load and display products from Firebase
async function loadProducts() {
  try {
    console.log('Loading products from Firebase...');
    
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));
    
    console.log(`Loaded ${products.length} products`);
    
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <h3 style="color: #666; margin-bottom: 15px;">No products found</h3>
          <p style="color: #999;">Products will appear here once added by admin.</p>
        </div>
      `;
      return;
    }
    
    // Sort products by ID
    products.sort((a, b) => a.id - b.id);
    
    // Display products
    productsGrid.innerHTML = products.map(product => {
      // Get gradient (use default if not provided)
      const gradient = product.gradient || 'linear-gradient(135deg, #f4a460, #e08040)';
      
      // Get badge HTML
      let badgeHTML = '';
      if (product.badge) {
        const badgeClass = product.badgeClass || product.badge.toLowerCase();
        badgeHTML = `<span class="product-badge ${badgeClass}">${product.badge}</span>`;
      }
      
      // Get product image/icon (use default emoji if empty)
      const productIcon = product.image || '🍩';
      
      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image" style="background: ${gradient};">
            ${badgeHTML}
            ${productIcon}
          </div>
          <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3>${product.name}</h3>
            <p class="description">${product.description.substring(0, 60)}...</p>
            <div class="product-price">
              <span class="price">RM ${product.price.toFixed(2)}</span>
              <button class="add-cart" onclick="event.stopPropagation(); openProductModal(${product.id})">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    console.log('Products displayed successfully');
    
  } catch (error) {
    console.error('Error loading products:', error);
    
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <h3 style="color: #e63946; margin-bottom: 15px;">Error Loading Products</h3>
        <p style="color: #999;">Please check your internet connection and try again.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #f4a460; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
      </div>
    `;
  }
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Listing page loaded');
  loadProducts();
});
