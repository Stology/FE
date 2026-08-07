import { useQuery } from '@tanstack/react-query';

import { getKnowledgeGraph } from '@/shared/api/knowledge';

import { mapKnowledgeGraphRes } from '../model/knowledge_api_mapper';

export const useKnowledgeGraph = (studyId: string | undefined) =>
  useQuery({
    enabled: Boolean(studyId),
    queryFn: () => getKnowledgeGraph(studyId as string).then(mapKnowledgeGraphRes),
    queryKey: ['knowledge-graph', studyId],
  });
