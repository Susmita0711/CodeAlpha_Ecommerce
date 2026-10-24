// BharatKart Authentication Controller

const auth = {
  user: null,

  init() {
    this.bindEvents();
    this.checkSession();
  },

  isLoggedIn() {
    return !!this.user;
  },

  getUser() {
    return this.user;
  },

  async checkSession() {
    const token = api.getToken();
    if (!token) {
      this.updateUI();
      return;
    }

    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        this.user = res.user;
      } else {
        this.logout();
      }
    } catch (err) {
      // Invalid or expired token
      this.logout();
    }
    this.updateUI();
  },

  updateUI() {
    const authBtn = document.getElementById('auth-btn');
    const authBtnText = document.getElementById('auth-btn-text');
    const userDropdown = document.getElementById('user-dropdown-menu');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    const userAvatarInitials = document.getElementById('user-avatar-initials');

    if (this.user) {
      const initials = this.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      authBtnText.textContent = this.user.name.split(' ')[0];
      authBtn.innerHTML = `<i class="fa-solid fa-user-check text-success"></i> <span>${this.user.name.split(' ')[0]}</span>`;
      
      if (dropdownUserName) dropdownUserName.textContent = this.user.name;
      if (dropdownUserEmail) dropdownUserEmail.textContent = this.user.email;
      if (userAvatarInitials) userAvatarInitials.textContent = initials;
    } else {
      authBtn.innerHTML = `<i class="fa-regular fa-user"></i> <span>Sign In</span>`;
      if (userDropdown) userDropdown.classList.remove('show');
    }
  },

  async login(email, password) {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        api.setToken(res.token);
        this.user = res.user;
        this.updateUI();
        this.closeAuthModal();
        app.showToast(`Namaste, ${res.user.name}! Welcome to BharatKart.`, 'success');
        return true;
      }
    } catch (err) {
      const errorEl = document.getElementById('login-error-msg');
      if (errorEl) errorEl.textContent = err.message || 'Login failed. Check credentials.';
      return false;
    }
  },

  async register(name, email, password) {
    try {
      const res = await api.register(name, email, password);
      if (res.success) {
        api.setToken(res.token);
        this.user = res.user;
        this.updateUI();
        this.closeAuthModal();
        app.showToast(`Account created! Welcome to BharatKart, ${res.user.name}.`, 'success');
        return true;
      }
    } catch (err) {
      const errorEl = document.getElementById('register-error-msg');
      if (errorEl) {
        if (err.message && err.message.toLowerCase().includes('already exists')) {
          errorEl.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
              <span>An account with this email already exists!</span>
              <button type="button" class="btn btn-xs btn-primary" onclick="auth.switchToSignInWithEmail('${email}')">
                Sign In Now →
              </button>
            </div>
          `;
        } else {
          errorEl.textContent = err.message || 'Registration failed.';
        }
      }
      return false;
    }
  },

  switchToSignInWithEmail(email) {
    this.switchTab('login');
    const loginEmail = document.getElementById('login-email');
    const loginPass = document.getElementById('login-password');
    if (loginEmail && email) loginEmail.value = email;
    if (loginPass) loginPass.focus();
    app.showToast('Switched to Sign In. Enter your password to log in.', 'info');
  },

  logout() {
    api.setToken(null);
    this.user = null;
    this.updateUI();
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.remove('show');
    app.showToast('You have been logged out.', 'info');
  },

  openAuthModal(defaultTab = 'login') {
    const modal = document.getElementById('auth-modal-overlay');
    if (!modal) return;
    this.switchTab(defaultTab);
    modal.classList.add('active');
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.classList.remove('active');
    // Clear error messages
    const loginErr = document.getElementById('login-error-msg');
    const regErr = document.getElementById('register-error-msg');
    if (loginErr) loginErr.textContent = '';
    if (regErr) regErr.textContent = '';
  },

  switchTab(tab) {
    const loginTabBtn = document.getElementById('tab-login-btn');
    const regTabBtn = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (tab === 'login') {
      loginTabBtn.classList.add('active');
      regTabBtn.classList.remove('active');
      loginForm.classList.add('active');
      regForm.classList.remove('active');
    } else {
      regTabBtn.classList.add('active');
      loginTabBtn.classList.remove('active');
      regForm.classList.add('active');
      loginForm.classList.remove('active');
    }
  },

  bindEvents() {
    const authBtn = document.getElementById('auth-btn');
    const userDropdown = document.getElementById('user-dropdown-menu');
    const closeBtn = document.getElementById('close-auth-modal');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegBtn = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('dropdown-logout-btn');
    const demoFillBtn = document.getElementById('fill-demo-credentials-btn');
    const quickDemoBtn = document.getElementById('quick-demo-login-btn');

    // Auth button click: if logged in, toggle dropdown; else open modal
    authBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isLoggedIn()) {
        userDropdown?.classList.toggle('show');
      } else {
        this.openAuthModal('login');
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#auth-wrapper')) {
        userDropdown?.classList.remove('show');
      }
    });

    closeBtn?.addEventListener('click', () => this.closeAuthModal());

    // Switch tabs
    tabLoginBtn?.addEventListener('click', () => this.switchTab('login'));
    tabRegBtn?.addEventListener('click', () => this.switchTab('register'));

    // Submit forms
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      await this.login(email, pass);
    });

    regForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const pass = document.getElementById('register-password').value;
      await this.register(name, email, pass);
    });

    logoutBtn?.addEventListener('click', () => {
      this.logout();
    });

    // Demo user autofill (Rahul Sharma)
    demoFillBtn?.addEventListener('click', () => {
      document.getElementById('login-email').value = 'rahul@codealpha.in';
      document.getElementById('login-password').value = 'password123';
      app.showToast('Rahul Sharma demo credentials filled!', 'info');
    });

    // Quick demo 1-click login from hero
    quickDemoBtn?.addEventListener('click', async () => {
      if (this.isLoggedIn()) {
        app.showToast(`Already logged in as ${this.user.name}`, 'info');
      } else {
        await this.login('rahul@codealpha.in', 'password123');
      }
    });
  }
};
