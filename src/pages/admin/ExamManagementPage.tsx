import React, { useEffect, useState, useCallback } from 'react';
import { adminService, type AdminExamDto, type ExamRequest, type AdminQuestionDto } from '../../services';
import { Button, Card, Input } from '../../components';

/**
 * Exam Management Page with full CRUD and question selection.
 */
export const ExamManagementPage: React.FC = () => {
    const [exams, setExams] = useState<AdminExamDto[]>([]);
    const [allQuestions, setAllQuestions] = useState<AdminQuestionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<AdminExamDto | null>(null);
    const [questionFilter, setQuestionFilter] = useState('');

    // Form state
    const [formData, setFormData] = useState<ExamRequest>({
        title: '',
        description: '',
        duration: 60,
        questionIds: [],
        questionCount: 0,
        categories: [],
        isActive: false,
        isRandom: false,
    });
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [categoryInput, setCategoryInput] = useState('');
    const [selectionMode, setSelectionMode] = useState<'manual' | 'random'>('manual');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [examsData, questionsData] = await Promise.all([
                adminService.getExams(),
                adminService.getQuestions(),
            ]);
            setExams(examsData);
            setAllQuestions(questionsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = useCallback(() => {
        setFormData({
            title: '',
            description: '',
            duration: 60,
            questionIds: [],
            questionCount: 0,
            categories: [],
            isActive: false,
            isRandom: false,
        });
        setCategoryInput('');
        setFormError('');
        setEditingExam(null);
        setQuestionFilter('');
        setSelectionMode('manual');
    }, []);

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (exam: AdminExamDto) => {
        setEditingExam(exam);
        const mode = (exam.questionIds && exam.questionIds.length > 0) ? 'manual' : 'random';
        setSelectionMode(mode);
        setFormData({
            title: exam.title,
            description: exam.description || '',
            duration: exam.duration,
            questionIds: exam.questionIds || [],
            questionCount: exam.questionCount || 0,
            categories: exam.categories || [],
            isActive: exam.isActive,
            isRandom: exam.isRandom || false,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const addCategory = () => {
        if (categoryInput.trim() && !formData.categories?.includes(categoryInput.trim())) {
            setFormData({ ...formData, categories: [...(formData.categories || []), categoryInput.trim()] });
            setCategoryInput('');
        }
    };

    const removeCategory = (cat: string) => {
        setFormData({ ...formData, categories: formData.categories?.filter(c => c !== cat) });
    };

    const toggleQuestion = (questionId: string) => {
        const current = formData.questionIds || [];
        if (current.includes(questionId)) {
            setFormData({ ...formData, questionIds: current.filter(id => id !== questionId) });
        } else {
            setFormData({ ...formData, questionIds: [...current, questionId] });
        }
    };

    const selectAllFiltered = () => {
        const filteredIds = filteredQuestions.map(q => q.id);
        const current = formData.questionIds || [];
        const allSelected = filteredIds.every(id => current.includes(id));

        if (allSelected) {
            setFormData({ ...formData, questionIds: current.filter(id => !filteredIds.includes(id)) });
        } else {
            const newIds = [...new Set([...current, ...filteredIds])];
            setFormData({ ...formData, questionIds: newIds });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formData.title.trim()) {
            setFormError('Exam title is required');
            return;
        }
        if (formData.duration <= 0) {
            setFormError('Duration must be greater than 0');
            return;
        }
        if (selectionMode === 'manual' && (!formData.questionIds || formData.questionIds.length === 0)) {
            setFormError('Please select at least one question');
            return;
        }
        if (selectionMode === 'random' && (!formData.questionCount || formData.questionCount <= 0)) {
            setFormError('Please specify number of random questions');
            return;
        }

        const submitData = {
            ...formData,
            questionIds: selectionMode === 'manual' ? formData.questionIds : [],
            questionCount: selectionMode === 'random' ? formData.questionCount : (formData.questionIds?.length || 0),
            isRandom: selectionMode === 'random',
        };

        setIsSaving(true);
        try {
            if (editingExam) {
                await adminService.updateExam(editingExam.id, submitData);
            } else {
                await adminService.createExam(submitData);
            }
            await loadData();
            closeModal();
        } catch (error) {
            console.error('Failed to save exam:', error);
            setFormError('Failed to save exam. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            await adminService.deleteExam(id);
            setExams(exams.filter(e => e.id !== id));
        } catch (error) {
            console.error('Failed to delete exam:', error);
        }
    };

    const filteredExams = exams.filter(e =>
        e.title.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredQuestions = allQuestions.filter(q =>
        q.content.toLowerCase().includes(questionFilter.toLowerCase()) ||
        q.category.toLowerCase().includes(questionFilter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Exam Management</h1>
                    <p className="text-slate-500">Create and manage exams ({exams.length} total)</p>
                </div>
                <Button onClick={openCreateModal}>+ Create New Exam</Button>
            </div>

            <Card padding="md">
                <div className="flex gap-4 mb-6">
                    <Input
                        placeholder="Search exams..."
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Questions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredExams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">{exam.title}</div>
                                            <div className="text-xs text-slate-500">{exam.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{exam.duration} mins</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {exam.questionIds?.length || exam.questionCount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                {exam.isActive ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(exam)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredExams.length === 0 && (
                            <div className="text-center py-12 text-slate-500">No exams found.</div>
                        )}
                    </div>
                )}
            </Card>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingExam ? 'Edit Exam' : 'Create New Exam'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                    {formError}
                                </div>
                            )}

                            <Input
                                label="Exam Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter exam title..."
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter exam description..."
                                />
                            </div>

                            <Input
                                label="Duration (minutes)"
                                type="number"
                                value={formData.duration.toString()}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                            />

                            {/* Question Selection Mode */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Question Selection Mode</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={selectionMode === 'manual'}
                                            onChange={() => setSelectionMode('manual')}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">Select Questions Manually</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={selectionMode === 'random'}
                                            onChange={() => setSelectionMode('random')}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">Random by Category</span>
                                    </label>
                                </div>
                            </div>

                            {/* Manual Question Selection */}
                            {selectionMode === 'manual' && (
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-medium text-slate-700">
                                            Select Questions ({formData.questionIds?.length || 0} selected)
                                        </label>
                                        <Button type="button" variant="ghost" size="sm" onClick={selectAllFiltered}>
                                            Toggle All Visible
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Filter questions..."
                                        value={questionFilter}
                                        onChange={(e) => setQuestionFilter(e.target.value)}
                                        className="mb-3"
                                    />
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {filteredQuestions.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center py-4">No questions available. Create questions first.</p>
                                        ) : (
                                            filteredQuestions.map((q) => {
                                                const isSelected = formData.questionIds?.includes(q.id);
                                                return (
                                                    <div
                                                        key={q.id}
                                                        onClick={() => toggleQuestion(q.id)}
                                                        className={`p-3 rounded-md border cursor-pointer transition-colors ${isSelected
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => { }}
                                                                className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 truncate">{q.content}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{q.category}</span>
                                                                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{q.difficulty}</span>
                                                                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{q.type}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Random Selection Options */}
                            {selectionMode === 'random' && (
                                <div className="space-y-4">
                                    <Input
                                        label="Number of Random Questions"
                                        type="number"
                                        value={(formData.questionCount || 0).toString()}
                                        onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) || 0 })}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Categories (for random selection)</label>
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                value={categoryInput}
                                                onChange={(e) => setCategoryInput(e.target.value)}
                                                placeholder="Add category..."
                                                className="flex-1"
                                            />
                                            <Button type="button" variant="secondary" onClick={addCategory}>Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.categories?.map((cat) => (
                                                <span key={cat} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                    {cat}
                                                    <button type="button" onClick={() => removeCategory(cat)} className="ml-1 text-blue-600 hover:text-blue-900">x</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                    Publish exam (make it active for users)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                                <Button type="submit" isLoading={isSaving}>
                                    {editingExam ? 'Save Changes' : 'Create Exam'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
