/* ============================================
   LISTING PAGE - FIREBASE VERSION (FINAL FIX)
   Includes Search and Filter Logic
   ============================================ */

// Import Firebase functions
import { db, collection, getDocs } from './firebase-config.js';

// GLOBAL VARIABLE: Store all products here so we can filter them later
let allProductsData = [];

// 1. MAIN FUNCTION: Fetch Data Once
async function loadProducts() {
  try {
    console.log('Loading products from Firebase...');
    
    const productsSnapshot = await getDocs(collection(db, 'products'));
    allProductsData = productsSnapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));
    
    console.log(`Loaded ${allProductsData.length} products`);
    
    // Default Sort by ID
    allProductsData.sort((a, b) => a.id - b.id);

    // Initial Render (Show All)
    renderProducts(allProductsData);

    // ACTIVATE SEARCH & FILTER features
    setupSearchAndFilter();
    
  } catch (error) {
    console.error('Error loading products:', error);
    showErrorState();
  }
}

// 2. RENDER FUNCTION: Displays whatever list you give it
function renderProducts(productsToDisplay) {
    const productsGrid = document.getElementById('products-grid');

    // Handle Empty Results
    if (productsToDisplay.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <h3 style="color: #666; margin-bottom: 15px;">No donuts found</h3>
          <p style="color: #999;">Try adjusting your search or filter.</p>
        </div>
      `;
      return;
    }

    // Generate HTML
    productsGrid.innerHTML = productsToDisplay.map(product => {
      // Logic for Gradient
      const gradient = product.gradient || 'linear-gradient(135deg, #f4a460, #e08040)';
      
      // Logic for Badge
      let badgeHTML = '';
      if (product.badge) {
        const badgeClass = product.badgeClass || product.badge.toLowerCase();
        badgeHTML = `<span class="product-badge ${badgeClass}">${product.badge}</span>`;
      }
      
      // Logic for Image (URL vs Emoji)
      let imageHTML = '';
      if (product.image && product.image.trim()) {
        if (product.image.includes('http') || product.image.includes('/') || product.image.includes('.')) {
          imageHTML = `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`;
        } else {
          imageHTML = product.image; // It is an emoji
        }
      } else {
        imageHTML = '🍩';
      }
      
      // Return the Card HTML
      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image" style="background: ${gradient}; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            ${badgeHTML}
            ${imageHTML}
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
}

// 3. LOGIC FUNCTION: Handles Search and Button Clicks
function setupSearchAndFilter() {
    // --- SEARCH LOGIC ---
    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchString = e.target.value.toLowerCase();
            
            // Filter the global data
            const filtered = allProductsData.filter(product => {
                return product.name.toLowerCase().includes(searchString) || 
                       product.description.toLowerCase().includes(searchString);
            });

            // Re-draw the screen
            renderProducts(filtered);
        });
    }

    // --- FILTER BUTTON LOGIC ---
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Remove 'active' class from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            // 2. Add 'active' class to clicked button
            btn.classList.add('active');

            // 3. Get category
            const categoryToFilter = btn.getAttribute('data-category');

            // 4. Filter Data
            if (categoryToFilter === 'all') {
                renderProducts(allProductsData);
            } else {
                // Check if product category CONTAINS the filter word (Fix is here)
                const filtered = allProductsData.filter(product => 
                    product.category && product.category.toLowerCase().includes(categoryToFilter.toLowerCase())
                );
                renderProducts(filtered);
            }
        });
    });
}

// Helper: Show Error if Firebase fails
function showErrorState() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <h3 style="color: #e63946; margin-bottom: 15px;">Error Loading Products</h3>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #f4a460; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
      </div>
    `;
}

// Start everything when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
});