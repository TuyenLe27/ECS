import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Settings, Users, Briefcase, Building2,
  CreditCard, PhoneCall, BarChart3, Package, LogOut, Activity
} from 'lucide-react';

const navItems = [
  { section: 'Tổng Quan', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'Quản Lý', items: [
    { to: '/services', label: 'Dịch Vụ', icon: Settings },
    { to: '/departments', label: 'Phòng Ban', icon: Building2 },
    { to: '/employees', label: 'Nhân Viên', icon: Users },
  ]},
  { section: 'Khách Hàng', items: [
    { to: '/clients', label: 'Khách Hàng', icon: Briefcase },
    { to: '/client-services', label: 'Đăng Ký Dịch Vụ', icon: Activity },
    { to: '/client-products', label: 'Sản Phẩm Client', icon: Package },
  ]},
  { section: 'Tài Chính', items: [
    { to: '/payments', label: 'Thanh Toán', icon: CreditCard },
    { to: '/call-logs', label: 'Call Logs', icon: PhoneCall },
    { to: '/reports', label: 'Báo Cáo', icon: BarChart3 },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⚡ ECS</h1>
        <p>Excell-On Consulting Services</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-title">{section}</div>
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name}
            </div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-icon btn-secondary" title="Đăng xuất">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
