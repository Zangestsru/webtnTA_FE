export { authService } from './authService';
export { examService } from './examService';
export { adminService } from './adminService';
export { examHistoryService } from './examHistoryService';
export { apiClient } from './api';

// Re-export types
export type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UserDto
} from './authService';

export type {
    ExamListDto,
    StartExamResponse,
    QuestionDto,
    AnswerOption,
    SaveProgressRequest,
    AttemptAnswer,
    SubmitExamRequest,
    SubmitAnswer,
    ExamResultDto,
    QuestionResultDto
} from './examService';

export type {
    AdminQuestionDto,
    AnswerOptionDto,
    QuestionRequest,
    AdminExamDto,
    ExamRequest,
    AdminUserDto,
    UpdateRoleRequest
} from './adminService';

export type {
    ExamHistoryItem,
    ExamHistoryList,
    SubmissionDetails
} from './examHistoryService';
