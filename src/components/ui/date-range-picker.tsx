"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Componente de ShadCN
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (range: DateRange) => void;
}

export function DatePickerWithRange({ date, setDate }: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {date?.from ? format(date.from, "dd/MM/yyyy") : "Desde"} - {date?.to ? format(date.to, "dd/MM/yyyy") : "Hasta"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={date}
          onSelect={(range) => setDate(range as DateRange)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
