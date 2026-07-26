import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button, Input, Modal } from '@/shared/ui';

export interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyName?: string;
  inviteToken?: string;
}

export const InviteLinkModal = ({
  isOpen,
  onClose,
  studyName = '새 스터디',
  inviteToken = 'sample-token',
}: InviteLinkModalProps) => {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('초대 링크 복사에 실패했습니다.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
          <Button type="button" variant="primary" onClick={onClose}>
            완료
          </Button>
        </div>
      </div>
    </Modal>
  );
};
