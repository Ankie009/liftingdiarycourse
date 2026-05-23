"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MOCK_WORKOUTS = [
  { id: 1, name: "Bench Press", sets: 4, reps: 8, weight: "80kg" },
  { id: 2, name: "Squat", sets: 3, reps: 5, weight: "100kg" },
  { id: 3, name: "Deadlift", sets: 3, reps: 5, weight: "120kg" },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Selected date</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="inline-flex h-8 w-60 items-center justify-start gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
            <CalendarIcon className="h-4 w-4" />
            {format(date, "do MMM yyyy")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {MOCK_WORKOUTS.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {MOCK_WORKOUTS.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-1 pt-4 px-5">
                  <CardTitle className="text-base">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {workout.sets} sets &times; {workout.reps} reps &mdash;{" "}
                    {workout.weight}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
