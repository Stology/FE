import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { homeApi, type TeamActivityInfo } from '@/shared/api/home';
import { type TeamActivityItem } from '../mocks';

function formatRelativeTime(occurredAt: string, now = new Date()) {
  const occurredDate = new Date(occurredAt);
  const elapsedMilliseconds = now.getTime() - occurredDate.getTime();

  if (Number.isNaN(occurredDate.getTime())) return '-';
  if (elapsedMilliseconds < 60_000) return '방금';

  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);
  if (elapsedMinutes < 60) return `${elapsedMinutes}분`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays}일`;

  return occurredDate.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

interface UseTeamActivityResult {
  items: TeamActivityItem[];
  isLoading: boolean;
  error: Error | null;
  removeItem: (id: string) => void;
}

async function getAllTeamActivities(studyId: number, signal: AbortSignal) {
  const activities: TeamActivityInfo[] = [];
  const visitedCursors = new Set<string>();
  let cursor: string | undefined;

  while (true) {
    const response = await homeApi.getTeamTodos(studyId, cursor, signal);
    activities.push(...response.activities);

    const nextCursor = response.pageInfo.nextCursor;
    if (!response.pageInfo.hasNext || !nextCursor || visitedCursors.has(nextCursor)) break;

    visitedCursors.add(nextCursor);
    cursor = nextCursor;
  }

  return activities;
}

export function useTeamActivity(studyId?: string): UseTeamActivityResult {
  const queryClient = useQueryClient();
  const numericStudyId = studyId && studyId !== 'all' ? Number(studyId) : -1;

  const { data, isLoading, error } = useQuery({
    queryKey: ['teamActivity', numericStudyId],
    queryFn: ({ signal }) => getAllTeamActivities(numericStudyId, signal),
    enabled: !Number.isNaN(numericStudyId),
  });

  const items = useMemo(() => {
    if (!data) return [];

    return [...data]
      .filter((activity) => activity.activityType === 'NODE' || activity.activityType === 'ANSWER')
      .sort(
        (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
      )
      .map(
        (act) =>
          ({
            id: `${act.studyId}-${act.targetId}-${act.activityType}-${act.occurredAt}`,
            type: act.activityType === 'NODE' ? '구조' : '답글',
            summary: act.event,
            detail:
              act.activityType === 'NODE'
                ? `${act.studyName} · 지식 구조 반영`
                : `${act.studyName} · 질문 답글`,
            target: act.activityType === 'NODE' ? '지식 구조' : `질문 #${act.targetId}`,
            timeAgo: formatRelativeTime(act.occurredAt),
            to:
              act.activityType === 'NODE'
                ? `/studies/${act.studyId}/knowledge`
                : `/studies/${act.studyId}/questions?questionId=${act.targetId}`,
          }) as TeamActivityItem,
      );
  }, [data]);

  function removeItem(id: string) {
    queryClient.setQueryData<TeamActivityInfo[]>(['teamActivity', numericStudyId], (oldData) => {
      return oldData?.filter(
        (activity) =>
          `${activity.studyId}-${activity.targetId}-${activity.activityType}-${activity.occurredAt}` !==
          id,
      );
    });
  }

  return {
    items,
    isLoading,
    error: error as Error | null,
    removeItem,
  };
}
