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
  <div className="flex min-h-[41px] w-full items-center gap-3 px-3 py-2">
    <img
      className="h-[22px] w-[22px] shrink-0 rounded object-contain"
      src={stologyIcon}
      alt=""
      width={22}
      height={22}
      aria-hidden
    />
    <p className="text-[28px] font-bold leading-none tracking-normal text-stology-deep-navy">
      St<span className="text-stology-electric-blue">o</span>logy
    </p>
  </div>
);

const SidebarNavItem = ({ item }: { item: SidebarItem }) => {
  const activeMatch = useMatch({ path: item.activePattern ?? item.to, end: !item.activePattern });
  const isActive = Boolean(activeMatch);

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex min-h-[39px] w-full items-center rounded-[4.5px] px-3 py-2 text-[14px] font-semibold leading-5 transition',
        isActive ? sidebarNavItemStateClass.active : sidebarNavItemStateClass.default,
      )}
      to={item.to}
    >
      <span className="truncate">{item.label}</span>
    </Link>
  );
};

const SidebarSection = ({ section }: { section: SidebarSection }) => (
  <div className="space-y-4">
    {section.title ? (
      <p className="w-[203px] px-3 text-sidebar-section text-stology-text-light">{section.title}</p>
    ) : null}
    <div className="space-y-2">
      {section.items.map((item) => (
        <SidebarNavItem item={item} key={item.to} />
      ))}
    </div>
  </div>
);

export const Sidebar = ({ sections }: SidebarProps) => (
  <aside className="flex h-[1200px] w-[260px] shrink-0 flex-col border-r border-stology-border-light bg-stology-off-white px-4 py-6">
    <SidebarLogo />
    <nav className="mt-10 flex flex-col gap-8">
      {sections.map((section, index) => (
        <SidebarSection key={section.title ?? index} section={section} />
      ))}
    </nav>
  </aside>
);
