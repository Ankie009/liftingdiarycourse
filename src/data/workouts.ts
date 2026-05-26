import { db } from "@/db"
import { workouts, workoutExercises, exercises, sets } from "@/db/schema"
import { eq, and, max, ilike } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { format } from "date-fns"

export async function createWorkout(date: Date): Promise<{ id: number }> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const title = `Workout for ${format(date, "do MMM yyyy")}`

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      title,
      date: format(date, "yyyy-MM-dd"),
      startedAt: new Date(),
    })
    .returning({ id: workouts.id })

  return workout
}

export type WorkoutWithExercises = {
  id: number
  title: string
  date: string
  startedAt: Date
  completedAt: Date | null
  exercises: {
    workoutExerciseId: number
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

export async function getWorkoutById(workoutId: number): Promise<WorkoutWithExercises | null> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutTitle: workouts.title,
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
    .where(and(eq(workouts.userId, userId), eq(workouts.id, workoutId)))
    .orderBy(workoutExercises.order, sets.setNumber)

  if (rows.length === 0) return null

  const workout: WorkoutWithExercises = {
    id: rows[0].workoutId,
    title: rows[0].workoutTitle,
    date: rows[0].workoutDate,
    startedAt: rows[0].startedAt,
    completedAt: rows[0].completedAt,
    exercises: [],
  }

  const exerciseMap = new Map<number, WorkoutWithExercises["exercises"][number]>()

  for (const row of rows) {
    if (row.workoutExerciseId != null && row.exerciseId != null && row.exerciseName != null) {
      if (!exerciseMap.has(row.workoutExerciseId)) {
        const exercise = {
          workoutExerciseId: row.workoutExerciseId,
          id: row.exerciseId,
          name: row.exerciseName,
          order: row.exerciseOrder ?? 0,
          sets: [] as WorkoutWithExercises["exercises"][number]["sets"],
        }
        exerciseMap.set(row.workoutExerciseId, exercise)
        workout.exercises.push(exercise)
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

  return workout
}

export async function deleteWorkout(workoutId: number): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
}

export async function updateWorkoutTitleAndDate(workoutId: number, title: string, date: Date): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db
    .update(workouts)
    .set({ title, date: format(date, "yyyy-MM-dd") })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
}

export async function addExerciseToWorkout(workoutId: number, exerciseName: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify workout belongs to user
  const [workout] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1)
  if (!workout) throw new Error("Workout not found")

  // Find or create exercise (case-insensitive match)
  let exerciseId: number
  const [existing] = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(ilike(exercises.name, exerciseName))
    .limit(1)

  if (existing) {
    exerciseId = existing.id
  } else {
    const [created] = await db
      .insert(exercises)
      .values({ name: exerciseName })
      .returning({ id: exercises.id })
    exerciseId = created.id
  }

  // Compute next order
  const [orderResult] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))

  const nextOrder = (orderResult?.maxOrder ?? -1) + 1

  await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: nextOrder })
    .onConflictDoNothing()
}

export async function removeExerciseFromWorkout(workoutExerciseId: number): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify ownership before deleting
  const [row] = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, and(eq(workouts.id, workoutExercises.workoutId), eq(workouts.userId, userId)))
    .where(eq(workoutExercises.id, workoutExerciseId))
    .limit(1)
  if (!row) throw new Error("Not found")

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId))
}

export async function addSet(
  workoutExerciseId: number,
  data: { reps: number; weight?: string }
): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify ownership
  const [weRow] = await db
    .select({ workoutId: workoutExercises.workoutId })
    .from(workoutExercises)
    .innerJoin(workouts, and(eq(workouts.id, workoutExercises.workoutId), eq(workouts.userId, userId)))
    .where(eq(workoutExercises.id, workoutExerciseId))
    .limit(1)
  if (!weRow) throw new Error("Not found")

  const [maxResult] = await db
    .select({ maxSet: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))

  const nextSetNumber = (maxResult?.maxSet ?? 0) + 1

  await db.insert(sets).values({
    workoutExerciseId,
    setNumber: nextSetNumber,
    reps: data.reps,
    weight: data.weight ?? null,
  })
}

export async function updateSet(
  setId: number,
  data: { reps: number; weight?: string }
): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify ownership
  const [row] = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, and(eq(workouts.id, workoutExercises.workoutId), eq(workouts.userId, userId)))
    .where(eq(sets.id, setId))
    .limit(1)
  if (!row) throw new Error("Not found")

  await db
    .update(sets)
    .set({ reps: data.reps, weight: data.weight ?? null })
    .where(eq(sets.id, setId))
}

export async function deleteSet(setId: number): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify ownership
  const [row] = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, and(eq(workouts.id, workoutExercises.workoutId), eq(workouts.userId, userId)))
    .where(eq(sets.id, setId))
    .limit(1)
  if (!row) throw new Error("Not found")

  await db.delete(sets).where(eq(sets.id, setId))
}

export async function getWorkoutsForDate(date: string): Promise<WorkoutWithExercises[]> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutTitle: workouts.title,
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
        title: row.workoutTitle,
        date: row.workoutDate,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      })
    }

    if (row.workoutExerciseId != null && row.exerciseId != null && row.exerciseName != null) {
      if (!exerciseMap.has(row.workoutExerciseId)) {
        const exercise = {
          workoutExerciseId: row.workoutExerciseId,
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
