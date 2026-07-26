// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WeeklyReportPage } from './WeeklyReportPage';

afterEach(cleanup);

describe('WeeklyReportPage', () => {
  it('로딩 상태를 표시한다', () => {
    render(<WeeklyReportPage isLoading />);

    expect(screen.getByText('주차별 리포트를 불러오는 중입니다')).toBeInTheDocument();
  });

  it('오류 상태에서 재시도할 수 있다', () => {
    const handleRetry = vi.fn();

    render(<WeeklyReportPage errorMessage="리포트 조회에 실패했습니다." onRetry={handleRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('리포트 조회에 실패했습니다.');
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('사용 가능한 주차가 없으면 전체 빈 상태를 표시한다', () => {
    render(<WeeklyReportPage availableWeeks={[]} />);

    expect(
      screen.getByRole('heading', { name: '생성된 주차별 리포트가 없습니다.' }),
    ).toBeInTheDocument();
  });

  it('선택한 주차의 리포트가 없으면 미완료 상태를 표시한다', () => {
    render(<WeeklyReportPage availableWeeks={[5]} selectedWeek={5} />);

    expect(
      screen.getByRole('heading', { name: '이번 주차 스터디가 완료되지 않았습니다.' }),
    ).toBeInTheDocument();
  });

  it('완료된 주차의 리포트를 표시한다', () => {
    render(<WeeklyReportPage availableWeeks={[4]} selectedWeek={4} />);

    expect(screen.getByRole('heading', { level: 1, name: '4주차 리포트' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '2. 노드 추천 · 이어서 해보기' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Refresh Token → Token Rotation → Session Revocation/),
    ).toBeInTheDocument();
  });

  it('종료된 스터디의 읽기 전용 상태를 표시한다', () => {
    render(<WeeklyReportPage isReadOnly />);

    expect(
      screen.getByText('종료된 스터디입니다. 주차별 리포트를 읽기 전용으로 확인할 수 있습니다.'),
    ).toBeInTheDocument();
  });
});
