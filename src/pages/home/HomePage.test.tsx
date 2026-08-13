// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './HomePage';

vi.mock('./hooks', () => ({
  useMyStudies: () => ({ error: null, isLoading: false, studies: [] }),
  useMyTodo: () => ({
    error: null,
    isLoading: false,
    items: [
      { section: '자료', summary: '자료 확인', to: '/studies/spring-study/upload' },
      { section: '질문함', summary: '질문 확인', to: '/studies/spring-study/questions' },
      { section: '리포트', summary: '리포트 확인', to: '/studies/spring-study/reports' },
    ],
  }),
  useTeamActivity: () => ({ error: null, isLoading: false, items: [] }),
}));

afterEach(cleanup);

const LocationProbe = () => {
  const location = useLocation();

  return <output aria-label="현재 경로">{location.pathname}</output>;
};

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HomePage routing', () => {
  it('스터디 생성 카드를 선택하면 생성 모달을 연다', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /스터디 생성/ }));

    expect(screen.getByRole('dialog', { name: '스터디 생성' })).toBeInTheDocument();
    expect(screen.getByText('새로운 스터디 정보를 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByLabelText('스터디 이름')).toBeInTheDocument();
    expect(screen.getByLabelText('시작일')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('스터디에 대한 설명을 입력해주세요')).toBeInTheDocument();
    expect(screen.queryByText(/HOM001-0100|기본 리포트/)).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent('/');
  });

  it.each([
    [0, '자료 상세'],
    [1, '질문함 상세'],
    [2, '리포트 상세'],
  ])('내 할 일 상세보기로 %s 모달을 연다', (index, dialogName) => {
    renderHome();

    fireEvent.click(screen.getAllByRole('button', { name: '상세보기' })[index]);

    expect(screen.getByRole('dialog', { name: dialogName })).toBeInTheDocument();
    expect(screen.queryByText('빈 상태: 내용 없음')).not.toBeInTheDocument();
    expect(screen.queryByText(/대상 삭제·상태 변경·권한 상실/)).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent('/');
  });

  it('팀 활동 패널에 설계 설명 문구를 표시하지 않는다', () => {
    renderHome();

    expect(screen.getByText('아직 팀 활동이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByText(/빈 상태:/)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: '스터디 필터' })).not.toBeInTheDocument();
    expect(
      screen.queryByText(/전체 스터디 필터 · 최신순 단일 세로 스크롤/),
    ).not.toBeInTheDocument();
  });
});
