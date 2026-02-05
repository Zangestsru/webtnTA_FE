import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button, Input, Card, Select, Navbar } from '../../components';
import { authService } from '../../services';

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Nam' },
    { value: 'Female', label: 'Nữ' },
    { value: 'Other', label: 'Khác' }
];

/**
 * Profile Page for editing personal info and changing password.
 */
export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Profile form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setGender(user.gender || '');
            if (user.dateOfBirth) {
                // Format date for input
                const date = new Date(user.dateOfBirth);
                setDateOfBirth(date.toISOString().split('T')[0]);
            }
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setIsProfileLoading(true);

        try {
            await authService.updateProfile({
                username: username || undefined,
                gender: gender || undefined,
                dateOfBirth: dateOfBirth || undefined
            });
            setProfileSuccess('Cập nhật hồ sơ thành công!');
            // Refresh user data
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: unknown) {
            let errorMessage = 'Không thể cập nhật hồ sơ';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setProfileError(errorMessage);
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Mật khẩu mới không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setIsPasswordLoading(true);

        try {
            await authService.changePassword({
                currentPassword,
                newPassword
            });
            setPasswordSuccess('Đổi mật khẩu thành công!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            let errorMessage = 'Không thể đổi mật khẩu';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setPasswordError(errorMessage);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Hồ sơ cá nhân</h1>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Profile Information */}
                    <Card padding="lg">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">Thông tin cá nhân</h2>

                        {profileError && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-6">
                                <p className="text-sm text-red-800">{profileError}</p>
                            </div>
                        )}

                        {profileSuccess && (
                            <div className="rounded-md bg-green-50 p-4 border border-green-200 mb-6">
                                <p className="text-sm text-green-800">{profileSuccess}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleProfileUpdate}>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                label="Tên người dùng"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                value={email}
                                disabled
                                className="bg-slate-100 cursor-not-allowed"
                            />

                            <Select
                                id="gender"
                                label="Giới tính"
                                options={GENDER_OPTIONS}
                                value={gender}
                                onChange={setGender}
                                placeholder="Chọn giới tính"
                            />

                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Ngày sinh
                                </label>
                                <input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isProfileLoading}
                            >
                                Cập nhật hồ sơ
                            </Button>
                        </form>
                    </Card>

                    {/* Change Password */}
                    <Card padding="lg">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">Đổi mật khẩu</h2>

                        {passwordError && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-6">
                                <p className="text-sm text-red-800">{passwordError}</p>
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="rounded-md bg-green-50 p-4 border border-green-200 mb-6">
                                <p className="text-sm text-green-800">{passwordSuccess}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handlePasswordChange}>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                label="Mật khẩu hiện tại"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />

                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                label="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />

                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                label="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isPasswordLoading}
                            >
                                Đổi mật khẩu
                            </Button>
                        </form>
                    </Card>
                </div>
            </main>
        </>
    );
};
