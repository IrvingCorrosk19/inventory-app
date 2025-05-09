const API_BASE_URL = 'https://inventory-app-backend-jzkd.onrender.com';

export const API_URLS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
  },
  dashboard: {
    stats: `${API_BASE_URL}/api/dashboard/stats`,
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
  }
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

const fetchProducts = async () => {
  try {
    const res = await fetchWithAuth(API_URLS.products.list);
    const data = await res.json();
    
    const mappedProducts = data.map(product => ({
      ...product,
      category: product.category_name,
      supplier: product.supplier_name
    }));
    
    setProducts(mappedProducts);
  } catch (error) {
    toast.error('Error al obtener productos');
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const url = selectedProduct 
      ? API_URLS.products.update(selectedProduct.id)
      : API_URLS.products.create;
    
    const method = selectedProduct ? 'PUT' : 'POST';
    
    const res = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      toast.success(selectedProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      setOpenDialog(false);
      fetchProducts();
    } else {
      toast.error('Error al guardar el producto');
    }
  } catch (error) {
    toast.error('Error al guardar el producto');
  }
};
