"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import {
  updateWorkoutTitleAndDate,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  updateSet,
  deleteSet,
} from "@/data/workouts"

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  date: z.coerce.date(),
})

export async function updateWorkoutAction(input: { workoutId: number; title: string; date: Date }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = updateWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return updateWorkoutTitleAndDate(parsed.data.workoutId, parsed.data.title, parsed.data.date)
}

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().min(1).max(200),
})

export async function addExerciseAction(input: { workoutId: number; exerciseName: string }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = addExerciseSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return addExerciseToWorkout(parsed.data.workoutId, parsed.data.exerciseName)
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
})

export async function removeExerciseAction(input: { workoutExerciseId: number }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = removeExerciseSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return removeExerciseFromWorkout(parsed.data.workoutExerciseId)
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.string().optional(),
})

export async function addSetAction(input: { workoutExerciseId: number; reps: number; weight?: string }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = addSetSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return addSet(parsed.data.workoutExerciseId, { reps: parsed.data.reps, weight: parsed.data.weight })
}

const updateSetSchema = z.object({
  setId: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.string().optional(),
})

export async function updateSetAction(input: { setId: number; reps: number; weight?: string }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = updateSetSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return updateSet(parsed.data.setId, { reps: parsed.data.reps, weight: parsed.data.weight })
}

const deleteSetSchema = z.object({
  setId: z.number().int().positive(),
})

export async function deleteSetAction(input: { setId: number }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = deleteSetSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return deleteSet(parsed.data.setId)
}
