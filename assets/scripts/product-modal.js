/* ============================================
   PRODUCT MODAL JAVASCRIPT - FIREBASE COMPATIBLE
   ============================================ */

// Import Firebase - this will be loaded from firebase-config.js
let db, collection, getDocs;

// Product array - will be loaded from Firebase
let products = [];

// Current modal state
let currentModalProduct = null;
let modalQuantity = 1;

// Initialize Firebase and load products
async function initializeProducts() {
  try {
    // Import Firebase functions dynamically
    const firebaseModule = await import('./firebase-config.js');
    db = firebaseModule.db;
    collection = firebaseModule.collection;
    getDocs = firebaseModule.getDocs;
    
    console.log('Firebase initialized, loading products...');
    
    // Load products from Firebase
    const productsSnapshot = await getDocs(collection(db, 'products'));
    products = productsSnapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));
    
    console.log(`Loaded ${products.length} products from Firebase`);
    
  } catch (error) {
    console.error('Error loading products from Firebase:', error);
    console.log('Using fallback products');
    
    // Fallback to default products if Firebase fails
    products = [
      {
        id: 1,
        name: "Nutella Banana",
        price: 8.90,
        category: "Solo Delight",
        description: "Indulge in our signature Nutella Banana donut - a heavenly combination of premium Nutella chocolate spread and fresh banana slices.",
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
        description: "Experience the perfect fusion of East meets West with our Berry Matcha donut.",
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
        description: "For all cookie lovers! Our Cookie O'Clock donut is packed with crushed Oreo cookies.",
        image: "🍪",
        gradient: "linear-gradient(135deg, #deb887, #8b4513)",
        calories: 340,
        liked: "#4 Most liked",
        rating: "88% (9)"
      }
    ];
  }
}

// Show notification function
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  if (!notification) {
    console.warn('Notification element not found');
    return;
  }
  
  notification.textContent = message;
  notification.style.background = type === 'success' ? '#3cb371' : '#e63946';
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Update cart count function
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}

// Open Product Modal
function openProductModal(productId) {
  console.log('Opening modal for product ID:', productId);
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    console.error('Product not found:', productId);
    return;
  }
  
  currentModalProduct = product;
  modalQuantity = 1;
  
  // Update modal content
  const modal = document.getElementById('product-modal');
  const modalImage = document.getElementById('modal-product-image');
  const modalBadges = document.getElementById('modal-badges');
  const modalCategory = document.getElementById('modal-category');
  const modalName = document.getElementById('modal-product-name');
  const modalCalories = document.getElementById('modal-calories');
  const modalDescription = document.getElementById('modal-description');
  const modalQuantityInput = document.getElementById('modal-quantity');
  const modalTotalPrice = document.getElementById('modal-total-price');
  
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  
  // Set gradient background (use default if not provided)
  const imageSection = document.querySelector('.modal-image-section');
  if (imageSection) {
    imageSection.style.background = product.gradient || 'linear-gradient(135deg, #f4a460, #e08040)';
  }
  
  // Update image (use default emoji if empty)
  if (modalImage) modalImage.textContent = product.image || '🍩';
  
  // Update badge
  if (modalBadges) {
    if (product.badge) {
      modalBadges.innerHTML = `<span class="product-badge ${product.badgeClass || ''}">${product.badge}</span>`;
    } else {
      modalBadges.innerHTML = '';
    }
  }
  
  // Update info
  if (modalCategory) modalCategory.textContent = product.category;
  if (modalName) modalName.textContent = product.name;
  if (modalCalories) modalCalories.textContent = `${product.calories || 250} cal`;
  if (modalDescription) modalDescription.textContent = product.description;
  
  // Update rating (use defaults if not provided)
  const ratingDiv = document.querySelector('.modal-rating');
  if (ratingDiv) {
    ratingDiv.innerHTML = `
      <span class="modal-liked">${product.liked || '#1 Most liked'}</span>
      <span class="modal-thumbs">👍 ${product.rating || '90% (10)'}</span>
    `;
  }
  
  // Update quantity
  if (modalQuantityInput) modalQuantityInput.value = modalQuantity;
  
  // Update price
  updateModalPrice();
  
  // Show modal
  modal.classList.add('active');
  document.body.classList.add('modal-open');
  
  console.log('Modal opened successfully');
}

