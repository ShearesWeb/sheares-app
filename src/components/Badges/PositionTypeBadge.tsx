import React from 'react';
import Badge from './Badge';
import { CCAPositionType, CCAType } from '@/types/cca';
import { capitalizeWords } from '@/utils/formatters';

interface PositionTypeBadgeProps {
    ccaType: CCAType
    positionType: CCAPositionType;
    style?: object;
}

const positionTypeColors: Record<CCAPositionType, { backgroundColor: string; textColor: string }> = {
    [CCAPositionType.Lead]: { backgroundColor: '#E53935', textColor: '#fff' },     // Red
    [CCAPositionType.Vice]: { backgroundColor: '#8E24AA', textColor: '#fff' },      // Purple
    [CCAPositionType.Blockcomm]: { backgroundColor: '#1E88E5', textColor: '#fff' },  // Blue
    [CCAPositionType.Maincomm]: { backgroundColor: '#1E88E5', textColor: '#fff' },  // Blue
    [CCAPositionType.Subcomm]: { backgroundColor: '#43A047', textColor: '#fff' },   // Green
    [CCAPositionType.Member]: { backgroundColor: '#616161', textColor: '#fff' },    // Grey
};

const PositionTypeBadge: React.FC<PositionTypeBadgeProps> = ({ ccaType, positionType, style }) => {
    const { backgroundColor, textColor } = positionTypeColors[positionType];

    let positionTypeLabel: string = positionType;
    if (positionType === CCAPositionType.Lead) {
        switch (ccaType) {
            case CCAType.Committee:
                positionTypeLabel = 'Chair';
                break;
            case CCAType.Culture:
                positionTypeLabel = 'Head';
                break;
            case CCAType.Sports:
                positionTypeLabel = 'Captain';
                break;
            case CCAType.JCRC:
                positionTypeLabel = 'Director';
                break;
            default:
                break;
        }
    }

    return (
        <Badge
            label={capitalizeWords(positionTypeLabel)}
            backgroundColor={backgroundColor}
            textColor={textColor}
            style={style}
        />
    );
};

export default PositionTypeBadge;
