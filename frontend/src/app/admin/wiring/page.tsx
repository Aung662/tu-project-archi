'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Spinner } from '@/components/ui';
import { api } from '@/lib/api';
import { BOARD_ORDER, getBoardProfile } from '@/lib/boardProfiles';
import { tr, t } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type ReviewDecision = 'APPROVED' | 'REJECTED';

interface WiringReviewImage {
  id: string;
  boardId: string;
  tags: string;
  sizeBytes: number;
  status: ReviewStatus;
  contentChecked: boolean;
  rightsConfirmed: boolean;
  reviewNote: string;
  uploadBatchId: string;
  createdAt: string;
  previewUrl: string;
}

interface WiringReviewList {
  items: WiringReviewImage[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  counts: { pending: number; approved: number; rejected: number; storageBytes: number };
}

interface UploadResult {
  batchId: string;
  received: number;
  uploaded: number;
  duplicates: number;
}

const CHUNK_SIZE = 8;
const MAX_SELECTION = 1000;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_INPUT_BYTES = 512 * 1024 * 1024;
const PAGE_SIZE = 24;
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;
const REVIEW_STATUSES: ReviewStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

function createBatchId(): string {
  const cryptoApi = globalThis.crypto as Crypto & { randomUUID?: () => string };
  if (typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID();
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function fileKey(file: File): string {
  const relative = 'webkitRelativePath' in file ? (file as File & { webkitRelativePath?: string }).webkitRelativePath : '';
  return `${relative || file.name}:${file.size}:${file.lastModified}`;
}

function formatBytes(size: number): string {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function boardName(boardId: string): string {
  return boardId === 'other' ? 'Other / mixed' : getBoardProfile(boardId).name;
}

export default function AdminWiringImagesPage() {
  const { lang } = useLanguage();
  const my = lang === 'my';
  const folderInput = useRef<HTMLInputElement>(null);
  const cancelUpload = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [batchId, setBatchId] = useState('');
  const [boardId, setBoardId] = useState('other');
  const [keywords, setKeywords] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number; stored: number; duplicates: number } | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('PENDING');
  const [reviewQuery, setReviewQuery] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewData, setReviewData] = useState<WiringReviewList | null>(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contentChecked, setContentChecked] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    setBatchId(createBatchId());
    folderInput.current?.setAttribute('webkitdirectory', '');
    folderInput.current?.setAttribute('directory', '');
  }, []);

