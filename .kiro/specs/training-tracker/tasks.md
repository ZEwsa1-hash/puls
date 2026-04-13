# Implementation Plan: Training Tracker

## Overview

This plan implements a client-side web application for tracking an 8-week cardiovascular training program. The implementation uses Next.js 16, React 19, TypeScript, and Ant Design with localStorage for data persistence. The approach follows a bottom-up strategy: data layer → state management → UI components → integration → testing → polish.

## Tasks

- [ ] 1. Set up project foundation and data layer
  - [ ] 1.1 Create type definitions and interfaces
    - Create `src/app/training-tracker/types/index.ts`
    - Define all TypeScript types: `Workout`, `WorkoutType`, `DayInfo`, `WeekData`, `WeekProgress`, `WeekStatus`, `ProgramStats`, `StoredData`
    - _Requirements: 1.4, 5.1-5.9_
  
  - [ ] 1.2 Create program constants
    - Create `src/app/training-tracker/constants/program.ts`
    - Define `PROGRAM_STRUCTURE` array with 8 weeks and targets
    - Define `TOTAL_PROGRAM_TARGET`, `PROGRAM_START_DATE`, `PROGRAM_END_DATE`, `DAYS_OF_WEEK`
    - _Requirements: 5.1-5.11_
  
  - [ ] 1.3 Implement storage service
    - Create `src/app/training-tracker/services/storage.ts`
    - Implement `save()`, `load()`, and `clear()` methods with error handling
    - Add JSON serialization/deserialization with try-catch blocks
    - Handle localStorage quota exceeded errors
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 1.4 Implement calculation service
    - Create `src/app/training-tracker/services/calculations.ts`
    - Implement `calculateProgramStats()` function
    - Implement `calculateWeekProgress()` function
    - Implement `getCurrentWeek()` function
    - Implement `isToday()` function
    - _Requirements: 4.1-4.6, 6.1-6.4, 8.1_
  
  - [ ]* 1.5 Write unit tests for calculation service
    - Test `calculateWeekProgress()` with empty week, complete week, week without HIIT
    - Test `calculateProgramStats()` with various workout combinations
    - Test `getCurrentWeek()` with different dates
    - Test edge cases: zero duration, boundary values, all weeks complete
    - _Requirements: 4.1-4.6, 6.1-6.4_

