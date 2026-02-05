import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { Navbar, Card, Button } from '../../components';
import { examHistoryService } from '../../services';
import type { SubmissionDetails } from '../../services';

/**
 * Submission Detail Page.
 * Shows detailed review of a completed exam submission.
 * 
 * Features:
 * - View all questions with user answers
 * - See correct/incorrect indicators
 * - Review score for each question
 * - Show correct answers with visual indicators
 * - Admin can view any user's submission
 * - Users can only view their own submissions
 * 
 * Design Pattern: Service Pattern for data fetching, Component Reuse
 */
export const SubmissionDetailPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSubmissionDetails();
    }, [submissionId]);

    const loadSubmissionDetails = async () => {
        if (!submissionId) return;
        
        setLoading(true);
        setError('');

        try {
            const data = await examHistoryService.getSubmissionDetails(submissionId);
            setSubmission(data);
        } catch (err: unknown) {
            let errorMessage = 'Không thể tải chi tiết bài làm';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const percentage = submission && submission.maxScore > 0 
        ? Math.round((submission.totalScore / submission.maxScore) * 100) 
        : 0;

    const isPassed = percentage >= 60;

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </>
        );
    }

    if (error || !submission) {
        return (
            <>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card className="text-center py-12">
                        <p className="text-red-600 mb-4">{error || 'Không tìm thấy bài làm'}</p>
                        <Button onClick={() => navigate('/history')}>Quay lại</Button>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link to="/history" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
                        ← Quay lại lịch sử
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Chi tiết bài làm</h1>
                </div>

                {/* Summary Card */}
                <Card className="mb-8" padding="lg">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{submission.examTitle}</h2>
                            {isAdmin && (
                                <div className="text-sm text-gray-600 mb-4">
                                    <p>Học viên: <span className="font-medium">{submission.username}</span></p>
                                    {submission.userEmail && <p>Email: {submission.userEmail}</p>}
                                </div>
                            )}
                            <p className="text-gray-600">
                                Nộp bài: {examHistoryService.formatDate(submission.submittedAt)}
                            </p>
                            <p className="text-gray-600">
                                Thời gian làm bài: {examHistoryService.formatTime(submission.timeTaken)}
                            </p>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-4">
                            <div className="text-center">
                                <div className={`text-5xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                    {percentage}%
                                </div>
                                <div className="text-sm text-gray-500">Tỷ lệ đạt</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {submission.totalScore}/{submission.maxScore}
                                    </div>
                                    <div className="text-xs text-gray-500">Điểm</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {submission.questions.filter(q => q.isCorrect).length}/{submission.questions.length}
                                    </div>
                                    <div className="text-xs text-gray-500">Câu đúng</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Answers List */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Chi tiết các câu trả lời</h2>
                    
                    {submission.questions.map((question, index) => (
                        <Card 
                            key={question.id} 
                            className={`border-l-4 ${question.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}
                            padding="lg"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Câu hỏi {index + 1}</span>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Điểm: {question.score}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    question.isCorrect 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {question.isCorrect ? '✓ Đúng' : '✗ Sai'}
                                </span>
                            </div>

                            <div className="mb-6">
                                <p className="text-lg text-gray-900 font-medium leading-relaxed">{question.content}</p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-6">
                                {question.options.map((option) => {
                                    const isCorrectAnswer = question.correctAnswers.includes(option.key);
                                    const isUserAnswer = question.userAnswers.includes(option.key);

                                    let borderClass = 'border-gray-200';
                                    let bgClass = 'bg-white';
                                    let textClass = 'text-gray-700';

                                    if (isCorrectAnswer) {
                                        borderClass = 'border-green-500 border-2';
                                        bgClass = 'bg-green-50';
                                        textClass = 'text-green-900 font-medium';
                                    } else if (isUserAnswer) {
                                        borderClass = 'border-red-400 border-2';
                                        bgClass = 'bg-red-50';
                                        textClass = 'text-red-900';
                                    }

                                    return (
                                        <div
                                            key={option.key}
                                            className={`p-4 rounded-lg border flex items-center justify-between ${borderClass} ${bgClass}`}
                                        >
                                            <div className="flex items-center flex-1">
                                                <span className="font-bold mr-3 text-lg">{option.key}.</span>
                                                <span className={textClass}>{option.content}</span>
                                            </div>
                                            {isCorrectAnswer && (
                                                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            {isUserAnswer && !isCorrectAnswer && (
                                                <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {question.explanation && (
                                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                                    <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Giải thích</h4>
                                    <p className="text-sm text-blue-800">{question.explanation}</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Button onClick={() => navigate('/history')} variant="secondary">
                        Quay lại lịch sử
                    </Button>
                </div>
            </main>
        </>
    );
};
