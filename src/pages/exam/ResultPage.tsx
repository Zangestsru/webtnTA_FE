import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { examService, type ExamResultDto } from '../../services';
import { Button, Card } from '../../components';

/**
 * Professional Result Page.
 */
export const ResultPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const [result, setResult] = useState<ExamResultDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadResult = async () => {
            if (!submissionId) return;
            try {
                const data = await examService.getResult(submissionId);
                setResult(data);
            } catch (error) {
                console.error('Failed to load result:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadResult();
    }, [submissionId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">Result not found</p>
                <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    const percentage = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;
    const isPassed = percentage >= 60;

    return (
        <div className="space-y-8">
            {/* Header / Score Summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{result.examTitle}</h1>
                <p className="text-slate-500 mb-8">Submission Results</p>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                    <div className="text-center">
                        <div className={`text-6xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                            {percentage}%
                        </div>
                        <div className="text-sm font-medium uppercase tracking-wide text-slate-500">Total Score</div>
                    </div>

                    <div className="h-12 w-px bg-slate-200 hidden md:block"></div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-left">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{result.totalScore} / {result.maxScore}</div>
                            <div className="text-xs text-slate-500 uppercase">Points</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{Math.floor(result.timeTaken / 60)}m</div>
                            <div className="text-xs text-slate-500 uppercase">Time Taken</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{result.questions?.filter(q => q.isCorrect).length || 0}</div>
                            <div className="text-xs text-slate-500 uppercase">Correct</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">{result.questions?.filter(q => !q.isCorrect).length || 0}</div>
                            <div className="text-xs text-slate-500 uppercase">Incorrect</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <Link to="/">
                        <Button variant="primary">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>

            {/* Detailed Review */}
            {result.questions && result.questions.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Detailed Review</h2>
                    {result.questions.map((question, index) => (
                        <Card key={question.id} padding="lg" className={`border-l-4 ${question.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-sm font-medium text-slate-500">Question {index + 1}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {question.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                            </div>

                            <p className="text-lg text-slate-900 font-medium mb-6">{question.content}</p>

                            <div className="space-y-3 mb-6">
                                {question.options.map((option) => {
                                    const isCorrectAnswer = question.correctAnswers.includes(option.key);
                                    const isUserAnswer = question.userAnswers.includes(option.key);

                                    let borderClass = 'border-slate-200';
                                    let bgClass = 'bg-white';
                                    let textClass = 'text-slate-700';

                                    if (isCorrectAnswer) {
                                        borderClass = 'border-green-500';
                                        bgClass = 'bg-green-50';
                                        textClass = 'text-green-900 font-medium';
                                    } else if (isUserAnswer) {
                                        borderClass = 'border-red-300';
                                        bgClass = 'bg-red-50';
                                        textClass = 'text-red-900';
                                    }

                                    return (
                                        <div
                                            key={option.key}
                                            className={`p-3 rounded-md border flex items-center justify-between ${borderClass} ${bgClass}`}
                                        >
                                            <div className="flex items-center">
                                                <span className="font-bold mr-3">{option.key}.</span>
                                                <span className={textClass}>{option.content}</span>
                                            </div>
                                            {isCorrectAnswer && (
                                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            {isUserAnswer && !isCorrectAnswer && (
                                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {question.explanation && (
                                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                                    <h4 className="text-sm font-bold text-blue-900 mb-1">Explanation</h4>
                                    <p className="text-sm text-blue-800">{question.explanation}</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
