import React from 'react';
import {
    Modal as ModalRN,
    View,
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    ScrollView,
    Text,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface ModalWrapperProps {
    visible: boolean;
    onClose: (event?: GestureResponderEvent) => void;
    children: React.ReactNode;
    title?: string; // Optional title prop
    animationType?: 'none' | 'slide' | 'fade';
    transparent?: boolean;
    maxWidth?: number | string;
    maxHeight?: number | string;
}

const CLOSE_BUTTON_SIZE = 40;

const Modal: React.FC<ModalWrapperProps> = ({
    visible,
    onClose,
    children,
    title,
    animationType = 'fade',
    transparent = true,
    maxWidth,
    maxHeight,
}) => {
    return (
        <ModalRN
            visible={visible}
            animationType={animationType}
            transparent={transparent}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.backdrop}>
                <TouchableOpacity
                    style={styles.backdropTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={[styles.modalContent, {
                    maxWidth: maxWidth as any ?? '80%',
                    maxHeight: maxHeight as any ?? '80%',
                }]}>
                    <View style={styles.header}>
                        {/* Left spacer */}
                        <View style={{ width: CLOSE_BUTTON_SIZE }} />

                        {/* Title */}
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                            {title}
                        </Text>

                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <AntDesign name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {children}
                    </ScrollView>
                </View>
            </View>
        </ModalRN>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdropTouchable: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        width: '80%',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    closeButton: {
        width: CLOSE_BUTTON_SIZE,
        height: CLOSE_BUTTON_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        textAlign: 'center',
    },
    contentContainer: {
        paddingBottom: 10,
    },
});

export default Modal;
