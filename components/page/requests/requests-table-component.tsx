'use client';

import { useCallback, useMemo, useState } from 'react';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

import { DataTableColumnHeader } from '../../data-table/data-table-column-header';
import { DataTableToolbar } from '../../data-table/data-table-toolbar';
import { DataTable } from '../../data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { formatJalaliDate, formatNumber } from '@/utils/format';
import { normalizeToPersianDigits } from '@/utils/normalize';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChangeRequestState } from '@/mutations/request';
import {
  canCancelRequest,
  canContinueRequest,
  canResumeRequest,
  getRequestStatusInfo,
  REQUEST_STATE_CANCELLED,
} from '@/utils/request-status';
import type { Request } from './request-types';

type RequestsTableComponentProps = {
  requests: Request[];
};

function PlanGuaranteesButton({ guarantees }: { guarantees: string[] }) {
  const [open, setOpen] = useState(false);

  if (!guarantees?.length) {
    return <span className='text-muted-foreground'>—</span>;
  }

  return (
    <>
      <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
        مشاهده ضمانت‌ها
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-right'>ضمانت‌های طرح</DialogTitle>
            <DialogDescription className='text-right'>
              لیست ضمانت‌های مورد نیاز این طرح
            </DialogDescription>
          </DialogHeader>
          <ul className='mt-2 list-disc space-y-2 pr-5 text-sm'>
            {guarantees.map(guarantee => (
              <li key={guarantee}>{guarantee}</li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RequestActionsCell({ request }: { request: Request }) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const changeRequestStateMutation = useChangeRequestState();

  const { id, requestState } = request;
  const showContinue = canContinueRequest(requestState);
  const showResume = canResumeRequest(requestState);
  const showCancel = canCancelRequest(requestState);

  const handleCancelRequest = useCallback(async () => {
    if (!canCancelRequest(requestState)) {
      toast.error('امکان لغو این درخواست وجود ندارد');
      return;
    }

    try {
      await changeRequestStateMutation.mutateAsync({
        id,
        requestState: REQUEST_STATE_CANCELLED,
      });
      toast.success('درخواست شما با موفقیت لغو شد');
      setIsCancelDialogOpen(false);
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.data?.message
          : undefined;
      toast.error(msg || 'خطا در لغو درخواست');
    }
  }, [id, requestState, changeRequestStateMutation]);

  if (!showContinue && !showResume && !showCancel) {
    return <span className='text-muted-foreground'>—</span>;
  }

  return (
    <div className='flex  items-center gap-2'>
      {showContinue && (
        <Button variant='outline' size='sm' asChild>
          <Link href={`/requests/request-credit?id=${id}`}>ادامه</Link>
        </Button>
      )}
      {showResume && (
        <Button variant='outline' size='sm' asChild>
          <Link href={`/requests/request-credit?id=${id}&editMode=true`}>از سرگیری</Link>
        </Button>
      )}
      {showCancel && (
        <>
          <Button variant='destructive' size='sm' onClick={() => setIsCancelDialogOpen(true)}>
            لغو
          </Button>
          <ConfirmDialog
            open={isCancelDialogOpen}
            setOpen={setIsCancelDialogOpen}
            title='لغو درخواست'
            description='آیا از لغو این درخواست اطمینان دارید؟ پس از لغو می‌توانید درخواست جدیدی ثبت کنید.'
            confirmText='بله، لغو شود'
            cancelText='خیر'
            isPending={changeRequestStateMutation.isPending}
            onConfirm={handleCancelRequest}
          />
        </>
      )}
    </div>
  );
}

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
        id: 'planName',
        accessorKey: 'planName',
        meta: { label: 'نام طرح' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='نام طرح' column={column} />
        ),
        cell: ({ cell }) => cell.getValue<string>() || 'یافت نشد',
      },
      {
        id: 'planGuarantees',
        accessorKey: 'planGuarantees',
        enableSorting: false,
        meta: { label: 'ضمانت‌ها' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='ضمانت‌ها' column={column} />
        ),
        cell: ({ row }) => <PlanGuaranteesButton guarantees={row.original.planGuarantees} />,
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
      {
        id: 'actions',
        enableSorting: false,
        meta: { label: 'عملیات' },
        header: ({ column }: { column: Column<Request, unknown> }) => (
          <DataTableColumnHeader label='عملیات' column={column} />
        ),
        cell: ({ row }) => <RequestActionsCell request={row.original} />,
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: requests,
    columns,
    pageCount: Math.max(1, Math.ceil(requests.length / 10)),
    manualSorting: false,
    manualPagination: false,
    manualFiltering: false,
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
