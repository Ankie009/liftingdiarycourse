import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardDatePicker } from "@/components/dashboard-date-picker"
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
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

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
          <div className="flex flex-col gap-3">
            {workouts.map((workout) =>
              workout.exercises.map((exercise) => (
                <Card key={exercise.id}>
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
