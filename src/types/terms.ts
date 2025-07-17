export interface TermsBlock {
    type: 'heading' | 'paragraph';
    text: string;
}

export interface TermsSection {
    id: string;
    title: string;
    content: TermsBlock[];
}

export interface TermsData {
    title: string;
    subtitle: string;
    lastUpdated: string;
    introTitle: string;
    intro: string;
    sections: TermsSection[];
}