# Requirements Document

## Introduction

The Training Tracker is a web application designed to help users track an 8-week cardiovascular training program called "RHR 50 → 46 Experiment". The program combines Zone 2 cardio training with High-Intensity Interval Training (HIIT) to improve resting heart rate. Users can log daily workouts, track progress toward weekly goals, and visualize their training journey through an interactive calendar interface.

## Glossary

- **Training_Tracker**: The web application system that manages workout tracking and progress visualization
- **User**: A person using the application to track their training program
- **Workout**: A training session with a specific type (Zone 2 or HIIT) and duration in minutes
- **Zone_2**: Low-intensity cardio training performed at 60-70% of maximum heart rate
- **HIIT**: High-Intensity Interval Training performed at 80-95% of maximum heart rate
- **Training_Week**: A 7-day period within the 8-week program with specific training targets
- **DELOAD_Week**: Week 4 of the program with reduced training volume for recovery
- **TAPER_Week**: Week 8 of the program with reduced training volume before program completion
- **Weekly_Target**: The goal range of training minutes for a specific week (minimum-maximum)
- **Workout_Modal**: The user interface component for adding or editing workout entries
- **LocalStorage**: Browser-based persistent storage mechanism for workout data
- **Progress_Stats**: Aggregate metrics showing total time, targets, and completion status

## Requirements

### Requirement 1: Workout Data Management

**User Story:** As a User, I want to add workouts to specific days, so that I can track my daily training activities.

#### Acceptance Criteria

1. WHEN a User clicks on a day cell, THE Training_Tracker SHALL display the Workout_Modal
2. WHEN a User submits a workout with type and duration, THE Training_Tracker SHALL save the workout to LocalStorage
3. WHEN a User submits a workout, THE Training_Tracker SHALL associate the workout with the selected day and week
4. THE Training_Tracker SHALL support two workout types: Zone_2 and HIIT
5. WHEN a User enters workout duration, THE Training_Tracker SHALL accept positive integer values in minutes
6. WHEN a User saves a workout, THE Training_Tracker SHALL close the Workout_Modal and update the calendar display

### Requirement 2: Workout Modification

**User Story:** As a User, I want to edit or delete existing workouts, so that I can correct mistakes or update my training log.

#### Acceptance Criteria

1. WHEN a User clicks on a day cell containing a workout, THE Training_Tracker SHALL display the Workout_Modal with existing workout data
2. WHEN a User modifies workout data and saves, THE Training_Tracker SHALL update the workout in LocalStorage
3. WHEN a User selects delete in the Workout_Modal, THE Training_Tracker SHALL remove the workout from LocalStorage
4. WHEN a User deletes a workout, THE Training_Tracker SHALL update the calendar display to show an empty day cell
5. WHEN a User cancels the Workout_Modal, THE Training_Tracker SHALL preserve existing workout data without changes

### Requirement 3: Visual Workout Indicators

**User Story:** As a User, I want to see visual indicators for completed workouts, so that I can quickly understand my training pattern.

#### Acceptance Criteria

