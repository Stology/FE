// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ConceptGraph } from '@/shared/types/stology';

import { KnowledgeGraphPage } from './KnowledgeGraphPage';

afterEach(cleanup);

const emptyGraph: ConceptGraph = { nodes: [], relations: [] };

const selectNode = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name: `${name} 노드` }));

describe('KnowledgeGraphPage', () => {
  it('활성 노드와 비활성 노드를 함께 표시한다', () => {
    render(<KnowledgeGraphPage />);

    const graph = screen.getByRole('group', { name: '지식 구조 그래프' });

    expect(within(graph).getByText('JWT')).toBeInTheDocument();
    expect(within(graph).getByText('Cache')).toBeInTheDocument();
    expect(within(graph).getByText('Session')).toBeInTheDocument();
  });

  it('노드를 선택하기 전에는 패널이 안내를 표시한다', () => {
    render(<KnowledgeGraphPage />);

    expect(screen.getByText('노드를 선택해 주세요')).toBeInTheDocument();
  });

  it('노드를 선택하면 정의와 관련 자료를 표시한다', () => {
    render(<KnowledgeGraphPage />);
    selectNode('JWT');

    expect(screen.getByRole('complementary', { name: 'JWT 노드 상세' })).toBeInTheDocument();
    expect(screen.getByText('정의: 인증 토큰')).toBeInTheDocument();
    expect(screen.getByText('관련 자료 3개 · 최신순')).toBeInTheDocument();
    expect(screen.getByText('JWT 정리 노트 · 김철수 · 2026-03-15')).toBeInTheDocument();
  });

  it('연결 관계 토글로 선택한 관계의 연결 노드만 표시한다', () => {
    render(<KnowledgeGraphPage />);
    selectNode('JWT');

    const panel = screen.getByRole('complementary', { name: 'JWT 노드 상세' });

    expect(within(panel).getByRole('button', { name: 'Auth' })).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: '맥락' }));

    expect(within(panel).queryByRole('button', { name: 'Auth' })).not.toBeInTheDocument();
    expect(within(panel).getByText('맥락 관계의 연결 노드가 없습니다.')).toBeInTheDocument();
  });

  it('연결 노드명을 클릭하면 해당 노드 상세로 패널을 전환한다', () => {
    render(<KnowledgeGraphPage />);
    selectNode('JWT');

    const panel = screen.getByRole('complementary', { name: 'JWT 노드 상세' });
    fireEvent.click(within(panel).getByRole('button', { name: 'Auth' }));

    expect(screen.getByRole('complementary', { name: 'Auth 노드 상세' })).toBeInTheDocument();
    expect(screen.getByText('정의: 사용자 인증 절차')).toBeInTheDocument();
  });

  it('검색 결과를 선택하면 해당 노드 패널로 진입한다', () => {
    render(<KnowledgeGraphPage />);

    fireEvent.change(screen.getByRole('searchbox', { name: '노드 검색' }), {
      target: { value: 'sess' },
    });

    const results = screen.getByRole('list', { name: '노드 검색 결과' });
    fireEvent.click(within(results).getByRole('button', { name: /Session/ }));

    expect(screen.getByRole('complementary', { name: 'Session 노드 상세' })).toBeInTheDocument();
  });

  it('활성 노드만 보기 필터로 비활성 노드를 숨긴다', () => {
    render(<KnowledgeGraphPage />);

    fireEvent.change(screen.getByRole('combobox', { name: '필터' }), {
      target: { value: 'active' },
    });

    const graph = screen.getByRole('group', { name: '지식 구조 그래프' });

    expect(within(graph).getByText('JWT')).toBeInTheDocument();
    expect(within(graph).queryByText('Cache')).not.toBeInTheDocument();
  });

  it('주차 필터를 선택하면 해당 주차 상태 노드만 남긴다', () => {
    render(<KnowledgeGraphPage />);

    fireEvent.change(screen.getByRole('combobox', { name: '주차별 필터' }), {
      target: { value: '3' },
    });

    const graph = screen.getByRole('group', { name: '지식 구조 그래프' });

    expect(within(graph).getByText('JWT')).toBeInTheDocument();
    expect(within(graph).getByText('Auth')).toBeInTheDocument();
    expect(within(graph).queryByText('Session')).not.toBeInTheDocument();
  });

  it('신규 활성과 보강 상태를 구분해 표시한다', () => {
    render(<KnowledgeGraphPage />);

    selectNode('JWT');
    expect(screen.getByText('신규 활성')).toBeInTheDocument();

    selectNode('Auth');
    expect(screen.getByText('보강')).toBeInTheDocument();
  });

  it('관련 자료를 클릭하면 원본 자료 열기를 요청한다', () => {
    const handleMaterialOpen = vi.fn();

    render(<KnowledgeGraphPage onMaterialOpen={handleMaterialOpen} />);
    selectNode('JWT');
    fireEvent.click(screen.getByRole('button', { name: 'JWT 정리 노트 · 김철수 · 2026-03-15' }));

    expect(handleMaterialOpen).toHaveBeenCalledOnce();
    expect(handleMaterialOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'jwt-note' }));
  });

  it('노드가 없으면 빈 상태를 표시한다', () => {
    render(<KnowledgeGraphPage graph={emptyGraph} />);

    expect(screen.getByText('표시할 노드가 없습니다')).toBeInTheDocument();
  });

  it('오류가 있으면 오류와 다시 시도를 표시한다', () => {
    const handleRetry = vi.fn();

    render(<KnowledgeGraphPage errorMessage="네트워크 오류" onRetry={handleRetry} />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('지식 구조를 불러오지 못했습니다')).toBeInTheDocument();
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('종료된 스터디는 읽기 전용 안내를 표시한다', () => {
    render(<KnowledgeGraphPage isReadOnly />);

    expect(
      screen.getByText('종료된 스터디입니다. 지식 구조를 읽기 전용으로 확인할 수 있습니다.'),
    ).toBeInTheDocument();
  });
});
