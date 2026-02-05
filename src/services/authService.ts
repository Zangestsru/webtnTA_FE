import { apiClient } from './api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    gender: string;
    dateOfBirth: string;
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
    gender?: string;
    dateOfBirth?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface UpdateProfileRequest {
    username?: string;
    gender?: string;
    dateOfBirth?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

/**
 * Authentication service for login, register, password reset, and profile management.
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

    async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
        await apiClient.post('/auth/forgot-password', data);
    },

    async verifyOtp(data: VerifyOtpRequest): Promise<void> {
        await apiClient.post('/auth/verify-otp', data);
    },

    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        await apiClient.post('/auth/reset-password', data);
    },

    async updateProfile(data: UpdateProfileRequest): Promise<UserDto> {
        const response = await apiClient.put<UserDto>('/auth/profile', data);
        return response.data;
    },

    async changePassword(data: ChangePasswordRequest): Promise<void> {
        await apiClient.post('/auth/change-password', data);
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
