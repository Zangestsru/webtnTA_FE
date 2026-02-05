import { apiClient } from './api';

// Question types
export interface AdminQuestionDto {
    id: string;
    content: string;
    type: 'Single' | 'Multiple';
    options: AnswerOptionDto[];
    correctAnswers: string[];
    explanation?: string;
    category: string;
    difficulty: string;
    audioUrl?: string;
    imageUrl?: string;
    isActive: boolean;
    createdAt: string;
}

export interface AnswerOptionDto {
    key: string;
    content: string;
    imageUrl?: string;
}

export interface QuestionRequest {
    content: string;
    type: 'Single' | 'Multiple';
    options: AnswerOptionDto[];
    correctAnswers: string[];
    explanation?: string;
    category: string;
    difficulty: string;
    audioUrl?: string;
    imageUrl?: string;
}

// Exam types
export interface AdminExamDto {
    id: string;
    title: string;
    description?: string;
    duration: number;
    totalScore: number;
    isActive: boolean;
    isRandom: boolean;
    questionCount: number;
    questionIds: string[];
    categories: string[];
    createdAt: string;
}

export interface ExamRequest {
    title: string;
    description?: string;
    duration: number;
    totalScore?: number;
    isActive: boolean;
    isRandom: boolean;
    questionCount?: number;
    questionIds?: string[];
    categories?: string[];
}

// User types
export interface AdminUserDto {
    id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface UpdateRoleRequest {
    role: string;
}

/**
 * Admin service for managing questions, exams, and users.
 */
export const adminService = {
    // Questions
    async getQuestions(): Promise<AdminQuestionDto[]> {
        const response = await apiClient.get<AdminQuestionDto[]>('/admin/questions');
        return response.data;
    },

    async getQuestion(id: string): Promise<AdminQuestionDto> {
        const response = await apiClient.get<AdminQuestionDto>(`/admin/questions/${id}`);
        return response.data;
    },

    async createQuestion(data: QuestionRequest): Promise<AdminQuestionDto> {
        const response = await apiClient.post<AdminQuestionDto>('/admin/questions', data);
        return response.data;
    },

    async updateQuestion(id: string, data: QuestionRequest): Promise<void> {
        await apiClient.put(`/admin/questions/${id}`, data);
    },

    async deleteQuestion(id: string): Promise<void> {
        await apiClient.delete(`/admin/questions/${id}`);
    },

    // Exams
    async getExams(): Promise<AdminExamDto[]> {
        const response = await apiClient.get<AdminExamDto[]>('/admin/exams');
        return response.data;
    },

    async getExam(id: string): Promise<AdminExamDto> {
        const response = await apiClient.get<AdminExamDto>(`/admin/exams/${id}`);
        return response.data;
    },

    async createExam(data: ExamRequest): Promise<AdminExamDto> {
        const response = await apiClient.post<AdminExamDto>('/admin/exams', data);
        return response.data;
    },

    async updateExam(id: string, data: ExamRequest): Promise<void> {
        await apiClient.put(`/admin/exams/${id}`, data);
    },

    async deleteExam(id: string): Promise<void> {
        await apiClient.delete(`/admin/exams/${id}`);
    },

    // Users
    async getUsers(): Promise<AdminUserDto[]> {
        const response = await apiClient.get<AdminUserDto[]>('/admin/users');
        return response.data;
    },

    async updateUserRole(id: string, role: string): Promise<void> {
        await apiClient.put(`/admin/users/${id}/role`, { role });
    },

    async toggleUserStatus(id: string): Promise<void> {
        await apiClient.put(`/admin/users/${id}/toggle-active`);
    },

    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(`/admin/users/${id}`);
    }
};
