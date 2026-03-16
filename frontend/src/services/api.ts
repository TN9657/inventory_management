import axios from 'axios';
import { Supplier, Material, MaterialName, MaterialListItem, Billing, DashboardData } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Suppliers
export const supplierService = {
  getAll: () => api.get<Supplier[]>('/suppliers'),
  getById: (id: number) => api.get<Supplier>(`/suppliers/${id}`),
  create: (data: Omit<Supplier, 'id' | 'created_at'>) => api.post('/suppliers', data),
  update: (id: number, data: Omit<Supplier, 'id' | 'created_at'>) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// Materials
export const materialService = {
  getAll: () => api.get<Material[]>('/materials'),
  getById: (id: number) => api.get<Material>(`/materials/${id}`),
  create: (data: any) => api.post('/materials', data),
  delete: (id: number) => api.delete(`/materials/${id}`),
};

// Material Names
export const materialNameService = {
  getAll: () => api.get<MaterialName[]>('/material-names'),
  create: (data: { name: string }) => api.post('/material-names', data),
  delete: (id: number) => api.delete(`/material-names/${id}`),
};

// Material List
export const materialListService = {
  getAll: () => api.get<MaterialListItem[]>('/material-list'),
  update: (id: number, data: { sell_price: number }) => api.put(`/material-list/${id}`, data),
};

// Billing
export const billingService = {
  getAll: () => api.get<Billing[]>('/billing'),
  getById: (id: number) => api.get<Billing>(`/billing/${id}`),
  create: (data: any) => api.post('/billing', data),
  updatePayment: (id: number, data: { paid_amount: number }) => api.put(`/billing/${id}/payment`, data),
};

// Dashboard
export const dashboardService = {
  getData: () => api.get<DashboardData>('/dashboard'),
};