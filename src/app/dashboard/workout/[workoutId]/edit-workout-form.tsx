"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Trash2, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  updateWorkoutAction,
  addExerciseAction,
  removeExerciseAction,
  addSetAction,
  updateSetAction,
  deleteSetAction,
} from "./actions"
import type { WorkoutWithExercises } from "@/data/workouts"

type SetRow = WorkoutWithExercises["exercises"][number]["sets"][number]

function SetEditor({
  set,
  onSave,
  onDelete,
}: {
  set: SetRow
  onSave: (reps: number, weight: string) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [reps, setReps] = useState(String(set.reps))
  const [weight, setWeight] = useState(set.weight ?? "")
  const [isPending, startTransition] = useTransition()

  function handleBlur() {
    const parsedReps = parseInt(reps, 10)
    if (isNaN(parsedReps) || parsedReps <= 0) return
    startTransition(() => onSave(parsedReps, weight))
  }

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-12 text-sm text-muted-foreground">Set {set.setNumber}</span>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={1}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={handleBlur}
          className="h-8 w-16 text-sm"
          placeholder="Reps"
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">reps</span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          step="0.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={handleBlur}
          className="h-8 w-20 text-sm"
          placeholder="kg"
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">kg</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => startTransition(onDelete)}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function AddSetRow({
  workoutExerciseId,
  onAdded,
}: {
  workoutExerciseId: number
  onAdded: () => void
}) {
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    const parsedReps = parseInt(reps, 10)
    if (isNaN(parsedReps) || parsedReps <= 0) return
    startTransition(async () => {
      await addSetAction({ workoutExerciseId, reps: parsedReps, weight: weight || undefined })
      setReps("")
      setWeight("")
      onAdded()
    })
  }

  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="w-12 text-sm text-muted-foreground">New</span>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={1}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="h-8 w-16 text-sm"
          placeholder="Reps"
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">reps</span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          step="0.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="h-8 w-20 text-sm"
          placeholder="kg"
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">kg</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={handleAdd}
        disabled={isPending || !reps}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Set
      </Button>
    </div>
  )
}

export default function EditWorkoutForm({ workout }: { workout: WorkoutWithExercises }) {
  const router = useRouter()
  const defaultTitle = workout.title || `Workout for ${format(parseISO(workout.date), "do MMM yyyy")}`
  const [title, setTitle] = useState(defaultTitle)
  const [date, setDate] = useState<Date>(parseISO(workout.date))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isSaving, startSave] = useTransition()
  const [newExerciseName, setNewExerciseName] = useState("")
  const [isAddingExercise, startAddExercise] = useTransition()

  function handleSave() {
    startSave(async () => {
      await updateWorkoutAction({ workoutId: workout.id, title, date })
      router.refresh()
    })
  }

  function handleAddExercise() {
    if (!newExerciseName.trim()) return
    startAddExercise(async () => {
      await addExerciseAction({ workoutId: workout.id, exerciseName: newExerciseName.trim() })
      setNewExerciseName("")
      router.refresh()
    })
  }

  function handleRemoveExercise(workoutExerciseId: number) {
    return async () => {
      await removeExerciseAction({ workoutExerciseId })
      router.refresh()
    }
  }

  function handleUpdateSet(setId: number) {
    return async (reps: number, weight: string) => {
      await updateSetAction({ setId, reps, weight: weight || undefined })
      router.refresh()
    }
  }

  function handleDeleteSet(setId: number) {
    return async () => {
      await deleteSetAction({ setId })
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title & Date */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Workout Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Workout title"
            disabled={isSaving}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                  setCalendarOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Exercises */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Exercises</h2>

        {workout.exercises.length === 0 && (
          <p className="text-sm text-muted-foreground">No exercises yet. Add one below.</p>
        )}

        {workout.exercises.map((exercise) => (
          <ExerciseSection
            key={exercise.workoutExerciseId}
            exercise={exercise}
            onRemove={handleRemoveExercise(exercise.workoutExerciseId)}
            onUpdateSet={handleUpdateSet}
            onDeleteSet={handleDeleteSet}
            onSetAdded={() => router.refresh()}
          />
        ))}

        {/* Add Exercise */}
        <div className="flex gap-2 pt-2">
          <Input
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="Exercise name (e.g. Bench Press)"
            disabled={isAddingExercise}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddExercise()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddExercise}
            disabled={isAddingExercise || !newExerciseName.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Exercise
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/dashboard")} type="button">
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

function ExerciseSection({
  exercise,
  onRemove,
  onUpdateSet,
  onDeleteSet,
  onSetAdded,
}: {
  exercise: WorkoutWithExercises["exercises"][number]
  onRemove: () => Promise<void>
  onUpdateSet: (setId: number) => (reps: number, weight: string) => Promise<void>
  onDeleteSet: (setId: number) => () => Promise<void>
  onSetAdded: () => void
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{exercise.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => startTransition(onRemove)}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>

      {exercise.sets.map((set) => (
        <SetEditor
          key={set.id}
          set={set}
          onSave={onUpdateSet(set.id)}
          onDelete={onDeleteSet(set.id)}
        />
      ))}

      <AddSetRow workoutExerciseId={exercise.workoutExerciseId} onAdded={onSetAdded} />
    </div>
  )
}
