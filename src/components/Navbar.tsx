import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { Button } from './Button';

/**
 * Professional Navigation Header.
 */
export const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">Anh ngữ Ephata</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden sm:flex flex-col items-end mr-4">
                                    <span className="text-sm font-medium text-slate-900">{user?.username}</span>
                                    <span className="text-xs text-slate-500">{user?.email}</span>
                                </div>

                                {user?.role === 'Admin' && (
                                    <Link to="/admin">
                                        <Button variant="outline" size="sm">Quản trị</Button>
                                    </Link>
                                )}

                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    Đăng xuất
                                </Button>
                            </>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Đăng nhập</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">Đăng ký</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
