import img1 from '@assets/stock_images/scenic_mountain_land_0e735cd1.jpg';
import img2 from '@assets/stock_images/tropical_beach_with__7068561d.jpg';
import img3 from '@assets/stock_images/cozy_european_street_f6c0c131.jpg';

// Re-export Entry type from shared schema
export type { Entry } from '@shared/schema';

// ⚠️ DEPRECATED: These mock entries are no longer used in the application
// All pages now fetch data from MongoDB via the API
// This file is kept for reference only and can be deleted

// Mock entries for development/demo purposes only
// In production, fetch from API: GET /api/entries/user/:userId
export const mockEntries = [
  {
    id: "1",
    title: "Alpine Adventures",
    location: "Swiss Alps, Switzerland",
    coordinates: [46.56, 8.56] as [number, number],
    date: "2023-12-15",
    description: "The air was crisp, the snow was perfect. We spent three days hiking through the trails, enjoying the breathtaking views of the Matterhorn. The fondue at the local chalet was the perfect way to end each day.",
    images: [img1, img3]
  },
  {
    id: "2",
    title: "Tropical Paradise Escape",
    location: "Bali, Indonesia",
    coordinates: [-8.34, 115.09] as [number, number],
    date: "2024-03-10",
    description: "Bali is truly a magical place. From the vibrant culture in Ubud to the serene beaches of Uluwatu. We woke up early to catch the sunrise and it was absolutely worth it. The colors of the sky were unlike anything I've ever seen.",
    images: [img2, img1]
  },
  {
    id: "3",
    title: "European Coffee Culture",
    location: "Paris, France",
    coordinates: [48.85, 2.35] as [number, number],
    date: "2024-05-22",
    description: "There's nothing quite like sitting at a sidewalk cafe in Paris, sipping an espresso and watching the world go by. The architecture, the fashion, the history - it's all so inspiring. We visited the Louvre and got lost in the Marais.",
    images: [img3, img2]
  },
  {
    id: "4",
    title: "Hidden Gems of Kyoto",
    location: "Kyoto, Japan",
    coordinates: [35.01, 135.76] as [number, number],
    date: "2024-11-05",
    description: "Kyoto in autumn is spectacular. The red maples against the traditional temples create a scene straight out of a painting. We found a small ramen shop tucked away in an alley that served the best broth I've ever tasted.",
    images: [img1, img3]
  }
];

// ============================================
// API Helper Functions
// ============================================

/**
 * Fetch all entries for a user from MongoDB
 * @param userId - The user's MongoDB ObjectId
 * @returns Array of journal entries
 */
export async function fetchUserEntries(userId: string) {
  const response = await fetch(`/api/entries/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch entries');
  }
  return response.json();
}

/**
 * Search entries for a user
 * @param userId - The user's MongoDB ObjectId
 * @param query - Search query string
 * @returns Array of matching journal entries
 */
export async function searchEntries(userId: string, query: string) {
  const response = await fetch(`/api/entries/user/${userId}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search entries');
  }
  return response.json();
}

/**
 * Create a new journal entry
 * @param entry - Entry data (without id)
 * @returns Created entry with id
 */
export async function createEntry(entry: {
  userId: string;
  title: string;
  location: string;
  coordinates: [number, number];
  date: string | Date;
  description: string;
  images?: string[];
}) {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create entry');
  }
  return response.json();
}

/**
 * Update an existing journal entry
 * @param entryId - Entry MongoDB ObjectId
 * @param userId - User MongoDB ObjectId (for authorization)
 * @param updates - Partial entry data to update
 * @returns Updated entry
 */
export async function updateEntry(
  entryId: string,
  userId: string,
  updates: Partial<{
    title: string;
    location: string;
    coordinates: [number, number];
    date: string | Date;
    description: string;
    images: string[];
  }>
) {
  const response = await fetch(`/api/entries/${entryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, userId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update entry');
  }
  return response.json();
}

/**
 * Delete a journal entry
 * @param entryId - Entry MongoDB ObjectId
 * @param userId - User MongoDB ObjectId (for authorization)
 */
export async function deleteEntry(entryId: string, userId: string) {
  const response = await fetch(`/api/entries/${entryId}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete entry');
  }
}
