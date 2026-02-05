import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { Button } from './Button';

/**
 * Professional Navigation Header with Mobile Menu.
 */
export const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <span className="text-base sm:text-xl font-bold text-slate-900 hidden xs:block">Anh ngữ Ephata</span>
                            <span className="text-base font-bold text-slate-900 xs:hidden">Ephata</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden lg:flex flex-col items-end mr-2">
                                    <span className="text-sm font-medium text-slate-900">{user?.username}</span>
                                    <span className="text-xs text-slate-500">{user?.email}</span>
                                </div>

                                <Link to="/history">
                                    <Button variant="ghost" size="sm">Lịch sử</Button>
                                </Link>

                                <Link to="/profile">
                                    <Button variant="ghost" size="sm">Hồ sơ</Button>
                                </Link>

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
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Đăng nhập</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">Đăng ký</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {isAuthenticated ? (
                            <>
                                <div className="px-3 py-2 border-b border-slate-100 mb-2">
                                    <div className="text-sm font-medium text-slate-900">{user?.username}</div>
                                    <div className="text-xs text-slate-500">{user?.email}</div>
                                </div>

                                <Link 
                                    to="/history" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                >
                                    📚 Lịch sử
                                </Link>

                                <Link 
                                    to="/profile" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                >
                                    👤 Hồ sơ
                                </Link>

                                {user?.role === 'Admin' && (
                                    <Link 
                                        to="/admin" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                    >
                                        ⚙️ Quản trị
                                    </Link>
                                )}

                                <button 
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                    🚪 Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                >
                                    Đăng nhập
                                </Link>
                                <Link 
                                    to="/register" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
