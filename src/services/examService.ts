import { apiClient } from './api';

export interface ExamListDto {
    id: string;
    title: string;
    description?: string;
    duration: number;
    totalScore: number;
    questionCount: number;
}

export interface StartExamResponse {
    attemptId: string;
    examId: string;
    title: string;
    duration: number;
    startedAt: string;
    expiredAt: string;
    questions: QuestionDto[];
}

export interface QuestionDto {
    id: string;
    content: string;
    type: string;
    options: AnswerOption[];
    score: number;
    order: number;
    audioUrl?: string;
    imageUrl?: string;
}

export interface AnswerOption {
    key: string;
    content: string;
    imageUrl?: string;
}

export interface SaveProgressRequest {
    answers: AttemptAnswer[];
}

export interface AttemptAnswer {
    questionId: string;
    selectedAnswers: string[];
    markedForReview: boolean;
}

export interface SubmitExamRequest {
    answers: SubmitAnswer[];
}

export interface SubmitAnswer {
    questionId: string;
    selectedAnswers: string[];
}

export interface ExamResultDto {
    submissionId: string;
    examTitle: string;
    totalScore: number;
    maxScore: number;
    timeTaken: number;
    submittedAt: string;
    questions?: QuestionResultDto[];
}

export interface QuestionResultDto {
    id: string;
    content: string;
    options: AnswerOption[];
    correctAnswers: string[];
    userAnswers: string[];
    isCorrect: boolean;
    score: number;
    explanation?: string;
}

/**
 * Exam service for user exam operations.
 */
export const examService = {
    async getActiveExams(): Promise<ExamListDto[]> {
        const response = await apiClient.get<ExamListDto[]>('/exam');
        return response.data;
    },

    async startExam(examId: string): Promise<StartExamResponse> {
        const response = await apiClient.post<StartExamResponse>(`/exam/${examId}/start`);
        return response.data;
    },

    async saveProgress(attemptId: string, data: SaveProgressRequest): Promise<void> {
        await apiClient.put(`/exam/attempt/${attemptId}/save`, data);
    },

    async submitExam(attemptId: string, data: SubmitExamRequest): Promise<ExamResultDto> {
        const response = await apiClient.post<ExamResultDto>(`/exam/attempt/${attemptId}/submit`, data);
        return response.data;
    },

    async getResult(submissionId: string): Promise<ExamResultDto> {
        const response = await apiClient.get<ExamResultDto>(`/exam/result/${submissionId}`);
        return response.data;
    },

    async getHistory(): Promise<ExamResultDto[]> {
        const response = await apiClient.get<ExamResultDto[]>('/exam/history');
        return response.data;
    }
};
