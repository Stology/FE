// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';
import { ErrorMessage } from './ErrorMessage';
import { Loading } from './Loading';

afterEach(cleanup);

describe('EmptyState', () => {
  it.each([
    '아직 업로드된 자료가 없습니다.',
    '아직 활성화된 노드가 없습니다.',
    '아직 질문이 없습니다.',
    '검토 대기 중인 자료가 없습니다.',
  ])('맥락별 빈 상태 문구를 제목으로 표시한다: %s', (title) => {
    render(<EmptyState title={title} />);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('설명, 아이콘, 액션을 전달한 경우에만 함께 표시한다', () => {
    render(
      <EmptyState
        action={<button type="button">자료 업로드</button>}
        description="학습자료를 등록하면 개념 후보를 추출합니다."
        icon={<span aria-label="자료 아이콘" />}
        title="아직 업로드된 자료가 없습니다."
      />,
    );

    expect(screen.getByText('학습자료를 등록하면 개념 후보를 추출합니다.')).toBeInTheDocument();
    expect(screen.getByLabelText('자료 아이콘')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '자료 업로드' })).toBeInTheDocument();
  });
});

describe('Loading', () => {
  it('전달된 로딩 문구와 화면에서 숨겨진 스피너를 표시한다', () => {
    const { container } = render(<Loading label="AI 후보를 추출하는 중입니다" />);

    expect(screen.getByText('AI 후보를 추출하는 중입니다')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('문구를 생략하면 한국어 대체 문구를 보조기기에 제공한다', () => {
    render(<Loading />);

    expect(screen.getByText('불러오는 중입니다')).toHaveClass('sr-only');
  });

  it.each([
    ['sm', 'size-4'],
    ['md', 'size-6'],
    ['lg', 'size-8'],
  ] as const)('%s 크기에 맞는 스피너 스타일을 사용한다', (size, expectedClass) => {
    const { container } = render(<Loading size={size} />);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(expectedClass);
  });
});

describe('ErrorMessage', () => {
  it('기본 제목과 오류 원인을 함께 표시한다', () => {
    render(<ErrorMessage message="네트워크 연결을 확인해 주세요." />);

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText('네트워크 연결을 확인해 주세요.')).toBeInTheDocument();
  });

  it('화면 맥락에 맞는 오류 제목을 사용할 수 있다', () => {
    render(
      <ErrorMessage message="자료 ID가 올바르지 않습니다." title="자료를 불러오지 못했습니다" />,
    );

    expect(screen.getByText('자료를 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText('자료 ID가 올바르지 않습니다.')).toBeInTheDocument();
  });
});