// Close Product Modal
function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  document.body.classList.remove('modal-open');
  currentModalProduct = null;
  modalQuantity = 1;
}

// Increase Modal Quantity
function modalIncreaseQuantity() {
  if (modalQuantity < 99) {
    modalQuantity++;
    const modalQuantityInput = document.getElementById('modal-quantity');
    if (modalQuantityInput) {
      modalQuantityInput.value = modalQuantity;
    }
    updateModalPrice();
  } else {
    showNotification('Maximum quantity is 99', 'error');
  }
}

// Decrease Modal Quantity
function modalDecreaseQuantity() {
  if (modalQuantity > 1) {
    modalQuantity--;
    const modalQuantityInput = document.getElementById('modal-quantity');
    if (modalQuantityInput) {
      modalQuantityInput.value = modalQuantity;
    }
    updateModalPrice();
  } else {
    showNotification('Minimum quantity is 1', 'error');
  }
}

// Update Modal Price
function updateModalPrice() {
  if (!currentModalProduct) return;
  
  const total = currentModalProduct.price * modalQuantity;
  const modalTotalPrice = document.getElementById('modal-total-price');
  if (modalTotalPrice) {
    modalTotalPrice.textContent = `RM ${total.toFixed(2)}`;
  }
}

// Add to Cart from Modal
function modalAddToCart() {
  if (!currentModalProduct) return;
  
  // Get existing cart
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if product already exists
  const existingIndex = cart.findIndex(item => item.id === currentModalProduct.id);
  
  if (existingIndex !== -1) {
    // Update quantity
    cart[existingIndex].quantity += modalQuantity;
    
    // Check max quantity
    if (cart[existingIndex].quantity > 99) {
      cart[existingIndex].quantity = 99;
      showNotification(`Maximum quantity (99) reached for ${currentModalProduct.name}`, 'error');
    } else {
      showNotification(`Updated ${currentModalProduct.name} quantity in cart!`, 'success');
    }
  } else {
    // Add new item
    cart.push({
      id: currentModalProduct.id,
      name: currentModalProduct.name,
      price: currentModalProduct.price,
      quantity: modalQuantity,
      category: currentModalProduct.category,
      image: currentModalProduct.image || '🍩'
    });
    showNotification(`${currentModalProduct.name} added to cart!`, 'success');
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  // Close modal
  closeProductModal();
}

// CATEGORY FILTER FUNCTIONALITY
function filterProducts(category) {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const productId = parseInt(card.getAttribute('data-product-id'));
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    if (category === 'all') {
      card.style.display = 'block';
    } else {
      // Match category (case-insensitive, partial match)
      const productCategory = product.category.toLowerCase();
      if (productCategory.includes(category.toLowerCase())) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// Initialize filter buttons
function initializeFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get category and filter
      const category = this.getAttribute('data-category');
      filterProducts(category);
    });
  });
}

// Close modal when clicking outside or pressing Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeProductModal();
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Product modal script loaded');
  
  // Initialize products from Firebase
  await initializeProducts();
  
  // Update cart count on load
  updateCartCount();
  
  // Initialize filter buttons
  initializeFilterButtons();
  
  // Add click event listeners to product cards
  const productCards = document.querySelectorAll('.product-card');
  console.log('Found product cards:', productCards.length);
  
  productCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't prevent if clicking the + button directly
      if (e.target.classList.contains('add-cart')) {
        return;
      }
      
      e.preventDefault();
      const productId = parseInt(this.getAttribute('data-product-id'));
      console.log('Card clicked, product ID:', productId);
      
      if (productId) {
        openProductModal(productId);
      }
    });
    
    // Make card cursor pointer
    card.style.cursor = 'pointer';
  });
});
