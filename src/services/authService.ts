import { apiClient } from './api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: UserDto;
}

export interface UserDto {
    id: string;
    username: string;
    email: string;
    role: string;
}

/**
 * Authentication service for login, register, and user management.
 */
export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    async getCurrentUser(): Promise<UserDto> {
        const response = await apiClient.get<UserDto>('/auth/me');
        return response.data;
    },

    setToken(token: string): void {
        localStorage.setItem('token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    removeToken(): void {
        localStorage.removeItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};
