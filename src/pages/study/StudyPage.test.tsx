// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { StudyPage } from './StudyPage';

afterEach(cleanup);

const renderStudyRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<StudyPage />} path="/studies/:studyId/:tab" />
      </Routes>
    </MemoryRouter>,
  );

describe('StudyPage reports route', () => {
  it('주차별 리포트 경로에서 선택된 주차의 리포트를 표시한다', () => {
    renderStudyRoute('/studies/spring-study/reports');

    expect(screen.getByRole('heading', { level: 1, name: '3주차 리포트' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '2주차' }));

    expect(screen.getByRole('heading', { level: 1, name: '2주차 리포트' })).toBeInTheDocument();
  });

  it('종료된 스터디의 리포트를 읽기 전용으로 표시한다', () => {
    renderStudyRoute('/studies/ended-study/reports');

    expect(
      screen.getByText('종료된 스터디입니다. 주차별 리포트를 읽기 전용으로 확인할 수 있습니다.'),
    ).toBeInTheDocument();
  });
});

describe('StudyPage questions route', () => {
  it('질문함 경로에서 질문 목록과 작성 기능을 표시한다', () => {
    renderStudyRoute('/studies/spring-study/questions');

    expect(screen.getByRole('button', { name: '질문 작성' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '질문 목록' })).toBeInTheDocument();
    expect(screen.getByText('Refresh Token 저장 위치가 궁금합니다')).toBeInTheDocument();
  });

  it('종료된 스터디의 질문함을 읽기 전용으로 표시한다', () => {
    renderStudyRoute('/studies/ended-study/questions');

    expect(screen.getByRole('list', { name: '질문 목록' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '질문 작성' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Refresh Token 저장 위치가 궁금합니다/ }));

    expect(screen.queryByRole('button', { name: '답글 작성' })).not.toBeInTheDocument();
    expect(screen.getByText('서버의 토큰 재발급 정책도 같이 정리해볼게요.')).toBeInTheDocument();
  });
});
