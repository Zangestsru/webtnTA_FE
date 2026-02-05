import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { examService, type ExamListDto, type ExamResultDto } from '../../services';
import { Button, Card } from '../../components';

/**
 * Professional Dashboard Page.
 */
export const DashboardPage: React.FC = () => {
    const { } = useAuth();
    const [exams, setExams] = useState<ExamListDto[]>([]);
    const [history, setHistory] = useState<ExamResultDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [examsData, historyData] = await Promise.all([
                    examService.getActiveExams(),
                    examService.getHistory()
                ]);
                setExams(examsData);
                setHistory(historyData);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const stats = {
        totalExams: history.length,
        averageScore: history.length > 0
            ? Math.round((history.reduce((acc, h) => acc + (h.maxScore > 0 ? (h.totalScore / h.maxScore) * 100 : 0), 0) / history.length))
            : 0,
        lastScore: history[0]?.totalScore ?? 0
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome & Stats */}
            <section>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Trang chủ</h1>
                    <p className="text-slate-600">Tổng quan tiến độ học tập của bạn</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card padding="md">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tổng số bài thi</h3>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalExams}</p>
                    </Card>
                    <Card padding="md">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Điểm trung bình</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{stats.averageScore}%</p>
                    </Card>
                    <Card padding="md">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Điểm gần nhất</h3>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.lastScore}</p>
                    </Card>
                </div>
            </section>

            {/* Available Exams */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Bài thi có sẵn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <Card key={exam.id} hoverable className="flex flex-col h-full" padding="md">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{exam.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{exam.description || 'Chưa có mô tả'}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{exam.questionCount} câu hỏi</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{exam.duration} phút</span>
                                    </div>
                                </div>
                            </div>
                            <Link to={`/exam/${exam.id}/start`}>
                                <Button className="w-full">Bắt đầu làm bài</Button>
                            </Link>
                        </Card>
                    ))}
                    {exams.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500">Chưa có bài thi nào.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Activity */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Hoạt động gần đây</h2>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {history.length > 0 ? (
                        <div className="divide-y divide-slate-200">
                            {history.map((result) => (
                                <div key={result.submissionId} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-slate-900">{result.examTitle}</h4>
                                        <p className="text-sm text-slate-500">
                                            {new Date(result.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.maxScore > 0 && (result.totalScore / result.maxScore) >= 0.6
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0}%
                                        </span>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {result.totalScore} / {result.maxScore} pts
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            Chưa có lịch sử làm bài.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
