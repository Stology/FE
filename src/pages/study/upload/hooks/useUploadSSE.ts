import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * 업로드/AI 분석 상태가 바뀔 때마다 서버가 SSE로 data-upload-status/data-ai-status 이벤트를
 * 보내준다(2026-08-09 실서버 확인됨). 이벤트 payload를 직접 파싱해 캐시에 병합하는 대신, 이벤트가
 * 오면 목록 쿼리를 무효화해서 REST로 다시 받아오는 방식을 쓴다 — SSE payload는 필드명이 REST
 * 목록 응답과 다르고(studyMaterialId vs materialId), 매핑 로직을 두 곳에 둘 필요가 없어서다.
 */
export const useUploadSSE = (studyId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!studyId || typeof EventSource === 'undefined') return undefined;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['study-upload-files', studyId] });
    };

    const source = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}/api/study/${studyId}/uploadSSE`,
      { withCredentials: true },
    );

    source.addEventListener('data-upload-status', invalidate);
    source.addEventListener('data-ai-status', invalidate);

    return () => {
      source.close();
    };
  }, [studyId, queryClient]);
};
