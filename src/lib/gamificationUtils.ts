/**
 * Centralized logic for mapping user XP to Levels.
 */

export const calculateUserLevel = (xp: number | undefined | null): number => {
    return Math.floor((xp || 0) / 100) + 1;
};

export const calculateNextLevelXp = (level: number): number => {
    return level * 100;
};

export const calculateLevelProgress = (xp: number | undefined | null): number => {
    const currentXp = xp || 0;
    return ((currentXp % 100) / 100) * 100;
};
