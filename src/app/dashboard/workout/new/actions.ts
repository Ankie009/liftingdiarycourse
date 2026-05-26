"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { createWorkout } from "@/data/workouts"

const createWorkoutSchema = z.object({
  date: z.coerce.date(),
})

export async function createWorkoutAction(input: { date: Date }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return createWorkout(parsed.data.date)
}
