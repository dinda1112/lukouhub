/* ============================================
   LISTING PAGE - FIREBASE VERSION (STRICT START-WITH)
   1. Search STRICTLY checks the first letter(s) of the NAME.
   2. "n" will show "Nutella", but NOT "Vanilla".
   3. Combined with Category buttons.
   ============================================ */

// Import Firebase functions
import { db, collection, getDocs } from './firebase-config.js';

// GLOBAL VARIABLE: Store all products here
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
    
    // Default Sort by ID
    allProductsData.sort((a, b) => a.id - b.id);

    // Initial Render
    renderProducts(allProductsData);

    // ACTIVATE SEARCH & FILTER
    setupSearchAndFilter();
    
  } catch (error) {
    console.error('Error loading products:', error);
    showErrorState();
  }
}

// 2. RENDER FUNCTION
function renderProducts(productsToDisplay) {
    const productsGrid = document.getElementById('products-grid');

    if (productsToDisplay.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <h3 style="color: #666; margin-bottom: 15px;">No donuts found</h3>
          <p style="color: #999;">Try checking your spelling.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = productsToDisplay.map(product => {
      const gradient = product.gradient || 'linear-gradient(135deg, #f4a460, #e08040)';
      
      let badgeHTML = '';
      if (product.badge) {
        const badgeClass = product.badgeClass || product.badge.toLowerCase();
        badgeHTML = `<span class="product-badge ${badgeClass}">${product.badge}</span>`;
      }
      
      let imageHTML = '';
      if (product.image && product.image.trim()) {
        if (product.image.includes('http') || product.image.includes('/') || product.image.includes('.')) {
          imageHTML = `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`;
        } else {
          imageHTML = product.image; 
        }
      } else {
        imageHTML = '🍩';
      }
      
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

// 3. SETUP LISTENERS
function setupSearchAndFilter() {
    const searchInput = document.getElementById('search-input');
    const buttons = document.querySelectorAll('.filter-btn');

    if(searchInput) {
        searchInput.addEventListener('input', runCombinedFilter);
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            runCombinedFilter();
        });
    });
}

// 4. MASTER FILTER LOGIC (STRICT START-WITH)
function runCombinedFilter() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const activeBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeBtn ? activeBtn.getAttribute('data-category') : 'all';

    let filtered = allProductsData.filter(product => {
        // A. Category Check
        let matchesCategory = false;
        if (activeCategory === 'all') {
            matchesCategory = true;
        } else {
            matchesCategory = product.category && 
                              product.category.toLowerCase().includes(activeCategory.toLowerCase());
        }

        // B. Search Check (STRICT: STARTS WITH ONLY)
        let matchesSearch = true;
        if (searchTerm) {
             // CHANGE: Used startsWith() instead of includes()
             matchesSearch = product.name.toLowerCase().startsWith(searchTerm);
        }

        return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
}

function showErrorState() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = `<h3 style="text-align:center; padding:40px;">Error Loading Data</h3>`;
}

document.addEventListener('DOMContentLoaded', loadProducts);