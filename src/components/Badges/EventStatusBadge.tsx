import React from 'react';
import Badge from './Badge'; // Your reusable Badge component
import { EventStatus } from '@/types/event';
import { capitalizeWords } from '@/utils/formatters';

interface EventStatusBadgeProps {
    status: EventStatus;
    style?: object;
}

const statusColors: Record<EventStatus, { backgroundColor: string; textColor: string }> = {
    [EventStatus.Upcoming]: { backgroundColor: '#007bff', textColor: '#fff' },   // Blue
    [EventStatus.Current]: { backgroundColor: '#28a745', textColor: '#fff' },    // Green
    [EventStatus.Completed]: { backgroundColor: '#F42C38', textColor: '#fff' },       // Red
};

const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status, style }) => {
    const { backgroundColor, textColor } = statusColors[status];

    return (
        <Badge
            label={capitalizeWords(status)}
            backgroundColor={backgroundColor}
            textColor={textColor}
            style={style}
        />
    );
};

export default EventStatusBadge;
