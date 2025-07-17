import React from 'react';
import Badge from './Badge'; // assumes you already created this
import { EventType } from '@/types/event';
import { capitalizeWords } from '@/utils/formatters';

interface EventTypeBadgeProps {
    eventType: EventType;
    style?: object;
}

const eventTypeColors: Record<EventType, { backgroundColor: string; textColor: string }> = {
    [EventType.Event]: { backgroundColor: '#1E88E5', textColor: '#fff' },        // Blue
    [EventType.Fundraiser]: { backgroundColor: '#E53935', textColor: '#fff' },   // Red
    [EventType.Welfare]: { backgroundColor: '#8E24AA', textColor: '#fff' },      // Purple
    [EventType.Election]: { backgroundColor: '#FB8C00', textColor: '#fff' },     // Orange
};

const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({ eventType, style }) => {
    const { backgroundColor, textColor } = eventTypeColors[eventType];

    return (
        <Badge
            label={capitalizeWords(eventType)}
            backgroundColor={backgroundColor}
            textColor={textColor}
            style={style}
        />
    );
};

export default EventTypeBadge;