- [ ] 2. Implement state management hooks
  - [ ] 2.1 Create useLocalStorage hook
    - Create `src/app/training-tracker/hooks/useLocalStorage.ts`
    - Implement generic hook with type parameter `<T>`
    - Add SSR-safe check for window object
    - Handle JSON parse errors gracefully
    - Return tuple: `[value, setValue]`
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 2.2 Create useWorkouts hook
    - Create `src/app/training-tracker/hooks/useWorkouts.ts`
    - Use `Map<string, Workout>` for workout storage with composite keys `${week}-${day}`
    - Implement `addWorkout()`, `updateWorkout()`, `deleteWorkout()`, `getWorkout()` methods
    - Sync to localStorage on every mutation using useEffect
    - Initialize from localStorage on mount
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 7.1, 7.2, 7.3_
  
  - [ ] 2.3 Create useProgram hook
    - Create `src/app/training-tracker/hooks/useProgram.ts`
    - Accept `workouts` Map as parameter
    - Use `useMemo` to calculate `programStats` (recalculate only when workouts change)
    - Implement `getWeekStatus()`, `getWeekProgress()`, `getCurrentWeek()` methods
    - Return interface: `{ stats, getWeekStatus, getWeekProgress, getCurrentWeek }`
    - _Requirements: 4.1-4.6, 6.1-6.6, 8.1_
  
  - [ ]* 2.4 Write unit tests for hooks
    - Test useLocalStorage with save/load cycles
    - Test useWorkouts CRUD operations
    - Test useProgram calculations with various workout data
    - Test localStorage synchronization
    - _Requirements: 1.2, 2.2, 2.3, 7.1-7.3_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Build UI components
  - [ ] 4.1 Create DayCell component
    - Create `src/app/training-tracker/components/DayCell.tsx`
    - Accept props: `day`, `workout`, `isToday`, `onClick`
    - Display day name (Mon, Tue, etc.)
    - Display workout duration if present
    - Apply color coding: green (#7cb342) for Zone 2, orange (#ff9800) for HIIT
    - Apply blue border (#3498db) for today
    - Add hover effects and cursor pointer
    - _Requirements: 3.1-3.4, 10.1_
  
  - [ ] 4.2 Create Legend component
    - Create `src/app/training-tracker/components/Legend.tsx`
    - Display 3 legend items: Zone 2 (green), HIIT (orange), Today (blue)
    - Use color squares with labels
    - _Requirements: 3.5_
  
  - [ ] 4.3 Create StatsBar component
    - Create `src/app/training-tracker/components/StatsBar.tsx`
    - Accept props: `stats` (ProgramStats)
    - Display 5 stat items: Total Z2, Target, Weeks Done, HIIT Weeks, Week
    - Use uppercase labels with large value text
    - Apply responsive layout (wrap on mobile)
    - _Requirements: 6.1-6.5_
  
  - [ ] 4.4 Create WeekRow component
    - Create `src/app/training-tracker/components/WeekRow.tsx`
    - Accept props: `week`, `workouts`, `isActive`, `onDayClick`
    - Render week header with number, date range, and optional label (DELOAD/TAPER)
    - Render 7 DayCell components
    - Render week summary with total minutes, target range, remaining minutes, and "need HIIT" indicator
    - Apply blue border and background tint for active week
    - Apply hover effects
    - _Requirements: 4.3-4.6, 5.10, 5.11, 8.2-8.5, 10.2, 12.2-12.5_
  
  - [ ] 4.5 Create WorkoutModal component
    - Create `src/app/training-tracker/components/WorkoutModal.tsx`
    - Use Ant Design Modal, Form, Radio.Group, InputNumber components
    - Accept props: `open`, `workout`, `dayInfo`, `onSave`, `onDelete`, `onCancel`
    - Display selected day and week information in modal title
    - Provide radio selection for workout type (Zone 2 / HIIT)
    - Provide number input for duration (positive integers only)
    - Add form validation: duration required, must be > 0, must be integer
    - Show delete button only when editing existing workout
    - Auto-focus first input field on open
    - _Requirements: 1.1, 1.5, 1.6, 2.1, 2.3, 2.4, 10.5, 11.1-11.7_
  
  - [ ]* 4.6 Write unit tests for components
    - Test DayCell rendering with different workout types and states
    - Test WeekRow with various workout combinations
    - Test WorkoutModal form validation and submission
    - Test StatsBar with different stat values
    - _Requirements: 3.1-3.4, 4.3-4.6, 11.1-11.7_

- [ ] 5. Integrate components into main page
  - [ ] 5.1 Create main page component structure
    - Create `src/app/training-tracker/page.tsx` as client component ('use client')
    - Initialize state: `workouts` (Map), `selectedDay` (object or null), `isModalOpen` (boolean)
    - Use `useWorkouts` hook for workout management
    - Use `useProgram` hook for statistics and progress calculations
    - _Requirements: 1.1, 7.3, 7.4_
  
  - [ ] 5.2 Implement event handlers
    - Implement `handleDayClick(week, day)` to open modal with selected day
    - Implement `handleWorkoutSave(workout)` to add/update workout and close modal
    - Implement `handleWorkoutDelete()` to remove workout and close modal
    - Implement `handleModalClose()` to close modal without changes
    - _Requirements: 1.1, 1.6, 2.1, 2.3, 2.4, 2.5, 10.3, 10.4_
  
  - [ ] 5.3 Render page layout
    - Wrap in Ant Design Card component
    - Render header with title "RHR 50 → 46 Experiment" and subtitle
    - Render StatsBar with program statistics
    - Render Legend component
    - Render 8 WeekRow components in scrollable container
    - Conditionally render WorkoutModal when `isModalOpen` is true
    - _Requirements: 12.1-12.5_
  
  - [ ] 5.4 Create component styles
    - Create `src/app/training-tracker/styles.css`
    - Define color palette constants
    - Style page container, header, stats bar, legend
    - Style week rows with hover effects and active state
    - Style day cells with color coding and hover effects
    - Add responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
    - _Requirements: 3.1-3.3, 8.2-8.5, 9.1-9.5, 10.1, 10.2_
  
  - [ ]* 5.5 Write integration tests
    - Test complete workflow: click day → enter workout → save → verify display
    - Test edit workflow: click existing workout → modify → save → verify update
    - Test delete workflow: click existing workout → delete → verify removal
    - Test cancel workflow: click day → enter data → cancel → verify no change
    - Test statistics updates after workout operations
    - _Requirements: 1.1-1.6, 2.1-2.5, 6.6, 10.3, 10.4_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement property-based tests
  - [ ] 7.1 Set up property testing infrastructure
    - Install fast-check: `npm install --save-dev fast-check`
    - Create `src/app/training-tracker/__tests__/properties.test.ts`
    - Create workout generator: `fc.record({ type, duration, date })`
    - Create position generator: `fc.record({ week, day })`
    - Create workout map generator: `fc.array(fc.tuple(position, workout))`
    - Configure minimum 100 iterations per property test
  
  - [ ]* 7.2 Write property test for workout persistence round-trip
    - **Property 1: Workout Persistence Round-Trip**
    - **Validates: Requirements 1.2, 1.3, 7.1, 7.3**
    - Test that saving a workout and loading it back returns equivalent data
  
  - [ ]* 7.3 Write property test for workout update preservation
    - **Property 2: Workout Update Preservation**
    - **Validates: Requirements 2.2**
    - Test that updating a workout preserves it at the same position with new values
  
  - [ ]* 7.4 Write property test for workout deletion removal
    - **Property 3: Workout Deletion Removal**
    - **Validates: Requirements 2.3, 7.2**
    - Test that deleting a workout removes it from storage
  
  - [ ]* 7.5 Write property test for cancel operation invariant
    - **Property 4: Cancel Operation Invariant**
    - **Validates: Requirements 2.5**
    - Test that canceling modal leaves program state unchanged
  
  - [ ]* 7.6 Write property test for workout type color mapping
    - **Property 5: Workout Type Color Mapping**
    - **Validates: Requirements 3.1, 3.2**
    - Test that Zone 2 renders green and HIIT renders orange
  
  - [ ]* 7.7 Write property test for duration display consistency
    - **Property 6: Duration Display Consistency**
    - **Validates: Requirements 3.4**
    - Test that displayed duration matches workout duration value
  
  - [ ]* 7.8 Write property test for weekly total aggregation
    - **Property 7: Weekly Total Aggregation**
    - **Validates: Requirements 4.1, 4.2**
    - Test that weekly total equals sum of all workout durations in that week
  
  - [ ]* 7.9 Write property test for remaining minutes calculation
    - **Property 8: Remaining Minutes Calculation**
    - **Validates: Requirements 4.4**
    - Test that remaining minutes equals max(0, target - total)
  
  - [ ]* 7.10 Write property test for HIIT requirement indicator
    - **Property 9: HIIT Requirement Indicator**
    - **Validates: Requirements 4.5**
    - Test that weeks with only Zone 2 show "need HIIT" status
  
  - [ ]* 7.11 Write property test for week completion criteria
    - **Property 10: Week Completion Criteria**
    - **Validates: Requirements 4.6**
    - Test that week is complete iff total >= minimum AND has HIIT
  
  - [ ]* 7.12 Write property test for Zone 2 total aggregation
    - **Property 11: Zone 2 Total Aggregation**
    - **Validates: Requirements 6.1**
    - Test that total Zone 2 minutes equals sum of all Zone 2 workout durations
  
  - [ ]* 7.13 Write property test for completed weeks count
    - **Property 12: Completed Weeks Count**
    - **Validates: Requirements 6.3**
    - Test that completed weeks count equals number of weeks meeting completion criteria
  
  - [ ]* 7.14 Write property test for HIIT weeks count
    - **Property 13: HIIT Weeks Count**
    - **Validates: Requirements 6.4**
    - Test that HIIT weeks count equals number of distinct weeks containing HIIT
  
  - [ ]* 7.15 Write property test for statistics reactivity
    - **Property 14: Statistics Reactivity**
    - **Validates: Requirements 6.6**
    - Test that adding/removing workouts triggers accurate statistics recalculation
  
  - [ ]* 7.16 Write property test for JSON serialization round-trip
    - **Property 15: JSON Serialization Round-Trip**
    - **Validates: Requirements 7.5**
    - Test that JSON.stringify then JSON.parse preserves workout data
  
  - [ ]* 7.17 Write property test for input validation consistency
    - **Property 16: Input Validation Consistency**
    - **Validates: Requirements 1.5**
    - Test that validation accepts positive integers and rejects invalid values
  
  - [ ]* 7.18 Write property test for weekly progress display completeness
    - **Property 17: Weekly Progress Display Completeness**
    - **Validates: Requirements 4.3**
    - Test that weekly progress includes both current total and target range

- [ ] 8. Polish and optimize user experience
  - [ ] 8.1 Add user feedback and error handling
    - Add success messages using Ant Design `message.success()` for save/delete operations
    - Add error messages using `message.error()` for validation failures and storage errors
    - Add error boundary component to catch React errors gracefully
    - Handle localStorage quota exceeded with user-friendly message
    - _Requirements: 10.3, 10.4_
  
  - [ ] 8.2 Implement accessibility improvements
    - Add ARIA labels to day cells: `aria-label="Monday, Week 1, 30 minutes Zone 2"`
    - Add ARIA live region for statistics updates: `aria-live="polite"`
    - Ensure all interactive elements have visible focus indicators
    - Add keyboard navigation: Tab through cells, Enter to open modal, Escape to close
    - Verify minimum 44x44px touch targets on mobile
    - _Requirements: 9.5, 10.5_
  
  - [ ] 8.3 Optimize performance
    - Wrap DayCell in `React.memo` to prevent unnecessary re-renders
    - Wrap WeekRow in `React.memo` to prevent unnecessary re-renders
    - Use `useCallback` for event handlers passed to child components
    - Use `useMemo` for expensive calculations (already implemented in hooks)
    - Test performance: initial render <100ms, workout save <50ms, UI update <16ms
  
  - [ ] 8.4 Test responsive behavior across devices
    - Test on mobile viewport (<768px): verify vertical stack layout
    - Test on tablet viewport (768-1024px): verify wrap layout
    - Test on desktop viewport (>1024px): verify horizontal layout
    - Test touch interactions on mobile devices
    - Verify day cell dimensions adjust appropriately
    - _Requirements: 9.1-9.5_
  
  - [ ] 8.5 Cross-browser compatibility testing
    - Test on Chrome 90+ (primary browser)
    - Test on Firefox 88+
    - Test on Safari 14+
    - Test on Edge 90+
    - Verify localStorage functionality across all browsers
    - Verify CSS Grid and Flexbox rendering

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: data layer → state → UI → integration
- All code uses TypeScript for type safety
- localStorage provides data persistence without backend infrastructure
