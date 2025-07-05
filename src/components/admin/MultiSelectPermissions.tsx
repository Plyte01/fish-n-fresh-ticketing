'use client';

import { useState } from 'react';
import { Permission } from '@prisma/client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type MultiSelectPermissionsProps = {
  allPermissions: Permission[];
  selected: string[]; // Array of selected permission IDs
  onChange: (newSelected: string[]) => void;
};

export function MultiSelectPermissions({
  allPermissions,
  selected,
  onChange,
}: MultiSelectPermissionsProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const togglePermission = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter((pid) => pid !== id)
      : [...selected, id];
    onChange(newSelected);
  };

  const selectedLabels = allPermissions
    .filter((p) => selected.includes(p.id))
    .map((p) => p.name)
    .join(', ');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            'w-full justify-between text-left font-normal',
            !selected.length && 'text-muted-foreground'
          )}
        >
          {selected.length > 0 ? selectedLabels : 'Select permissions...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search permissions..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No permission found.</CommandEmpty>
          <CommandGroup>
            {allPermissions
              .filter((perm) => perm.name.toLowerCase().includes(search.toLowerCase()))
              .map((perm) => (
                <CommandItem
                  key={perm.id}
                  onSelect={() => togglePermission(perm.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(perm.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {perm.name}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
