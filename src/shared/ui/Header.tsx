import type { ReactNode } from 'react';

interface HeaderProps {
  code?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export const Header = ({ actions, code, description, title, children }: HeaderProps) => (
  <header className="flex flex-wrap items-start justify-between gap-4">
    <div>
      {code ? <p className="text-label text-stology-electric-blue">{code}</p> : null}
      <h1 className="mt-1 text-heading-1 text-stology-text-dark">{title}</h1>
      {description ? <p className="mt-2 text-body text-stology-text-light">{description}</p> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </header>
);
