import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, AppStats } from '../types';
import { theme, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { HabitService } from '../services/habitService';
import { ContributionGrid } from '../components/ContributionGrid';
import { ProgressBar, StatsCard } from '../components/ProgressBar';
import { StreakCounter } from '../components/StreakCounter';

interface StatsScreenProps {
  navigation: any;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
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
      console.error('Error loading stats:', error);
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

  const getOverallStreak = () => {
    if (!habits.length) return { currentStreak: 0, longestStreak: 0 };
    
    const maxCurrentStreak = Math.max(...habits.map(h => h.currentStreak));
    const maxLongestStreak = Math.max(...habits.map(h => h.longestStreak));
    
    return {
      currentStreak: maxCurrentStreak,
      longestStreak: maxLongestStreak,
    };
  };

  const getTopHabits = () => {
    return habits
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 3);
  };

  const getCategoryStats = () => {
    const categoryMap = new Map<string, { count: number; totalStreak: number }>();
    
    habits.forEach(habit => {
      if (habit.category) {
        const existing = categoryMap.get(habit.category) || { count: 0, totalStreak: 0 };
        categoryMap.set(habit.category, {
          count: existing.count + 1,
          totalStreak: existing.totalStreak + habit.currentStreak,
        });
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      avgStreak: Math.round(data.totalStreak / data.count),
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading statistics...</Text>
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
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>Track your progress</Text>
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
        <View style={styles.quickStatsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Habits"
              value={stats.totalHabits}
              icon="📊"
              color={theme.primary}
            />
            <StatsCard
              title="Active Habits"
              value={stats.activeHabits}
              icon="🔥"
              color={theme.streak}
            />
            <StatsCard
              title="Total Completions"
              value={stats.totalCompletions}
              icon="✅"
              color={theme.success}
            />
          </View>
        </View>
      )}

      {/* Progress Bars */}
      {stats && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <ProgressBar
            progress={stats.weeklyProgress}
            label="This Week"
            value={`${stats.weeklyProgress}%`}
            color={theme.primary}
          />
          <ProgressBar
            progress={stats.monthlyProgress}
            label="This Month"
            value={`${stats.monthlyProgress}%`}
            color={theme.secondary}
          />
        </View>
      )}

      {/* Top Performing Habits */}
      {habits.length > 0 && (
        <View style={styles.topHabitsSection}>
          <Text style={styles.sectionTitle}>Top Performing Habits</Text>
          {getTopHabits().map((habit, index) => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitItem}
              onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
            >
              <View style={styles.habitRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitCategory}>{habit.category}</Text>
              </View>
              <View style={styles.habitStats}>
                <Text style={styles.streakText}>{habit.currentStreak} day streak</Text>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: habit.color },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category Breakdown */}
      {getCategoryStats().length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>By Category</Text>
          {getCategoryStats().map(({ category, count, avgStreak }) => (
            <View key={category} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryCount}>{count} habits</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.avgStreakText}>{avgStreak} day avg</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Activity Graph */}
      {contributionData.length > 0 && (
        <View style={styles.graphSection}>
          <Text style={styles.sectionTitle}>Activity Graph</Text>
          <ContributionGrid data={contributionData} />
        </View>
      )}

      {/* Empty State */}
      {habits.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptyText}>
            Create your first habit to start seeing statistics and progress!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>
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
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    ...typography.h1,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: theme.textSecondary,
  },
  streakSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickStatsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: theme.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    gap: spacing.md,
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  topHabitsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  habitRank: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    ...typography.caption,
    color: theme.background,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    ...typography.body,
    color: theme.text,
    fontWeight: '600',
  },
  habitCategory: {
    ...typography.caption,
    color: theme.textSecondary,
  },
  habitStats: {
    alignItems: 'flex-end',
  },
  streakText: {
    ...typography.caption,
    color: theme.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.round,
  },
  categorySection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.body,
    color: theme.text,
    fontWeight: '600',
  },
  categoryCount: {
    ...typography.caption,
    color: theme.textSecondary,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  avgStreakText: {
    ...typography.caption,
    color: theme.primary,
    fontWeight: '600',
  },
  graphSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
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
}); 