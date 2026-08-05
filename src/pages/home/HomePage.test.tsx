// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

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

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
      <LocationProbe />
    </MemoryRouter>,
  );

describe('HomePage routing', () => {
  it('스터디 생성 카드를 선택하면 생성 모달을 연다', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /스터디 생성/ }));

    expect(screen.getByRole('dialog', { name: '스터디 생성' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent('/');
  });

  it.each([
    [0, '/studies/spring-study/upload'],
    [1, '/studies/spring-study/questions'],
    [2, '/studies/spring-study/reports'],
  ])('내 할 일 링크를 구현된 스터디 탭으로 이동시킨다', (index, expectedPath) => {
    renderHome();

    fireEvent.click(screen.getAllByRole('button', { name: '상세보기' })[index]);

    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent(expectedPath);
  });
});
