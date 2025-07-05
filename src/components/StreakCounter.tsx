import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreakData } from '../types';
import { theme, spacing, typography, borderRadius, shadows } from '../utils/theme';

interface StreakCounterProps {
  streakData: StreakData;
  size?: 'small' | 'medium' | 'large';
  showLongest?: boolean;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  streakData,
  size = 'medium',
  showLongest = true,
}) => {
  const fireAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (streakData.currentStreak > 0) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(fireAnimation, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fireAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [streakData.currentStreak]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { padding: spacing.sm },
          iconSize: 16,
          textSize: typography.small,
          numberSize: { ...typography.h3, fontSize: 18 },
        };
      case 'large':
        return {
          container: { padding: spacing.lg },
          iconSize: 32,
          textSize: typography.body,
          numberSize: typography.h1,
        };
      default:
        return {
          container: { padding: spacing.md },
          iconSize: 24,
          textSize: typography.caption,
          numberSize: typography.h2,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderFireIcon = (streak: number) => {
    if (streak === 0) return null;

    const getFireColor = (streak: number) => {
      if (streak >= 7) return '#FF6B35'; // Orange for long streaks
      if (streak >= 3) return '#FFC800'; // Yellow for medium streaks
      return '#FF4B4B'; // Red for short streaks
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale: fireAnimation }],
        }}
      >
        <Ionicons
          name="flame"
          size={sizeStyles.iconSize}
          color={getFireColor(streak)}
        />
      </Animated.View>
    );
  };

  const renderStreakInfo = (label: string, streak: number, isCurrent: boolean = false) => (
    <View style={styles.streakInfo}>
      <View style={styles.streakHeader}>
        {isCurrent && renderFireIcon(streak)}
        <Text style={[styles.streakLabel, sizeStyles.textSize]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.streakNumber, sizeStyles.numberSize]}>
        {streak}
      </Text>
      <Text style={[styles.streakUnit, sizeStyles.textSize]}>
        {streak === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, sizeStyles.container]}>
      {renderStreakInfo('Current Streak', streakData.currentStreak, true)}
      {showLongest && streakData.longestStreak > 0 && (
        <View style={styles.divider} />
      )}
      {showLongest && streakData.longestStreak > 0 && (
        renderStreakInfo('Longest Streak', streakData.longestStreak)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.small,
  },
  streakInfo: {
    alignItems: 'center',
    flex: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  streakLabel: {
    color: theme.textSecondary,
    marginLeft: spacing.xs,
  },
  streakNumber: {
    color: theme.text,
    fontWeight: 'bold',
  },
  streakUnit: {
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: theme.surface,
  },
}); 