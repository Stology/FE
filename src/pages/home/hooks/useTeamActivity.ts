import { useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { homeApi } from '@/shared/api/home';
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
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  removeItem: (id: string) => void;
}

export const useTeamActivity = (studyId?: string): UseTeamActivityResult => {
  const queryClient = useQueryClient();
  const numericStudyId = studyId && studyId !== 'all' ? Number(studyId) : -1;

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['teamActivity', numericStudyId],
      queryFn: ({ pageParam }) => homeApi.getTeamTodos(numericStudyId, pageParam),
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasNext ? lastPage.pageInfo.nextCursor : undefined,
      enabled: !Number.isNaN(numericStudyId),
      initialPageParam: undefined as string | undefined,
    });

  const items = useMemo(() => {
    if (!data) return [];

    return data.pages.flatMap((page) =>
      page.activities.map(
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
      ),
    );
  }, [data]);

  const removeItem = (id: string) => {
    // In a real scenario, this might call a backend API to hide the activity.
    // For now, we will just invalidate the query or optimistically update the cache.
    // Since the API doesn't provide a delete endpoint for activity, we just do nothing or update cache.
    queryClient.setQueryData(['teamActivity', numericStudyId], (oldData: unknown) => {
      if (!oldData) return oldData;
      const data = oldData as {
        pages: {
          activities: {
            studyId: number;
            targetId: number;
            activityType: string;
            occurredAt: string;
          }[];
        }[];
      };
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          activities: page.activities.filter(
            (act) => `${act.studyId}-${act.targetId}-${act.activityType}-${act.occurredAt}` !== id,
          ),
        })),
      };
    });
  };

  return {
    items,
    isLoading,
    error: error as Error | null,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    removeItem,
  };
};
