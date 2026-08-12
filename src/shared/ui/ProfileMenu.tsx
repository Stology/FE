import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/shared/stores/useAuthStore';
import { Avatar } from './Avatar';

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full outline-none ring-stology-electric-blue focus-visible:ring-2"
        aria-label="프로필 메뉴 열기"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar name="User" size="md" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-[4px] border border-stology-border-light bg-white py-1 shadow-lg focus:outline-none">
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-[13px] text-stology-text-dark hover:bg-stology-off-white font-medium"
            role="menuitem"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};
