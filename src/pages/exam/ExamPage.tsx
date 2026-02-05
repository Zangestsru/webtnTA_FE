import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService, type StartExamResponse, type QuestionDto, type SubmitAnswer } from '../../services';
import { Button, Card } from '../../components';

/**
 * Professional Exam Taking Interface.
 */
export const ExamPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [examData, setExamData] = useState<StartExamResponse | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
    const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Start exam
    useEffect(() => {
        const startExam = async () => {
            if (!examId) return;
            try {
                const data = await examService.startExam(examId);
                setExamData(data);
                const expiredAt = new Date(data.expiredAt).getTime();
                setTimeRemaining(Math.max(0, Math.floor((expiredAt - Date.now()) / 1000)));
            } catch (error) {
                console.error('Không thể bắt đầu làm bài:', error);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };
        startExam();
    }, [examId, navigate]);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining <= 0 || !examData) return;
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, examData]);

    // Auto-save logic (omitted for brevity, same as before)
    useEffect(() => {
        if (!examData) return;
        const interval = setInterval(saveProgress, 30000);
        return () => clearInterval(interval);
    }, [examData, answers, markedForReview]);

    const saveProgress = async () => {
        if (!examData) return;
        const attemptAnswers = Array.from(answers.entries()).map(([questionId, selectedAnswers]) => ({
            questionId,
            selectedAnswers,
            markedForReview: markedForReview.has(questionId)
        }));
        await examService.saveProgress(examData.attemptId, { answers: attemptAnswers });
    };

    const handleAnswerSelect = (questionId: string, optionKey: string, isMultiple: boolean) => {
        setAnswers((prev) => {
            const newAnswers = new Map(prev);
            const current = newAnswers.get(questionId) || [];

            if (isMultiple) {
                if (current.includes(optionKey)) {
                    newAnswers.set(questionId, current.filter((k) => k !== optionKey));
                } else {
                    newAnswers.set(questionId, [...current, optionKey]);
                }
            } else {
                newAnswers.set(questionId, [optionKey]);
            }
            return newAnswers;
        });
    };

    const toggleMarkForReview = (questionId: string) => {
        setMarkedForReview((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleSubmit = useCallback(async () => {
        if (!examData || isSubmitting) return;
        setIsSubmitting(true);

        try {
            const submitAnswers: SubmitAnswer[] = Array.from(answers.entries()).map(([questionId, selectedAnswers]) => ({
                questionId,
                selectedAnswers
            }));

            const result = await examService.submitExam(examData.attemptId, { answers: submitAnswers });
            navigate(`/result/${result.submissionId}`);
        } catch (error) {
            console.error('Không thể nộp bài:', error);
            setIsSubmitting(false);
        }
    }, [examData, answers, isSubmitting, navigate]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!examData || !examData.questions || examData.questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Không có câu hỏi</h2>
                    <p className="text-slate-500 mb-4">Bài thi này chưa có câu hỏi nào.</p>
                    <Button onClick={() => navigate('/')}>Quay lại</Button>
                </div>
            </div>
        );
    }

    const currentQuestion: QuestionDto | undefined = examData.questions[currentQuestionIndex];
    if (!currentQuestion) {
        setCurrentQuestionIndex(0);
        return null;
    }

    const isMultiple = currentQuestion.type === 'Multiple';
    const selectedAnswers = answers.get(currentQuestion.id) || [];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm h-16 flex items-center px-4 justify-between">
                <div className="flex flex-col">
                    <h1 className="text-base font-bold text-slate-900 truncate max-w-md">{examData.title}</h1>
                    <span className="text-xs text-slate-500">Mã bài làm: {examData.attemptId.substring(0, 8)}...</span>
                </div>
                <div className={`text-xl font-mono font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatTime(timeRemaining)}
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-sm font-medium text-slate-500 block uppercase tracking-wide">Câu hỏi {currentQuestionIndex + 1}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {currentQuestion.score} Điểm
                                    </span>
                                    {isMultiple && (
                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                            Nhiều đáp án
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMarkForReview(currentQuestion.id)}
                                className={markedForReview.has(currentQuestion.id) ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-slate-500'}
                            >
                                <span className="mr-2">{markedForReview.has(currentQuestion.id) ? '★' : '☆'}</span>
                                {markedForReview.has(currentQuestion.id) ? 'Đã đánh dấu' : 'Đánh dấu'}
                            </Button>
                        </div>

                        <div className="prose prose-slate max-w-none mb-8">
                            <p className="text-lg text-slate-900 font-medium leading-relaxed">{currentQuestion.content}</p>
                        </div>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option) => (
                                <div
                                    key={option.key}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, option.key, isMultiple)}
                                    className={`
                                relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                ${selectedAnswers.includes(option.key)
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }
                            `}
                                >
                                    <div className={`
                                w-6 h-6 rounded-full border flex items-center justify-center text-xs mr-4 flex-shrink-0
                                ${selectedAnswers.includes(option.key)
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-slate-300 text-slate-500'
                                        }
                            `}>
                                        {option.key}
                                    </div>
                                    <span className={`font-medium ${selectedAnswers.includes(option.key) ? 'text-blue-900' : 'text-slate-700'}`}>
                                        {option.content}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex justify-between items-center">
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            Câu trước
                        </Button>

                        {currentQuestionIndex === examData.questions.length - 1 ? (
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Nộp bài
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(examData.questions.length - 1, prev + 1))}
                            >
                                Câu tiếp theo
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <Card padding="md" className="sticky top-24">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Câu hỏi</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {examData.questions.map((q, idx) => {
                                const isAnswered = answers.has(q.id);
                                const isMarked = markedForReview.has(q.id);
                                const isCurrent = idx === currentQuestionIndex;

                                let bgClass = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";
                                if (isCurrent) bgClass = "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 ring-offset-1";
                                else if (isMarked) bgClass = "bg-amber-100 text-amber-800 border-amber-300";
                                else if (isAnswered) bgClass = "bg-slate-800 text-white border-slate-800";

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`h-9 w-full rounded border text-sm font-medium transition-all ${bgClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 space-y-2 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-600"></div> <span>Câu hiện tại</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-slate-800"></div> <span>Đã trả lời</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div> <span>Đã đánh dấu</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-white border border-slate-200"></div> <span>Chưa xem</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
