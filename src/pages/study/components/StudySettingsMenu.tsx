import { useEffect, useRef, useState } from 'react';
import { Copy, Link, Minus, Plus, Settings } from 'lucide-react';

import { useToast } from '@/shared/hooks';
import { createInvitationLink } from '@/shared/lib/invitation_link';
import { Button, Loading, Modal } from '@/shared/ui';

import { useStudySettings } from '../hooks/useStudySettings';
import type { CloseStudyRes } from '@/shared/api/study';

type SettingsDialog = 'invite' | 'reviewer' | null;

export interface StudySettingsMenuProps {
  onStudyClosed: (summary: CloseStudyRes) => void;
  studyId: string;
}

export const StudySettingsMenu = ({ onStudyClosed, studyId }: StudySettingsMenuProps) => {
  const { showToast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedDialog, setSelectedDialog] = useState<SettingsDialog>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const {
    closeStudyMutation,
    getInvitationTokenMutation,
    reviewerCountQuery,
    updateReviewerCountMutation,
  } = useStudySettings(studyId, selectedDialog === 'reviewer');

  useEffect(() => {
    if (!isMenuOpen) return;

    function closeMenuOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', closeMenuOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeMenuOnOutsideClick);
  }, [isMenuOpen]);

  function openDialog(dialog: Exclude<SettingsDialog, null>) {
    setIsMenuOpen(false);
    setSelectedDialog(dialog);

    if (dialog === 'invite' && !inviteToken) {
      void loadInvitationToken();
    }
  }

  async function loadInvitationToken() {
    try {
      const token = await getInvitationTokenMutation.mutateAsync();
      setInviteToken(token);
    } catch {
      showToast({ message: '초대 링크를 불러오지 못했습니다.', type: 'error' });
    }
  }

  async function copyInvitationLink() {
    if (!invitationLink) return;

    try {
      await navigator.clipboard.writeText(invitationLink);
      showToast({ message: '링크가 복사되었습니다.', type: 'success' });
    } catch {
      showToast({ message: '초대 링크를 직접 선택해 복사해 주세요.', type: 'error' });
    }
  }

  async function changeReviewerCount(nextCount: number) {
    const reviewerSettings = reviewerCountQuery.data;
    if (!reviewerSettings) return;
    if (nextCount < 1 || nextCount > reviewerSettings.maxReviewerCount) return;

    try {
      await updateReviewerCountMutation.mutateAsync({ reviewerCount: nextCount });
      showToast({ message: `검토 인원 수가 ${nextCount}명으로 변경되었습니다.`, type: 'success' });
    } catch {
      showToast({ message: '검토 인원 수를 변경하지 못했습니다.', type: 'error' });
    }
  }

  async function closeStudy() {
    try {
      const summary = await closeStudyMutation.mutateAsync();
      setIsCloseDialogOpen(false);
      onStudyClosed(summary);
    } catch {
      showToast({ message: '스터디를 종료하지 못했습니다. 다시 시도해 주세요.', type: 'error' });
    }
  }

  const invitationLink = inviteToken ? createInvitationLink(inviteToken) : '';
  const reviewerSettings = reviewerCountQuery.data;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-label="스터디 설정"
          className="flex items-center gap-1.5"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          size="sm"
          variant="outline"
        >
          <Settings aria-hidden className="size-4" />
          설정
        </Button>

        {isMenuOpen ? (
          <div
            aria-label="스터디 설정 메뉴"
            className="absolute right-0 top-[calc(100%+8px)] z-30 w-48 rounded border border-stology-border-light bg-white p-1 shadow-lg"
            role="menu"
          >
            <SettingsMenuItem label="초대 링크" onClick={() => openDialog('invite')} />
            <SettingsMenuItem label="검토 인원 수 조정" onClick={() => openDialog('reviewer')} />
            <div className="my-1 border-t border-stology-border-light" />
            <SettingsMenuItem
              isDanger
              label="스터디 종료"
              onClick={() => {
                setIsMenuOpen(false);
                setIsCloseDialogOpen(true);
              }}
            />
          </div>
        ) : null}
      </div>

      <Modal
        footer={
          <Button onClick={() => setSelectedDialog(null)} variant="outline">
            닫기
          </Button>
        }
        isOpen={selectedDialog === 'invite'}
        onClose={() => setSelectedDialog(null)}
        showCloseButton
        title="스터디 초대"
      >
        {getInvitationTokenMutation.isPending ? (
          <div className="flex min-h-28 items-center justify-center">
            <Loading label="초대 링크를 불러오는 중입니다" />
          </div>
        ) : inviteToken ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-label text-stology-text-dark">초대 링크</span>
              <span className="flex items-center gap-2 rounded border border-stology-border-light bg-stology-off-white p-3">
                <Link aria-hidden className="size-4 shrink-0 text-stology-text-light" />
                <input
                  aria-label="초대 링크"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-stology-text-dark outline-none"
                  onFocus={(event) => event.currentTarget.select()}
                  readOnly
                  value={invitationLink}
                />
              </span>
            </label>
            <Button className="w-full" onClick={() => void copyInvitationLink()}>
              <Copy aria-hidden className="size-4" />
              복사하기
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-stology-text-light">초대 링크를 불러오지 못했습니다.</p>
            <Button onClick={() => void loadInvitationToken()} variant="outline">
              다시 시도
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        footer={
          <Button onClick={() => setSelectedDialog(null)} variant="outline">
            닫기
          </Button>
        }
        isOpen={selectedDialog === 'reviewer'}
        onClose={() => setSelectedDialog(null)}
        showCloseButton
        title="검토 인원 수 조정"
      >
        {reviewerCountQuery.isLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loading label="검토 인원 수를 불러오는 중입니다" />
          </div>
        ) : reviewerSettings ? (
          <div className="space-y-5">
            <div
              className="flex items-center justify-center gap-5"
              role="group"
              aria-label="검토 인원 수"
            >
              <Button
                aria-label="검토 인원 줄이기"
                disabled={
                  reviewerSettings.reviewerCount <= 1 || updateReviewerCountMutation.isPending
                }
                onClick={() => void changeReviewerCount(reviewerSettings.reviewerCount - 1)}
                size="icon"
                variant="outline"
              >
                <Minus aria-hidden className="size-4" />
              </Button>
              <output className="min-w-16 text-center text-[28px] font-bold text-stology-text-dark">
                {reviewerSettings.reviewerCount}명
              </output>
              <Button
                aria-label="검토 인원 늘리기"
                disabled={
                  reviewerSettings.reviewerCount >= reviewerSettings.maxReviewerCount ||
                  updateReviewerCountMutation.isPending
                }
                onClick={() => void changeReviewerCount(reviewerSettings.reviewerCount + 1)}
                size="icon"
                variant="outline"
              >
                <Plus aria-hidden className="size-4" />
              </Button>
            </div>
            <p className="text-center text-caption text-stology-text-light">
              변경된 인원 수는 새로 시작되는 검토에만 적용됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-stology-text-light">검토 인원 수를 불러오지 못했습니다.</p>
            <Button onClick={() => void reviewerCountQuery.refetch()} variant="outline">
              다시 시도
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        className="max-w-[440px]"
        footer={
          <>
            <Button
              className="text-stology-text-dark"
              disabled={closeStudyMutation.isPending}
              onClick={() => setIsCloseDialogOpen(false)}
              variant="outline"
            >
              아니오
            </Button>
            <Button
              className="bg-[#171717] hover:bg-stology-deep-navy"
              isLoading={closeStudyMutation.isPending}
              onClick={() => void closeStudy()}
            >
              예
            </Button>
          </>
        }
        isOpen={isCloseDialogOpen}
        onClose={closeStudyMutation.isPending ? () => undefined : () => setIsCloseDialogOpen(false)}
        title="스터디 종료"
      >
        <div className="space-y-5 text-[13px] leading-6 text-stology-text-dark">
          <p>스터디를 종료 하시겠습니까?</p>
          <p>스터디를 종료하면 더 이상 자료 업로드, 검토, 질문 작성이 불가능합니다.</p>
        </div>
      </Modal>
    </>
  );
};

interface SettingsMenuItemProps {
  isDanger?: boolean;
  label: string;
  onClick: () => void;
}

const SettingsMenuItem = ({ isDanger = false, label, onClick }: SettingsMenuItemProps) => (
  <button
    className={`flex w-full items-center rounded px-3 py-2 text-left text-[13px] transition-colors hover:bg-stology-off-white ${
      isDanger ? 'text-stology-reject' : 'text-stology-text-dark'
    }`}
    onClick={onClick}
    role="menuitem"
    type="button"
  >
    {label}
  </button>
);
