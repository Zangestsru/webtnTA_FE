import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type UserDto, type LoginRequest, type RegisterRequest, type AuthResponse } from '../services';

interface AuthContextType {
    user: UserDto | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Authentication context provider.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch {
                    authService.removeToken();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (data: LoginRequest): Promise<void> => {
        const response: AuthResponse = await authService.login(data);
        authService.setToken(response.token);
        setUser(response.user);
    };

    const register = async (data: RegisterRequest): Promise<void> => {
        const response: AuthResponse = await authService.register(data);
        authService.setToken(response.token);
        setUser(response.user);
    };

    const logout = (): void => {
        authService.removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to access authentication context.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
