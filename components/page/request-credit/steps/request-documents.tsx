'use client';

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Download,
  FileText,
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getShopImageUrl } from '@/lib/shop-utils';
import {
  REQUEST_DOCUMENT_ACCEPT,
  REQUEST_DOCUMENT_MAX_SIZE_MB,
  REQUEST_DOCUMENT_STATUS,
  checkRequestDocumentCompleteness,
  formatRequestDocumentUploadedAt,
  getRequestDocumentStatusLabel,
  isRequestDocumentUploaded,
  needsRequestDocumentReupload,
  validateRequestDocumentFile,
  type RequestDocument,
} from '@/api/request-document';
import { useRequestDocumentCompleteness, useRequestDocuments } from '@/queries/request-document';
import { useUploadRequestDocument } from '@/mutations/request-document';

interface RequestDocumentsProps {
  requestId: string;
  planNote?: string | null;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isReadOnly?: boolean;
}

function statusBadgeVariant(
  status?: number | null,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (Number(status)) {
    case REQUEST_DOCUMENT_STATUS.Approved:
      return 'default';
    case REQUEST_DOCUMENT_STATUS.Rejected:
    case REQUEST_DOCUMENT_STATUS.NeedsCorrection:
      return 'destructive';
    case REQUEST_DOCUMENT_STATUS.Uploaded:
      return 'secondary';
    default:
      return 'outline';
  }
}

function resolveTemplateUrl(doc: RequestDocument): string | null {
  if (doc.templateFilePath) return getShopImageUrl(doc.templateFilePath);
  if (doc.templateAttachmentId && doc.templateFileName) {
    return getShopImageUrl(`${doc.templateAttachmentId}/${doc.templateFileName}`);
  }
  if (doc.templateAttachmentId) return getShopImageUrl(doc.templateAttachmentId);
  return null;
}

