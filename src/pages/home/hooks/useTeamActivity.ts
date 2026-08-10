import { useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { homeApi } from '@/shared/api/home';
import { type TeamActivityItem } from '../mocks';

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
  const parsedStudyId = studyId && studyId !== 'all' ? Number(studyId) : NaN;
  const numericStudyId = Number.isInteger(parsedStudyId) ? parsedStudyId : null;

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['teamActivity', numericStudyId],
      queryFn: ({ pageParam }) => homeApi.getTeamTodos(numericStudyId!, pageParam),
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasNext ? lastPage.pageInfo.nextCursor : undefined,
      enabled: numericStudyId !== null,
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
            detail: act.activityType === 'NODE' ? '지식 구조 변경' : '답글이 등록되었습니다',
            target: act.targetId.toString(), // Mocked as string, might need real target text from event
            timeAgo: new Date(act.occurredAt).toLocaleDateString(), // ToDo: convert to time ago format
            to: `/studies/${act.studyId}/${act.activityType === 'NODE' ? 'knowledge' : 'questions'}`,
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
