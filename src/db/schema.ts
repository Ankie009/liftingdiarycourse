import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  date,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const exercises = pgTable('exercises', {
  id:        serial('id').primaryKey(),
  name:      text('name').notNull().unique(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const workouts = pgTable('workouts', {
  id:          serial('id').primaryKey(),
  userId:      text('user_id').notNull(),
  title:       text('title').notNull().default(''),
  date:        date('date').notNull(),
  startedAt:   timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id:         serial('id').primaryKey(),
    workoutId:  integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'restrict' }),
    order:      integer('order').notNull().default(0),
    createdAt:  timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique('uq_workout_exercise').on(t.workoutId, t.exerciseId)]
);

export const sets = pgTable('sets', {
  id:                serial('id').primaryKey(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber:         integer('set_number').notNull(),
  reps:              integer('reps').notNull(),
  weight:            numeric('weight', { precision: 6, scale: 2 }),
  createdAt:         timestamp('created_at').notNull().defaultNow(),
});

export type Exercise           = typeof exercises.$inferSelect;
export type NewExercise        = typeof exercises.$inferInsert;
export type Workout            = typeof workouts.$inferSelect;
export type NewWorkout         = typeof workouts.$inferInsert;
export type WorkoutExercise    = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type Set                = typeof sets.$inferSelect;
export type NewSet             = typeof sets.$inferInsert;