function DocumentUploadCard({
  document,
  requestId,
  isReadOnly,
}: {
  document: RequestDocument;
  requestId: string;
  isReadOnly: boolean;
}) {
  const uploadMutation = useUploadRequestDocument();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userNote, setUserNote] = useState(document.userNote || '');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(
    document.completedFileName || null,
  );
  const [isDragging, setIsDragging] = useState(false);

  const uploaded = isRequestDocumentUploaded(document);
  const needsReupload = needsRequestDocumentReupload(document);
  // User can upload/replace until admin has approved the document
  const showUploadZone =
    !isReadOnly && Number(document.status) !== REQUEST_DOCUMENT_STATUS.Approved;

  const templateUrl = resolveTemplateUrl(document);
  const completedUrl = document.completedFilePath
    ? getShopImageUrl(document.completedFilePath)
    : null;
  const uploadedAtLabel = formatRequestDocumentUploadedAt(document.uploadedAt);

  const uploadFile = (file: File) => {
    const error = validateRequestDocumentFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    if (!document.planDocumentId) {
      toast.error('شناسه مدرک طرح نامعتبر است');
      return;
    }

    setSelectedFileName(file.name);
    toast.dismiss();

    uploadMutation.mutate(
      {
        requestId,
        planDocumentId: document.planDocumentId,
        completedFile: file,
        userNote: userNote.trim() || undefined,
      },
      {
        onSuccess: result => {
          if (result.ok) {
            toast.success(result.message || `مدرک «${document.title}» با موفقیت آپلود شد`);
          } else {
            toast.error(result.message);
          }
        },
        onError: () => toast.error('خطا در آپلود مدرک'),
      },
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadFile(file);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!showUploadZone || uploadMutation.isPending) return;
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <Card className={cn(needsReupload && 'border-destructive/50')}>
      <CardHeader className='pb-3'>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div className='space-y-1 min-w-0'>
            <CardTitle className='text-base flex flex-wrap items-center gap-2'>
              <FileText className='size-4 shrink-0' />
              <span>{document.title}</span>
              {document.isRequired ? (
                <Badge variant='destructive' className='text-[10px]'>
                  الزامی
                </Badge>
              ) : (
                <Badge variant='outline'>اختیاری</Badge>
              )}
            </CardTitle>
            {document.description ? (
              <CardDescription>{document.description}</CardDescription>
            ) : null}
          </div>
          <div className='flex items-center gap-1.5'>
            <Badge variant={statusBadgeVariant(document.status)}>
              {getRequestDocumentStatusLabel(document.status)}
            </Badge>
            {Number(document.status) === REQUEST_DOCUMENT_STATUS.Approved ? (
              <CheckCircle2 className='size-4 text-green-600' />
            ) : null}
            {needsReupload ? <XCircle className='size-4 text-destructive' /> : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {document.adminNote ? (
          <div className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
            یادداشت ادمین: {document.adminNote}
          </div>
        ) : null}

        <div className='flex flex-wrap gap-2'>
          {templateUrl ? (
            <Button type='button' variant='outline' size='sm' asChild>
              <a href={templateUrl} target='_blank' rel='noopener noreferrer'>
                <Download className='size-4 ml-1' />
                دانلود قالب
                {document.templateFileName ? ` (${document.templateFileName})` : ''}
              </a>
            </Button>
          ) : document.templateFileName ? (
            <p className='text-sm text-muted-foreground'>قالب: {document.templateFileName}</p>
          ) : null}

          {completedUrl ? (
            <Button type='button' variant='outline' size='sm' asChild>
              <a href={completedUrl} target='_blank' rel='noopener noreferrer'>
                <FileText className='size-4 ml-1' />
                مشاهده فایل آپلودشده
              </a>
            </Button>
          ) : null}
        </div>

        {uploaded && !needsReupload ? (
          <div className='rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900 space-y-1'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='size-4 shrink-0' />
              <span>
                {document.completedFileName
                  ? `فایل آپلود شده: ${document.completedFileName}`
                  : 'مدرک آپلود شده است'}
              </span>
            </div>
            {uploadedAtLabel ? (
              <p className='text-xs text-green-800/80 pr-6'>زمان آپلود: {uploadedAtLabel}</p>
            ) : null}
          </div>
        ) : null}

        {showUploadZone ? (
          <div className='space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor={`note-${document.planDocumentId}`}>یادداشت (الزامی)</Label>
              <Textarea
                id={`note-${document.planDocumentId}`}
                value={userNote}
                onChange={e => setUserNote(e.target.value)}
                placeholder='مثلاً: امضا و مهر شد'
                rows={2}
                disabled={uploadMutation.isPending}
              />
            </div>

            <div className='space-y-2'>
              <Label>
                {uploaded || needsReupload ? 'آپلود مجدد فایل تکمیل‌شده' : 'آپلود فایل تکمیل‌شده'}
              </Label>
              <p className='text-xs text-blue-600'>
                پسوندهای مجاز: pdf, jpg, jpeg, png, doc, docx (حداکثر {REQUEST_DOCUMENT_MAX_SIZE_MB}{' '}
                مگابایت)
              </p>
              <div
                className={cn(
                  'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                  isDragging && 'border-primary bg-primary/5',
                  uploadMutation.isPending
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400',
                )}
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept={REQUEST_DOCUMENT_ACCEPT}
                  className='absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:pointer-events-none'
                  onChange={handleFileChange}
                  disabled={uploadMutation.isPending}
                />
                {uploadMutation.isPending ? (
                  <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                    <Loader2 className='size-4 animate-spin' />
                    در حال آپلود...
                  </div>
                ) : (
                  <div className='space-y-1 text-sm pointer-events-none'>
                    <Upload className='mx-auto size-6 text-muted-foreground' />
                    <p>برای انتخاب فایل کلیک کنید یا فایل را اینجا رها کنید</p>
                    {selectedFileName ? (
                      <p className='text-xs text-muted-foreground'>{selectedFileName}</p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RequestDocuments({
  requestId,
  planNote,
  onNext,
  onBack,
  onCancel,
  isReadOnly = false,
}: RequestDocumentsProps) {
  const {
    data: documents = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRequestDocuments(requestId);

  const { data: completeness, refetch: refetchCompleteness } =
    useRequestDocumentCompleteness(requestId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [documents],
  );

  const requiredMissingLocally = useMemo(() => {
    return sortedDocuments.filter(
      doc =>
        doc.isRequired && (!isRequestDocumentUploaded(doc) || needsRequestDocumentReupload(doc)),
    );
  }, [sortedDocuments]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetch(), refetchCompleteness()]);
  }, [refetch, refetchCompleteness]);

  const handleNext = async () => {
    if (isReadOnly) {
      onNext?.();
      return;
    }

    if (!requestId) {
      toast.error('شناسه درخواست نامعتبر است');
      return;
    }

    if (requiredMissingLocally.length > 0) {
      toast.error(
        `لطفاً مدارک الزامی را آپلود کنید: ${requiredMissingLocally.map(d => d.title).join('، ')}`,
      );
      return;
    }

    setIsSubmitting(true);
    toast.dismiss();

    try {
      const result = await checkRequestDocumentCompleteness(requestId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      await refetchCompleteness();

      if (!result.data.isComplete) {
        const missing = result.data.missingDocuments?.length
          ? `مدارک ناقص: ${result.data.missingDocuments.join('، ')}`
          : 'لطفاً تمام مدارک الزامی را آپلود کنید';
        toast.error(missing);
        return;
      }

      onNext?.();
    } catch {
      toast.error('خطا در بررسی کامل بودن مدارک');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <CardTitle>مدارک طرح</CardTitle>
              <CardDescription className='mt-2 space-y-1'>
                <p>مدارک تعریف‌شده برای این طرح را در صورت نیاز دانلود، تکمیل و آپلود کنید.</p>
                <p className='text-xs'>ادامه مرحله فقط پس از تکمیل مدارک الزامی ممکن است.</p>
              </CardDescription>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => void handleRefresh()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <RefreshCw className='size-4' />
              )}
              <span className='mr-1'>بروزرسانی</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {planNote ? (
            <div className='rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900'>
              {planNote}
            </div>
          ) : null}

          {completeness ? (
            <div
              className={cn(
                'rounded-lg border px-4 py-3 text-sm',
                completeness.isComplete
                  ? 'border-green-200 bg-green-50 text-green-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900',
              )}
            >
              <div className='flex items-start gap-2'>
                {completeness.isComplete ? (
                  <CheckCircle2 className='size-4 mt-0.5 shrink-0' />
                ) : (
                  <AlertCircle className='size-4 mt-0.5 shrink-0' />
                )}
                <div>
                  <p>
                    آپلود شده: {completeness.totalUploaded.toLocaleString('fa-IR')} از{' '}
                    {completeness.totalRequired.toLocaleString('fa-IR')} مدرک الزامی
                  </p>
                  {!completeness.isComplete && completeness.missingDocuments?.length ? (
                    <p className='mt-1'>ناقص: {completeness.missingDocuments.join('، ')}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className='flex items-center justify-center py-12 text-muted-foreground'>
          <Loader2 className='size-5 animate-spin ml-2' />
          در حال دریافت لیست مدارک...
        </div>
      ) : isError ? (
        <Card>
          <CardContent className='py-10 text-center space-y-3'>
            <p className='text-sm text-destructive'>
              {(error as Error)?.message || 'خطا در دریافت لیست مدارک'}
            </p>
            <Button type='button' variant='outline' onClick={() => void refetch()}>
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      ) : sortedDocuments.length === 0 ? (
        <Card>
          <CardContent className='py-10 text-center text-sm text-muted-foreground'>
            مدرکی برای این درخواست تعریف نشده است. می‌توانید به مرحله بعد بروید.
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {sortedDocuments.map(doc => (
            <DocumentUploadCard
              key={`${doc.planDocumentId}-${doc.id || 'pending'}`}
              document={doc}
              requestId={requestId}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}

      <div className='flex flex-wrap justify-center gap-3 pt-2'>
        {onBack ? (
          <Button type='button' variant='outline' size='lg' onClick={onBack}>
            بازگشت
          </Button>
        ) : null}
        {onCancel ? (
          <Button type='button' variant='outline' size='lg' onClick={onCancel}>
            انصراف
          </Button>
        ) : null}
        {onNext ? (
          <Button type='button' size='lg' onClick={() => void handleNext()} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className='size-4 animate-spin ml-1' />
                در حال بررسی...
              </>
            ) : isReadOnly ? (
              'مشاهده مرحله بعد'
            ) : (
              'مرحله بعد'
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
