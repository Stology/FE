import { useRef, useState, type FormEvent } from 'react';
import { ImagePlus } from 'lucide-react';

import type { QuestionDetail, QuestionReply } from '@/shared/types/stology';
import { Button, Input } from '@/shared/ui';

interface QuestionDetailPanelProps {
  detail: QuestionDetail;
  isReadOnly?: boolean;
  onQuestionDelete?: () => void;
  onQuestionEdit?: () => void;
  onReplyCreate: (content: string) => void;
  onReplyDelete?: (replyId: string) => void;
  onReplyUpdate: (replyId: string, content: string) => void;
  replies: QuestionReply[];
}

export const QuestionDetailPanel = ({
  detail,
  isReadOnly = false,
  onQuestionDelete,
  onQuestionEdit,
  onReplyCreate,
  onReplyDelete,
  onReplyUpdate,
  replies,
}: QuestionDetailPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replyContent, setReplyContent] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string>();
  const [editingContent, setEditingContent] = useState('');

  const handleReplySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = replyContent.trim();
    if (!trimmedContent) return;

    onReplyCreate(trimmedContent);
    setReplyContent('');
    setAttachmentName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEditing = (reply: QuestionReply) => {
    setEditingReplyId(reply.id);
    setEditingContent(reply.content);
  };

  const cancelEditing = () => {
    setEditingReplyId(undefined);
    setEditingContent('');
  };

  const saveEditing = (replyId: string) => {
    const trimmedContent = editingContent.trim();
    if (!trimmedContent) return;

    onReplyUpdate(replyId, trimmedContent);
    cancelEditing();
  };

  return (
    <div className="px-[18px] pb-[18px]">
      <div className="flex items-start justify-between gap-4">
        <p className="break-words text-[13px] leading-[22.1px] text-stology-text-dark">
          {detail.content}
        </p>
        {detail.isMine && !isReadOnly ? (
          <div className="flex shrink-0 gap-1.5">
            {onQuestionEdit ? (
              <Button aria-label="질문 수정" onClick={onQuestionEdit} size="sm" variant="ghost">
                수정
              </Button>
            ) : null}
            {onQuestionDelete ? (
              <Button
                aria-label="질문 삭제"
                className="text-stology-reject"
                onClick={onQuestionDelete}
                size="sm"
                variant="ghost"
              >
                삭제
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {!isReadOnly ? (
        <form
          aria-label={`${detail.title} 답글 작성`}
          className="mt-3.5 flex flex-col gap-2 sm:flex-row"
          onSubmit={handleReplySubmit}
        >
          <input
            accept="image/*"
            className="sr-only"
            onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? '')}
            ref={fileInputRef}
            type="file"
          />
          <Button
            aria-label={attachmentName ? `첨부 이미지 변경: ${attachmentName}` : '이미지 첨부'}
            leftIcon={<ImagePlus aria-hidden size={14} />}
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <span className="max-w-40 truncate" title={attachmentName || undefined}>
              {attachmentName || '이미지 첨부'}
            </span>
          </Button>
          <Input
            aria-label="답글 내용"
            className="h-9"
            onChange={(event) => setReplyContent(event.target.value)}
            placeholder="답글을 입력하세요"
            value={replyContent}
          />
          <Button
            className="bg-stology-deep-navy hover:bg-stology-royal-blue"
            disabled={!replyContent.trim()}
            type="submit"
          >
            답글 작성
          </Button>
        </form>
      ) : null}

      <div aria-label="답글 목록" className="mt-3.5">
        {replies.length === 0 ? (
          <p className="border-t border-stology-off-white py-4 text-[13px] text-stology-text-light">
            아직 답글이 없습니다.
          </p>
        ) : (
          replies.map((reply) => {
            const isEditing = editingReplyId === reply.id;

            return (
              <article
                aria-label={`${reply.authorName}의 답글`}
                className="flex flex-col gap-2 border-t border-stology-off-white py-3 sm:flex-row sm:items-center"
                key={reply.id}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <strong className="w-[50px] shrink-0 text-[13px] leading-[19.5px] text-stology-text-dark">
                    {reply.authorName}
                  </strong>
                  {isEditing && !isReadOnly ? (
                    <Input
                      aria-label={`${reply.authorName} 답글 수정 내용`}
                      className="h-9"
                      onChange={(event) => setEditingContent(event.target.value)}
                      value={editingContent}
                    />
                  ) : (
                    <p className="break-words text-[13px] leading-[19.5px] text-stology-text-dark">
                      {reply.content}
                    </p>
                  )}
                </div>

                {reply.isMine && !isReadOnly ? (
                  <div className="flex shrink-0 gap-1.5 self-end sm:self-auto">
                    {isEditing ? (
                      <>
                        <Button
                          disabled={!editingContent.trim()}
                          onClick={() => saveEditing(reply.id)}
                          size="sm"
                        >
                          저장
                        </Button>
                        <Button onClick={cancelEditing} size="sm" variant="outline">
                          취소
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => startEditing(reply)} size="sm" variant="ghost">
                          수정
                        </Button>
                        {onReplyDelete ? (
                          <Button
                            aria-label={`${reply.authorName} 답글 삭제`}
                            className="text-stology-reject"
                            onClick={() => onReplyDelete(reply.id)}
                            size="sm"
                            variant="ghost"
                          >
                            삭제
                          </Button>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
