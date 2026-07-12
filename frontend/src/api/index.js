import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const servicesApi = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const departmentsApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const employeesApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const clientsApi = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const clientServicesApi = {
  getAll: (params) => api.get('/client-services', { params }),
  create: (data) => api.post('/client-services', data),
  update: (id, data) => api.put(`/client-services/${id}`, data),
  delete: (id) => api.delete(`/client-services/${id}`),
};

export const clientProductsApi = {
  getAll: (params) => api.get('/client-products', { params }),
  create: (data) => api.post('/client-products', data),
  update: (id, data) => api.put(`/client-products/${id}`, data),
  delete: (id) => api.delete(`/client-products/${id}`),
};

export const paymentsApi = {
  getAll: (params) => api.get('/payments', { params }),
  getOverdue: () => api.get('/payments/overdue'),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const callLogsApi = {
  getAll: (params) => api.get('/call-logs', { params }),
  create: (data) => api.post('/call-logs', data),
  update: (id, data) => api.put(`/call-logs/${id}`, data),
  delete: (id) => api.delete(`/call-logs/${id}`),
};

export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  exportExcel: (type, params) => api.get('/reports/export-excel', {
    params: { type, ...params }, responseType: 'blob'
  }),
  exportPdf: (type, params) => api.get('/reports/export-pdf', {
    params: { type, ...params }, responseType: 'blob'
  }),
};
