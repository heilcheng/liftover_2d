import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { theme, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { HabitService } from '../services/habitService';

interface AddHabitScreenProps {
  navigation: any;
}

const habitColors = [
  '#58CC02', // Duolingo green
  '#FFC800', // Duolingo yellow
  '#FF6B35', // Orange
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Mint
  '#FFEAA7', // Light yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Seafoam
  '#F7DC6F', // Gold
];

const habitCategories = [
  'Health & Fitness',
  'Learning',
  'Productivity',
  'Mindfulness',
  'Social',
  'Creative',
  'Finance',
  'Other',
];

export const AddHabitScreen: React.FC<AddHabitScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(habitColors[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [loading, setLoading] = useState(false);

  const handleCreateHabit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setLoading(true);
      
      const habitData = {
        name: name.trim(),
        description: description.trim() || undefined,
        category: selectedCategory,
        color: selectedColor,
        frequency,
      };

      await HabitService.createHabit(habitData);
      
      Alert.alert(
        'Success!',
        'Habit created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  const renderColorPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Choose Color</Text>
      <View style={styles.colorGrid}>
        {habitColors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              {
                backgroundColor: color,
                borderColor: selectedColor === color ? theme.text : 'transparent',
              },
            ]}
            onPress={() => setSelectedColor(color)}
          >
            {selectedColor === color && (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategoryPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.categoryGrid}>
        {habitCategories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryOption,
              {
                backgroundColor: selectedCategory === category ? theme.primary : theme.surface,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category ? theme.background : theme.text,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFrequencyPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Frequency</Text>
      <View style={styles.frequencyContainer}>
        {[
          { key: 'daily', label: 'Daily', icon: 'calendar' },
          { key: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
          { key: 'custom', label: 'Custom', icon: 'settings' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.frequencyOption,
              {
                backgroundColor: frequency === option.key ? theme.primary : theme.surface,
              },
            ]}
            onPress={() => setFrequency(option.key as any)}
          >
            <Ionicons
              name={option.icon as any}
              size={20}
              color={frequency === option.key ? theme.background : theme.text}
            />
            <Text
              style={[
                styles.frequencyText,
                {
                  color: frequency === option.key ? theme.background : theme.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Habit</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Read 30 minutes"
              placeholderTextColor={theme.textSecondary}
              maxLength={50}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description to help you remember..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {renderColorPicker()}
          {renderCategoryPicker()}
          {renderFrequencyPicker()}

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: loading ? theme.textSecondary : theme.primary,
              },
            ]}
            onPress={handleCreateHabit}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Habit'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
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
  headerTitle: {
    ...typography.h2,
    color: theme.text,
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: theme.text,
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.body,
    color: theme.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...shadows.small,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xs,
    ...shadows.small,
  },
  frequencyText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  createButton: {
    backgroundColor: theme.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  createButtonText: {
    ...typography.h3,
    color: theme.background,
    fontWeight: '600',
  },
}); 