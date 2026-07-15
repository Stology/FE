import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface AccordionItem {
  content: ReactNode;
  id: string;
  title: ReactNode;
}

interface AccordionProps {
  allowMultiple?: boolean;
  className?: string;
  defaultOpenIds?: string[];
  items: AccordionItem[];
}

export const Accordion = ({
  allowMultiple = false,
  className,
  defaultOpenIds = [],
  items,
}: AccordionProps) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleItem = (id: string) => {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      if (isOpen) return current.filter((openId) => openId !== id);
      return allowMultiple ? [...current, id] : [id];
    });
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-stology-border-light bg-white',
        className,
      )}
    >
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const panelId = `${item.id}-panel`;
        const triggerId = `${item.id}-trigger`;

        return (
          <section className="border-b border-stology-border-light last:border-b-0" key={item.id}>
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-heading-2 text-stology-text-dark transition hover:bg-stology-off-white"
              id={triggerId}
              onClick={() => toggleItem(item.id)}
              type="button"
            >
              <span>{item.title}</span>
              <ChevronDown
                aria-hidden
                className={cn(
                  'size-4 shrink-0 text-stology-text-light transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen ? (
              <div
                aria-labelledby={triggerId}
                className="border-t border-stology-border-light px-4 py-4 text-body text-stology-text-light"
                id={panelId}
                role="region"
              >
                {item.content}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
};
