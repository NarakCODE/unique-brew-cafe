"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { State, IState } from "country-state-city";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StateDropdownProps {
  countryCode: string;
  value?: string;
  onChange?: (stateName: string, stateCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function StateDropdown({
  countryCode,
  value,
  onChange,
  disabled,
  placeholder = "Select state...",
}: StateDropdownProps) {
  const [open, setOpen] = useState(false);
  const [states, setStates] = useState<IState[]>([]);
  const [selectedState, setSelectedState] = useState<IState | undefined>(
    undefined
  );

  useEffect(() => {
    if (countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      setStates(countryStates);
    } else {
      setStates([]);
    }
  }, [countryCode]);

  useEffect(() => {
    if (value && states.length > 0) {
      const match = states.find(
        (s) => s.name.toLowerCase() === value.toLowerCase()
      );
      setSelectedState(match);
    } else if (!value) {
      setSelectedState(undefined);
    }
  }, [value, states]);

  const handleSelect = (state: IState) => {
    setSelectedState(state);
    onChange?.(state.name, state.isoCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled || states.length === 0}
        >
          {selectedState ? (
            <span className="truncate">{selectedState.name}</span>
          ) : (
            <span className="flex items-center gap-2">{placeholder}</span>
          )}
          <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search state..." />
          <CommandList>
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              <div className="max-h-[200px] overflow-y-auto">
                {states.map((state) => (
                  <CommandItem
                    key={state.isoCode}
                    value={state.name}
                    onSelect={() => handleSelect(state)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedState?.isoCode === state.isoCode
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {state.name}
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
