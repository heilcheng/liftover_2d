import { Habit, AppStats, ContributionData } from '../types';
import { StorageService } from './storage';
import { calculateStreak, generateContributionData, getToday } from '../utils/dateUtils';

export class HabitService {
  static async getAllHabits(): Promise<Habit[]> {
    const habits = await StorageService.getHabits();
    
    // Update streaks for all habits
    const updatedHabits = await Promise.all(
      habits.map(async (habit) => {
        const completions = await StorageService.getHabitCompletions(habit.id);
        const streakData = calculateStreak(completions);
        
        return {
          ...habit,
          currentStreak: streakData.currentStreak,
          longestStreak: Math.max(habit.longestStreak, streakData.longestStreak),
          totalCompletions: completions.length,
          completedDates: completions,
        };
      })
    );

    // Save updated habits
    await StorageService.saveHabits(updatedHabits);
    
    return updatedHabits;
  }

  static async createHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'currentStreak' | 'longestStreak' | 'totalCompletions'>): Promise<Habit> {
    const newHabit: Habit = {
      ...habitData,
      id: this.generateId(),
      createdAt: new Date(),
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
    };

    await StorageService.addHabit(newHabit);
    return newHabit;
  }

  static async toggleHabitCompletion(habitId: string, date: string = getToday()): Promise<Habit> {
    await StorageService.toggleHabitCompletion(habitId, date);
    
    // Get updated habit with new streak data
    const habits = await this.getAllHabits();
    const updatedHabit = habits.find(habit => habit.id === habitId);
    
    if (!updatedHabit) {
      throw new Error('Habit not found');
    }

    return updatedHabit;
  }

  static async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const habits = await StorageService.getHabits();
    const habitIndex = habits.findIndex(habit => habit.id === habitId);
    
    if (habitIndex === -1) {
      throw new Error('Habit not found');
    }

    const updatedHabit = { ...habits[habitIndex], ...updates };
    await StorageService.updateHabit(updatedHabit);
    
    return updatedHabit;
  }

  static async deleteHabit(habitId: string): Promise<void> {
    await StorageService.deleteHabit(habitId);
  }

  static async getHabitStats(habitId: string): Promise<{
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    lastCompletedDate?: string;
  }> {
    const completions = await StorageService.getHabitCompletions(habitId);
    const streakData = calculateStreak(completions);
    
    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = completions.filter(date => new Date(date) >= thirtyDaysAgo);
    const completionRate = (recentCompletions.length / 30) * 100;

    return {
      totalCompletions: completions.length,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      completionRate: Math.round(completionRate),
      lastCompletedDate: streakData.lastCompletedDate,
    };
  }

  static async getAppStats(): Promise<AppStats> {
    const habits = await this.getAllHabits();
    const today = getToday();
    
    const totalHabits = habits.length;
    const activeHabits = habits.filter(habit => habit.currentStreak > 0).length;
    const totalCompletions = habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
    
    // Calculate weekly progress (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCompletions = habits.reduce((sum, habit) => {
      const recentCompletions = habit.completedDates.filter(date => new Date(date) >= weekAgo);
      return sum + recentCompletions.length;
    }, 0);
    const weeklyProgress = totalHabits > 0 ? (weeklyCompletions / (totalHabits * 7)) * 100 : 0;
    
    // Calculate monthly progress (last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyCompletions = habits.reduce((sum, habit) => {
      const recentCompletions = habit.completedDates.filter(date => new Date(date) >= monthAgo);
      return sum + recentCompletions.length;
    }, 0);
    const monthlyProgress = totalHabits > 0 ? (monthlyCompletions / (totalHabits * 30)) * 100 : 0;

    return {
      totalHabits,
      activeHabits,
      totalCompletions,
      currentDate: today,
      weeklyProgress: Math.round(weeklyProgress),
      monthlyProgress: Math.round(monthlyProgress),
    };
  }

  static async getContributionData(): Promise<ContributionData[]> {
    const habits = await this.getAllHabits();
    const allCompletions = new Map<string, string[]>();
    
    // Collect all completion dates
    habits.forEach(habit => {
      habit.completedDates.forEach(date => {
        if (!allCompletions.has(date)) {
          allCompletions.set(date, []);
        }
        allCompletions.get(date)!.push(habit.id);
      });
    });

    // Generate contribution data for last 365 days
    const contributionData: ContributionData[] = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const habitIds = allCompletions.get(dateString) || [];
      
      contributionData.push({
        date: dateString,
        count: habitIds.length,
        habits: habitIds,
      });
    }

    return contributionData;
  }

  static async getTopHabits(limit: number = 5): Promise<Habit[]> {
    const habits = await this.getAllHabits();
    return habits
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, limit);
  }

  static async getHabitsByCategory(category: string): Promise<Habit[]> {
    const habits = await this.getAllHabits();
    return habits.filter(habit => habit.category === category);
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 