# Progress Indicators for Web Scraper

This document describes the enhanced progress indicators implemented for the web scraper application.

## Features

### 1. Real-time Progress Bars for Individual Product Scraping

- **Overall Progress**: Shows the complete scraping progress from 0-100%
- **Stage-based Progress**: Visual indicators for different scraping stages:
  - Initializing (Blue)
  - Fetching Archives (Yellow)
  - Scraping Products (Green)
  - Generating CSV (Purple)
  - Complete (Dark Green)

- **Individual Progress Bars**:
  - Archive Pages: Shows progress through archive processing
  - Products: Shows individual product scraping progress
  - Current Item: Displays which archive/product is currently being processed

### 2. Estimated Time Remaining for Large Scrapes

- **Time Estimates Panel**: Shows three key metrics:
  - **Elapsed Time**: How long the scraping has been running
  - **Remaining Time**: Estimated time to completion based on current processing rate
  - **Processing Rate**: Items processed per second

- **Smart Calculations**: Time estimates are calculated based on:
  - Current processing speed
  - Number of items remaining
  - Historical processing rates

### 3. Better Visual Feedback During Attribute Editing

- **Attribute Processing Progress**: Shows progress during attribute editing operations
- **Current Product Display**: Shows which product/attribute is being processed
- **Processing States**: Visual feedback during save operations
- **Disabled States**: Form elements are disabled during processing to prevent conflicts

## Components

### EnhancedProgressTracker

The main component that displays all progress information:

```tsx
<EnhancedProgressTracker
  detailedProgress={detailedProgress}
  attributeEditProgress={attributeEditProgress}
  isVisible={isProcessing}
/>
```

### ProgressDemo

A demo component for testing progress indicators without running actual scrapes:

```tsx
<ProgressDemo />
```

## Progress Stages

1. **Initializing** (0-5%): Setting up the scraping process
2. **Fetching Archives** (5-15%): Processing archive pages and extracting product URLs
3. **Scraping Products** (15-90%): Scraping individual product pages
4. **Generating CSV** (90-98%): Creating CSV files
5. **Complete** (98-100%): Finalizing and storing results

## Time Estimation Algorithm

The time estimation works by:

1. **Tracking Processing Rate**: Calculating items processed per second
2. **Dynamic Updates**: Updating estimates as processing speed changes
3. **Remaining Calculation**: `(total_items - processed_items) / processing_rate`

## Visual Enhancements

### CSS Classes

- `.progress-smooth`: Smooth transitions for progress bars
- `.progress-glow`: Glow effect on main progress bar
- `.stage-indicator`: Shimmer animation for stage progress
- `.time-estimate-card`: Hover effects for time estimate cards
- `.archive-progress`: Blue gradient for archive progress
- `.product-progress`: Green gradient for product progress
- `.attribute-progress`: Purple gradient for attribute editing

### Animations

- **Progress Bar Transitions**: Smooth width changes with cubic-bezier easing
- **Stage Indicators**: Shimmer effect for active stages
- **Time Estimate Cards**: Hover animations with transform and shadow
- **Loading Spinners**: Animated spinners for processing states

## API Integration

### Server-Sent Events (SSE)

Progress updates are delivered via SSE for real-time updates:

```typescript
// Event types
type ProgressEvent = {
  type: 'progress';
  percent: number;
  message?: string;
  timestamp: number;
};

type DetailedProgressEvent = {
  type: 'detailed_progress';
  progress: DetailedProgress;
  timestamp: number;
};

type AttributeEditProgressEvent = {
  type: 'attribute_edit_progress';
  progress: AttributeEditProgress;
  timestamp: number;
};
```

### Job Logger Integration

The enhanced job logger supports multiple event types:

```typescript
// Log progress
jobLogger.progress(requestId, 50, 'Halfway done');

// Log detailed progress
jobLogger.detailedProgress(requestId, detailedProgress);

// Log attribute editing progress
jobLogger.attributeEditProgress(requestId, attributeProgress);
```

## Usage Examples

### Basic Progress Tracking

```tsx
const [detailedProgress, setDetailedProgress] = useState<DetailedProgress>();

// In your component
<EnhancedProgressTracker
  detailedProgress={detailedProgress}
  isVisible={true}
/>
```

### Attribute Editing Progress

```tsx
const [attributeProgress, setAttributeProgress] = useState<AttributeEditProgress>();

// In your component
<EnhancedProgressTracker
  attributeEditProgress={attributeProgress}
  isVisible={true}
/>
```

### Combined Progress Tracking

```tsx
<EnhancedProgressTracker
  detailedProgress={detailedProgress}
  attributeEditProgress={attributeProgress}
  isVisible={isProcessing || isAttributeEditing}
/>
```

## Testing

Use the `ProgressDemo` component to test progress indicators without running actual scrapes:

1. Click "Start Demo" to begin the simulation
2. Watch the progress bars animate through different stages
3. Observe time estimates and current item displays
4. Click "Reset Demo" to start over

## Future Enhancements

- **Progress Persistence**: Save progress state for resuming interrupted scrapes
- **Progress History**: Track performance metrics across multiple scraping sessions
- **Custom Progress Themes**: Allow users to customize progress bar colors and styles
- **Progress Notifications**: Desktop notifications for completion and errors
- **Progress Export**: Export progress data for analysis and reporting

## Technical Notes

- **Performance**: Progress updates are throttled to prevent UI lag
- **Memory Management**: Event listeners are properly cleaned up to prevent memory leaks
- **Error Handling**: Progress tracking continues even if individual items fail
- **Responsive Design**: Progress indicators adapt to different screen sizes
- **Accessibility**: Progress bars include proper ARIA labels and screen reader support
