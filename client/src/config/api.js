const API_BASE_URL = 'https://inventory-app-backend-jzkd.onrender.com';

export const API_URLS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
  },
  dashboard: {
    stats: `${API_BASE_URL}/api/dashboard`,
  },
  products: {
    list: `${API_BASE_URL}/api/products`,
    create: `${API_BASE_URL}/api/products`,
    update: (id) => `${API_BASE_URL}/api/products/${id}`,
    delete: (id) => `${API_BASE_URL}/api/products/${id}`,
  },
  categories: {
    list: `${API_BASE_URL}/api/categories`,
    create: `${API_BASE_URL}/api/categories`,
    update: (id) => `${API_BASE_URL}/api/categories/${id}`,
    delete: (id) => `${API_BASE_URL}/api/categories/${id}`,
  },
  suppliers: {
    list: `${API_BASE_URL}/api/suppliers`,
    create: `${API_BASE_URL}/api/suppliers`,
    update: (id) => `${API_BASE_URL}/api/suppliers/${id}`,
    delete: (id) => `${API_BASE_URL}/api/suppliers/${id}`,
  },
  inventory: {
    list: `${API_BASE_URL}/api/inventory`,
    update: (id) => `${API_BASE_URL}/api/inventory/${id}`,
  },
  users: {
    list: `${API_BASE_URL}/api/users`,
  },
  barcode: {
    products: `${API_BASE_URL}/api/barcode/products`,
  },
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  return response;
};
