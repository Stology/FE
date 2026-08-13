// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { baseMockTeamActivity } from '../mocks';
import { TeamActivityPanel } from './TeamActivityPanel';

afterEach(cleanup);

const LocationProbe = () => {
  const location = useLocation();

  return <output aria-label="현재 경로">{location.pathname}</output>;
};

describe('TeamActivityPanel', () => {
  it('활동이 없으면 빈 상태 문구만 중앙 영역에 표시한다', () => {
    render(
      <MemoryRouter>
        <TeamActivityPanel
          items={[]}
          studies={[{ id: '1', name: '백엔드 스터디' }]}
          selectedStudy="all"
          onStudyChange={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('아직 팀 활동이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByText(/빈 상태:/)).not.toBeInTheDocument();
    expect(screen.queryByText('유형')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: '스터디 필터' })).not.toBeInTheDocument();
  });

  it('진행 스터디가 2개 이상이면 전체 스터디 필터를 표시한다', () => {
    render(
      <MemoryRouter>
        <TeamActivityPanel
          items={[]}
          studies={[
            { id: '1', name: '백엔드 스터디' },
            { id: '2', name: 'CS 스터디' },
          ]}
          selectedStudy="all"
          onStudyChange={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('combobox', { name: '스터디 필터' })).toHaveValue('all');
    expect(screen.getByRole('option', { name: '전체 스터디' })).toBeInTheDocument();
  });

  it('활동 행 전체를 클릭하면 연결된 화면으로 이동한다', () => {
    render(
      <MemoryRouter>
        <TeamActivityPanel
          items={[baseMockTeamActivity[0]]}
          studies={[{ id: '1', name: '백엔드 스터디' }]}
          selectedStudy="all"
          onStudyChange={vi.fn()}
        />
        <LocationProbe />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /5개 반영/ }));

    expect(screen.getByRole('status', { name: '현재 경로' })).toHaveTextContent(
      '/studies/spring-study/knowledge',
    );
  });
});
