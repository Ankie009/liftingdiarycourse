"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { deleteWorkout } from "@/data/workouts"

const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
})

export async function deleteWorkoutAction(input: { workoutId: number }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = deleteWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return deleteWorkout(parsed.data.workoutId)
}
