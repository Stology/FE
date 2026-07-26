import { Link, useMatch } from 'react-router-dom';

import stologyIcon from '@/shared/assets/stology-icon.png';
import { cn } from '@/shared/lib/cn';

export interface SidebarItem {
  label: string;
  to: string;
  activePattern?: string;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
}

const sidebarNavItemStateClass = {
  active: 'border border-stology-deep-navy bg-stology-deep-navy text-white',
  default:
    'border border-stology-border-light bg-white text-stology-text-dark hover:border-stology-light-blue',
};

const SidebarLogo = () => (
  <div className="w-full pb-3">
    <div className="flex h-12 w-full items-center gap-2 px-3">
      <img
        className="h-[22px] w-[22px] shrink-0 rounded object-contain"
        src={stologyIcon}
        alt=""
        width={22}
        height={22}
        aria-hidden
      />
      <p className="text-[20px] font-bold leading-8 tracking-normal text-stology-deep-navy">
        St<span className="text-stology-electric-blue">o</span>logy
      </p>
    </div>
  </div>
);

const SidebarNavItem = ({ item }: { item: SidebarItem }) => {
  const activeMatch = useMatch({ path: item.activePattern ?? item.to, end: !item.activePattern });
  const isActive = Boolean(activeMatch);

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-[39px] w-full items-center rounded-[4.5px] px-[13px] text-[13px] font-medium leading-[20.8px] transition',
        isActive ? sidebarNavItemStateClass.active : sidebarNavItemStateClass.default,
      )}
      to={item.to}
    >
      <span className="truncate">{item.label}</span>
    </Link>
  );
};

const SidebarSection = ({ section }: { section: SidebarSection }) => (
  <div className="space-y-2">
    {section.title ? (
      <p className="w-full px-3 pb-1 pt-4 text-[11px] font-medium leading-[17.6px] text-stology-text-light">
        {section.title}
      </p>
    ) : null}
    <div className="space-y-2">
      {section.items.map((item) => (
        <SidebarNavItem item={item} key={item.to} />
      ))}
    </div>
  </div>
);

export const Sidebar = ({ sections }: SidebarProps) => (
  <aside className="flex min-h-screen w-[260px] shrink-0 flex-col overflow-y-auto rounded-[7.5px] border-r border-stology-border-light bg-stology-off-white px-4 py-6">
    <SidebarLogo />
    <nav className="mt-2 flex flex-col gap-2">
      {sections.map((section, index) => (
        <SidebarSection key={section.title ?? index} section={section} />
      ))}
    </nav>
  </aside>
);
