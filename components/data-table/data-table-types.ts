import type { RowData } from '@tanstack/react-table';
import type { FilterVariant, Option } from './data-table';

declare module '@tanstack/react-table' {
  // biome-ignore lint/correctness/noUnusedVariables: TValue is used in the ColumnMeta interface
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    className?: string;
  }
}
