const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('vm_session_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de comunicacion' }));
    if (response.status === 401) {
      localStorage.removeItem('vm_session_token');
      localStorage.removeItem('vm_session_user');
      window.dispatchEvent(new Event('vm-auth-expired'));
    }
    throw new Error(error.message || 'Error de comunicacion');
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  dashboard: () => request('/dashboard'),
  products: () => request('/products'),
  createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  clients: () => request('/clients'),
  createClient: (payload) => request('/clients', { method: 'POST', body: JSON.stringify(payload) }),
  updateClient: (id, payload) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),
  sales: () => request('/sales'),
  createSale: (payload) => request('/sales', { method: 'POST', body: JSON.stringify(payload) }),
  deleteSale: (id) => request(`/sales/${id}`, { method: 'DELETE' }),
  orders: () => request('/orders'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  users: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  suggestions: () => request('/external/suggestions')
};
