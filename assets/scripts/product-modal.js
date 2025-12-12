/* ============================================
   PRODUCT MODAL JAVASCRIPT
   ============================================ */

// Product database
const products = [
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
  }
];

// Current modal state
let currentModalProduct = null;
let modalQuantity = 1;

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
  
  // Set gradient background
  const imageSection = document.querySelector('.modal-image-section');
  if (imageSection) {
    imageSection.style.background = product.gradient;
  }
  
  // Update image
  if (modalImage) modalImage.textContent = product.image;
  
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
  if (modalCalories) modalCalories.textContent = `${product.calories} cal`;
  if (modalDescription) modalDescription.textContent = product.description;
  
  // Update rating
  const ratingDiv = document.querySelector('.modal-rating');
  if (ratingDiv) {
    ratingDiv.innerHTML = `
      <span class="modal-liked">${product.liked}</span>
      <span class="modal-thumbs">👍 ${product.rating}</span>
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
      image: currentModalProduct.image
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

// Close modal when clicking outside or pressing Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeProductModal();
  }
});

// Initialize modal on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Product modal script loaded');
  
  // Update cart count on load
  updateCartCount();
  
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
    
    // Also make card cursor pointer
    card.style.cursor = 'pointer';
  });
});