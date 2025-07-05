import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { theme, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { HabitService } from '../services/habitService';
import { StreakCounter } from '../components/StreakCounter';
import { ContributionGrid } from '../components/ContributionGrid';
import { ProgressBar } from '../components/ProgressBar';

interface HabitDetailScreenProps {
  navigation: any;
  route: { params: { habitId: string } };
}

const { width } = Dimensions.get('window');

export const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { habitId } = route.params;
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabit();
  }, [habitId]);

  const loadHabit = async () => {
    try {
      setLoading(true);
      const habits = await HabitService.getAllHabits();
      const foundHabit = habits.find(h => h.id === habitId);
      if (foundHabit) {
        setHabit(foundHabit);
      } else {
        Alert.alert('Error', 'Habit not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading habit:', error);
      Alert.alert('Error', 'Failed to load habit details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async () => {
    if (!habit) return;

    try {
      const updatedHabit = await HabitService.toggleHabitCompletion(habit.id);
      setHabit(updatedHabit);
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleDeleteHabit = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await HabitService.deleteHabit(habitId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const isCompletedToday = habit?.completedDates.includes(
    new Date().toISOString().split('T')[0]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading habit details...</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Habit not found</Text>
      </View>
    );
  }

  const completionRate = habit.totalCompletions > 0 
    ? Math.round((habit.totalCompletions / 30) * 100) 
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.colorIndicator,
              { backgroundColor: habit.color },
            ]}
          />
          <Text style={styles.habitName}>{habit.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteHabit}
        >
          <Ionicons name="trash-outline" size={24} color={theme.error} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      {habit.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{habit.description}</Text>
        </View>
      )}

      {/* Category */}
      {habit.category && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{habit.category}</Text>
        </View>
      )}

      {/* Streak Counter */}
      <View style={styles.streakSection}>
        <StreakCounter
          streakData={{
            currentStreak: habit.currentStreak,
            longestStreak: habit.longestStreak,
          }}
          size="large"
        />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{habit.totalCompletions}</Text>
            <Text style={styles.statLabel}>Total Completions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {habit.createdAt.toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Started</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <ProgressBar
          progress={completionRate}
          label="Completion Rate"
          value={`${habit.totalCompletions} completions`}
          color={habit.color}
        />
      </View>

      {/* Today's Action */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <TouchableOpacity
          style={[
            styles.completionButton,
            {
              backgroundColor: isCompletedToday ? theme.success : theme.surface,
              borderColor: isCompletedToday ? theme.success : habit.color,
            },
          ]}
          onPress={handleToggleCompletion}
        >
          <Ionicons
            name={isCompletedToday ? 'checkmark-circle' : 'ellipse-outline'}
            size={32}
            color={isCompletedToday ? theme.background : habit.color}
          />
          <Text
            style={[
              styles.completionText,
              {
                color: isCompletedToday ? theme.background : habit.color,
              },
            ]}
          >
            {isCompletedToday ? 'Completed Today!' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activity Graph */}
      <View style={styles.graphSection}>
        <Text style={styles.sectionTitle}>Activity History</Text>
        <ContributionGrid
          data={habit.completedDates.map(date => ({
            date,
            count: 1,
            habits: [habit.id],
          }))}
          showTooltip={false}
        />
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  errorText: {
    ...typography.body,
    color: theme.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  colorIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  habitName: {
    ...typography.h1,
    color: theme.text,
    flex: 1,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  categoryText: {
    ...typography.caption,
    color: theme.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
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
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.small,
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
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  completionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    ...shadows.medium,
  },
  completionText: {
    ...typography.h3,
    fontWeight: '600',
    marginLeft: spacing.md,
  },
  graphSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
}); 