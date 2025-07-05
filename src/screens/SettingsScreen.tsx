import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { StorageService } from '../services/storage';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleExportData = async () => {
    try {
      const data = await StorageService.exportData();
      Alert.alert(
        'Export Data',
        `Successfully exported ${data.habits.length} habits and ${data.completions.length} completions.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all habits and progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={theme.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        onPress && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {renderSettingItem(
          'notifications',
          'Notifications',
          'Get reminded about your habits',
          undefined,
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: theme.surface, true: theme.primary }}
            thumbColor={theme.background}
          />
        )}

        {renderSettingItem(
          'moon',
          'Dark Mode',
          'Switch to dark theme',
          undefined,
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: theme.surface, true: theme.primary }}
            thumbColor={theme.background}
          />
        )}
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {renderSettingItem(
          'download',
          'Export Data',
          'Backup your habits and progress',
          handleExportData
        )}

        {renderSettingItem(
          'cloud-upload',
          'Import Data',
          'Restore from backup',
          () => Alert.alert('Coming Soon', 'Import feature will be available soon!')
        )}

        {renderSettingItem(
          'trash',
          'Clear All Data',
          'Delete all habits and progress',
          handleClearData
        )}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        {renderSettingItem(
          'information-circle',
          'App Version',
          '1.0.0',
          undefined,
          <Text style={styles.versionText}>1.0.0</Text>
        )}

        {renderSettingItem(
          'document-text',
          'Privacy Policy',
          'Read our privacy policy',
          () => Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.')
        )}

        {renderSettingItem(
          'help-circle',
          'Help & Support',
          'Get help and contact support',
          () => Alert.alert('Help & Support', 'Support information will be displayed here.')
        )}

        {renderSettingItem(
          'star',
          'Rate App',
          'Rate us on the App Store',
          () => Alert.alert('Rate App', 'This would open the App Store rating page.')
        )}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <View style={styles.appIcon}>
          <Ionicons name="leaf" size={32} color={theme.primary} />
        </View>
        <Text style={styles.appName}>HabitTracker</Text>
        <Text style={styles.appDescription}>
          Build better habits, one day at a time
        </Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: theme.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: theme.text,
    fontWeight: '600',
  },
  settingSubtitle: {
    ...typography.caption,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  versionText: {
    ...typography.caption,
    color: theme.textSecondary,
  },
  appInfo: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  appName: {
    ...typography.h2,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  appDescription: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  appVersion: {
    ...typography.caption,
    color: theme.textSecondary,
  },
}); 