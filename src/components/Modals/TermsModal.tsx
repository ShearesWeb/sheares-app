import React, { useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    findNodeHandle,
    UIManager,
    TextStyle,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { AntDesign } from '@expo/vector-icons';
import { TermsBlock, TermsData } from '@/types/terms';
import FullScreenModal from './FullScreenModal';

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    termsData: TermsData;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose, termsData }) => {
    const scrollRef = useRef<ScrollView>(null);
    const sectionRefs = useRef<Record<string, View | null>>({});

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const scrollToSection = (id: string) => {
        const ref = sectionRefs.current[id];
        const scrollNode = scrollRef.current?.getInnerViewNode?.();
        if (ref && scrollNode) {
            const handle = findNodeHandle(ref);
            if (handle) {
                UIManager.measureLayout(
                    handle,
                    scrollNode,
                    () => { },
                    (_x, y) => {
                        scrollRef.current?.scrollTo({ y, animated: true });
                    }
                );
            }
        }
    };

    const renderBlock = (block: TermsBlock, idx: number) => {
        switch (block.type) {
            case 'heading':
                return (
                    <Text key={idx} style={styles.subheading}>
                        {block.text}
                    </Text>
                );
            case 'paragraph':
                const markdownText = block.text.replace(/\[\[(.*?)\]\]/g, (_match, id) => {
                    const target = termsData.sections.find((s) => s.id === id);
                    return `[${target?.title || id}](#${id})`;
                });

                return (
                    <Markdown
                        key={idx}
                        style={markdownStyles}
                        onLinkPress={(url) => {
                            const sectionId = url.replace('#', '');
                            scrollToSection(sectionId);
                            return true;
                        }}
                    >
                        {markdownText}
                    </Markdown>
                );
            default:
                return null;
        }
    };

    return (
        <FullScreenModal visible={visible} onClose={onClose}>
            <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{termsData.title}</Text>
                <Text style={styles.subtitle}>{termsData.subtitle}</Text>
                <Text style={styles.date}>Last updated on {termsData.lastUpdated}</Text>
                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>{termsData.introTitle}</Text>
                <Markdown style={markdownStyles}>{termsData.intro}</Markdown>

                <Text style={styles.sectionTitle}>TABLE OF CONTENTS</Text>
                {termsData.sections.map((section) => (
                    <TouchableOpacity key={section.id} onPress={() => scrollToSection(section.id)}>
                        <Text style={styles.tocItem}>{section.title}</Text>
                    </TouchableOpacity>
                ))}

                {termsData.sections.map((section) => (
                    <View
                        key={section.id}
                        ref={(ref) => {
                            sectionRefs.current[section.id] = ref;
                        }}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.content.map((block, idx) => renderBlock(block, idx))}
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.fab} onPress={scrollToTop}>
                <AntDesign name="arrowup" size={24} color="#fff" />
            </TouchableOpacity>
        </FullScreenModal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
    closeButton: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
    closeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    scrollContent: { paddingBottom: 80 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 18, textAlign: 'center', color: '#555' },
    date: { fontSize: 14, textAlign: 'center', color: '#999', marginBottom: 12 },
    divider: { height: 1, backgroundColor: '#ccc', marginVertical: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 10 },
    tocItem: { fontSize: 16, color: '#007bff', paddingVertical: 4 },
    subheading: { fontSize: 16, fontWeight: '600', marginTop: 10 },
    section: { marginTop: 20 },
    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        backgroundColor: '#f18437',
        borderRadius: 28,
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

const markdownStyles: { [key: string]: TextStyle } = {
    body: { fontSize: 14, lineHeight: 24, color: '#333', textAlign: 'justify' },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    link: { color: '#007bff', textDecorationLine: 'underline' },
};

export default TermsModal;
