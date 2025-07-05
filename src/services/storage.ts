import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCompletion } from '../types';

const HABITS_KEY = '@habits';
const COMPLETIONS_KEY = '@completions';

export class StorageService {
  // Habit management
  static async getHabits(): Promise<Habit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(HABITS_KEY);
      if (habitsJson) {
        const habits = JSON.parse(habitsJson);
        // Convert string dates back to Date objects
        return habits.map((habit: any) => ({
          ...habit,
          createdAt: new Date(habit.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  }

  static async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  }

  static async addHabit(habit: Habit): Promise<void> {
    try {
      const habits = await this.getHabits();
      habits.push(habit);
      await this.saveHabits(habits);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }

  static async updateHabit(updatedHabit: Habit): Promise<void> {
    try {
      const habits = await this.getHabits();
      const index = habits.findIndex(habit => habit.id === updatedHabit.id);
      if (index !== -1) {
        habits[index] = updatedHabit;
        await this.saveHabits(habits);
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    try {
      const habits = await this.getHabits();
      const filteredHabits = habits.filter(habit => habit.id !== habitId);
      await this.saveHabits(filteredHabits);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }

  // Completion management
  static async getCompletions(): Promise<HabitCompletion[]> {
    try {
      const completionsJson = await AsyncStorage.getItem(COMPLETIONS_KEY);
      return completionsJson ? JSON.parse(completionsJson) : [];
    } catch (error) {
      console.error('Error getting completions:', error);
      return [];
    }
  }

  static async saveCompletions(completions: HabitCompletion[]): Promise<void> {
    try {
      await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving completions:', error);
    }
  }

  static async toggleHabitCompletion(habitId: string, date: string): Promise<void> {
    try {
      const completions = await this.getCompletions();
      const existingIndex = completions.findIndex(
        comp => comp.habitId === habitId && comp.date === date
      );

      if (existingIndex !== -1) {
        // Toggle completion
        completions[existingIndex].completed = !completions[existingIndex].completed;
      } else {
        // Add new completion
        completions.push({
          habitId,
          date,
          completed: true,
        });
      }

      await this.saveCompletions(completions);
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  }

  static async getHabitCompletions(habitId: string): Promise<string[]> {
    try {
      const completions = await this.getCompletions();
      return completions
        .filter(comp => comp.habitId === habitId && comp.completed)
        .map(comp => comp.date);
    } catch (error) {
      console.error('Error getting habit completions:', error);
      return [];
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([HABITS_KEY, COMPLETIONS_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static async exportData(): Promise<{ habits: Habit[]; completions: HabitCompletion[] }> {
    try {
      const habits = await this.getHabits();
      const completions = await this.getCompletions();
      return { habits, completions };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { habits: [], completions: [] };
    }
  }

  static async importData(data: { habits: Habit[]; completions: HabitCompletion[] }): Promise<void> {
    try {
      await this.saveHabits(data.habits);
      await this.saveCompletions(data.completions);
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }
} 