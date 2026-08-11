// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import {
  buildQuestionMutationContent,
  stripQuestionImageTokens,
} from './question_mutation_content';

describe('question mutation content', () => {
  it('표시용 본문에서 기존 이미지와 신규 이미지 토큰을 제거한다', () => {
    expect(stripQuestionImageTokens('본문\n[[img:10]]\n[[img:new:0]]')).toBe('본문');
  });

  it('기존 이미지 토큰을 보존하고 신규 파일 순서대로 토큰을 추가한다', () => {
    const existingImages = [
      { id: '10', url: 'https://example.com/10.png' },
      { id: '20', url: 'https://example.com/20.png' },
    ];
    const newImages = [
      new File(['first'], 'first.png', { type: 'image/png' }),
      new File(['second'], 'second.png', { type: 'image/png' }),
    ];

    expect(buildQuestionMutationContent('수정한 본문', existingImages, newImages)).toBe(
      '수정한 본문\n[[img:10]]\n[[img:20]]\n[[img:new:0]]\n[[img:new:1]]',
    );
  });
});
