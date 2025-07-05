import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, AppStats } from '../types';
import { theme, spacing, typography, borderRadius } from '../utils/theme';
import { HabitService } from '../services/habitService';
import { HabitCard } from '../components/HabitCard';
import { StreakCounter } from '../components/StreakCounter';
import { ContributionGrid } from '../components/ContributionGrid';
import { ProgressBar } from '../components/ProgressBar';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [contributionData, setContributionData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, statsData, contributionData] = await Promise.all([
        HabitService.getAllHabits(),
        HabitService.getAppStats(),
        HabitService.getContributionData(),
      ]);
      
      setHabits(habitsData);
      setStats(statsData);
      setContributionData(contributionData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load habits data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const updatedHabit = await HabitService.toggleHabitCompletion(habitId);
      setHabits(prevHabits =>
        prevHabits.map(habit =>
          habit.id === habitId ? updatedHabit : habit
        )
      );
      
      // Reload stats and contribution data
      const [newStats, newContributionData] = await Promise.all([
        HabitService.getAppStats(),
        HabitService.getContributionData(),
      ]);
      setStats(newStats);
      setContributionData(newContributionData);
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleHabitPress = (habitId: string) => {
    navigation.navigate('HabitDetail', { habitId });
  };

  const handleAddHabit = () => {
    navigation.navigate('AddHabit');
  };

  const getOverallStreak = () => {
    if (!habits.length) return { currentStreak: 0, longestStreak: 0 };
    
    const maxCurrentStreak = Math.max(...habits.map(h => h.currentStreak));
    const maxLongestStreak = Math.max(...habits.map(h => h.longestStreak));
    
    return {
      currentStreak: maxCurrentStreak,
      longestStreak: maxLongestStreak,
    };
  };

  const getMotivationalMessage = () => {
    if (!habits.length) return 'Start your habit journey! 🚀';
    
    const completedToday = habits.filter(habit =>
      habit.completedDates.includes(new Date().toISOString().split('T')[0])
    ).length;
    
    if (completedToday === habits.length) return 'Perfect day! All habits completed! 🎉';
    if (completedToday > 0) return `Great progress! ${completedToday}/${habits.length} habits done today! 💪`;
    return 'Ready to build some habits? Let\'s go! 🔥';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.motivationalText}>
            {getMotivationalMessage()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddHabit}
        >
          <Ionicons name="add" size={24} color={theme.background} />
        </TouchableOpacity>
      </View>

      {/* Overall Streak */}
      {habits.length > 0 && (
        <View style={styles.streakSection}>
          <StreakCounter
            streakData={getOverallStreak()}
            size="large"
          />
        </View>
      )}

      {/* Quick Stats */}
      {stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalHabits}</Text>
              <Text style={styles.statLabel}>Total Habits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.activeHabits}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalCompletions}</Text>
              <Text style={styles.statLabel}>Completions</Text>
            </View>
          </View>
        </View>
      )}

      {/* Habits List */}
      <View style={styles.habitsSection}>
        <Text style={styles.sectionTitle}>Your Habits</Text>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list" size={48} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>
              Create your first habit to start tracking your progress!
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleAddHabit}
            >
              <Text style={styles.createButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggleHabit}
              onPress={handleHabitPress}
            />
          ))
        )}
      </View>

      {/* Contribution Graph */}
      {habits.length > 0 && contributionData.length > 0 && (
        <View style={styles.contributionSection}>
          <Text style={styles.sectionTitle}>Activity Graph</Text>
          <ContributionGrid data={contributionData} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    ...typography.body,
    color: theme.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  motivationalText: {
    ...typography.body,
    color: theme.textSecondary,
  },
  addButton: {
    backgroundColor: theme.primary,
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: theme.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: theme.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  habitsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyTitle: {
    ...typography.h3,
    color: theme.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  createButtonText: {
    ...typography.body,
    color: theme.background,
    fontWeight: '600',
  },
  contributionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
}); 