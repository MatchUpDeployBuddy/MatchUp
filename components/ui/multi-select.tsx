"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface MultiSelectOption {
  label: string
  value: string
}

export interface MultiSelectProps {
  placeholder?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (values: string[]) => void
}

export function MultiSelectDemo({
  placeholder,
  options,
  value,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown if user clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Toggle individual option
  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      // Remove if already selected
      onChange(value.filter((v) => v !== optionValue))
    } else {
      // Add otherwise
      onChange([...value, optionValue])
    }
  }

  // Figure out which labels are currently selected
  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label)

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between"
      >
        <span className="truncate">
          {selectedLabels.length === 0
            ? placeholder || "Select..."
            : selectedLabels.join(", ")}
        </span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {/* Dropdown with checkboxes */}
      {open && (
        <div className="absolute z-10 mt-1 max-h-44 w-full overflow-y-auto rounded border bg-white shadow">
          {options.map((opt) => {
            const isSelected = value.includes(opt.value)
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleOption(opt.value)}
                  className="mr-2"
                />
                <span>{opt.label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
