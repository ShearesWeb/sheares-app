import { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from '@/types/announcement';
import { InMemoryCache } from '@/utils/cache';
import { createAnnouncementApi, deleteAnnouncementApi, fetchAllAnnouncementApi, fetchAnnouncementApi, updateAnnouncementApi } from '../api/announcements';

const AnnouncementsCache: InMemoryCache = new InMemoryCache();
const CACHE_KEY = 'announcements'

export async function getAllAnnouncements(): Promise<Announcement[]> {
    const cached = AnnouncementsCache.get<Announcement[]>(CACHE_KEY);
    if (cached) {
        return cached;
    }

    const announcements = await fetchAllAnnouncementApi();
    const announcementsById: Record<string, Announcement> = {};
    for (const ann of announcements) {
        announcementsById[ann.id.toString()] = ann;
    }

    AnnouncementsCache.hsetall(CACHE_KEY, announcementsById)
    return announcements
}



export async function getAnnouncement(id: number): Promise<Announcement | null> {
    const cached = AnnouncementsCache.hget<Announcement>(CACHE_KEY, id.toString());
    if (cached) return cached;

    return fetchAnnouncementApi(id);
}


export async function createAnnouncement(announcement: CreateAnnouncementInput): Promise<Announcement> {
    // Call your API to create the announcement, expect returned announcement with assigned id
    const data = await createAnnouncementApi(announcement);
    const newAnnouncement: Announcement = { id: data.id, created_at: data.created_at, ...announcement }

    // Add created announcement to cache by id
    AnnouncementsCache.hset(CACHE_KEY, data.id.toString(), newAnnouncement);

    return newAnnouncement;
}


export async function updateAnnouncement(update: UpdateAnnouncementInput): Promise<void> {
    await updateAnnouncementApi(update);

    // Update announcement in cache
    const announcement = AnnouncementsCache.hget<Announcement>(CACHE_KEY, update.id.toString());
    if (!announcement) return;

    if (update.title) announcement.title = update.title;
    if (update.content) announcement.content = update.content;
    if (update.expires_at) update.expires_at = announcement.expires_at;

    AnnouncementsCache.hset(CACHE_KEY, update.id.toString(), announcement);
    return;
}

export async function deleteAnnouncement(id: number): Promise<void> {
    const announcementIdStr = id.toString();

    await deleteAnnouncementApi(id);

    // Remove from announcements byId cache
    AnnouncementsCache.hdel(CACHE_KEY, announcementIdStr);
    return;
}
