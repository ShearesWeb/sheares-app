export function capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Format: "Tuesday, June 17"
export const formatFullWeekdayDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(date);
};

// Format: "17 Jun - 18 Jun"
export const formatShortDateRange = (start: Date, end: Date): string => {
    const startStr = new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
    }).format(start);
    const endStr = new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
    }).format(end);
    return `${startStr} - ${endStr}`;
};

// Format: "June 17, 2025 - June 18, 2025"
export const formatLongDateRange = (start: Date, end: Date): string => {
    const startStr = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(start);
    const endStr = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(end);
    return `${startStr} - ${endStr}`;
};

// Format: "9:12 AM - 8:11 PM"
export const formatTimeRange = (start: Date, end: Date): string => {
    const startStr = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(start);
    const endStr = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(end);
    return `${startStr} - ${endStr}`;
};


export function extractFirstName(name: string): string {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);
    const westernNames = new Set(['John', 'Daniel', 'Michael', 'David', 'James', 'Robert', 'Mary', 'Linda', 'Susan']); // add more if needed

    if (parts.length === 1) {
        return parts[0]; // single name
    }

    if (parts.length >= 3 && westernNames.has(parts[parts.length - 1])) {
        return parts[parts.length - 1]; // last word is a known western given name
    }

    if (parts.length === 2) {
        return parts[0]; // first word as given name, e.g. Amos Yee -> Amos
    }

    // For 3 parts and no western name last, return all except surname
    return parts.slice(1).join(' '); // e.g. Tan Wei Ming -> Wei Ming
}