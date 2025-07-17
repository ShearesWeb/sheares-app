import React from 'react';
import Badge from './Badge';
import { CCAPositionType } from '@/types/cca';
import { capitalizeWords } from '@/utils/formatters';

interface PositionTypeBadgeProps {
    positionType: CCAPositionType;
    style?: object;
}

const positionTypeColors: Record<CCAPositionType, { backgroundColor: string; textColor: string }> = {
    [CCAPositionType.Chair]: { backgroundColor: '#E53935', textColor: '#fff' },     // Red
    [CCAPositionType.Head]: { backgroundColor: '#E53935', textColor: '#fff' },      // Red
    [CCAPositionType.Captain]: { backgroundColor: '#E53935', textColor: '#fff' },   // Red
    [CCAPositionType.Vice]: { backgroundColor: '#8E24AA', textColor: '#fff' },      // Purple
    [CCAPositionType.Maincomm]: { backgroundColor: '#1E88E5', textColor: '#fff' },  // Blue
    [CCAPositionType.Subcomm]: { backgroundColor: '#43A047', textColor: '#fff' },   // Green
    [CCAPositionType.Member]: { backgroundColor: '#616161', textColor: '#fff' },    // Grey
};

const PositionTypeBadge: React.FC<PositionTypeBadgeProps> = ({ positionType, style }) => {
    const { backgroundColor, textColor } = positionTypeColors[positionType];

    return (
        <Badge
            label={capitalizeWords(positionType)}
            backgroundColor={backgroundColor}
            textColor={textColor}
            style={style}
        />
    );
};

export default PositionTypeBadge;
