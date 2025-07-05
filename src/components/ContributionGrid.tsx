import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { ContributionData } from '../types';
import { theme, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { getMonthName, getRelativeDateString } from '../utils/dateUtils';

interface ContributionGridProps {
  data: ContributionData[];
  onDayPress?: (date: string, count: number) => void;
  showTooltip?: boolean;
}

const { width } = Dimensions.get('window');
const GRID_SIZE = Math.min((width - spacing.lg * 2) / 53, 12); // 53 weeks max
const CELL_SIZE = Math.max(GRID_SIZE - 1, 8);

export const ContributionGrid: React.FC<ContributionGridProps> = ({
  data,
  onDayPress,
  showTooltip = true,
}) => {
  const getColorForCount = (count: number): string => {
    if (count === 0) return '#EBEDF0';
    if (count === 1) return '#9BE9A8';
    if (count === 2) return '#40C463';
    if (count === 3) return '#30A14E';
    return '#216E39';
  };

  const handleDayPress = (date: string, count: number) => {
    if (onDayPress) {
      onDayPress(date, count);
    } else if (showTooltip) {
      const dateString = getRelativeDateString(date);
      const habitText = count === 1 ? 'habit' : 'habits';
      Alert.alert(
        dateString,
        `${count} ${habitText} completed`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderWeek = (weekData: ContributionData[], weekIndex: number) => {
    return (
      <View key={weekIndex} style={styles.weekContainer}>
        {weekData.map((day, dayIndex) => (
          <TouchableOpacity
            key={`${weekIndex}-${dayIndex}`}
            style={[
              styles.cell,
              {
                backgroundColor: getColorForCount(day.count),
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
            onPress={() => handleDayPress(day.date, day.count)}
            activeOpacity={0.7}
          />
        ))}
      </View>
    );
  };

  const renderMonthLabels = () => {
    const months: { month: string; weekIndex: number }[] = [];
    let currentMonth = '';
    
    data.forEach((day, index) => {
      const month = getMonthName(day.date);
      if (month !== currentMonth) {
        months.push({ month, weekIndex: Math.floor(index / 7) });
        currentMonth = month;
      }
    });

    return (
      <View style={styles.monthLabelsContainer}>
        {months.map(({ month, weekIndex }, index) => (
          <Text
            key={index}
            style={[
              styles.monthLabel,
              { marginLeft: weekIndex * (CELL_SIZE + 1) },
            ]}
          >
            {month}
          </Text>
        ))}
      </View>
    );
  };

  const renderLegend = () => {
    const legendItems = [
      { count: 0, label: 'Less' },
      { count: 1, label: '' },
      { count: 2, label: '' },
      { count: 3, label: '' },
      { count: 4, label: 'More' },
    ];

    return (
      <View style={styles.legendContainer}>
        <Text style={styles.legendText}>Less</Text>
        {legendItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.legendCell,
              {
                backgroundColor: getColorForCount(item.count),
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    );
  };

  // Group data into weeks (7 days each)
  const weeks: ContributionData[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {renderMonthLabels()}
      <View style={styles.gridContainer}>
        {weeks.map((week, index) => renderWeek(week, index))}
      </View>
      {renderLegend()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  monthLabelsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    height: 20,
  },
  monthLabel: {
    ...typography.caption,
    color: theme.textSecondary,
    position: 'absolute',
  },
  gridContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weekContainer: {
    flexDirection: 'column',
  },
  cell: {
    margin: 0.5,
    borderRadius: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendCell: {
    marginHorizontal: 1,
    borderRadius: 2,
  },
  legendText: {
    ...typography.small,
    color: theme.textSecondary,
    marginHorizontal: spacing.sm,
  },
}); 