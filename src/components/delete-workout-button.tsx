"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteWorkoutAction } from "@/app/dashboard/actions"

export function DeleteWorkoutButton({ workoutId }: { workoutId: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteWorkoutAction({ workoutId })
          router.refresh()
        })
      }
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
