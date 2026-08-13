// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { KnowledgeGraph } from '@/shared/types/stology';

import { KnowledgeGraphPage } from './KnowledgeGraphPage';

afterEach(cleanup);

const emptyGraph: KnowledgeGraph = { clusters: [], edges: [], nodes: [] };

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderPage = (props: Parameters<typeof KnowledgeGraphPage>[0] = {}) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <KnowledgeGraphPage {...props} />
    </QueryClientProvider>,
  );

const selectNode = (label: string) =>
  fireEvent.click(screen.getByRole('button', { name: `${label} 노드` }));

describe('KnowledgeGraphPage', () => {
  it('활성 노드와 비활성 노드를 함께 표시한다', () => {
    renderPage();

    const list = screen.getByRole('list', { name: '지식 구조 노드 목록' });

    expect(within(list).getByText('JWT')).toBeInTheDocument();
    expect(within(list).getByText('DNS 조회')).toBeInTheDocument();
  });

  it('노드를 선택하기 전에는 패널이 안내를 표시한다', () => {
    renderPage();

    expect(screen.getByText('노드를 선택해 주세요')).toBeInTheDocument();
  });

  it('노드를 선택하면 정의와 관련 자료를 표시한다', () => {
    renderPage();
    selectNode('JWT');

    expect(screen.getByRole('complementary', { name: 'JWT 노드 상세' })).toBeInTheDocument();
    expect(
      screen.getByText('정의: 서버가 발급하는 자가 검증 가능한 인증 토큰'),
    ).toBeInTheDocument();
    expect(screen.getByText('관련 자료 3개 · 최신순')).toBeInTheDocument();
    expect(screen.getByText('토큰 재발급 전략')).toBeInTheDocument();
  });

  it('연결 관계 토글로 선택한 관계의 연결 노드만 표시한다', () => {
    renderPage();
    selectNode('JWT');

    const panel = screen.getByRole('complementary', { name: 'JWT 노드 상세' });

    expect(within(panel).getByText('기반 관계의 연결 노드가 없습니다.')).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: '맥락' }));
    expect(within(panel).getByRole('button', { name: 'OAuth2' })).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: '대조' }));
    expect(within(panel).queryByRole('button', { name: 'OAuth2' })).not.toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Session' })).toBeInTheDocument();
  });

  it('연결 노드명을 클릭하면 해당 노드 상세로 패널을 전환한다', () => {
    renderPage();
    selectNode('JWT');

    const panel = screen.getByRole('complementary', { name: 'JWT 노드 상세' });
    fireEvent.click(within(panel).getByRole('button', { name: '맥락' }));
    fireEvent.click(within(panel).getByRole('button', { name: 'OAuth2' }));

    expect(screen.getByRole('complementary', { name: 'OAuth2 노드 상세' })).toBeInTheDocument();
  });

  it('검색 결과를 선택하면 해당 노드 패널로 진입한다', () => {
    renderPage();

    fireEvent.change(screen.getByRole('searchbox', { name: '노드 검색' }), {
      target: { value: '세션' },
    });

    const results = screen.getByRole('list', { name: '노드 검색 결과' });
    fireEvent.click(within(results).getByRole('button', { name: /Session/ }));

    expect(screen.getByRole('complementary', { name: 'Session 노드 상세' })).toBeInTheDocument();
  });

  it('활성 노드만 보기 필터로 비활성 노드를 숨긴다', () => {
    renderPage();

    fireEvent.change(screen.getByRole('combobox', { name: '필터' }), {
      target: { value: 'active' },
    });

    const list = screen.getByRole('list', { name: '지식 구조 노드 목록' });

    expect(within(list).getByText('JWT')).toBeInTheDocument();
    expect(within(list).queryByText('DNS 조회')).not.toBeInTheDocument();
  });

  it('주차 필터를 선택하면 해당 주차에 활동이 있는 노드만 남긴다', () => {
    renderPage();

    fireEvent.change(screen.getByRole('combobox', { name: '주차별 필터' }), {
      target: { value: '3' },
    });

    const list = screen.getByRole('list', { name: '지식 구조 노드 목록' });

    expect(within(list).getByText('JWT')).toBeInTheDocument();
    expect(within(list).queryByText('OAuth2')).not.toBeInTheDocument();
  });

  it('신규 활성과 보강 상태를 구분해 표시한다', () => {
    renderPage();

    selectNode('JWT');
    expect(
      within(screen.getByRole('complementary', { name: 'JWT 노드 상세' })).getByText('보강'),
    ).toBeInTheDocument();

    selectNode('OAuth2');
    expect(
      within(screen.getByRole('complementary', { name: 'OAuth2 노드 상세' })).getByText(
        '신규 활성',
      ),
    ).toBeInTheDocument();
  });

  it('원본 자료 보기 링크를 클릭하면 관련자료 팝업을 연다', () => {
    const handleMaterialOpen = vi.fn();

    renderPage({ onMaterialOpen: handleMaterialOpen });
    selectNode('JWT');
    fireEvent.click(screen.getByRole('button', { name: '[원본 자료 보기]' }));

    const dialog = screen.getByRole('dialog', { name: 'JWT 관련자료' });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('토큰 재발급 전략')).toBeInTheDocument();

    fireEvent.click(within(dialog).getAllByRole('button', { name: '다운로드' })[0]);

    expect(handleMaterialOpen).toHaveBeenCalledOnce();
    expect(handleMaterialOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'mat-3' }));
  });

  it('관련자료 팝업의 닫기 버튼을 클릭하면 팝업을 닫는다', () => {
    renderPage();
    selectNode('JWT');
    fireEvent.click(screen.getByRole('button', { name: '[원본 자료 보기]' }));
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(screen.queryByRole('dialog', { name: 'JWT 관련자료' })).not.toBeInTheDocument();
  });

  it('노드가 없으면 빈 상태를 표시한다', () => {
    renderPage({ graph: emptyGraph });

    expect(screen.getByText('표시할 노드가 없습니다')).toBeInTheDocument();
  });

  it('오류가 있으면 오류와 다시 시도를 표시한다', () => {
    const handleRetry = vi.fn();

    renderPage({ errorMessage: '네트워크 오류', onRetry: handleRetry });
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('지식 구조를 불러오지 못했습니다')).toBeInTheDocument();
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('종료된 스터디는 읽기 전용 안내를 표시한다', () => {
    renderPage({ isReadOnly: true });

    expect(
      screen.getByText('종료된 스터디입니다. 지식 구조를 읽기 전용으로 확인할 수 있습니다.'),
    ).toBeInTheDocument();
  });
});
