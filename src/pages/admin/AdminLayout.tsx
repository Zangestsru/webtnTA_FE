import React from 'react';
import { ManagementLayout } from './ManagementLayout';

/**
 * Admin management layout — full access including User Management.
 */
export const AdminLayout: React.FC = () => (
    <ManagementLayout basePath="/admin" showUserManagement={true} title="Quiz Admin" />
);
