import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import { Card } from '../../components';

interface DashboardStats {
    totalQuestions: number;
    totalExams: number;
    totalUsers: number;
    activeExams: number;
}

/**
 * Admin Dashboard Overview Page.
 */
export const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalQuestions: 0,
        totalExams: 0,
        totalUsers: 0,
        activeExams: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [questions, exams, users] = await Promise.all([
                adminService.getQuestions(),
                adminService.getExams(),
                adminService.getUsers(),
            ]);
            setStats({
                totalQuestions: questions.length,
                totalExams: exams.length,
                totalUsers: users.length,
                activeExams: exams.filter(e => e.isActive).length,
            });
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Questions', value: stats.totalQuestions, link: '/admin/questions', color: 'bg-blue-500' },
        { label: 'Total Exams', value: stats.totalExams, link: '/admin/exams', color: 'bg-green-500' },
        { label: 'Active Exams', value: stats.activeExams, link: '/admin/exams', color: 'bg-amber-500' },
        { label: 'Total Users', value: stats.totalUsers, link: '/admin/users', color: 'bg-purple-500' },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Admin</h1>
                <p className="text-slate-500">Tổng quan hệ thống Anh ngữ Ephata</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Link key={stat.label} to={stat.link}>
                        <Card padding="md" hoverable className="relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}></div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</h3>
                            <p className="mt-2 text-4xl font-bold text-slate-900">{stat.value}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/admin/questions" className="block p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900">Add New Question</h3>
                                <p className="text-sm text-slate-500">Create a quiz question</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/exams" className="block p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900">Create New Exam</h3>
                                <p className="text-sm text-slate-500">Set up a new exam</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/users" className="block p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900">Manage Users</h3>
                                <p className="text-sm text-slate-500">View and manage users</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};
