import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from '../../components';
import { authService } from '../../services';

type Step = 'email' | 'otp' | 'reset';

/**
 * Forgot Password Page with 3-step flow: email → OTP → new password.
 */
export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.forgotPassword({ email });
            setSuccess('Mã OTP đã được gửi đến email của bạn');
            setStep('otp');
        } catch (err: unknown) {
            let errorMessage = 'Không thể gửi OTP';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.verifyOtp({ email, otp });
            setSuccess('Xác thực OTP thành công');
            setStep('reset');
        } catch (err: unknown) {
            let errorMessage = 'Mã OTP không hợp lệ hoặc đã hết hạn';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword({ email, otp, newPassword });
            setSuccess('Đặt lại mật khẩu thành công!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: unknown) {
            let errorMessage = 'Không thể đặt lại mật khẩu';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 'email': return 'Quên mật khẩu';
            case 'otp': return 'Xác thực OTP';
            case 'reset': return 'Đặt mật khẩu mới';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 'email': return 'Nhập email để nhận mã OTP';
            case 'otp': return 'Nhập mã 6 chữ số đã gửi đến email của bạn';
            case 'reset': return 'Nhập mật khẩu mới cho tài khoản';
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
                        {getStepTitle()}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {getStepDescription()}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center items-center space-x-4">
                    {['email', 'otp', 'reset'].map((s, index) => (
                        <React.Fragment key={s}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s ? 'bg-blue-600 text-white' :
                                    ['email', 'otp', 'reset'].indexOf(step) > index ? 'bg-green-500 text-white' :
                                        'bg-slate-200 text-slate-500'
                                }`}>
                                {index + 1}
                            </div>
                            {index < 2 && (
                                <div className={`w-12 h-1 ${['email', 'otp', 'reset'].indexOf(step) > index ? 'bg-green-500' : 'bg-slate-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <Card className="mt-8" padding="lg">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-6">
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

                    {success && (
                        <div className="rounded-md bg-green-50 p-4 border border-green-200 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">{success}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'email' && (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                Gửi mã OTP
                            </Button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <Input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                label="Mã OTP"
                                placeholder="Nhập mã 6 chữ số"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                Xác thực
                            </Button>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('email');
                                    setError('');
                                    setSuccess('');
                                }}
                                className="w-full text-sm text-blue-600 hover:text-blue-500"
                            >
                                ← Quay lại
                            </button>
                        </form>
                    )}

                    {step === 'reset' && (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                label="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
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
                                Đặt lại mật khẩu
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
