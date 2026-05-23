"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DashboardDatePicker({ selected }: { selected: Date }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleSelect(d: Date | undefined) {
    if (!d) return
    router.push(`?date=${format(d, "yyyy-MM-dd")}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex h-8 w-60 items-center justify-start gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
        <CalendarIcon className="h-4 w-4" />
        {format(selected, "do MMM yyyy")}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
