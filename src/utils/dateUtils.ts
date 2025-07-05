import { ContributionData, StreakData } from '../types';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getDateFromString = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = getDateFromString(startDate);
  const end = getDateFromString(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
};

export const getLast365Days = (): string[] => {
  const dates: string[] = [];
  for (let i = 364; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
};

export const calculateStreak = (completedDates: string[]): StreakData => {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = getToday();
  const sortedDates = [...completedDates].sort().reverse();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = '';

  // Calculate current streak
  if (sortedDates[0] === today) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const daysDiff = getDaysBetween(sortedDates[i], sortedDates[i - 1]);
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (getDaysBetween(sortedDates[0], today) === 1) {
    // Yesterday was completed, check if we have a streak
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const daysDiff = getDaysBetween(sortedDates[i], sortedDates[i - 1]);
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
      lastDate = sortedDates[i];
    } else {
      const daysDiff = getDaysBetween(sortedDates[i], lastDate);
      if (daysDiff === 1) {
        tempStreak++;
        lastDate = sortedDates[i];
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        lastDate = sortedDates[i];
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: sortedDates[0],
  };
};

export const generateContributionData = (
  completedDates: string[],
  startDate?: string
): ContributionData[] => {
  const dates = getLast365Days();
  const contributionData: ContributionData[] = [];

  dates.forEach(date => {
    const isCompleted = completedDates.includes(date);
    contributionData.push({
      date,
      count: isCompleted ? 1 : 0,
      habits: isCompleted ? ['default'] : [],
    });
  });

  return contributionData;
};

export const getWeekNumber = (date: string): number => {
  const d = getDateFromString(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getMonthName = (date: string): string => {
  const d = getDateFromString(date);
  return d.toLocaleDateString('en-US', { month: 'short' });
};

export const isToday = (date: string): boolean => {
  return date === getToday();
};

export const isYesterday = (date: string): boolean => {
  return date === getDaysAgo(1);
};

export const getRelativeDateString = (date: string): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  
  const daysDiff = getDaysBetween(date, getToday());
  if (daysDiff <= 7) return `${daysDiff} days ago`;
  
  return getDateFromString(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}; 