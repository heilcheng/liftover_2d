import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { theme, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { StreakCounter } from './StreakCounter';
import { isToday } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onPress: (habitId: string) => void;
  showStreak?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggle,
  onPress,
  showStreak = true,
}) => {
  const scaleAnimation = React.useRef(new Animated.Value(1)).current;
  const checkmarkAnimation = React.useRef(new Animated.Value(0)).current;

  const isCompletedToday = habit.completedDates.includes(
    new Date().toISOString().split('T')[0]
  );

  const handleToggle = () => {
    // Animate the card
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate checkmark if completing
    if (!isCompletedToday) {
      Animated.timing(checkmarkAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        checkmarkAnimation.setValue(0);
      });
    }

    onToggle(habit.id);
  };

  const getCompletionColor = () => {
    if (isCompletedToday) return theme.success;
    if (habit.currentStreak > 0) return theme.warning;
    return theme.textSecondary;
  };

  const getMotivationalMessage = () => {
    if (isCompletedToday) return 'Great job! 🎉';
    if (habit.currentStreak > 0) return `Keep the ${habit.currentStreak}-day streak! 🔥`;
    if (habit.longestStreak > 0) return `Your best was ${habit.longestStreak} days! 💪`;
    return 'Start building your streak! 💫';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnimation }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(habit.id)}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: habit.color },
              ]}
            />
            <View style={styles.titleText}>
              <Text style={styles.habitName}>{habit.name}</Text>
              {habit.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {habit.description}
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: isCompletedToday ? theme.success : theme.surface,
                borderColor: getCompletionColor(),
              },
            ]}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            {isCompletedToday && (
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: checkmarkAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.background}
                />
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.motivationalText}>
            {getMotivationalMessage()}
          </Text>
          
          {showStreak && (
            <StreakCounter
              streakData={{
                currentStreak: habit.currentStreak,
                longestStreak: habit.longestStreak,
              }}
              size="small"
              showLongest={false}
            />
          )}
        </View>

        {habit.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{habit.category}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  titleText: {
    flex: 1,
  },
  habitName: {
    ...typography.h3,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: theme.textSecondary,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  motivationalText: {
    ...typography.caption,
    color: theme.textSecondary,
    flex: 1,
  },
  categoryContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: theme.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.small,
    color: theme.textSecondary,
  },
}); 