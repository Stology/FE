import { cn } from '@/shared/lib/cn';
import type { ConceptRelationKind } from '@/shared/types/stology';

import { RELATION_ORDER, relationLabel } from '../model/knowledge_relations';

interface KnowledgeRelationToggleProps {
  onChange: (kind: ConceptRelationKind) => void;
  value: ConceptRelationKind;
}

function segmentClass(isSelected: boolean) {
  return cn(
    'h-[30px] flex-1 border text-[12px] font-semibold leading-none transition first:rounded-l-md last:rounded-r-md',
    isSelected
      ? 'border-stology-deep-navy bg-stology-deep-navy text-white'
      : 'border-stology-border-light bg-white text-stology-text-dark hover:bg-stology-off-white',
  );
}

export const KnowledgeRelationToggle = ({ onChange, value }: KnowledgeRelationToggleProps) => (
  <div aria-label="연결 관계 유형" className="mt-2 flex" role="group">
    {RELATION_ORDER.map((kind) => (
      <button
        aria-pressed={value === kind}
        className={segmentClass(value === kind)}
        key={kind}
        onClick={() => onChange(kind)}
        type="button"
      >
        {relationLabel[kind]}
      </button>
    ))}
  </div>
);