  useEffect(() => {
    const urls = files.slice(0, 4).map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const loadReview = useCallback(async (active: () => boolean) => {
    setReviewLoading(true);
    setReviewError(null);
    const suffix = api.qs({ status: reviewStatus, q: reviewQuery.trim(), page: reviewPage, pageSize: PAGE_SIZE });
    try {
      const result = await api.get<WiringReviewList>(`/images/wiring/admin${suffix}`);
      if (active()) setReviewData(result);
    } catch (err) {
      if (active()) setReviewError(err instanceof Error ? err.message : 'Could not load the review list');
    } finally {
      if (active()) setReviewLoading(false);
    }
  }, [reviewStatus, reviewQuery, reviewPage]);

  useEffect(() => {
    let current = true;
    const timer = window.setTimeout(() => void loadReview(() => current), 180);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [loadReview, reloadVersion]);

  useEffect(() => {
    setSelectedIds([]);
    setContentChecked(false);
    setRightsConfirmed(false);
    setReviewNote('');
  }, [reviewStatus, reviewPage, reviewQuery]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError(null);
    setUploadMessage('');
    setUploadProgress(null);
    const incoming = Array.from(fileList);
    const valid = incoming.filter((file) => IMAGE_MIME.has(file.type) || (!file.type && IMAGE_EXTENSION.test(file.name)));
    const ignored = incoming.length - valid.length;
    const tooLarge = valid.filter((file) => file.size > MAX_FILE_BYTES);
    const eligible = valid.filter((file) => file.size <= MAX_FILE_BYTES);
    setFiles((current) => {
      const have = new Set(current.map(fileKey));
      const merged = [...current, ...eligible.filter((file) => !have.has(fileKey(file)))];
      return merged.slice(0, MAX_SELECTION);
    });
    if (tooLarge.length) setError(my ? `8 MB ကန့်သတ်ချက်ကျော်သော ပုံ ${tooLarge.length} ပုံကို မထည့်ထားပါ။` : `${tooLarge.length} image(s) exceed the 8 MB per-file limit and were not added.`);
    else if (ignored) setError(my ? 'ပုံမဟုတ်သော ဖိုင်များကို ကျော်ထားသည်။ JPEG၊ PNG သို့မဟုတ် WebP ကို ရွေးပါ။' : `${ignored} non-image file(s) were ignored. Choose JPEG, PNG or WebP files.`);
    if (incoming.length > 0 && eligible.length === 0 && !ignored && !tooLarge.length) {
      setError(my ? 'ပံ့ပိုးသော ပုံဖိုင် မရွေးထားပါ။' : 'No supported images were selected.');
    }
  }

  function splitFiles(source: File[], size: number): File[][] {
    const chunks: File[][] = [];
    for (let i = 0; i < source.length; i += size) chunks.push(source.slice(i, i + size));
    return chunks;
  }

  async function uploadAll() {
    if (files.length === 0 || uploadBusy) return;
    const totalInputBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalInputBytes > MAX_TOTAL_INPUT_BYTES) {
      setError(my ? 'ရွေးထားသောဖိုင်စုစုပေါင်းသည် 512 MB ကျော်နေသည်။ Folder ကို အပိုင်းခွဲ၍ တင်ပါ။' : 'This selection is larger than 512 MB. Split the folder into smaller batches before uploading.');
      return;
    }
    setError(null);
    setUploadMessage('');
    cancelUpload.current = false;
    setUploadBusy(true);
    const chunks = splitFiles(files, CHUNK_SIZE);
    const activeBatchId = batchId || createBatchId();
    if (!batchId) setBatchId(activeBatchId);
    let stored = 0;
    let duplicates = 0;
    let completed = 0;
    setUploadProgress({ completed, total: chunks.length, stored, duplicates });

    try {
      for (let index = 0; index < chunks.length; index++) {
        if (cancelUpload.current) break;
        const form = new FormData();
        form.append('batchId', activeBatchId);
        form.append('boardId', boardId);
        form.append('boardName', boardName(boardId));
        form.append('tags', keywords);
        for (const file of chunks[index]) {
          const hint = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
          form.append('images', file, file.name);
          form.append('searchHints', hint);
        }
        const result = await api.postForm<UploadResult>('/images/wiring/bulk', form, 120_000);
        stored += result.uploaded;
        duplicates += result.duplicates;
        completed = index + 1;
        setUploadProgress({ completed, total: chunks.length, stored, duplicates });
      }

      if (cancelUpload.current) {
        setUploadMessage(my
          ? `${completed} အပိုင်းပြီးနောက် ရပ်ထားသည်။ ရွေးချယ်ထားသောပုံများကို မရှင်းဘဲ ထပ်တင်နိုင်သည် — တင်ပြီးသားပုံများကို ထပ်မသိမ်းပါ။`
          : `Upload paused after ${completed} completed chunk(s). Keep the selection and press upload to safely resume; duplicate files are skipped.`);
      } else {
        setUploadMessage(my
          ? `${tr(t.wiringUploadComplete)} — စစ်ဆေးရန် ${stored} ပုံ သိမ်းပြီး${duplicates ? ` · ထပ်နေသော ${duplicates} ပုံ ကျော်သွားသည်` : ''}။`
          : `${tr(t.wiringUploadComplete)}: ${stored} image(s) stored for review${duplicates ? ` · ${duplicates} duplicate(s) skipped` : ''}.`);
        setFiles([]);
        setBatchId(createBatchId());
        setReviewStatus('PENDING');
        setReviewPage(1);
        setReloadVersion((value) => value + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk upload failed. Your selection is kept so you can retry safely.');
    } finally {
      setUploadBusy(false);
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  const currentItems = reviewData?.items ?? [];
  const allCurrentSelected = currentItems.length > 0 && currentItems.every((item) => selectedIds.includes(item.id));
  const statusCounts = reviewData?.counts ?? { pending: 0, approved: 0, rejected: 0, storageBytes: 0 };
  const previewCards = useMemo(() => files.slice(0, 4), [files]);

  async function moderate(decision: ReviewDecision) {
    if (selectedIds.length === 0 || reviewBusy) return;
    if (decision === 'APPROVED' && (!contentChecked || !rightsConfirmed || reviewNote.trim().length < 10)) return;
    if (decision === 'REJECTED' && reviewNote.trim().length < 5) return;
    setReviewBusy(true);
    setReviewError(null);
    try {
      await api.post('/images/wiring/review-batch', {
        ids: selectedIds,
        decision,
        contentChecked,
        rightsConfirmed,
        reviewNote: reviewNote.trim(),
      });
      setSelectedIds([]);
      setContentChecked(false);
      setRightsConfirmed(false);
      setReviewNote('');
      setReloadVersion((value) => value + 1);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Review action failed');
    } finally {
      setReviewBusy(false);
    }
  }

  async function deleteImage(id: string) {
    if (!window.confirm(my ? 'ဤပုံကို အပြီးဖျက်မှာ သေချာပါသလား။' : 'Permanently delete this image?')) return;
    setReviewError(null);
    try {
      await api.del(`/images/wiring/${id}`);
      setSelectedIds((current) => current.filter((value) => value !== id));
      setReloadVersion((value) => value + 1);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const selectedFilesSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      <section className="card space-y-4 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100">{tr(t.wiringAdminTitle)}</h2>
          <p className="mt-1 max-w-4xl text-sm leading-relaxed text-slate-400">{tr(t.wiringAdminSubtitle)}</p>
        </div>

        <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <label className="btn-primary cursor-pointer px-4 py-2 text-sm">
                📁 {tr(t.wiringChooseFolder)}
                <input
                  ref={folderInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploadBusy}
                  className="sr-only"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
              </label>
              <label className="btn-secondary cursor-pointer px-4 py-2 text-sm">
                🖼️ {tr(t.wiringChooseFiles)}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploadBusy}
                  className="sr-only"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
              </label>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">{tr(t.wiringUploadHint)}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
              <span><strong className="font-latin text-slate-100">{files.length}</strong> {tr(t.wiringSelected)}</span>
              <span>{formatBytes(selectedFilesSize)}</span>
              {files.length > 0 && (
                <button type="button" onClick={() => setFiles([])} disabled={uploadBusy} className="text-rose-300 hover:text-rose-200 disabled:opacity-50">
                  {my ? 'ရွေးချယ်မှုရှင်းရန်' : 'Clear selection'}
                </button>
              )}
            </div>
            {previewUrls.length > 0 && (
              <div className="flex gap-2">
                {previewCards.map((file, index) => (
                  <div key={fileKey(file)} className="h-16 w-20 overflow-hidden rounded-lg border border-white/10 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrls[index]} alt={`Selected wiring image ${index + 1}`} className="h-full w-full object-contain" />
                  </div>
                ))}
                {files.length > 4 && <span className="self-center text-xs text-slate-500">+{files.length - 4}</span>}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-400/20 bg-brand-400/[0.05] px-3 py-2">
              <span className="text-xs text-slate-400">{tr(t.wiringCommonTitle)}</span>
              <strong className="text-sm text-brand-100">Wiring</strong>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">{tr(t.wiringBoardForBatch)}</span>
              <select
                value={boardId}
                onChange={(event) => setBoardId(event.target.value)}
                disabled={uploadBusy}
                className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-brand-400/50"
              >
                <option value="other">{tr(t.wiringOtherBoards)}</option>
                {BOARD_ORDER.map((id) => (
                  <option key={id} value={id}>{getBoardProfile(id).name}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">{tr(t.wiringTagsForBatch)}</span>
              <input
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                disabled={uploadBusy}
                maxLength={300}
                placeholder="e.g. sensor, HC-SR04, classroom"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-400/50"
              />
              <span className="block text-[11px] text-slate-500">{my ? 'ဤ keyword များကို အစုတစ်ခုလုံးတွင် အသုံးပြုမည်။ ဖိုင်/Folder အမည်မှ ရှာဖွေစကားလုံးများကိုလည်း အလိုအလျောက်ဖန်တီးသော်လည်း Website ပေါ်တွင် မပြပါ။' : 'These keywords apply to the whole batch. Search hints are also generated from file/folder names, but those names are never displayed.'}</span>
            </label>
          </div>
        </div>

        {error && <Alert kind="error">{error}</Alert>}
        {uploadMessage && <Alert kind="success">{uploadMessage}</Alert>}

        {uploadProgress && (
          <div className="space-y-1.5">
            <div className="flex justify-between gap-3 text-xs text-slate-400">
              <span>{my ? `အပိုင်း ${uploadProgress.completed}/${uploadProgress.total}` : `Chunk ${uploadProgress.completed}/${uploadProgress.total}`}</span>
              <span>{my ? `${uploadProgress.stored} သိမ်းပြီး · ထပ်နေသော ${uploadProgress.duplicates} ကျော်သွားသည်` : `${uploadProgress.stored} stored · ${uploadProgress.duplicates} duplicates skipped`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all" style={{ width: `${uploadProgress.total ? (uploadProgress.completed / uploadProgress.total) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={uploadAll} disabled={uploadBusy || files.length === 0} className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            {uploadBusy ? (my ? 'တင်နေသည်…' : 'Uploading…') : `⬆ ${tr(t.wiringUploadButton)}`}
          </button>
          {uploadBusy && (
            <button type="button" onClick={() => { cancelUpload.current = true; }} className="btn-secondary px-4 py-2 text-sm">
              {tr(t.wiringStopUpload)}
            </button>
          )}
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{tr(t.wiringReviewQueue)}</h2>
            <p className="mt-1 text-xs text-slate-400">
              {statusCounts.pending} {tr(t.wiringPending)} · {statusCounts.approved} {tr(t.wiringApproved)} · {statusCounts.rejected} {tr(t.wiringRejected)} · {formatBytes(statusCounts.storageBytes)} {my ? 'သိမ်းထား' : 'stored'}
            </p>
          </div>
          <label className="w-full sm:w-72">
            <span className="sr-only">{tr(t.wiringImageSearchAdmin)}</span>
            <input
              value={reviewQuery}
              onChange={(event) => { setReviewQuery(event.target.value); setReviewPage(1); }}
              placeholder={tr(t.wiringImageSearchAdmin)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-400/50"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label={tr(t.wiringReviewQueue)}>
          {REVIEW_STATUSES.map((status) => {
            const count = status === 'PENDING' ? statusCounts.pending : status === 'APPROVED' ? statusCounts.approved : statusCounts.rejected;
            const label = status === 'PENDING' ? tr(t.wiringPending) : status === 'APPROVED' ? tr(t.wiringApproved) : tr(t.wiringRejected);
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={reviewStatus === status}
                onClick={() => { setReviewStatus(status); setReviewPage(1); }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${reviewStatus === status ? 'border-transparent bg-brand-500 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10'}`}
              >
                {label} <span className="font-latin opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {reviewError && <Alert kind="error">{reviewError}</Alert>}
        {reviewLoading ? <Spinner label={my ? 'Wiring ပုံများ ဖွင့်နေသည်…' : 'Loading wiring images…'} /> : currentItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-500">{tr(t.wiringNoReviewImages)}</div>
        ) : (
          <>
            {reviewStatus === 'PENDING' && (
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={() => setSelectedIds(allCurrentSelected ? [] : currentItems.map((item) => item.id))}
                    className="accent-brand-500"
                  />
                  {tr(t.wiringSelectPage)}
                </label>
                {selectedIds.length > 0 && (
                  <div className="space-y-3 border-t border-white/10 pt-3">
                    <p className="text-xs font-semibold text-slate-200">{selectedIds.length} {tr(t.wiringSelected)}</p>
                    <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-slate-300">
                      <input type="checkbox" checked={contentChecked} onChange={(event) => setContentChecked(event.target.checked)} className="mt-0.5 accent-brand-500" />
                      {tr(t.wiringContentCheck)}
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-slate-300">
                      <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-0.5 accent-brand-500" />
                      {tr(t.wiringRightsCheck)}
                    </label>
                    <textarea
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder={tr(t.wiringReviewNote)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-400/50"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={reviewBusy || !contentChecked || !rightsConfirmed || reviewNote.trim().length < 10}
                        onClick={() => void moderate('APPROVED')}
                        className="btn-primary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {reviewBusy ? 'Saving…' : `✓ ${tr(t.wiringApproveSelected)}`}
                      </button>
                      <button
                        type="button"
                        disabled={reviewBusy || reviewNote.trim().length < 5}
                        onClick={() => void moderate('REJECTED')}
                        className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ✕ {tr(t.wiringRejectSelected)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {currentItems.map((item) => {
                const checked = selectedIds.includes(item.id);
                const tags = item.tags.split(';').map((tag) => tag.trim()).filter(Boolean);
                return (
                  <article key={item.id} className={`overflow-hidden rounded-xl border bg-white/[0.02] ${checked ? 'border-brand-400/60' : 'border-white/10'}`}>
                    <div className="relative grid aspect-[4/3] place-items-center bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt="Wiring image under review" loading="lazy" className="h-full w-full object-contain" />
                      {reviewStatus === 'PENDING' && (
                        <label className="absolute left-2 top-2 grid h-7 w-7 cursor-pointer place-items-center rounded-md bg-black/75">
                          <input type="checkbox" checked={checked} onChange={() => toggleSelected(item.id)} aria-label="Select wiring image" className="accent-brand-500" />
                        </label>
                      )}
                    </div>
                    <div className="space-y-2 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="truncate text-xs text-slate-100">Wiring</strong>
                        <span className="shrink-0 text-[10px] text-slate-500">{formatBytes(item.sizeBytes)}</span>
                      </div>
                      <p className="truncate text-[11px] text-slate-400">{item.boardId === 'other' ? tr(t.wiringOtherBoards) : boardName(item.boardId)}</p>
                      {tags.length > 0 && (
                        <div className="flex max-h-10 flex-wrap gap-1 overflow-hidden">
                          {tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] text-slate-400">{tag}</span>)}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                      {reviewStatus !== 'PENDING' && item.reviewNote && <p className="line-clamp-2 text-[10px] text-slate-400">{item.reviewNote}</p>}
                      <button type="button" onClick={() => void deleteImage(item.id)} className="text-[10px] font-medium text-rose-300 hover:text-rose-200">
                        {tr(t.wiringDeleteImage)}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-400">
              <span>{reviewData?.total.toLocaleString()} {tr(t.wiringImageCount)}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setReviewPage((current) => Math.max(1, current - 1))} disabled={reviewPage <= 1} className="btn-secondary px-3 py-1.5 disabled:opacity-40">← {tr(t.wiringPagePrevious)}</button>
                <button type="button" onClick={() => setReviewPage((current) => current + 1)} disabled={!reviewData?.hasMore} className="btn-secondary px-3 py-1.5 disabled:opacity-40">{tr(t.wiringPageNext)} →</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
