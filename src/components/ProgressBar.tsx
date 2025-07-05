import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { theme, spacing, typography, borderRadius } from '../utils/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label: string;
  value?: string | number;
  color?: string;
  showPercentage?: boolean;
  height?: number;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  value,
  color = theme.primary,
  showPercentage = true,
  height = 8,
  animated = true,
}) => {
  const progressAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(progressAnimation, {
        toValue: Math.min(progress, 100),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnimation.setValue(Math.min(progress, 100));
    }
  }, [progress, animated]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return theme.success;
    if (progress >= 60) return theme.primary;
    if (progress >= 40) return theme.warning;
    return theme.error;
  };

  const progressColor = color || getProgressColor(progress);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          {value && <Text style={styles.value}>{value}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      </View>
      
      <View style={[styles.progressContainer, { height }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: progressColor,
              width: progressAnimation.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = theme.primary,
}) => {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        )}
        <View style={styles.statsText}>
          <Text style={styles.statsTitle}>{title}</Text>
          {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: theme.text,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    ...typography.caption,
    color: theme.textSecondary,
    marginRight: spacing.xs,
  },
  percentage: {
    ...typography.caption,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.round,
  },
  statsCard: {
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconText: {
    fontSize: 16,
    color: theme.background,
  },
  statsText: {
    flex: 1,
  },
  statsTitle: {
    ...typography.caption,
    color: theme.text,
    fontWeight: '600',
  },
  statsSubtitle: {
    ...typography.small,
    color: theme.textSecondary,
  },
  statsValue: {
    ...typography.h2,
    fontWeight: 'bold',
  },
}); 