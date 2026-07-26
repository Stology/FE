// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { StudyPage } from './StudyPage';

afterEach(cleanup);

const renderStudyRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<p>홈 화면</p>} path="/" />
        <Route element={<StudyPage />} path="/studies/:studyId/:tab" />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

const LocationProbe = () => {
  const location = useLocation();

  return <output aria-label="현재 경로">{`${location.pathname}${location.search}`}</output>;
};

describe('StudyPage route validation', () => {
  it('존재하지 않는 스터디는 홈으로 이동한다', () => {
    renderStudyRoute('/studies/missing-study/knowledge');

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent('/');
  });

  it('지원하지 않는 탭은 지식 구조로 이동한다', () => {
    renderStudyRoute('/studies/spring-study/missing-tab');

    expect(screen.getByRole('region', { name: '지식 구조' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent(
      '/studies/spring-study/knowledge',
    );
  });
});

describe('StudyPage knowledge route', () => {
  it('연결 자료를 선택하면 자료 업로드 탭으로 이동한다', () => {
    renderStudyRoute('/studies/spring-study/knowledge');

    fireEvent.click(screen.getByRole('button', { name: 'JWT 노드' }));
    fireEvent.click(screen.getByRole('button', { name: /JWT 정리 노트/ }));

    expect(screen.getByRole('region', { name: '자료 업로드' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent(
      '/studies/spring-study/upload?materialId=jwt-note',
    );
  });
});

describe('StudyPage questions route', () => {
  it('질문함 경로에서 질문 목록을 표시한다', () => {
    renderStudyRoute('/studies/spring-study/questions');

    expect(screen.getByRole('region', { name: '질문함' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '질문 작성' })).toBeInTheDocument();
  });

  it('종료된 스터디의 질문함을 읽기 전용으로 표시한다', () => {
    renderStudyRoute('/studies/ended-study/questions');

    expect(screen.getByRole('region', { name: '질문함' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '질문 작성' })).not.toBeInTheDocument();
  });
});

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
