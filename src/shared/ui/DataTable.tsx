import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import { EmptyState } from './EmptyState';
import { Loading } from './Loading';

export interface DataTableColumn<T> {
  align?: 'left' | 'center' | 'right';
  header: ReactNode;
  key: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  className?: string;
  columns: DataTableColumn<T>[];
  emptyMessage?: string;
  isLoading?: boolean;
  rowKey: (row: T) => string;
  rows: T[];
}

const alignClass = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
};

export const DataTable = <T,>({
  className,
  columns,
  emptyMessage = 'No data',
  isLoading = false,
  rowKey,
  rows,
}: DataTableProps<T>) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-lg border border-stology-border-light bg-white p-8', className)}>
        <Loading label="Loading data" />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState className={className} title={emptyMessage} />;
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-stology-border-light bg-white',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body">
          <thead className="bg-stology-off-white text-stology-text-light">
            <tr>
              {columns.map((column) => (
                <th
                  className={cn(
                    'border-b border-stology-border-light px-4 py-3 font-semibold',
                    alignClass[column.align ?? 'left'],
                  )}
                  key={column.key}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-stology-border-light last:border-0" key={rowKey(row)}>
                {columns.map((column) => (
                  <td
                    className={cn(
                      'px-4 py-3 text-stology-text-dark',
                      alignClass[column.align ?? 'left'],
                    )}
                    key={column.key}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
