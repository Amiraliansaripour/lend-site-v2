<<<<<<< HEAD
'use client';

import { useMemo } from 'react';
import { Column, ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '../../data-table/data-table-column-header';
import { DataTableToolbar } from '../../data-table/data-table-toolbar';
import { DataTable } from '../../data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { formatJalaliDate, formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { cn } from '@/lib/utils';
import type { WalletTransaction } from '@/api/wallet';

type WalletTransactionsTableProps = {
  transactions: WalletTransaction[];
};

const getTransactionTypeLabel = (value: number): string => {
  switch (value) {
    case 0:
      return 'ورود به درگاه پرداخت';
    case 1:
      return 'فریز';
    case 2:
      return 'موفق';
    case 3:
      return 'لغو';
    case 4:
      return 'شارژ کیف پول';
    case 5:
      return 'شارژ کیف پول اعتباری';
    default:
      return 'نامشخص';
  }
};

const getTransactionTypeColor = (value: number): string => {
  switch (value) {
    case 0:
      return 'text-blue-700 bg-blue-100';
    case 1:
      return 'text-orange-700 bg-orange-100';
    case 2:
      return 'text-green-700 bg-green-100';
    case 3:
      return 'text-red-700 bg-red-100';
    case 4:
      return 'text-purple-700 bg-purple-100';
    case 5:
      return 'text-indigo-700 bg-indigo-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

export function WalletTransactionsTable({ transactions }: WalletTransactionsTableProps) {
  const columns = useMemo<ColumnDef<WalletTransaction>[]>(
    () => [
      {
        id: 'orderId',
        accessorKey: 'orderId',
        meta: { label: 'شناسه' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='شناسه' column={column} />
        ),
        cell: ({ cell }) => normalizeToPersianDigits(String(cell.getValue<number>())),
      },
      {
        id: 'dateTimeFinal',
        accessorKey: 'dateTimeFinal',
        meta: { label: 'تاریخ آخرین فعالیت' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='تاریخ آخرین فعالیت' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? formatJalaliDate(value) : '_';
        },
      },
      {
        id: 'dateTimeFreez',
        accessorKey: 'dateTimeFreez',
        meta: { label: 'تاریخ فریز' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='تاریخ فریز' column={column} />
        ),
        cell: ({ cell }) => formatJalaliDate(cell.getValue<string>()),
      },
      {
        id: 'transactionType',
        accessorKey: 'transactionType',
        meta: { label: 'وضعیت' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='وضعیت' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return (
            <span
              className={cn(
                'font-medium px-2 py-1 rounded-full text-xs',
                getTransactionTypeColor(value),
              )}
            >
              {getTransactionTypeLabel(value)}
            </span>
          );
        },
      },
      {
        id: 'freezAmount',
        accessorKey: 'freezAmount',
        meta: { label: 'مبلغ' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='مبلغ' column={column} />
        ),
        cell: ({ cell }) => {
          const amount = cell.getValue<number>();
          return `${normalizeToPersianDigits(formatNumber(amount, { int: true }))} ریال`;
        },
      },
      {
        id: 'creditType',
        accessorKey: 'creditType',
        meta: { label: 'نوع' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='نوع' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<string>(),
      },
      {
        id: 'merchantName',
        accessorKey: 'merchantName',
        meta: { label: 'فروشگاه' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='فروشگاه' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<string>(),
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: transactions,
    columns,
    pageCount: 1,
  });

  return (
    <div className='mt-10 md:mt-20'>
      <div className='mb-5 font-bold text-base lg:text-xl pr-2'>لیست تراکنش‌ها</div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
=======
'use client';

import { useMemo } from 'react';
import { Column, ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '../../data-table/data-table-column-header';
import { DataTableToolbar } from '../../data-table/data-table-toolbar';
import { DataTable } from '../../data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { formatJalaliDate, formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { cn } from '@/lib/utils';
import type { WalletTransaction } from '@/api/wallet';

type WalletTransactionsTableProps = {
  transactions: WalletTransaction[];
};

const getTransactionTypeLabel = (value: number): string => {
  switch (value) {
    case 0:
      return 'ورود به درگاه پرداخت';
    case 1:
      return 'فریز';
    case 2:
      return 'موفق';
    case 3:
      return 'لغو';
    case 4:
      return 'شارژ کیف پول';
    case 5:
      return 'شارژ کیف پول اعتباری';
    default:
      return 'نامشخص';
  }
};

const getTransactionTypeColor = (value: number): string => {
  switch (value) {
    case 0:
      return 'text-blue-700 bg-blue-100';
    case 1:
      return 'text-orange-700 bg-orange-100';
    case 2:
      return 'text-green-700 bg-green-100';
    case 3:
      return 'text-red-700 bg-red-100';
    case 4:
      return 'text-purple-700 bg-purple-100';
    case 5:
      return 'text-indigo-700 bg-indigo-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

export function WalletTransactionsTable({ transactions }: WalletTransactionsTableProps) {
  const columns = useMemo<ColumnDef<WalletTransaction>[]>(
    () => [
      {
        id: 'orderId',
        accessorKey: 'orderId',
        meta: { label: 'شناسه' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='شناسه' column={column} />
        ),
        cell: ({ cell }) => normalizeToPersianDigits(String(cell.getValue<number>())),
      },
      {
        id: 'dateTimeFinal',
        accessorKey: 'dateTimeFinal',
        meta: { label: 'تاریخ آخرین فعالیت' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='تاریخ آخرین فعالیت' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? formatJalaliDate(value) : '_';
        },
      },
      {
        id: 'dateTimeFreez',
        accessorKey: 'dateTimeFreez',
        meta: { label: 'تاریخ فریز' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='تاریخ فریز' column={column} />
        ),
        cell: ({ cell }) => formatJalaliDate(cell.getValue<string>()),
      },
      {
        id: 'transactionType',
        accessorKey: 'transactionType',
        meta: { label: 'وضعیت' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='وضعیت' column={column} />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return (
            <span
              className={cn(
                'font-medium px-2 py-1 rounded-full text-xs',
                getTransactionTypeColor(value),
              )}
            >
              {getTransactionTypeLabel(value)}
            </span>
          );
        },
      },
      {
        id: 'freezAmount',
        accessorKey: 'freezAmount',
        meta: { label: 'مبلغ' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='مبلغ' column={column} />
        ),
        cell: ({ cell }) => {
          const amount = cell.getValue<number>();
          return `${normalizeToPersianDigits(formatNumber(amount, { int: true }))} ریال`;
        },
      },
      {
        id: 'creditType',
        accessorKey: 'creditType',
        meta: { label: 'نوع' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='نوع' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<string>(),
      },
      {
        id: 'merchantName',
        accessorKey: 'merchantName',
        meta: { label: 'فروشگاه' },
        header: ({ column }: { column: Column<WalletTransaction, unknown> }) => (
          <DataTableColumnHeader label='فروشگاه' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<string>(),
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: transactions,
    columns,
    pageCount: 1,
  });

  return (
    <div className='mt-10 md:mt-20'>
      <div className='mb-5 font-bold text-base lg:text-xl pr-2'>لیست تراکنش‌ها</div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
>>>>>>> a47b58a (pwa)
