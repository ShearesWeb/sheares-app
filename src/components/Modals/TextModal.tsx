import React from 'react';
import {
    StyleSheet,
    GestureResponderEvent,
    Text,
} from 'react-native';
import Modal from './Modal';


export interface ModalMessage {
    title: string;
    message: string;
}

interface ModalWrapperProps {
    onClose: (event?: GestureResponderEvent) => void;
    message: ModalMessage | null;
}

const CLOSE_BUTTON_SIZE = 40;

const TextModal: React.FC<ModalWrapperProps> = ({
    onClose,
    message,
}) => {
    return (
        <Modal visible={!!message} title={message?.title} onClose={onClose}>
            <Text style={styles.modalText}>{message?.message} </Text>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
});

export default TextModal;
