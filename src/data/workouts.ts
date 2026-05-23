import { db } from "@/db"
import { workouts, workoutExercises, exercises, sets } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export type WorkoutWithExercises = {
  id: number
  date: string
  startedAt: Date
  completedAt: Date | null
  exercises: {
    id: number
    name: string
    order: number
    sets: {
      id: number
      setNumber: number
      reps: number
      weight: string | null
    }[]
  }[]
}

export async function getWorkoutsForDate(date: string): Promise<WorkoutWithExercises[]> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutDate: workouts.date,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)))
    .orderBy(workouts.id, workoutExercises.order, sets.setNumber)

  const workoutMap = new Map<number, WorkoutWithExercises>()
  const exerciseMap = new Map<number, WorkoutWithExercises["exercises"][number]>()

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        date: row.workoutDate,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      })
    }

    if (row.workoutExerciseId != null && row.exerciseId != null && row.exerciseName != null) {
      if (!exerciseMap.has(row.workoutExerciseId)) {
        const exercise = {
          id: row.exerciseId,
          name: row.exerciseName,
          order: row.exerciseOrder ?? 0,
          sets: [] as WorkoutWithExercises["exercises"][number]["sets"],
        }
        exerciseMap.set(row.workoutExerciseId, exercise)
        workoutMap.get(row.workoutId)!.exercises.push(exercise)
      }

      if (row.setId != null) {
        exerciseMap.get(row.workoutExerciseId)!.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps!,
          weight: row.weight ?? null,
        })
      }
    }
  }

  return Array.from(workoutMap.values())
}
