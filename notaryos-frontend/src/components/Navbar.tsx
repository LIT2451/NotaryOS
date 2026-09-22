import React, { useState, useEffect } from 'react';
import { 
  SignOut,
  List,
  X,
  UserCircle,
} from '@phosphor-icons/react';

export type TabType = 'home' | 'dashboard' | 'create' | 'init-number' | 'history' | 'audit' | 'accounts' | 'services' | 'roles' | 'banks' | 'login' | 'register' | 'profile';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  handleLogout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoggedIn: boolean;
  onLoginClick?: () => void;
  userFullName?: string;
  userRole?: string;
};

const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  handleLogout, 
  hasPermission,
  isLoggedIn,
  onLoginClick,
  userFullName,
  userRole
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    ...(hasPermission('Stats.View') ? [{ id: 'dashboard', label: 'Tổng quan' }] : []),
    ...(hasPermission('Invoices.Create') ? [{ id: 'create', label: 'Nhập mới' }] : []),
    ...(userRole === 'Manager' || userRole === 'Admin' ? [{ id: 'init-number', label: 'Khởi tạo SHD' }] : []),
    ...(hasPermission('Invoices.View') ? [{ id: 'history', label: 'Lịch sử' }] : []),
    ...(hasPermission('System.Manage') ? [{ id: 'audit', label: 'Nhật ký' }] : []),
    ...(hasPermission('Users.Manage') ? [{ id: 'accounts', label: 'Tài khoản' }] : []),
    ...(hasPermission('ServiceTypes.Manage') ? [{ id: 'services', label: 'Dịch vụ' }] : []),
    ...(hasPermission('Banks.Manage') ? [{ id: 'banks', label: 'Ngân hàng' }] : []),
    ...(hasPermission('Roles.Manage') ? [{ id: 'roles', label: 'Vai trò' }] : []),
  ];

  return (
    <nav className={`navbar-apple ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <img src="/favicon.png" alt="Logo" style={{ height: '48px' }} />
        </div>

        {/* Desktop Menu */}
        {isLoggedIn && (
          <div className="nav-links-desktop">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id as TabType)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right Side: Actions */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="user-profile-nav">
              <div 
                className={`user-info ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => setActiveTab('profile')}
                style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '6px 12px', borderRadius: '12px' }}
              >
                <UserCircle size={24} weight={activeTab === 'profile' ? "fill" : "regular"} color={activeTab === 'profile' ? "var(--primary)" : "var(--ink-muted)"} />
                <span className="user-name" style={{ color: activeTab === 'profile' ? "var(--primary)" : "inherit" }}>{userFullName}</span>
              </div>
              <button className="btn btn-ghost" onClick={handleLogout} title="Đăng xuất" style={{ padding: '8px' }}>
                <SignOut size={20} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setActiveTab('login')}>
              Đăng nhập
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <List size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {isLoggedIn ? (
            <>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                </button>
              ))}
              <button 
                className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => {
                  setActiveTab('profile');
                  setMobileMenuOpen(false);
                }}
              >
                <span>Hồ sơ cá nhân</span>
              </button>
              <hr style={{ margin: '16px 0', opacity: 0.1 }} />
              <button className="mobile-nav-item" style={{ color: 'var(--error)' }} onClick={handleLogout}>
                <SignOut size={20} />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => {
               setActiveTab('login');
               setMobileMenuOpen(false);
            }}>
              <span>Đăng nhập hệ thống</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
