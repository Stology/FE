// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { WeeklyRecordsPage } from './WeeklyRecordsPage';

afterEach(cleanup);

describe('WeeklyRecordsPage', () => {
  it('개념을 전달하지 않으면 목 기록 대신 선택 주차의 빈 상태를 표시한다', () => {
    render(<WeeklyRecordsPage availableWeeks={[1]} selectedWeek={1} />);

    expect(
      screen.getByRole('heading', { name: '이 주차에 활성화된 노드가 없습니다' }),
    ).toBeInTheDocument();
  });
});
