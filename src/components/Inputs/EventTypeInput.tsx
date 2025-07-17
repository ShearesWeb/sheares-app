import { TextStyle, ViewStyle } from "react-native";
import Selector from "./Selector";
import { EventType } from "@/types/event";

export type EventTypeSelectorInputProps = {
    selected: string | null;
    onSelect: (value: EventType) => void;
    containerStyle?: ViewStyle;
    itemStyle?: ViewStyle;
    selectedTextStyle?: TextStyle;
};

const EventTypeSelector: React.FC<EventTypeSelectorInputProps> = ({
    selected, onSelect, containerStyle, itemStyle, selectedTextStyle

}) => {
    return <Selector
        options={[
            { value: EventType.Event, label: 'Event', selectedColor: '#1976d2', textColor: '#ffffff' },       // Blue
            { value: EventType.Fundraiser, label: 'Fundraiser', selectedColor: '#2e7d32', textColor: '#ffffff' }, // Green
            { value: EventType.Welfare, label: 'Welfare', selectedColor: '#8e24aa', textColor: '#ffffff' },   // Purple
            { value: EventType.Election, label: 'Election', selectedColor: '#c62828', textColor: '#ffffff' }, // Red
        ]}
        selected={selected}
        onSelect={(value: string) => onSelect(value as EventType)}
        containerStyle={containerStyle}
        itemStyle={itemStyle}
        selectedTextStyle={selectedTextStyle}
    />
}

export default EventTypeSelector