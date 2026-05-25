"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateWorkoutAction } from "./actions"
import type { WorkoutWithExercises } from "@/data/workouts"

export default function EditWorkoutForm({ workout }: { workout: WorkoutWithExercises }) {
  const router = useRouter()
  const [date, setDate] = useState<Date>(parseISO(workout.date))
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateWorkoutAction({ workoutId: workout.id, date })
      router.push("/dashboard")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            id="date"
            className="inline-flex w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal whitespace-nowrap transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
          >
            <CalendarIcon className="h-4 w-4" />
            {format(date, "do MMM yyyy")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (!d) return
                setDate(d)
                setOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  )
}
