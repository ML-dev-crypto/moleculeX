# MoleculeX - Bio-Line Inspired Design

This is a redesigned frontend for MoleculeX inspired by the Bio-Line website, featuring:

## Design Features

### 🎨 Dark Theme
- Black background (#0a0a0a)
- Cyan/blue accent colors
- Terminal-style aesthetics
- Monospace fonts for technical feel

### 📋 Section-Based Layout
1. **Hero Section** - Animated introduction with typewriter effect
2. **Problem Statement** (01) - Identifies pharmaceutical research challenges
3. **Proposed Solution** (02) - Explains AI-driven approach
4. **System Architecture** (03) - Technical pipeline visualization
5. **Query Interface** - Terminal-style input for user queries
6. **Results Display** - Real-time agent progress and comprehensive results

### ✨ Key Components

#### `BioLineLayout.jsx`
Main layout component that orchestrates all sections with smooth scrolling navigation.

#### `Hero.jsx`
Landing section with animated particles, typewriter effect, and call-to-action.

#### `Problem.jsx`
Displays three main problems in pharmaceutical research with card-based layout.

#### `Solution.jsx`
Showcases the AI-driven solution with feature highlights and metrics.

#### `System.jsx`
Visualizes the processing pipeline and specialized agent architecture.

#### `QueryInterface.jsx`
Terminal-style query input interface with example queries.

#### `Results.jsx`
Real-time progress tracking and comprehensive results display with agent status monitoring.

## Running the Application

```bash
cd frontend
npm install
npm run dev
```

## Design Philosophy

The design follows a technical, developer-focused aesthetic similar to Bio-Line:
- **Minimalist**: Clean, focused interface
- **Technical**: Monospace fonts, terminal elements
- **Scientific**: Data-driven visualizations
- **Modern**: Smooth animations, gradient accents
- **Professional**: Dark theme, structured layout

## Color Palette

- Background: `#0a0a0a` (Dark black)
- Primary Accent: `#06b6d4` (Cyan)
- Secondary Accent: `#3b82f6` (Blue)
- Tertiary Accent: `#8b5cf6` (Purple)
- Text Primary: `#ffffff` (White)
- Text Secondary: `#9ca3af` (Gray)
- Borders: `rgba(255, 255, 255, 0.1)` (Subtle white)

## Animation Features

- Typewriter effect on hero section
- Floating particles background
- Smooth scroll navigation
- Hover effects on interactive elements
- Progress bar animations
- Loading spinners with gradient effects

## Typography

- **Headings**: Inter (Bold, 700)
- **Body**: Inter (Regular, 400)
- **Monospace**: JetBrains Mono
- **Technical Text**: Monospace at 12-14px

## Future Enhancements

- [ ] Add more data visualizations
- [ ] Implement chart components for results
- [ ] Add export functionality for reports
- [ ] Enhance mobile responsiveness
- [ ] Add dark mode toggle (light theme option)
- [ ] Implement search and filter for results
