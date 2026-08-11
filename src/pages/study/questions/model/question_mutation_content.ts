import type { QuestionImage } from '@/shared/types/stology';

const imageTokenPattern = /\[\[img:(?:new:)?\d+\]\]/g;

export function stripQuestionImageTokens(content: string): string {
  return content
    .replace(imageTokenPattern, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildQuestionMutationContent(
  content: string,
  existingImages: QuestionImage[],
  newImages: File[],
): string {
  const tokens = [
    ...existingImages.map(({ id }) => `[[img:${id}]]`),
    ...newImages.map((_, index) => `[[img:new:${index}]]`),
  ];

  return [stripQuestionImageTokens(content), ...tokens].filter(Boolean).join('\n');
}
