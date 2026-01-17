"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { City, ICity } from "country-state-city";

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

interface CityDropdownProps {
  countryCode: string;
  stateCode: string;
  value?: string;
  onChange?: (cityName: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CityDropdown({
  countryCode,
  stateCode,
  value,
  onChange,
  disabled,
  placeholder = "Select city...",
}: CityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCity, setSelectedCity] = useState<ICity | undefined>(
    undefined
  );

  useEffect(() => {
    if (countryCode && stateCode) {
      const stateCities = City.getCitiesOfState(countryCode, stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [countryCode, stateCode]);

  useEffect(() => {
    if (value && cities.length > 0) {
      const match = cities.find(
        (c) => c.name.toLowerCase() === value.toLowerCase()
      );
      setSelectedCity(match);
    } else if (!value) {
      setSelectedCity(undefined);
    }
  }, [value, cities]);

  const handleSelect = (city: ICity) => {
    setSelectedCity(city);
    onChange?.(city.name);
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
          disabled={disabled || cities.length === 0}
        >
          {selectedCity ? (
            <span className="truncate">{selectedCity.name}</span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              <div className="max-h-[200px] overflow-y-auto">
                {cities.map((city) => (
                  <CommandItem
                    key={city.name + city.latitude} // Some cities have duplicates or no ID
                    value={city.name}
                    onSelect={() => handleSelect(city)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCity?.name === city.name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {city.name}
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
