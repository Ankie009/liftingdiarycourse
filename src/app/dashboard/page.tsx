import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { DashboardDatePicker } from "@/components/dashboard-date-picker"
import { DeleteWorkoutButton } from "@/components/delete-workout-button"
import { getWorkoutsForDate } from "@/data/workouts"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams

  const today = format(new Date(), "yyyy-MM-dd")
  const dateStr = dateParam ?? today
  const selectedDate = parseISO(dateStr)

  const workouts = await getWorkoutsForDate(dateStr)

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/dashboard/workout/new" className={buttonVariants()}>
          New Workout
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Selected date</p>
        <DashboardDatePicker selected={selectedDate} />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {workouts.map((workout) => (
              <div key={workout.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{workout.title || `Workout for ${format(parseISO(workout.date), "do MMM yyyy")}`}</h3>
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/workout/${workout.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Edit
                    </Link>
                    <DeleteWorkoutButton workoutId={workout.id} />
                  </div>
                </div>
                {workout.exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No exercises added yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {workout.exercises.map((exercise) => (
                      <Card key={exercise.workoutExerciseId}>
                        <CardHeader className="pb-1 pt-4 px-5">
                          <CardTitle className="text-base">{exercise.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-4">
                          <div className="flex flex-col gap-0.5">
                            {exercise.sets.map((set) => (
                              <p key={set.id} className="text-sm text-muted-foreground">
                                Set {set.setNumber}: {set.reps} reps
                                {set.weight ? ` — ${set.weight}kg` : ""}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