1. WHEN a day contains a Zone_2 workout, THE Training_Tracker SHALL display the day cell with green background color (#7cb342)
2. WHEN a day contains a HIIT workout, THE Training_Tracker SHALL display the day cell with orange background color (#ff9800)
3. WHEN a day contains no workout, THE Training_Tracker SHALL display the day cell with default background color
4. WHEN a day contains a workout, THE Training_Tracker SHALL display the workout duration in minutes within the day cell
5. THE Training_Tracker SHALL display a legend showing color coding for Zone_2, HIIT, and today indicators

### Requirement 4: Weekly Progress Calculation

**User Story:** As a User, I want to see weekly totals and progress toward goals, so that I can monitor if I'm meeting my training targets.

#### Acceptance Criteria

1. WHEN workouts are added to a Training_Week, THE Training_Tracker SHALL calculate the total minutes for that week
2. WHEN calculating weekly totals, THE Training_Tracker SHALL sum all workout durations regardless of type
3. WHEN displaying weekly progress, THE Training_Tracker SHALL show current total and Weekly_Target range
4. WHEN a Training_Week total is below the minimum target, THE Training_Tracker SHALL display remaining minutes needed
5. WHEN a Training_Week contains Zone_2 workouts but no HIIT workouts, THE Training_Tracker SHALL indicate "need HIIT" status
6. WHEN a Training_Week total meets or exceeds the minimum target and includes at least one HIIT workout, THE Training_Tracker SHALL mark the week as completed

### Requirement 5: Program Structure

**User Story:** As a User, I want to follow an 8-week structured program with varying weekly targets, so that I can progressively build cardiovascular fitness.

#### Acceptance Criteria

1. THE Training_Tracker SHALL support exactly 8 Training_Weeks
2. THE Training_Tracker SHALL assign Week 1 a Weekly_Target of 180-210 minutes
3. THE Training_Tracker SHALL assign Week 2 a Weekly_Target of 200-230 minutes
4. THE Training_Tracker SHALL assign Week 3 a Weekly_Target of 220-260 minutes
5. THE Training_Tracker SHALL assign Week 4 (DELOAD_Week) a Weekly_Target of 160-200 minutes
6. THE Training_Tracker SHALL assign Week 5 a Weekly_Target of 230-270 minutes
7. THE Training_Tracker SHALL assign Week 6 a Weekly_Target of 250-300 minutes
8. THE Training_Tracker SHALL assign Week 7 a Weekly_Target of 240-280 minutes
9. THE Training_Tracker SHALL assign Week 8 (TAPER_Week) a Weekly_Target of 150-190 minutes
10. WHEN displaying Week 4, THE Training_Tracker SHALL show a "DELOAD" label
11. WHEN displaying Week 8, THE Training_Tracker SHALL show a "TAPER" label

### Requirement 6: Overall Progress Tracking

**User Story:** As a User, I want to see aggregate statistics for the entire program, so that I can understand my overall progress.

#### Acceptance Criteria

1. THE Training_Tracker SHALL calculate and display total Zone_2 minutes across all weeks
2. THE Training_Tracker SHALL display the cumulative target of 1630 minutes for the entire program
3. THE Training_Tracker SHALL count and display the number of completed weeks out of 8
4. THE Training_Tracker SHALL count and display the number of weeks containing at least one HIIT workout
5. THE Training_Tracker SHALL display the current week number (1-8)
6. WHEN workouts are added or removed, THE Training_Tracker SHALL recalculate Progress_Stats in real-time

### Requirement 7: Data Persistence

**User Story:** As a User, I want my workout data to persist between sessions, so that I don't lose my training history when I close the browser.

#### Acceptance Criteria

1. WHEN a User saves a workout, THE Training_Tracker SHALL store the workout data in LocalStorage
2. WHEN a User deletes a workout, THE Training_Tracker SHALL remove the workout data from LocalStorage
3. WHEN the application loads, THE Training_Tracker SHALL retrieve all workout data from LocalStorage
4. WHEN the application loads, THE Training_Tracker SHALL restore the calendar display with all saved workouts
5. THE Training_Tracker SHALL serialize workout data to JSON format before storing in LocalStorage
6. WHEN LocalStorage contains no workout data, THE Training_Tracker SHALL initialize with an empty training program

### Requirement 8: Week Status Visualization

**User Story:** As a User, I want to see which week is currently active, so that I can focus on the current training period.

#### Acceptance Criteria

1. THE Training_Tracker SHALL determine the active week based on the current date
2. WHEN displaying the active Training_Week, THE Training_Tracker SHALL apply a blue border (#3498db) to the week row
3. WHEN displaying the active Training_Week, THE Training_Tracker SHALL apply a blue-tinted background
4. WHEN displaying upcoming Training_Weeks, THE Training_Tracker SHALL use default styling
5. WHEN displaying completed Training_Weeks, THE Training_Tracker SHALL maintain standard styling with completion indicators

### Requirement 9: Responsive Design

**User Story:** As a User, I want to use the application on mobile and desktop devices, so that I can track workouts from any device.

#### Acceptance Criteria

1. WHEN the viewport width is 768 pixels or less, THE Training_Tracker SHALL adjust the layout for mobile display
2. WHEN displaying on mobile, THE Training_Tracker SHALL stack week summary information below the day cells
3. WHEN displaying on mobile, THE Training_Tracker SHALL reduce day cell dimensions to fit smaller screens
4. WHEN displaying on desktop, THE Training_Tracker SHALL show week information, day cells, and summary in a horizontal layout
5. THE Training_Tracker SHALL maintain touch-friendly interaction targets on mobile devices (minimum 44x44 pixels)

### Requirement 10: User Interaction Feedback

**User Story:** As a User, I want visual feedback when interacting with the application, so that I know my actions are recognized.

#### Acceptance Criteria

1. WHEN a User hovers over a day cell, THE Training_Tracker SHALL change the cell background to indicate interactivity
2. WHEN a User hovers over a week row, THE Training_Tracker SHALL brighten the row background
3. WHEN a User saves a workout, THE Training_Tracker SHALL immediately update the visual display
4. WHEN a User deletes a workout, THE Training_Tracker SHALL immediately update the visual display
5. WHEN the Workout_Modal opens, THE Training_Tracker SHALL focus the first input field for immediate data entry

### Requirement 11: Workout Modal Interface

**User Story:** As a User, I want an intuitive form for entering workout details, so that I can quickly log my training sessions.

#### Acceptance Criteria

1. WHEN the Workout_Modal opens, THE Training_Tracker SHALL display the selected day and week information
2. THE Training_Tracker SHALL provide a dropdown or radio selection for workout type (Zone_2 or HIIT)
3. THE Training_Tracker SHALL provide a numeric input field for workout duration in minutes
4. THE Training_Tracker SHALL provide a save button to confirm the workout entry
5. THE Training_Tracker SHALL provide a cancel button to close the modal without saving
6. WHEN editing an existing workout, THE Training_Tracker SHALL provide a delete button
7. WHEN a User attempts to save without entering duration, THE Training_Tracker SHALL display a validation error message

### Requirement 12: Calendar Navigation

**User Story:** As a User, I want to easily navigate through the 8-week program, so that I can view and manage workouts across all weeks.

#### Acceptance Criteria

1. THE Training_Tracker SHALL display all 8 Training_Weeks in a vertical scrollable list
2. WHEN displaying each Training_Week, THE Training_Tracker SHALL show the week number and date range
3. WHEN displaying each Training_Week, THE Training_Tracker SHALL show 7 day cells representing the week
4. THE Training_Tracker SHALL label each day cell with the day of the week (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
5. THE Training_Tracker SHALL maintain consistent visual hierarchy across all weeks
