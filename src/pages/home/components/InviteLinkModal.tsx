import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { createInvitationLink } from '@/shared/lib/invitation_link';
import { Button, Input, Modal } from '@/shared/ui';

export interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyName: string;
  inviteToken: string;
}

export const InviteLinkModal = ({
  isOpen,
  onClose,
  studyName,
  inviteToken,
}: InviteLinkModalProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 모달 unmount 시 복사 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const inviteUrl = createInvitationLink(inviteToken);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);

      // 기존 복사 타이머 취소 (단일 타이머 관리)
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 2000);
    } catch {
      alert('초대 링크 복사에 실패했습니다.');
    }
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
    onClose();
  };

  if (!isOpen || !studyName || !inviteToken) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="스터디 생성 완료"
      description={`'${studyName}' 스터디가 성공적으로 생성되었습니다.`}
      showCloseButton
      className="max-w-[460px]"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200">
          <p className="text-xs text-amber-900 leading-relaxed">
            팀원에게 아래 초대 링크를 공유하여 스터디 참가를 요청해 보세요.
          </p>
        </div>

        <div>
          <label
            htmlFor="invite-url-input"
            className="mb-2 block text-label text-stology-text-dark"
          >
            초대 링크
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="invite-url-input"
              readOnly
              value={inviteUrl}
              className="font-mono text-xs text-stology-text-dark bg-stology-off-white"
            />
            <Button
              type="button"
              variant={copied ? 'success' : 'primary'}
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check size={14} /> 복사됨
                </>
              ) : (
                <>
                  <Copy size={14} /> 복사
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="primary" onClick={handleClose}>
            완료
          </Button>
        </div>
      </div>
    </Modal>
  );
};
