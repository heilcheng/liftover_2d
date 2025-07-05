# HabitTracker: Build Better Habits with Visual Motivation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

HabitTracker is a beautiful, motivating habit tracking app inspired by GitHub's contribution graph and Duolingo's streak system. Track your daily habits with a visually satisfying interface that encourages consistency and celebrates your progress.

### ✨ Key Features

- **📊 GitHub-style Contribution Graph**: Visualize your habit completion with colored squares
- **🔥 Duolingo-inspired Streak System**: Track current and longest streaks with motivating fire icons
- **🎯 Habit Management**: Create, edit, and organize your personal habits
- **📱 Beautiful UI/UX**: Clean, modern interface with Duolingo's signature light green theme
- **📈 Progress Tracking**: See your improvement over time with detailed statistics
- **🔔 Daily Reminders**: Never miss a habit with customizable notifications

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/habit-tracker.git
cd habit-tracker

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# For iOS
npm run ios

# For Android
npm run android

# For web
npm run web
```

## 🎨 Design Philosophy

### Duolingo-Inspired Theme
- **Primary Color**: Light green (#58CC02) - Duolingo's signature color
- **Background**: Clean white (#FFFFFF)
- **Accent Colors**: Warm oranges and yellows for streaks
- **Typography**: Clear, readable fonts with proper hierarchy

### Visual Elements
- **Contribution Grid**: GitHub-style squares showing daily completion
- **Streak Fire**: Animated fire icons for active streaks
- **Progress Bars**: Visual representation of habit completion
- **Celebration Animations**: Rewards for maintaining streaks

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── ContributionGrid.tsx
│   ├── StreakCounter.tsx
│   ├── HabitCard.tsx
│   └── ProgressBar.tsx
├── screens/            # Main app screens
│   ├── HomeScreen.tsx
│   ├── HabitDetailScreen.tsx
│   ├── AddHabitScreen.tsx
│   └── StatsScreen.tsx
├── navigation/         # Navigation configuration
├── services/          # Data management and storage
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## 🔧 Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Storage**: AsyncStorage for local data persistence
- **Icons**: Expo Vector Icons
- **State Management**: React Context API

## 🎯 Core Features

### 1. Habit Management
- Create custom habits with personalized names and descriptions
- Set frequency (daily, weekly, custom)
- Add categories and tags for organization
- Edit and delete habits

### 2. Contribution Graph
- GitHub-style grid showing 365 days of activity
- Color-coded squares based on completion status
- Interactive tooltips showing detailed information
- Smooth animations and transitions

### 3. Streak System
- Current streak counter with fire icon
- Longest streak tracking
- Streak milestones and achievements
- Motivational messages and celebrations

### 4. Statistics & Analytics
- Weekly and monthly progress reports
- Success rate calculations
- Habit completion trends
- Personal best records

## 🚧 Development Roadmap

### Phase 1: Core Features ✅
- [x] Basic habit tracking
- [x] Contribution graph visualization
- [x] Streak system
- [x] Local data storage

### Phase 2: Enhanced Features 🚧
- [ ] Push notifications
- [ ] Cloud sync
- [ ] Social features
- [ ] Advanced analytics

### Phase 3: Premium Features 📋
- [ ] Custom themes
- [ ] Export data
- [ ] Habit templates
- [ ] Integration with health apps

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by GitHub's contribution graph
- UI/UX design inspired by Duolingo's engaging interface
- Built with React Native and Expo

---

**Build better habits, one day at a time! 🔥**