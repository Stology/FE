import type { QuestionDetailRes, QuestionListRes } from '@/shared/api/questions';
import type { QuestionDetail, QuestionImage, QuestionSummary } from '@/shared/types/stology';

export interface QuestionListQueryData {
  currentPage: number;
  questions: QuestionSummary[];
  studyEnded: boolean;
  totalElements: number;
  totalPages: number;
}

function formatQuestionDate(createdAt: string): string {
  return createdAt.slice(0, 10);
}

function mapQuestionImages(images: QuestionDetailRes['images']): QuestionImage[] {
  return (images ?? []).map((image) => ({
    id: String(image.imageId),
    url: image.imageUrl,
  }));
}

export function mapQuestionList(response: QuestionListRes): QuestionListQueryData {
  return {
    currentPage: response.currentPage + 1,
    questions: response.questionList.map((question) => ({
      authorName: question.authorName,
      createdAt: formatQuestionDate(question.createdAt),
      hasAttachment: question.hasImage,
      id: String(question.questionId),
      isMine: question.isMine,
      replyCount: question.answerCount,
      title: question.title,
    })),
    studyEnded: response.studyEnded,
    totalElements: response.totalElements,
    totalPages: response.totalPage,
  };
}

export function mapQuestionDetail(response: QuestionDetailRes): QuestionDetail {
  const images = mapQuestionImages(response.images);

  return {
    authorName: response.authorName,
    content: response.content,
    createdAt: formatQuestionDate(response.createdAt),
    hasAttachment: images.length > 0,
    id: String(response.questionId),
    images,
    isMine: response.isMine,
    replies: (response.answerList ?? []).map((answer) => ({
      authorName: answer.authorName,
      content: answer.content,
      createdAt: formatQuestionDate(answer.createdAt),
      id: String(answer.answerId),
      images: mapQuestionImages(answer.images),
      isMine: answer.isMine,
    })),
    replyCount: response.answerList?.length ?? 0,
    title: response.title,
  };
}
