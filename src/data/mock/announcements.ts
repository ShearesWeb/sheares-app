// src/data/mocks/mockEvents.ts
import { Announcement } from '@/types/announcement';

const now = new Date();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

export const mockAnnouncements: Announcement[] = [
    {
        id: 1,
        title: 'Welcome to the New Semester!',
        content: 'We’re excited to kick off another semester filled with activities, workshops, and more. Stay tuned for upcoming events!',
        createdAt: new Date(now.getTime() - 7 * day), // 7 days ago
        updatedAt: null,
        expiresAt: new Date(now.getTime() + 7 * day),
        authorName: 'Rachel Tan',
        authorProfileUri: 'https://example.com/profiles/rachel-tan.jpg',
    },
    {
        id: 2,
        title: 'Annual General Meeting (AGM)',
        content: 'Our AGM is scheduled for next week. All members are encouraged to attend as we discuss upcoming plans and vote for next term’s committee.',
        createdAt: new Date(now.getTime() - 3 * day), // 3 days ago
        updatedAt: new Date(now.getTime() - 2 * day), // 2 days ago
        expiresAt: new Date(now.getTime() + 7 * day),
        authorName: 'Darren Lim',
        authorProfileUri: 'https://example.com/profiles/darren-lim.jpg',
    },
    {
        id: 3,
        title: 'CCA Appreciation Night',
        content: 'Join us for an evening of celebration as we thank all CCA members for their hard work and dedication. Dress code: Smart casual.',
        createdAt: new Date(now.getTime() - 1 * day), // 1 day ago
        updatedAt: null,
        expiresAt: new Date(now.getTime() + 7 * day),
        authorName: 'Mei Xin',
        authorProfileUri: null,
    },
    {
        id: 4,
        title: 'Volunteer Recruitment Drive',
        content: 'We’re looking for volunteers to support our upcoming welfare events. If you’re interested, sign up soon.',
        createdAt: new Date(now.getTime() - 12 * hour), // 12 hours ago
        updatedAt: null,
        expiresAt: new Date(now.getTime() + 7 * day),
        authorName: 'Jonathan Koh',
        authorProfileUri: 'https://example.com/profiles/jonathan-koh.jpg',
    },
    {
        id: 5,
        title: 'Important: Safety Measures Reminder',
        content: 'Please remember to follow all venue safety guidelines during events. Masks and sanitizers will be provided if needed.',
        createdAt: new Date(now.getTime() - 2 * hour), // 2 hours ago
        updatedAt: null,
        expiresAt: new Date(now.getTime() + 7 * day),
        authorName: 'Serena Lee',
        authorProfileUri: null,
    },
];