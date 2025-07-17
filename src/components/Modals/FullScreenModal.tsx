import React from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface ModalWrapperProps {
    visible: boolean;
    onClose: (event?: GestureResponderEvent) => void;
    children: React.ReactNode;
    animationType?: 'none' | 'slide' | 'fade';
    transparent?: boolean;
}

const FullScreenModal: React.FC<ModalWrapperProps> = ({
    visible,
    onClose,
    children,
    animationType = 'slide',
    transparent = false,
}) => {
    return (
        <Modal
            visible={visible}
            animationType={animationType}
            transparent={transparent}
            onRequestClose={onClose}
        >
            <View style={[styles.container, transparent && styles.transparentBackground]}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <AntDesign name="close" size={24} color={transparent ? '#fff' : '#333'} />
                </TouchableOpacity>

                {/* Modal content passed as children */}
                {children}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    transparentBackground: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
});

export default FullScreenModal;
