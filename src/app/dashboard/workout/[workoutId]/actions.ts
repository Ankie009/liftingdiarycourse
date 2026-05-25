"use server"

import { z } from "zod"
import { updateWorkoutDate } from "@/data/workouts"

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  date: z.coerce.date(),
})

export async function updateWorkoutAction(input: { workoutId: number; date: Date }) {
  const parsed = updateWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return updateWorkoutDate(parsed.data.workoutId, parsed.data.date)
}
