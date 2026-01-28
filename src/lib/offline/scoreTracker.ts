/**
 * Offline Score Tracker
 * 
 * Handles golf score synchronization between local storage (offline)
 * and Supabase (online).
 */

import { createClient } from '@/lib/supabase/client';
import type { GolfScore, HoleScore } from '@/types';

const SCORES_STORAGE_KEY = 'golf_scores_offline';

/**
 * Get all local scores from localStorage
 */
export function getLocalScores(): GolfScore[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(SCORES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (err) {
        console.error('Failed to parse local scores:', err);
        return [];
    }
}

/**
 * Save a score locally
 */
export function saveScoreLocally(score: GolfScore) {
    if (typeof window === 'undefined') return;
    const scores = getLocalScores();
    const existingIdx = scores.findIndex(s => s.id === score.id);

    if (existingIdx >= 0) {
        scores[existingIdx] = { ...score, sync_status: 'local', updated_at: new Date().toISOString() };
    } else {
        scores.push({ ...score, sync_status: 'local', created_at: new Date().toISOString() });
    }

    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores));
}

/**
 * Sync local scores to Supabase
 */
export async function syncScores() {
    if (typeof window === 'undefined') return;
    const localScores = getLocalScores().filter(s => s.sync_status === 'local');
    if (localScores.length === 0) return;

    const supabase = createClient();
    const successfulSyncIds: string[] = [];

    for (const score of localScores) {
        try {
            const { error } = await supabase
                .from('golf_scores')
                .upsert({
                    id: score.id.includes('temp-') ? undefined : score.id,
                    user_id: score.user_id,
                    course_id: score.course_id,
                    booking_id: score.booking_id,
                    date: score.date,
                    scores: score.scores,
                    total_strokes: score.total_strokes,
                    sync_status: 'synced'
                });

            if (!error) {
                successfulSyncIds.push(score.id);
            }
        } catch (err) {
            console.error('Failed to sync score:', score.id, err);
        }
    }

    // Update local status
    if (successfulSyncIds.length > 0) {
        const allScores = getLocalScores();
        const updated = allScores.map(s =>
            successfulSyncIds.includes(s.id) ? { ...s, sync_status: 'synced' } : s
        );
        localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(updated));
    }
}

/**
 * Create a new score card template
 */
export function createScoreCard(userId: string, courseId: string, bookingId?: string): GolfScore {
    return {
        id: `temp-${Date.now()}`,
        user_id: userId,
        course_id: courseId,
        booking_id: bookingId || null,
        date: new Date().toISOString().split('T')[0],
        scores: {},
        total_strokes: 0,
        sync_status: 'local',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

/**
 * Update a specific hole score
 */
export function updateHoleScore(score: GolfScore, holeNumber: number, strokes: number, par: number): GolfScore {
    const newScores = {
        ...score.scores,
        [holeNumber]: { strokes, par }
    };

    const total = Object.values(newScores).reduce((sum, h) => sum + (h as HoleScore).strokes, 0);

    return {
        ...score,
        scores: newScores,
        total_strokes: total,
        updated_at: new Date().toISOString()
    };
}
