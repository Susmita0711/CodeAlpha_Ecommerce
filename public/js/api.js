// NovaStore API Service Layer

const API_BASE = '/api';

const api = {
  // Get Auth Token from local storage
  getToken() {
    return localStorage.getItem('novastore_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('novastore_token', token);
    } else {
      localStorage.removeItem('novastore_token');
    }
  },

  // Base request handler
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);

    const qs = query.toString();
    return this.request(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProductById(id) {
    return this.request(`/products/${id}`);
  },

  async getCategories() {
    return this.request('/products/categories');
  },

  // Authentication
  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getProfile() {
    return this.request('/auth/me');
  },

  // Orders
  async createOrder(orderPayload) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  async getUserOrders() {
    return this.request('/orders/my-orders');
  },

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }
};
