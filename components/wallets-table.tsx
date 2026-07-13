import { useMemo } from 'react';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table/data-table-column-header';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from './data-table/data-table';
import { DataTableToolbar } from './data-table/data-table-toolbar';
import { DataTableSkeleton } from './data-table/data-table-skeleton';
import { formatJalaliDate } from '@/utils/format';

const data = [
  {
    loanDetailAmount: 17652278,
    requestDate: '2025-12-31T15:45:19.6629846',
    creditAmount: 100000000,
    remainCreditAmount: 0,
    creditValidityDate: null,
    period: 6,
    contractFilePath: null,
    requestNumber: 10057,
    planFinancierName: null,
    planName: 'یلدا',
    planGuarantees: [],
    requestState: 2,
    lastSuccessState: null,
    mode: 1,
    forCorrections: null,
    rejectDescription: null,
    incomeInfoAttachmentFilePath: null,
    loanHeaderId: '00000000-0000-0000-0000-000000000000',
    planId: '45825ad9-d314-46d1-0033-08de4792676b',
    invoiceId: '00000000-0000-0000-0000-000000000000',
    invoiceAttachmentId: null,
    userCreditStatusId: '00000000-0000-0000-0000-000000000000',
    userFacilityId: '00000000-0000-0000-0000-000000000000',
    userGuarantyId: '00000000-0000-0000-0000-000000000000',
    chequeId: '00000000-0000-0000-0000-000000000000',
    userId: '161e42c1-5703-4224-9308-5acd671a0bbb',
    incomeInfoId: '00000000-0000-0000-0000-000000000000',
    validateType: null,
    id: 'ef3b1aa8-0b22-4cd0-f472-08de48468f41',
    isActive: true,
  },
  {
    loanDetailAmount: 9407632,
    requestDate: '2025-12-31T12:02:55.4257199',
    creditAmount: 100000000,
    remainCreditAmount: 0,
    creditValidityDate: null,
    period: 12,
    contractFilePath: null,
    requestNumber: 10054,
    planFinancierName: 'کاراپی',
    planName: '12 ماهه',
    planGuarantees: ['کسر از حقوق'],
    requestState: 28,
    lastSuccessState: null,
    mode: 4,
    forCorrections: null,
    rejectDescription: '',
    incomeInfoAttachmentFilePath: null,
    loanHeaderId: '00000000-0000-0000-0000-000000000000',
    planId: 'd0494344-cb62-4faa-2cd9-08ddc37ce085',
    invoiceId: '00000000-0000-0000-0000-000000000000',
    invoiceAttachmentId: null,
    userCreditStatusId: '00000000-0000-0000-0000-000000000000',
    userFacilityId: '00000000-0000-0000-0000-000000000000',
    userGuarantyId: '00000000-0000-0000-0000-000000000000',
    chequeId: '00000000-0000-0000-0000-000000000000',
    userId: '161e42c1-5703-4224-9308-5acd671a0bbb',
    incomeInfoId: '00000000-0000-0000-0000-000000000000',
    validateType: 1,
    id: '59dd1fdd-d474-4119-f46f-08de48468f41',
    isActive: true,
  },
];

export const WalletsTable = () => {
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'requestDate',
        accessorKey: 'requestDate',
        meta: { label: 'شناسه' },
        header: ({ column }: { column: Column<any, unknown> }) => (
          <DataTableColumnHeader label='شناسه' column={column} />
        ),
        cell: ({ cell }) => formatJalaliDate(cell.getValue<any['requestDate']>()),
      },
      {
        id: 'creditAmount',
        accessorKey: 'creditAmount',
        meta: { label: 'تاریخ آخرین فعالیت' },
        header: ({ column }: { column: Column<any, unknown> }) => (
          <DataTableColumnHeader label='تاریخ آخرین فعالیت' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<any['creditAmount']>(),
      },
      {
        id: 'period',
        accessorKey: 'period',
        meta: { label: 'تاریخ فریز' },
        header: ({ column }: { column: Column<any, unknown> }) => (
          <DataTableColumnHeader label='تاریخ فریز' column={column} />
        ),
        cell: ({ cell }) => `${cell.getValue<any['period']>()} ماه`,
      },
      {
        id: 'requestNumber',
        accessorKey: 'requestNumber',
        meta: { label: 'وضعیت' },
        header: ({ column }: { column: Column<any, unknown> }) => (
          <DataTableColumnHeader label='وضعیت' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<any['requestNumber']>(),
      },
      {
        id: 'requestState',
        accessorKey: 'requestState',
        meta: { label: 'مبلغ' },
        header: ({ column }: { column: Column<any, unknown> }) => (
          <DataTableColumnHeader label='مبلغ' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<any['requestState']>(),
      },
      {
        id: 'requestState',
        accessorKey: 'requestState',
        meta: { label: 'نوع' },
        header: ({ column }: { column: Column<any, unknown> }) => (
          <DataTableColumnHeader label='نوع' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<any['requestState']>(),
      },
      {
        id: 'requestState',
        accessorKey: 'requestState',
        meta: { label: 'فروشگاه' },
        header: ({ column }: { column: Column<any, unknown> }) => (
          <DataTableColumnHeader label='فروشگاه' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<any['requestState']>(),
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount: Math.ceil((data?.length ?? 0) / 10),
    getRowId: row => row.city_id?.toString() ?? '',
  });

  return (
    <DataTable table={table} className='overflow-x-auto'>
      <DataTableToolbar table={table} className='flex-col md:flex-row'></DataTableToolbar>

      {/* {isLoading && (
        <DataTableSkeleton
          columnCount={2}
          filterCount={0}
          cellWidths={['200px', '300px', 'grow']}
        />
      )} */}
    </DataTable>
  );
};
