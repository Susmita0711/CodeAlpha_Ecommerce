// BharatKart Main Application Logic (Indian E-Commerce)

const app = {
  products: [],
  categories: [],
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  currentViewingProduct: null,
  searchDebounceTimer: null,

  async init() {
    console.log('Initializing BharatKart App...');
    auth.init();
    cart.init();
    this.bindEvents();
    await this.loadCategories();
    await this.loadProducts();
  },

  formatINR(val) {
    return '₹' + Math.round(val || 0).toLocaleString('en-IN');
  },

  // ================= Load Data =================
  async loadCategories() {
    try {
      const res = await api.getCategories();
      if (res.success) {
        this.categories = res.categories;
        this.renderCategoryPills(res.totalProducts);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  },

  async loadProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-products-state');

    try {
      if (grid) {
        grid.innerHTML = `
          <div class="grid-loader">
            <div class="spinner"></div>
            <p>Fetching deals from Indian catalog...</p>
          </div>
        `;
      }

      const res = await api.getProducts({
        category: this.selectedCategory,
        search: this.searchQuery,
        sort: this.sortBy
      });

      if (res.success) {
        this.products = res.products;
        this.renderProducts();
        this.updateStatusBar();
      }
    } catch (err) {
      if (grid) {
        grid.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-triangle-exclamation empty-icon text-danger"></i>
            <h3>Failed to load products</h3>
            <p>${err.message || 'Make sure the Express server is running.'}</p>
            <button class="btn btn-primary" onclick="app.loadProducts()">Try Again</button>
          </div>
        `;
      }
    }
  },

  // ================= Render Views =================
  renderCategoryPills(totalProducts = 0) {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    let html = `
      <button class="category-pill ${this.selectedCategory === 'all' ? 'active' : ''}" data-category="all">
        <i class="fa-solid fa-border-all"></i> All Products
        <span class="pill-count">${totalProducts}</span>
      </button>
    `;

    this.categories.forEach(cat => {
      const iconClass = this.getCategoryIcon(cat.icon);
      html += `
        <button class="category-pill ${this.selectedCategory === cat.slug ? 'active' : ''}" data-category="${cat.slug}">
          <i class="${iconClass}"></i> ${cat.name}
          <span class="pill-count">${cat.product_count || 0}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    // Attach listeners
    container.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        this.setCategory(cat);
      });
    });
  },

  getCategoryIcon(iconName) {
    switch (iconName) {
      case 'cpu': return 'fa-solid fa-microchip';
      case 'headphones': return 'fa-solid fa-headphones';
      case 'watch': return 'fa-solid fa-clock';
      case 'briefcase': return 'fa-solid fa-briefcase';
      case 'home': return 'fa-solid fa-mug-hot';
      default: return 'fa-solid fa-tag';
    }
  },

  renderProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-products-state');

    if (!grid) return;

    if (this.products.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = this.products.map(p => {
      let badgeClass = 'editor';
      if (p.badge) {
        const b = p.badge.toLowerCase();
        if (b.includes('diwali') || b.includes('sale') || b.includes('deal')) badgeClass = 'sale';
        else if (b.includes('trending') || b.includes('popular')) badgeClass = 'popular';
        else if (b.includes('made in india')) badgeClass = 'desi';
      }

      const badgeHtml = p.badge ? `<span class="card-badge ${badgeClass}">${p.badge}</span>` : '';
      
      let discountBadgeHtml = '';
      if (p.original_price && p.original_price > p.price) {
        const discountPct = Math.round(((p.original_price - p.price) / p.original_price) * 100);
        discountBadgeHtml = `<span class="discount-pill">${discountPct}% OFF</span>`;
      }

      const originalPriceHtml = p.original_price ? `<span class="original-price">${this.formatINR(p.original_price)}</span>` : '';
      const starsHtml = this.renderStars(p.rating);

      return `
        <article class="product-card" data-id="${p.id}">
          <div class="card-img-wrap" onclick="app.openProductModal(${p.id})">
            ${badgeHtml}
            <img src="${p.image_url}" alt="${p.name}" class="card-img" loading="lazy">
            <button class="quick-view-btn" onclick="event.stopPropagation(); app.openProductModal(${p.id})">
              <i class="fa-regular fa-eye"></i> Quick View
            </button>
          </div>
          <div class="card-body">
            <span class="card-category">${p.category_name || 'Electronics'}</span>
            <h4 class="card-title" onclick="app.openProductModal(${p.id})">${p.name}</h4>
            <div class="card-rating">
              <div class="stars">${starsHtml}</div>
              <span class="rating-count">(${p.reviews_count.toLocaleString('en-IN')})</span>
            </div>
            <div class="card-pricing">
              <span class="current-price">${this.formatINR(p.price)}</span>
              ${originalPriceHtml}
              ${discountBadgeHtml}
            </div>
            <div class="card-actions">
              <button class="card-add-btn" onclick="app.handleAddToCart(${p.id})">
                <i class="fa-solid fa-cart-plus"></i> Add to Bag
              </button>
              <button class="card-view-btn" onclick="app.openProductModal(${p.id})" title="Details">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  renderStars(rating = 4.5) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalf) {
      stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
  },

  updateStatusBar() {
    const countText = document.getElementById('results-count-text');
    const tagsContainer = document.getElementById('active-filter-tags');

    if (countText) {
      countText.textContent = `Showing ${this.products.length} product${this.products.length === 1 ? '' : 's'}`;
    }

    if (tagsContainer) {
      let tags = '';
      if (this.selectedCategory !== 'all') {
        const cat = this.categories.find(c => c.slug === this.selectedCategory);
        tags += `
          <span class="filter-tag">
            Category: ${cat ? cat.name : this.selectedCategory}
            <i class="fa-solid fa-xmark" onclick="app.setCategory('all')"></i>
          </span>
        `;
      }
      if (this.searchQuery) {
        tags += `
          <span class="filter-tag">
            Search: "${this.searchQuery}"
            <i class="fa-solid fa-xmark" onclick="app.clearSearch()"></i>
          </span>
        `;
      }
      tagsContainer.innerHTML = tags;
    }
  },

  // ================= Filter & Sort Actions =================
  setCategory(categorySlug) {
    this.selectedCategory = categorySlug;
    this.loadProducts();
    // Update active pill UI
    document.querySelectorAll('.category-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === categorySlug);
    });
  },

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('global-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    if (input) input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    this.loadProducts();
  },

  handleAddToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      cart.addItem(product, 1);
    }
  },

  // ================= Product Details Modal =================
  async openProductModal(productId) {
    const modal = document.getElementById('product-modal-overlay');
    const body = document.getElementById('product-modal-body');
    if (!modal || !body) return;

    try {
      body.innerHTML = `
        <div class="grid-loader">
          <div class="spinner"></div>
          <p>Loading product details...</p>
        </div>
      `;
      modal.classList.add('active');

      const res = await api.getProductById(productId);
      if (!res.success || !res.product) {
        throw new Error('Product not found');
      }

      const p = res.product;
      this.currentViewingProduct = p;

      const badgeHtml = p.badge ? `<span class="card-badge sale">${p.badge}</span>` : '';
      const originalPriceHtml = p.original_price ? `<span class="modal-original-price">${this.formatINR(p.original_price)}</span>` : '';
      const starsHtml = this.renderStars(p.rating);
      const isLowStock = p.stock <= 5;
      const stockBadge = `
        <span class="modal-stock-badge ${isLowStock ? 'low-stock' : 'in-stock'}">
          <i class="fa-solid ${isLowStock ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
          ${isLowStock ? `Hurry! Only ${p.stock} left in stock!` : `In Stock (${p.stock} units in warehouse)`}
        </span>
      `;

      // Render specs table rows
      let specsRows = '';
      if (p.specs && typeof p.specs === 'object') {
        specsRows = Object.entries(p.specs).map(([key, val]) => `
          <tr>
            <td>${key}</td>
            <td>${val}</td>
          </tr>
        `).join('');
      }

      body.innerHTML = `
        <div class="product-detail-layout">
          <div class="modal-img-container">
            <img src="${p.image_url}" alt="${p.name}" class="modal-product-img">
          </div>
          <div class="modal-details-col">
            <div class="modal-badge-row">
              <span class="modal-category">${p.category_name || 'Electronics'}</span>
              ${badgeHtml}
            </div>
            <h2 class="modal-title">${p.name}</h2>
            <div class="modal-rating-row">
              <div class="stars">${starsHtml}</div>
              <span class="rating-text"><strong>${p.rating}</strong> (${p.reviews_count.toLocaleString('en-IN')} verified customer reviews)</span>
            </div>

            <div class="modal-price-box">
              <span class="modal-price">${this.formatINR(p.price)}</span>
              ${originalPriceHtml}
              ${stockBadge}
            </div>

            <p class="modal-desc">${p.description}</p>

            ${specsRows ? `
              <div class="specs-section">
                <h4><i class="fa-solid fa-list-check"></i> Specifications & Warranty</h4>
                <table class="specs-table">
                  <tbody>${specsRows}</tbody>
                </table>
              </div>
            ` : ''}

            <div class="delivery-pincode-check">
              <i class="fa-solid fa-location-dot text-accent"></i>
              <span>Delivery available across all Indian PIN codes • COD Available</span>
            </div>

            <div class="purchase-controls" style="margin-top: 1.25rem;">
              <div class="qty-picker">
                <button type="button" class="qty-btn" id="modal-qty-minus">-</button>
                <input type="number" class="qty-input" id="modal-qty-input" value="1" min="1" max="${p.stock}">
                <button type="button" class="qty-btn" id="modal-qty-plus">+</button>
              </div>
              <button class="btn btn-primary btn-lg" id="modal-add-cart-btn" style="flex: 1;">
                <i class="fa-solid fa-cart-plus"></i> Add to Bag
              </button>
              <button class="btn btn-success btn-lg" id="modal-buy-now-btn">
                <i class="fa-solid fa-bolt"></i> Instant Buy
              </button>
            </div>
          </div>
        </div>
      `;

      // Bind dynamic quantity controls inside modal
      const qtyInput = document.getElementById('modal-qty-input');
      const minusBtn = document.getElementById('modal-qty-minus');
      const plusBtn = document.getElementById('modal-qty-plus');
      const addCartBtn = document.getElementById('modal-add-cart-btn');
      const buyNowBtn = document.getElementById('modal-buy-now-btn');

      minusBtn?.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });

      plusBtn?.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val < p.stock) qtyInput.value = val + 1;
      });

      addCartBtn?.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        cart.addItem(p, qty);
      });

      buyNowBtn?.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        cart.addItem(p, qty);
        this.closeProductModal();
        this.openCheckout();
      });

    } catch (err) {
      body.innerHTML = `<div class="empty-state"><h3>Unable to display product</h3><p>${err.message}</p></div>`;
    }
  },

  closeProductModal() {
    const modal = document.getElementById('product-modal-overlay');
    if (modal) modal.classList.remove('active');
    this.currentViewingProduct = null;
  },

  // ================= Checkout & Order Processing =================
  openCheckout() {
    if (cart.items.length === 0) {
      this.showToast('Your bag is empty. Please add items before placing order.', 'warning');
      return;
    }

    const modal = document.getElementById('checkout-modal-overlay');
    if (!modal) return;

    // Reset steps to step 1
    this.goToCheckoutStep(1);

    // Pre-fill user information if logged in
    const user = auth.getUser();
    if (user) {
      const nameInput = document.getElementById('checkout-name');
      const emailInput = document.getElementById('checkout-email');
      if (nameInput && !nameInput.value) nameInput.value = user.name;
      if (emailInput && !emailInput.value) emailInput.value = user.email;
    }

    cart.updateUI();
    modal.classList.add('active');
  },

  closeCheckout() {
    const modal = document.getElementById('checkout-modal-overlay');
    if (modal) modal.classList.remove('active');
  },

  goToCheckoutStep(step) {
    const pane1 = document.getElementById('checkout-step-1');
    const pane2 = document.getElementById('checkout-step-2');
    const pane3 = document.getElementById('checkout-step-3');

    const dot1 = document.getElementById('step-dot-1');
    const dot2 = document.getElementById('step-dot-2');
    const dot3 = document.getElementById('step-dot-3');

    pane1?.classList.toggle('active', step === 1);
    pane2?.classList.toggle('active', step === 2);
    pane3?.classList.toggle('active', step === 3);

    dot1?.classList.toggle('active', step >= 1);
    dot2?.classList.toggle('active', step >= 2);
    dot3?.classList.toggle('active', step >= 3);
  },

  async handleProcessOrder(e) {
    e.preventDefault();

    const name = document.getElementById('checkout-name').value;
    const email = document.getElementById('checkout-email').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const city = document.getElementById('checkout-city').value;
    const zip = document.getElementById('checkout-zip').value;

    const paymentOption = document.querySelector('input[name="payment_method"]:checked');
    const paymentMethod = paymentOption ? paymentOption.value : 'UPI (Google Pay / PhonePe)';

    const orderPayload = {
      items: cart.items.map(i => ({ productId: i.id, quantity: i.quantity })),
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      city,
      postalCode: zip,
      paymentMethod,
      discountCode: cart.couponCode
    };

    const submitBtn = document.getElementById('btn-place-order');
    const btnText = document.getElementById('btn-place-order-text');

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Processing Payment & Order...';

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        // Order processed successfully!
        this.renderOrderReceipt(res.order);
        this.goToCheckoutStep(3);
        cart.clearCart();
        this.showToast('Order confirmed! Receipt generated.', 'success');
        // Refresh catalog to reflect updated inventory
        this.loadProducts();
      }
    } catch (err) {
      this.showToast(err.message || 'Error processing order. Please try again.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Pay & Place Order';
    }
  },

  renderOrderReceipt(order) {
    const card = document.getElementById('order-receipt-card');
    if (!card) return;

    const itemsHtml = order.items.map(item => `
      <div class="receipt-item-row">
        <span>${item.quantity}x ${item.product_name}</span>
        <strong>${this.formatINR(item.price * item.quantity)}</strong>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="receipt-header">
        <div>
          <div class="receipt-num">${order.orderNumber}</div>
          <small class="text-muted"><i class="fa-solid fa-truck"></i> Express Delivery: 1 - 3 Business Days Across India</small>
        </div>
        <span class="order-badge-status processing">Confirmed</span>
      </div>

      <div class="receipt-items-list">
        ${itemsHtml}
      </div>

      <div class="summary-divider"></div>

      <div class="recap-row">
        <span>Payment Method:</span>
        <strong>${order.paymentMethod}</strong>
      </div>
      <div class="recap-row">
        <span>Customer:</span>
        <strong>${order.customerName} (${order.customerPhone || order.customerEmail})</strong>
      </div>
      <div class="recap-row">
        <span>Delivery Address:</span>
        <span>${order.shippingAddress || ''}, ${order.city || ''} - ${order.postalCode || ''}</span>
      </div>
      <div class="recap-row recap-total">
        <span>Total Paid (Incl. GST):</span>
        <span class="highlight-total">${this.formatINR(order.totalAmount)}</span>
      </div>
    `;
  },

  // ================= My Orders Modal =================
  async openMyOrdersModal() {
    if (!auth.isLoggedIn()) {
      auth.openAuthModal('login');
      this.showToast('Please log in to view your orders.', 'info');
      return;
    }

    const modal = document.getElementById('orders-modal-overlay');
    const container = document.getElementById('orders-list-container');
    if (!modal || !container) return;

    try {
      container.innerHTML = `
        <div class="grid-loader">
          <div class="spinner"></div>
          <p>Fetching your order history...</p>
        </div>
      `;
      modal.classList.add('active');

      const res = await api.getUserOrders();
      if (res.success) {
        if (!res.orders || res.orders.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <i class="fa-solid fa-box-open empty-icon"></i>
              <h4>No orders placed yet</h4>
              <p>You haven't made any purchases yet. Your completed orders will appear here.</p>
              <button class="btn btn-primary" onclick="app.closeMyOrdersModal()">Start Shopping</button>
            </div>
          `;
          return;
        }

        container.innerHTML = res.orders.map(order => {
          const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const statusClass = (order.status || 'processing').toLowerCase();

          const itemsHtml = order.items.map(item => `
            <div class="order-subitem">
              <img src="${item.image_url || 'https://via.placeholder.com/40'}" alt="${item.product_name}">
              <div>
                <strong>${item.product_name}</strong>
                <div class="text-muted">${item.quantity} x ${this.formatINR(item.price)}</div>
              </div>
            </div>
          `).join('');

          return `
            <div class="order-history-card">
              <div class="order-card-top">
                <div>
                  <span class="order-num-tag">${order.order_number}</span>
                  <div class="text-muted" style="font-size: 0.775rem;">Placed on ${dateStr}</div>
                </div>
                <span class="order-badge-status ${statusClass}">${order.status}</span>
              </div>
              <div class="order-items-grid">
                ${itemsHtml}
              </div>
              <div class="summary-line" style="margin-top: 0.5rem; font-weight: 700;">
                <span>Total Amount Paid:</span>
                <span class="text-accent" style="font-size: 1.1rem;">${this.formatINR(order.total_amount)}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><h3>Failed to load orders</h3><p>${err.message}</p></div>`;
    }
  },

  closeMyOrdersModal() {
    const modal = document.getElementById('orders-modal-overlay');
    if (modal) modal.classList.remove('active');
  },

  // ================= Toast System =================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ================= Event Listeners =================
  bindEvents() {
    // 1. Search Input Debounced
    const searchInput = document.getElementById('global-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    searchInput?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (clearSearchBtn) clearSearchBtn.style.display = val ? 'block' : 'none';

      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        this.searchQuery = val.trim();
        this.loadProducts();
      }, 350);
    });

    clearSearchBtn?.addEventListener('click', () => this.clearSearch());

    // 2. Sort Dropdown
    const sortSelect = document.getElementById('sort-select');
    sortSelect?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.loadProducts();
    });

    // 3. Reset filters button in empty state
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    resetFiltersBtn?.addEventListener('click', () => {
      this.selectedCategory = 'all';
      this.searchQuery = '';
      const input = document.getElementById('global-search-input');
      if (input) input.value = '';
      this.loadProducts();
    });

    // 4. Close Product Modal
    const closeProdBtn = document.getElementById('close-product-modal');
    closeProdBtn?.addEventListener('click', () => this.closeProductModal());

    // 5. Checkout Navigation
    const nextToPaymentBtn = document.getElementById('btn-next-to-payment');
    const backToShippingBtn = document.getElementById('btn-back-to-shipping');
    const backToCartBtn = document.getElementById('back-to-cart-from-checkout');
    const closeCheckoutBtn = document.getElementById('close-checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const viewMyOrdersAfter = document.getElementById('view-my-orders-after-order');

    nextToPaymentBtn?.addEventListener('click', () => {
      const name = document.getElementById('checkout-name');
      const email = document.getElementById('checkout-email');
      const address = document.getElementById('checkout-address');
      const city = document.getElementById('checkout-city');
      const zip = document.getElementById('checkout-zip');

      if (!name.value || !email.value || !address.value || !city.value || !zip.value) {
        this.showToast('Please fill in all required delivery fields.', 'warning');
        return;
      }
      this.goToCheckoutStep(2);
    });

    backToShippingBtn?.addEventListener('click', () => this.goToCheckoutStep(1));

    backToCartBtn?.addEventListener('click', () => {
      this.closeCheckout();
      cart.openDrawer();
    });

    closeCheckoutBtn?.addEventListener('click', () => this.closeCheckout());

    checkoutForm?.addEventListener('submit', (e) => this.handleProcessOrder(e));

    continueShoppingBtn?.addEventListener('click', () => {
      this.closeCheckout();
      const catalog = document.getElementById('catalog-section');
      if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
    });

    viewMyOrdersAfter?.addEventListener('click', () => {
      this.closeCheckout();
      this.openMyOrdersModal();
    });

    // Payment options selection visual toggle (UPI vs Card vs Netbanking vs COD)
    document.querySelectorAll('.payment-card-option input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-card-option').forEach(card => card.classList.remove('selected'));
        radio.closest('.payment-card-option').classList.add('selected');

        const upiBox = document.getElementById('upi-details-box');
        const cardBox = document.getElementById('card-details-box');

        if (radio.value.includes('UPI')) {
          if (upiBox) upiBox.style.display = 'block';
          if (cardBox) cardBox.style.display = 'none';
        } else if (radio.value.includes('Card') || radio.value.includes('RuPay')) {
          if (upiBox) upiBox.style.display = 'none';
          if (cardBox) cardBox.style.display = 'block';
        } else {
          if (upiBox) upiBox.style.display = 'none';
          if (cardBox) cardBox.style.display = 'none';
        }
      });
    });

    // 6. My Orders Buttons
    const myOrdersQuickBtn = document.getElementById('my-orders-quick-btn');
    const dropdownOrdersBtn = document.getElementById('dropdown-my-orders-btn');
    const closeOrdersBtn = document.getElementById('close-orders-modal');

    myOrdersQuickBtn?.addEventListener('click', () => this.openMyOrdersModal());
    dropdownOrdersBtn?.addEventListener('click', () => this.openMyOrdersModal());
    closeOrdersBtn?.addEventListener('click', () => this.closeMyOrdersModal());

    // 7. Close Modals on Overlay Click or Esc
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        cart.closeDrawer();
      }
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
