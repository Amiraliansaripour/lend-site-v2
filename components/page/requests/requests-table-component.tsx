'use client';

import { useMemo } from 'react';
import { Column, ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '../../data-table/data-table-column-header';
import { DataTableToolbar } from '../../data-table/data-table-toolbar';
import { DataTable } from '../../data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { formatJalaliDate, formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { Badge } from '@/components/ui/badge';
import { getRequestStatusInfo } from '@/utils/request-status';
import type { Request } from './request-types';

type RequestsTableComponentProps = {
  requests: Request[];
};

export function RequestsTableComponent({ requests }: RequestsTableComponentProps) {
  const columns = useMemo<ColumnDef<Request>[]>(
    () => [
      {
        id: 'requestDate',
        accessorKey: 'requestDate',
        meta: { label: 'تاریخ درخواست' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='تاریخ درخواست' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return value ? formatJalaliDate(value) : 'یافت نشد';
        },
      },
      {
        id: 'creditAmount',
        accessorKey: 'creditAmount',
        meta: { label: 'مبلغ' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='مبلغ' column={column} />
        ),
        cell: ({ cell }) => {
          const amount = cell.getValue<number>();
          return `${normalizeToPersianDigits(formatNumber(amount, { int: true }))} ریال`;
        },
      },
      {
        id: 'period',
        accessorKey: 'period',
        meta: { label: 'مدت بازپرداخت' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='مدت بازپرداخت' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value ? `${normalizeToPersianDigits(String(value))} ماه` : 'یافت نشد';
        },
      },
      {
        id: 'requestNumber',
        accessorKey: 'requestNumber',
        meta: { label: 'شناسه درخواست' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='شناسه درخواست' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return normalizeToPersianDigits(String(value)) || 'یافت نشد';
        },
      },
      {
        id: 'requestState',
        accessorKey: 'requestState',
        meta: { label: 'وضعیت' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='وضعیت' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<number>();
          const statusInfo = getRequestStatusInfo(value);

          return (
            <Badge variant={statusInfo.variant} className='whitespace-nowrap'>
              {statusInfo.text}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: requests,
    columns,
    pageCount: 1,
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
