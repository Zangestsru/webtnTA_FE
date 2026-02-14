import React from 'react';
import { ManagementLayout } from './ManagementLayout';

/**
 * Teacher management layout — same as admin but without User Management.
 */
export const TeacherLayout: React.FC = () => (
    <ManagementLayout basePath="/teacher" showUserManagement={false} title="Quiz Teacher" />
);
