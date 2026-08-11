import { useRef, useState, type FormEvent } from 'react';
import { ImagePlus } from 'lucide-react';

import type { QuestionDetail, QuestionImage, QuestionReply } from '@/shared/types/stology';
import { Button, Input } from '@/shared/ui';

import { stripQuestionImageTokens } from './model/question_mutation_content';

interface QuestionDetailPanelProps {
  detail: QuestionDetail;
  isReadOnly?: boolean;
  onQuestionDelete?: () => void;
  onQuestionEdit?: () => void;
  onReplyCreate: (content: string, images: File[]) => Promise<void> | void;
  onReplyDelete?: (replyId: string) => void;
  onReplyUpdate: (replyId: string, content: string) => Promise<void> | void;
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
  const [attachment, setAttachment] = useState<File>();
  const [editingReplyId, setEditingReplyId] = useState<string>();
  const [editingContent, setEditingContent] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [isReplyUpdating, setIsReplyUpdating] = useState(false);

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = replyContent.trim();
    if (!trimmedContent) return;

    setIsReplySubmitting(true);
    try {
      await onReplyCreate(trimmedContent, attachment ? [attachment] : []);
      setReplyContent('');
      setAttachment(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      // The mutation layer reports the error. Preserve the reply for retry.
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const startEditing = (reply: QuestionReply) => {
    setEditingReplyId(reply.id);
    setEditingContent(stripQuestionImageTokens(reply.content));
  };

  const cancelEditing = () => {
    setEditingReplyId(undefined);
    setEditingContent('');
  };

  const saveEditing = async (replyId: string) => {
    const trimmedContent = editingContent.trim();
    if (!trimmedContent) return;

    setIsReplyUpdating(true);
    try {
      await onReplyUpdate(replyId, trimmedContent);
      cancelEditing();
    } catch {
      // The mutation layer reports the error. Keep edit mode open for retry.
    } finally {
      setIsReplyUpdating(false);
    }
  };

  return (
    <div className="px-[18px] pb-[18px]">
      <div className="flex items-start justify-between gap-4">
        <InlineQuestionContent
          content={detail.content}
          images={detail.images ?? []}
          label={`${detail.authorName} 질문`}
        />
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
            disabled={isReplySubmitting}
            onChange={(event) => setAttachment(event.target.files?.[0])}
            ref={fileInputRef}
            type="file"
          />
          <Button
            aria-label={attachment ? `첨부 이미지 변경: ${attachment.name}` : '이미지 첨부'}
            disabled={isReplySubmitting}
            leftIcon={<ImagePlus aria-hidden size={14} />}
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <span className="max-w-40 truncate" title={attachment?.name}>
              {attachment?.name || '이미지 첨부'}
            </span>
          </Button>
          <div className="min-w-0 flex-1">
            <Input
              aria-label="답글 내용"
              className="h-9"
              disabled={isReplySubmitting}
              onChange={(event) => setReplyContent(event.target.value)}
              placeholder="답글을 입력하세요"
              value={replyContent}
            />
          </div>
          <Button
            className="bg-stology-deep-navy hover:bg-stology-royal-blue"
            disabled={!replyContent.trim()}
            isLoading={isReplySubmitting}
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
                      disabled={isReplyUpdating}
                      onChange={(event) => setEditingContent(event.target.value)}
                      value={editingContent}
                    />
                  ) : (
                    <InlineQuestionContent
                      content={reply.content}
                      images={reply.images ?? []}
                      label={`${reply.authorName} 답글`}
                    />
                  )}
                </div>

                {reply.isMine && !isReadOnly ? (
                  <div className="flex shrink-0 gap-1.5 self-end sm:self-auto">
                    {isEditing ? (
                      <>
                        <Button
                          disabled={!editingContent.trim()}
                          isLoading={isReplyUpdating}
                          onClick={() => saveEditing(reply.id)}
                          size="sm"
                        >
                          저장
                        </Button>
                        <Button
                          disabled={isReplyUpdating}
                          onClick={cancelEditing}
                          size="sm"
                          variant="outline"
                        >
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

interface InlineQuestionContentProps {
  content: string;
  images: QuestionImage[];
  label: string;
}

const imageTokenPattern = /(\[\[img:\d+\]\])/g;
const imageTokenIdPattern = /^\[\[img:(\d+)\]\]$/;

const InlineQuestionContent = ({ content, images, label }: InlineQuestionContentProps) => {
  const renderedImageIds = new Set<string>();
  const contentParts = content.split(imageTokenPattern);

  const renderImage = (image: QuestionImage, key: string) => {
    renderedImageIds.add(image.id);

    return (
      <img
        alt={`${label} 첨부 이미지`}
        className="my-2 max-h-80 max-w-full rounded-[4px] border border-stology-border-light object-contain"
        key={key}
        loading="lazy"
        src={image.url}
      />
    );
  };

  return (
    <div className="min-w-0 flex-1 break-words text-[13px] leading-[22.1px] text-stology-text-dark">
      {contentParts.map((part, index) => {
        const imageId = part.match(imageTokenIdPattern)?.[1];
        const image = imageId ? images.find(({ id }) => id === imageId) : undefined;

        return image ? (
          renderImage(image, `${image.id}-${index}`)
        ) : (
          <span className="whitespace-pre-wrap" key={`text-${index}`}>
            {imageId ? '' : part}
          </span>
        );
      })}
      {images
        .filter(({ id }) => !renderedImageIds.has(id))
        .map((image) => renderImage(image, `trailing-${image.id}`))}
    </div>
  );
};
