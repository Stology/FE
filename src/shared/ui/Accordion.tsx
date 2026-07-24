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
    <div className={cn('flex w-full max-w-[600px] flex-col gap-[13px]', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const panelId = `${item.id}-panel`;
        const triggerId = `${item.id}-trigger`;

        return (
          <section
            className="overflow-hidden rounded-[5.5px] border border-stology-border-light bg-white"
            key={item.id}
          >
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[13px] font-semibold leading-[20.8px] text-stology-text-dark transition hover:bg-stology-off-white"
              id={triggerId}
              onClick={() => toggleItem(item.id)}
              type="button"
            >
              <span>{item.title}</span>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center justify-center text-[13px] font-semibold leading-[20.8px] text-stology-text-light transition-transform',
                  isOpen && 'rotate-180',
                )}
                aria-hidden
              >
                ▾
              </span>
            </button>
            {isOpen ? (
              <div
                aria-labelledby={triggerId}
                className="border-t border-stology-border-light bg-stology-off-white px-5 pb-5 pt-[21px] text-[13px] font-normal leading-[20.8px] text-stology-text-light"
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
