const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URLS = {
  auth: {
    login: ${API_BASE_URL}/api/auth/login,
  },
  dashboard: {
    stats: ${API_BASE_URL}/api/dashboard/stats,
  },
  products: {
    list: ${API_BASE_URL}/api/products,
    create: ${API_BASE_URL}/api/products,
    update: (id) => ${API_BASE_URL}/api/products/,
    delete: (id) => ${API_BASE_URL}/api/products/,
  },
  categories: {
    list: ${API_BASE_URL}/api/categories,
    create: ${API_BASE_URL}/api/categories,
    update: (id) => ${API_BASE_URL}/api/categories/,
    delete: (id) => ${API_BASE_URL}/api/categories/,
  },
  suppliers: {
    list: ${API_BASE_URL}/api/suppliers,
    create: ${API_BASE_URL}/api/suppliers,
    update: (id) => ${API_BASE_URL}/api/suppliers/,
    delete: (id) => ${API_BASE_URL}/api/suppliers/,
  },
  inventory: {
    list: ${API_BASE_URL}/api/inventory,
    update: (id) => ${API_BASE_URL}/api/inventory/,
  }
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': Bearer  } : {}),
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
