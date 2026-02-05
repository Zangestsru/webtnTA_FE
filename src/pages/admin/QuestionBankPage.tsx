import React, { useEffect, useState, useCallback } from 'react';
import { adminService, type AdminQuestionDto, type QuestionRequest } from '../../services';
import { Button, Card, Input } from '../../components';

/**
 * Question Bank Management Page with full CRUD.
 */
export const QuestionBankPage: React.FC = () => {
    const [questions, setQuestions] = useState<AdminQuestionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<AdminQuestionDto | null>(null);

    // Form state
    const [formData, setFormData] = useState<QuestionRequest>({
        content: '',
        type: 'Single',
        options: [
            { key: 'A', content: '' },
            { key: 'B', content: '' },
            { key: 'C', content: '' },
            { key: 'D', content: '' },
        ],
        correctAnswers: [],
        explanation: '',
        category: '',
        difficulty: 'Easy',
    });
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getQuestions();
            setQuestions(data);
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = useCallback(() => {
        setFormData({
            content: '',
            type: 'Single',
            options: [
                { key: 'A', content: '' },
                { key: 'B', content: '' },
                { key: 'C', content: '' },
                { key: 'D', content: '' },
            ],
            correctAnswers: [],
            explanation: '',
            category: '',
            difficulty: 'Easy',
        });
        setFormError('');
        setEditingQuestion(null);
    }, []);

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (question: AdminQuestionDto) => {
        setEditingQuestion(question);
        setFormData({
            content: question.content,
            type: question.type,
            options: question.options,
            correctAnswers: question.correctAnswers,
            explanation: question.explanation || '',
            category: question.category,
            difficulty: question.difficulty,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = { ...newOptions[index], content: value };
        setFormData({ ...formData, options: newOptions });
    };

    const handleCorrectAnswerToggle = (key: string) => {
        if (formData.type === 'Single') {
            setFormData({ ...formData, correctAnswers: [key] });
        } else {
            const current = formData.correctAnswers;
            if (current.includes(key)) {
                setFormData({ ...formData, correctAnswers: current.filter(k => k !== key) });
            } else {
                setFormData({ ...formData, correctAnswers: [...current, key] });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formData.content.trim()) {
            setFormError('Question content is required');
            return;
        }
        if (formData.correctAnswers.length === 0) {
            setFormError('Please select at least one correct answer');
            return;
        }
        if (!formData.category.trim()) {
            setFormError('Category is required');
            return;
        }

        setIsSaving(true);
        try {
            if (editingQuestion) {
                await adminService.updateQuestion(editingQuestion.id, formData);
            } else {
                await adminService.createQuestion(formData);
            }
            await loadQuestions();
            closeModal();
        } catch (error) {
            console.error('Failed to save question:', error);
            setFormError('Failed to save question. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await adminService.deleteQuestion(id);
            setQuestions(questions.filter(q => q.id !== id));
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.content.toLowerCase().includes(filter.toLowerCase()) ||
        q.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
                    <p className="text-slate-500">Manage your quiz questions ({questions.length} total)</p>
                </div>
                <Button onClick={openCreateModal}>+ Add New Question</Button>
            </div>

            <Card padding="md">
                <div className="flex gap-4 mb-6">
                    <Input
                        placeholder="Search questions..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Content</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Difficulty</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredQuestions.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 truncate max-w-md">{q.content}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {q.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.difficulty}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(q)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredQuestions.length === 0 && (
                            <div className="text-center py-12 text-slate-500">No questions found.</div>
                        )}
                    </div>
                )}
            </Card>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingQuestion ? 'Edit Question' : 'Create New Question'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Question Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your question..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g., Grammar, Vocabulary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Single' | 'Multiple', correctAnswers: [] })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Single">Single Choice</option>
                                    <option value="Multiple">Multiple Choice</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Answer Options (Click to mark as correct)
                                </label>
                                <div className="space-y-3">
                                    {formData.options.map((option, index) => (
                                        <div key={option.key} className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleCorrectAnswerToggle(option.key)}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${formData.correctAnswers.includes(option.key)
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'bg-white border-slate-300 text-slate-500 hover:border-green-400'
                                                    }`}
                                            >
                                                {option.key}
                                            </button>
                                            <Input
                                                value={option.content}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                                placeholder={`Option ${option.key}`}
                                                className="flex-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (Optional)</label>
                                <textarea
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Explain why the correct answer is right..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                                <Button type="submit" isLoading={isSaving}>
                                    {editingQuestion ? 'Save Changes' : 'Create Question'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
