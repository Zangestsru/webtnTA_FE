import React, { useState, useRef, useCallback } from 'react';
import { Button, Card } from '../../components';
import { apiClient } from '../../services/api';

interface ExtractedQuestion {
    content: string;
    type: string;
    options: { key: string; content: string }[];
    correctAnswers: string[];
    explanation?: string;
    category?: string;
    difficulty: string;
    selected: boolean;
}

/**
 * Document Import Page - Upload PDF/DOCX and extract questions using AI.
 */
export const DocumentImportPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFile = (selectedFile: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Only PDF and DOCX files are supported');
            return;
        }
        setFile(selectedFile);
        setError('');
        setExtractedQuestions([]);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleUploadAndParse = async () => {
        if (!file) return;

        setIsUploading(true);
        setIsParsing(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/document-import/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const rawQuestions = response.data as ExtractedQuestion[];
            const questions: ExtractedQuestion[] = rawQuestions.map(q => ({
                ...q,
                selected: true,
            }));

            setExtractedQuestions(questions);
            setSuccess(`Successfully extracted ${questions.length} questions from the document.`);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
            setError(axiosError.response?.data?.message || axiosError.message || 'Failed to parse document');
        } finally {
            setIsUploading(false);
            setIsParsing(false);
        }
    };

    const toggleQuestionSelection = (index: number) => {
        setExtractedQuestions(prev => prev.map((q, i) =>
            i === index ? { ...q, selected: !q.selected } : q
        ));
    };

    const selectAll = () => {
        setExtractedQuestions(prev => prev.map(q => ({ ...q, selected: true })));
    };

    const deselectAll = () => {
        setExtractedQuestions(prev => prev.map(q => ({ ...q, selected: false })));
    };

    const handleSaveQuestions = async () => {
        const selectedQuestions = extractedQuestions.filter(q => q.selected);
        if (selectedQuestions.length === 0) {
            setError('Please select at least one question to save');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const questionsToSave = selectedQuestions.map(q => ({
                content: q.content,
                type: q.type,
                options: q.options,
                correctAnswers: q.correctAnswers,
                explanation: q.explanation,
                category: q.category,
                difficulty: q.difficulty,
            }));

            const response = await apiClient.post('/document-import/confirm', questionsToSave);
            const result = response.data as { saved: number; total: number };

            setSuccess(`Successfully saved ${result.saved} out of ${result.total} questions to the database.`);
            setExtractedQuestions([]);
            setFile(null);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
            setError(axiosError.response?.data?.message || 'Failed to save questions');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedCount = extractedQuestions.filter(q => q.selected).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Import Questions from Document</h1>
                <p className="text-slate-500">Upload a PDF or DOCX file to extract quiz questions using AI</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            {/* Upload Area */}
            {extractedQuestions.length === 0 && (
                <Card padding="lg">
                    <div
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-slate-900">
                            {file ? file.name : 'Drop your document here'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF or DOCX files up to 10MB'}
                        </p>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <div className="mt-4 flex justify-center gap-4">
                            <Button variant="secondary" onClick={() => inputRef.current?.click()}>
                                Select File
                            </Button>
                            {file && (
                                <Button onClick={handleUploadAndParse} isLoading={isUploading || isParsing}>
                                    {isParsing ? 'Extracting questions...' : 'Upload & Extract'}
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Extracted Questions Preview */}
            {extractedQuestions.length > 0 && (
                <Card padding="md">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Extracted Questions</h2>
                            <p className="text-sm text-slate-500">
                                {selectedCount} of {extractedQuestions.length} selected
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                            <Button variant="ghost" size="sm" onClick={deselectAll}>Deselect All</Button>
                            <Button onClick={handleSaveQuestions} isLoading={isSaving}>
                                Save {selectedCount} Questions
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {extractedQuestions.map((q, index) => (
                            <div
                                key={index}
                                className={`p-4 border rounded-lg transition-colors ${q.selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={q.selected}
                                        onChange={() => toggleQuestionSelection(index)}
                                        className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex gap-2 mb-2">
                                            <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{q.category || 'General'}</span>
                                            <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{q.difficulty}</span>
                                            <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{q.type}</span>
                                        </div>
                                        <p className="font-medium text-slate-900 mb-2">{q.content}</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {q.options.map((opt: { key: string; content: string }) => (
                                                <div
                                                    key={opt.key}
                                                    className={`p-2 rounded ${q.correctAnswers.includes(opt.key)
                                                            ? 'bg-green-100 text-green-800 font-medium'
                                                            : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                >
                                                    <span className="font-bold mr-2">{opt.key}.</span>
                                                    {opt.content}
                                                </div>
                                            ))}
                                        </div>
                                        {q.explanation && (
                                            <p className="mt-2 text-sm text-slate-600 italic">
                                                Explanation: {q.explanation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};
