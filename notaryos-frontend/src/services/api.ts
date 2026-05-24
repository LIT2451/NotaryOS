import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('/')
    ? import.meta.env.VITE_API_BASE_URL 
    : `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5202'}/api`,
});

api.interceptors.request.use((config) => {
  // Đọc token từ sessionStorage - tự xóa khi đóng tab
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const login = (data: unknown) => api.post('/auth/login', data);
export const register = (data: unknown) => api.post('/auth/register', data);
export const getInvoices = (params?: { startDate?: string; endDate?: string }) => api.get('/invoices', { params });
export const getStats = (params?: { startDate?: string; endDate?: string }) => api.get('/invoices/stats', { params });
export const createInvoice = (data: FormData) => api.post('/invoices', data);
export const getNextInvoiceNumber = (serviceTypeId: number) => api.get(`/invoices/next-number?serviceTypeId=${serviceTypeId}`);
export const checkInvoiceNumber = (invoiceNumber: string) => api.get(`/invoices/check-number?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);

export const updateInvoice = (id: number, data: FormData) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id: number) => api.delete(`/invoices/${id}`);
export const exportExcel = (params?: { startDate?: string; endDate?: string }) => 
  api.get('/invoices/export', { params, responseType: 'blob' });
export const exportPdf = (params?: { startDate?: string; endDate?: string }) => 
  api.get('/invoices/export-pdf', { params, responseType: 'blob' });
export const getAuditLogs = () => api.get('/auditlogs');
export const getUsers = () => api.get('/users');
export const updateUser = (id: number, data: unknown) => api.put(`/users/${id}`, data);
export const resetPassword = (id: number) => api.put(`/users/${id}/reset-password`);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Service Types Management (Admin)
export const getServiceTypes = () => api.get('/servicetypes');
export const createServiceType = (data: unknown) => api.post('/servicetypes', data);
export const updateServiceType = (id: number, data: unknown) => api.put(`/servicetypes/${id}`, data);
export const deleteServiceType = (id: number) => api.delete(`/servicetypes/${id}`);

export default api;
