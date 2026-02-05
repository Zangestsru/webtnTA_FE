import { apiClient } from './api';

/**
 * Interface for exam history item.
 * Represents a completed exam submission.
 */
export interface ExamHistoryItem {
    submissionId: string;
    examId: string;
    examTitle: string;
    userId: string;
    username: string;
    userEmail?: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
    timeTaken: number; // in seconds
    duration: number; // exam duration in minutes
    submittedAt: string;
    correctAnswers: number;
    totalQuestions: number;
}

/**
 * Interface for paginated exam history response.
 */
export interface ExamHistoryList {
    items: ExamHistoryItem[];
    totalCount: number;
    page: number;
    pageSize: number;
}

/**
 * Interface for submission details.
 */
export interface SubmissionDetails {
    id: string;
    userId: string;
    username: string;
    userEmail?: string;
    examId: string;
    examTitle: string;
    totalScore: number;
    maxScore: number;
    questions: Array<{
        id: string;
        content: string;
        options: Array<{ key: string; content: string }>;
        correctAnswers: string[];
        userAnswers: string[];
        isCorrect: boolean;
        score: number;
        explanation?: string;
    }>;
    submittedAt: string;
    timeTaken: number;
}

/**
 * Exam History Service.
 * Handles all exam history-related API calls following the service pattern.
 */
export const examHistoryService = {
    /**
     * Get current user's exam history.
     */
    async getMyHistory(page: number = 1, pageSize: number = 20): Promise<ExamHistoryList> {
        const response = await apiClient.get<ExamHistoryList>('/exam-history/my-history', {
            params: { page, pageSize }
        });
        return response.data;
    },

    /**
     * Get all exam history (Admin only).
     */
    async getAllHistory(
        page: number = 1, 
        pageSize: number = 20,
        examId?: string,
        userId?: string
    ): Promise<ExamHistoryList> {
        const response = await apiClient.get<ExamHistoryList>('/exam-history/all', {
            params: { page, pageSize, examId, userId }
        });
        return response.data;
    },

    /**
     * Get specific user's exam history (Admin only).
     */
    async getUserHistory(userId: string, page: number = 1, pageSize: number = 20): Promise<ExamHistoryList> {
        const response = await apiClient.get<ExamHistoryList>(`/exam-history/user/${userId}`, {
            params: { page, pageSize }
        });
        return response.data;
    },

    /**
     * Get submission details by ID.
     */
    async getSubmissionDetails(submissionId: string): Promise<SubmissionDetails> {
        const response = await apiClient.get<SubmissionDetails>(`/exam-history/submission/${submissionId}`);
        return response.data;
    },

    /**
     * Format time in seconds to readable format (HH:MM:SS or MM:SS).
     */
    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Format date to local string.
     */
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get score color based on percentage.
     */
    getScoreColor(percentage: number): string {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    }
};
