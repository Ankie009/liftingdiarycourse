import { notFound } from "next/navigation"
import { getWorkoutById } from "@/data/workouts"
import EditWorkoutForm from "./edit-workout-form"

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const id = parseInt(workoutId, 10)

  if (isNaN(id)) notFound()

  const workout = await getWorkoutById(id)
  if (!workout) notFound()

  return (
    <div className="container mx-auto max-w-md py-10 px-4">
      <h1 className="text-2xl font-semibold mb-8">Edit Workout</h1>
      <EditWorkoutForm workout={workout} />
    </div>
  )
}
