import {
  Select,
  SelectItem,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select';

import type { JSX } from 'react';

type EditorSelectProps = {
  options: { label: string; value: string; icon: JSX.Element }[];
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export function EditorSelect({ options, value, onValueChange, disabled }: EditorSelectProps) {
  return (
    <Select disabled={disabled} value={value} onValueChange={onValueChange}>
      <SelectTrigger className='capitalize *:first:-mb-1 border-y-0 rounded-none *:data-[slot="select-value"]:-mt-1'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(({ label, value, icon }) => (
            <SelectItem key={value} value={value} className='capitalize'>
              {icon}
              <span className='-mb-1'>{label}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
