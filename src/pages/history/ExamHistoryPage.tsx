import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { Navbar, Card, Button } from '../../components';
import { examHistoryService } from '../../services';
import type { ExamHistoryItem } from '../../services';

/**
 * Exam History Page.
 * Displays completed exam submissions for users and admins.
 * 
 * Features:
 * - User role: View own exam history
 * - Admin role: View all users' exam history
 * - Pagination support
 * - Detailed score information
 * - Time tracking
 */
export const ExamHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    // State management
    const [historyItems, setHistoryItems] = useState<ExamHistoryItem[]>([]);
    const [allHistoryItems, setAllHistoryItems] = useState<ExamHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const pageSize = 10;

    // Load exam history
    useEffect(() => {
        loadHistory();
    }, [page]);

    const loadHistory = async () => {
        setLoading(true);
        setError('');
        
        try {
            const data = isAdmin 
                ? await examHistoryService.getAllHistory(page, pageSize)
                : await examHistoryService.getMyHistory(page, pageSize);
            
            setAllHistoryItems(data.items);
            setHistoryItems(data.items);
            setTotalCount(data.totalCount);
            setTotalPages(Math.ceil(data.totalCount / pageSize));
        } catch (err: unknown) {
            let errorMessage = 'Không thể tải lịch sử làm bài';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setHistoryItems(allHistoryItems);
            return;
        }

        const filtered = allHistoryItems.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const matchExamTitle = item.examTitle.toLowerCase().includes(searchLower);
            const matchUsername = isAdmin && item.username?.toLowerCase().includes(searchLower);
            const matchEmail = isAdmin && item.userEmail?.toLowerCase().includes(searchLower);
            
            return matchExamTitle || matchUsername || matchEmail;
        });

        setHistoryItems(filtered);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setHistoryItems(allHistoryItems);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isAdmin ? 'Lịch Sử Làm Bài - Tất Cả' : 'Lịch Sử Làm Bài Của Tôi'}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {isAdmin 
                            ? 'Xem lịch sử làm bài của tất cả học viên'
                            : 'Xem kết quả các bài thi đã hoàn thành'
                        }
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={isAdmin ? "Tìm kiếm theo tên bài thi, học viên, email..." : "Tìm kiếm theo tên bài thi..."}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg 
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSearch}
                                variant="primary"
                                className="whitespace-nowrap"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Tìm kiếm
                            </Button>
                            {searchQuery && (
                                <Button
                                    onClick={handleClearSearch}
                                    variant="secondary"
                                    className="whitespace-nowrap"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Xóa
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : historyItems.length === 0 ? (
                    /* Empty State */
                    <Card className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-lg">Chưa có lịch sử làm bài</p>
                        <p className="text-gray-500 mt-2">Hoàn thành bài thi đầu tiên của bạn!</p>
                    </Card>
                ) : (
                    /* History List */
                    <>
                        <div className="space-y-4">
                            {historyItems.map((item) => (
                                <Link key={item.submissionId} to={`/submission/${item.submissionId}`} className="block">
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Exam Info */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.examTitle}
                                            </h3>
                                            {isAdmin && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Học viên: <span className="font-medium">{item.username}</span>
                                                    {item.userEmail && <span className="text-gray-500"> ({item.userEmail})</span>}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1">
                                                Hoàn thành: {examHistoryService.formatDate(item.submittedAt)}
                                            </p>
                                        </div>

                                        {/* Score Info */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Điểm số</p>
                                                <p className={`text-2xl font-bold ${examHistoryService.getScoreColor(item.percentage)}`}>
                                                    {item.totalScore}/{item.maxScore}
                                                </p>
                                                <p className={`text-sm font-medium ${examHistoryService.getScoreColor(item.percentage)}`}>
                                                    {item.percentage.toFixed(1)}%
                                                </p>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Câu đúng</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {item.correctAnswers}/{item.totalQuestions}
                                                </p>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Thời gian</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {examHistoryService.formatTime(item.timeTaken)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    / {item.duration} phút
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Hiển thị {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} trong tổng số {totalCount} bài
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handlePreviousPage}
                                        disabled={page === 1}
                                        variant="secondary"
                                    >
                                        ← Trước
                                    </Button>
                                    <div className="flex items-center px-4 text-sm text-gray-700">
                                        Trang {page} / {totalPages}
                                    </div>
                                    <Button
                                        onClick={handleNextPage}
                                        disabled={page === totalPages}
                                        variant="secondary"
                                    >
                                        Sau →
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};
