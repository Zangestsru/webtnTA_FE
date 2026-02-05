import React, { type ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Professional Card component.
 * Uses white background, subtle border, and shadow.
 */
export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverable = false,
    padding = 'lg'
}) => {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            className={`bg-white border border-slate-200 rounded-lg shadow-sm ${paddings[padding]} ${hoverable ? 'transition-shadow duration-300 hover:shadow-md' : ''
                } ${className}`}
        >
            {children}
        </div>
    );
};
