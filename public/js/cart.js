// BharatKart Shopping Cart Controller (Indian E-Commerce)

const cart = {
  items: [],
  couponCode: '',
  discountPercent: 0,
  flatDiscount: 0,

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.updateUI();
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('bharatkart_cart');
      this.items = stored ? JSON.parse(stored) : [];
      const storedCoupon = localStorage.getItem('bharatkart_coupon');
      if (storedCoupon) {
        this.applyCoupon(storedCoupon, false);
      }
    } catch (e) {
      this.items = [];
    }
  },

  saveToStorage() {
    localStorage.setItem('bharatkart_cart', JSON.stringify(this.items));
    if (this.couponCode) {
      localStorage.setItem('bharatkart_coupon', this.couponCode);
    } else {
      localStorage.removeItem('bharatkart_coupon');
    }
  },

  formatINR(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  },

  addItem(product, quantity = 1) {
    const qty = parseInt(quantity, 10) || 1;
    const existingIndex = this.items.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      const newQty = this.items[existingIndex].quantity + qty;
      const maxStock = product.stock || 99;
      if (newQty > maxStock) {
        this.items[existingIndex].quantity = maxStock;
        app.showToast(`Max available stock (${maxStock}) reached for this item.`, 'warning');
      } else {
        this.items[existingIndex].quantity = newQty;
      }
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        quantity: Math.min(qty, product.stock || 99)
      });
    }

    this.saveToStorage();
    this.updateUI();
    app.showToast(`"${product.name}" added to shopping bag!`, 'success');
  },

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }

    if (item.stock && newQty > item.stock) {
      app.showToast(`Only ${item.stock} units left in stock.`, 'warning');
      return;
    }

    item.quantity = newQty;
    this.saveToStorage();
    this.updateUI();
  },

  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.saveToStorage();
    this.updateUI();
    app.showToast('Item removed from cart.', 'info');
  },

  clearCart() {
    this.items = [];
    this.couponCode = '';
    this.discountPercent = 0;
    this.flatDiscount = 0;
    this.saveToStorage();
    this.updateUI();
  },

  applyCoupon(code, notify = true) {
    const cleanCode = (code || '').trim().toUpperCase();
    const feedbackEl = document.getElementById('promo-feedback');

    if (!cleanCode) {
      this.couponCode = '';
      this.discountPercent = 0;
      this.flatDiscount = 0;
      if (feedbackEl) feedbackEl.innerHTML = '';
      this.saveToStorage();
      this.updateUI();
      return;
    }

    if (cleanCode === 'DIWALI20') {
      this.couponCode = cleanCode;
      this.discountPercent = 0.20;
      this.flatDiscount = 0;
      if (feedbackEl) feedbackEl.innerHTML = `<span class="text-success">✓ 🪔 20% Festive Diwali Discount Applied!</span>`;
      if (notify) app.showToast('Coupon DIWALI20 applied (-20%)', 'success');
    } else if (cleanCode === 'CODEALPHA10') {
      this.couponCode = cleanCode;
      this.discountPercent = 0.10;
      this.flatDiscount = 0;
      if (feedbackEl) feedbackEl.innerHTML = `<span class="text-success">✓ 10% CodeAlpha Discount Applied!</span>`;
      if (notify) app.showToast('Coupon CODEALPHA10 applied (-10%)', 'success');
    } else if (cleanCode === 'DESI100') {
      this.couponCode = cleanCode;
      this.discountPercent = 0;
      this.flatDiscount = 100;
      if (feedbackEl) feedbackEl.innerHTML = `<span class="text-success">✓ Flat ₹100 Off Applied!</span>`;
      if (notify) app.showToast('Coupon DESI100 applied (-₹100)', 'success');
    } else {
      if (feedbackEl) feedbackEl.innerHTML = `<span class="text-danger">Invalid coupon code</span>`;
      if (notify) app.showToast('Invalid coupon code', 'error');
      return;
    }

    this.saveToStorage();
    this.updateUI();
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getDiscount() {
    const subtotal = this.getSubtotal();
    let disc = subtotal * this.discountPercent;
    if (this.flatDiscount > 0) {
      disc += Math.min(this.flatDiscount, subtotal);
    }
    return Math.round(disc);
  },

  getShipping() {
    const net = this.getSubtotal() - this.getDiscount();
    if (net === 0 || net >= 999) return 0;
    return 49;
  },

  getTotal() {
    const total = this.getSubtotal() - this.getDiscount() + this.getShipping();
    return Math.max(0, total);
  },

  getItemsCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  openDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.classList.add('active');
  },

  closeDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  updateUI() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const shipping = this.getShipping();
    const total = this.getTotal();
    const totalCount = this.getItemsCount();

    // 1. Header Badges
    const badgeCount = document.getElementById('cart-badge-count');
    const headerTotal = document.getElementById('header-cart-total');
    if (badgeCount) badgeCount.textContent = totalCount;
    if (headerTotal) headerTotal.textContent = this.formatINR(total);

    // 2. Drawer Count Badge
    const drawerCount = document.getElementById('drawer-items-count');
    if (drawerCount) drawerCount.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;

    // 3. Free Delivery progress (₹999 target)
    const threshold = 999;
    const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));
    const fillEl = document.getElementById('shipping-progress-fill');
    const textEl = document.getElementById('shipping-progress-text');
    if (fillEl) fillEl.style.width = `${progressPercent}%`;

    if (textEl) {
      if (subtotal >= threshold) {
        textEl.innerHTML = `<span class="text-success"><i class="fa-solid fa-circle-check"></i> Congratulations! You unlocked <strong>FREE Delivery across India!</strong></span>`;
      } else {
        const remaining = this.formatINR(threshold - subtotal);
        textEl.innerHTML = `Add <strong>${remaining}</strong> more for <strong>FREE Delivery!</strong>`;
      }
    }

    // 4. Cart List or Empty View
    const container = document.getElementById('cart-items-container');
    const emptyView = document.getElementById('cart-empty-view');
    const cartFooter = document.getElementById('cart-footer');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyView) emptyView.style.display = 'flex';
      if (cartFooter) cartFooter.style.display = 'none';
    } else {
      if (emptyView) emptyView.style.display = 'none';
      if (cartFooter) cartFooter.style.display = 'flex';

      container.innerHTML = this.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-price">${this.formatINR(item.price)}</div>
            <div class="cart-item-controls">
              <div class="item-qty-widget">
                <button type="button" onclick="cart.updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button type="button" onclick="cart.updateQuantity(${item.id}, 1)">+</button>
              </div>
              <button type="button" class="cart-item-remove" onclick="cart.removeItem(${item.id})" title="Remove item">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // 5. Drawer Summary Lines
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const discountEl = document.getElementById('cart-discount-val');
    const discountLine = document.getElementById('discount-summary-line');
    const shippingEl = document.getElementById('cart-shipping-val');
    const totalEl = document.getElementById('cart-total-val');

    if (subtotalEl) subtotalEl.textContent = this.formatINR(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : this.formatINR(shipping);
    if (totalEl) totalEl.textContent = this.formatINR(total);

    if (discount > 0 && discountLine && discountEl) {
      discountLine.style.display = 'flex';
      discountEl.textContent = `-${this.formatINR(discount)}`;
    } else if (discountLine) {
      discountLine.style.display = 'none';
    }

    // 6. Checkout recap update (if open)
    const checkSubtotal = document.getElementById('checkout-subtotal-val');
    const checkDiscountRow = document.getElementById('checkout-discount-row');
    const checkDiscountVal = document.getElementById('checkout-discount-val');
    const checkShipping = document.getElementById('checkout-shipping-val');
    const checkTotal = document.getElementById('checkout-total-val');

    if (checkSubtotal) checkSubtotal.textContent = this.formatINR(subtotal);
    if (checkShipping) checkShipping.textContent = shipping === 0 ? 'FREE' : this.formatINR(shipping);
    if (checkTotal) checkTotal.textContent = this.formatINR(total);

    if (discount > 0 && checkDiscountRow && checkDiscountVal) {
      checkDiscountRow.style.display = 'flex';
      checkDiscountVal.textContent = `-${this.formatINR(discount)}`;
    } else if (checkDiscountRow) {
      checkDiscountRow.style.display = 'none';
    }
  },

  bindEvents() {
    const headerCartBtn = document.getElementById('header-cart-btn');
    const closeDrawerBtn = document.getElementById('close-cart-drawer');
    const drawerOverlay = document.getElementById('cart-drawer-overlay');
    const startShoppingBtn = document.getElementById('cart-start-shopping-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    const promoInput = document.getElementById('promo-code-input');
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');

    headerCartBtn?.addEventListener('click', () => this.openDrawer());
    closeDrawerBtn?.addEventListener('click', () => this.closeDrawer());

    drawerOverlay?.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) this.closeDrawer();
    });

    startShoppingBtn?.addEventListener('click', () => {
      this.closeDrawer();
      const catalog = document.getElementById('catalog-section');
      if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
    });

    clearCartBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to empty your shopping cart?')) {
        this.clearCart();
      }
    });

    applyPromoBtn?.addEventListener('click', () => {
      if (promoInput) this.applyCoupon(promoInput.value);
    });

    promoInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.applyCoupon(promoInput.value);
      }
    });

    proceedCheckoutBtn?.addEventListener('click', () => {
      this.closeDrawer();
      app.openCheckout();
    });
  }
};
