import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { httpClient } from '@/shared/api/http_client';
import type { ApiResponse } from '@/shared/api/types';
import { Button, Input, Loading, Modal } from '@/shared/ui';

// 스웨거 GET /api/template 응답 형태
interface TemplateFromApi {
  templateId: number;
  title: string;
  uploader: string;
  description: string;
}

export interface OntologyTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
}

export interface OntologySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: OntologyTemplate) => void;
  initialSelectedId?: string;
}

function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res =
        await httpClient.get<ApiResponse<{ templates: TemplateFromApi[] }>>('/api/template');
      return (res.data.result?.templates ?? []).map((t): OntologyTemplate => ({
        id: String(t.templateId),
        name: t.title,
        description: t.description ?? '',
        author: t.uploader ?? 'Stology',
      }));
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });
}

export const OntologySearchModal = ({
  isOpen,
  onClose,
  onSelect,
  initialSelectedId,
}: OntologySearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);

  const { data: templates = [], isLoading } = useTemplates();

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConfirm = () => {
    const chosen = templates.find((t) => t.id === selectedId);
    if (chosen) {
      onSelect(chosen);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="온톨로지 템플릿 검색"
      showCloseButton
      className="max-w-[440px]"
    >
      <div className="space-y-5 pt-1">
        {/* 1. 템플릿 검색어 입력 */}
        <div>
          <label
            htmlFor="ontology-template-search"
            className="block text-xs font-bold text-stology-text-dark mb-1.5"
          >
            템플릿 검색어
          </label>
          <div className="relative">
            <Input
              id="ontology-template-search"
              placeholder="예: Spring Boot, JPA, CS"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stology-text-light pointer-events-none" />
          </div>
        </div>

        {/* 2 & 3. 검색 결과 N개 & 카드 목록 */}
        <div>
          <div className="text-xs font-bold text-stology-text-dark mb-2.5">
            검색 결과 {isLoading ? '...' : `${filteredTemplates.length}개`}
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {isLoading ? (
              <Loading label="템플릿 목록을 불러오는 중..." className="py-8" />
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => {
                const isSelected = selectedId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedId(template.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CF6] ${
                      isSelected
                        ? 'bg-[#EEF2FF] border-[#5B5CF6] shadow-sm'
                        : 'bg-white border-stology-border hover:border-stology-border-dark hover:bg-stology-off-white/50'
                    }`}
                  >
                    {/* Title + 선택됨 badge */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-stology-text-dark">
                        {template.name}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-bold text-[#5B5CF6]">선택됨</span>
                      )}
                    </div>

                    {/* Subtitle & Author */}
                    <div className="flex items-center justify-between text-xs text-stology-text-light">
                      <span>{template.description}</span>
                      <span>업로드 사용자: {template.author}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-stology-text-light border border-dashed rounded-xl">
                검색 결과와 일치하는 온톨로지 템플릿이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 4. 하단 버튼 그룹 (뒤로, 선택 완료) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full py-2.5">
            뒤로
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedId}
            className="w-full py-2.5 bg-[#191919] hover:bg-[#333] text-white"
          >
            선택 완료
          </Button>
        </div>
      </div>
    </Modal>
  );
};
