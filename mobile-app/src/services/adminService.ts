import ApiService from './api';
import {
  User,
  LoginCredentials,
  ApiResponse,
  DashboardStats,
  Order,
  Customer,
  Product,
  Company,
} from '../types';

class AdminService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{user: User; token: string}>> {
    return ApiService.post('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    return ApiService.post('/auth/logout');
  }

  async getDashboardStats(companyId: string): Promise<ApiResponse<DashboardStats>> {
    return ApiService.get(`/admin/${companyId}/dashboard/stats`);
  }

  async getOrders(companyId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{orders: Order[]; total: number}>> {
    const queryParams = new URLSearchParams(params as any).toString();
    return ApiService.get(`/admin/${companyId}/orders?${queryParams}`);
  }

  async getOrder(companyId: string, orderId: string): Promise<ApiResponse<Order>> {
    return ApiService.get(`/admin/${companyId}/orders/${orderId}`);
  }

  async updateOrderStatus(
    companyId: string,
    orderId: string,
    status: string,
  ): Promise<ApiResponse<Order>> {
    return ApiService.patch(`/admin/${companyId}/orders/${orderId}`, {status});
  }

  async getCustomers(companyId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{customers: Customer[]; total: number}>> {
    const queryParams = new URLSearchParams(params as any).toString();
    return ApiService.get(`/admin/${companyId}/customers?${queryParams}`);
  }

  async getCustomer(companyId: string, customerId: string): Promise<ApiResponse<Customer>> {
    return ApiService.get(`/admin/${companyId}/customers/${customerId}`);
  }

  async getProducts(companyId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<{products: Product[]; total: number}>> {
    const queryParams = new URLSearchParams(params as any).toString();
    return ApiService.get(`/admin/${companyId}/products?${queryParams}`);
  }

  async getProduct(companyId: string, productId: string): Promise<ApiResponse<Product>> {
    return ApiService.get(`/admin/${companyId}/products/${productId}`);
  }

  async updateProduct(
    companyId: string,
    productId: string,
    data: Partial<Product>,
  ): Promise<ApiResponse<Product>> {
    return ApiService.put(`/admin/${companyId}/products/${productId}`, data);
  }

  async createProduct(companyId: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return ApiService.post(`/admin/${companyId}/products`, data);
  }

  async deleteProduct(companyId: string, productId: string): Promise<ApiResponse<void>> {
    return ApiService.delete(`/admin/${companyId}/products/${productId}`);
  }

  async getCompany(companyId: string): Promise<ApiResponse<Company>> {
    return ApiService.get(`/admin/companies/${companyId}`);
  }
}

export default new AdminService();
