import React, { useEffect, useState } from 'react';
import { adminService, type AdminUserDto } from '../../services';
import { Card, Input } from '../../components';

export const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Không thể tải danh sách người dùng:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            await adminService.updateUserRole(id, newRole);
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await adminService.toggleUserStatus(id);
            setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;
        try {
            await adminService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(filter.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
                    <p className="text-slate-500">Quản lý người dùng và vai trò</p>
                </div>
            </div>

            <Card padding="md">
                <div className="flex gap-4 mb-6">
                    <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Đang tải...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Người dùng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{user.username}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="User">Người dùng</option>
                                                <option value="Admin">Quản trị</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {user.isActive ? 'Hoạt động' : 'Khóa'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
