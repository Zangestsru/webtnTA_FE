import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button, Input, Card, Select } from '../../components';

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Nam' },
    { value: 'Female', label: 'Nữ' },
    { value: 'Other', label: 'Khác' }
];

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,20}$/;

/**
 * Professional Register Page with gender and date of birth.
 */
export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        if (!USERNAME_REGEX.test(username.trim())) {
            setError('Tên đăng nhập không hợp lệ (3-20 ký tự, chỉ chứa chữ, số, dấu chấm và gạch dưới)');
            return false;
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            setError('Email không hợp lệ');
            return false;
        }

        if (password.length <= 6) {
            setError('Mật khẩu phải có hơn 6 ký tự');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return false;
        }

        if (!gender) {
            setError('Vui lòng chọn giới tính');
            return false;
        }

        if (!dateOfBirth) {
            setError('Vui lòng nhập ngày sinh');
            return false;
        }

        // Validate age > 6
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 6) {
            setError('Bạn phải trên 6 tuổi để đăng ký');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await register({
                username: username.trim(),
                email: email.trim(),
                password,
                gender,
                dateOfBirth
            });
            navigate('/');
        } catch (err: unknown) {
            let errorMessage = 'Đăng ký thất bại';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">E</span>
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-blue-600">
                        Anh ngữ Ephata
                    </h1>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        Đăng ký tài khoản
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>

                <Card className="mt-8" padding="lg">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Input
                            id="username"
                            name="username"
                            type="text"
                            required
                            label="Tên người dùng"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                id="gender"
                                label="Giới tính"
                                options={GENDER_OPTIONS}
                                value={gender}
                                onChange={setGender}
                                placeholder="Chọn giới tính"
                                required
                            />

                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Ngày sinh
                                </label>
                                <input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    required
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                            </div>
                        </div>

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            label="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            label="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Đăng ký
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};
