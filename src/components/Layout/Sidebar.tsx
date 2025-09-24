import React from 'react';
import { Text } from '@magnetic/text';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'home', onItemClick }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: '🏠', active: activeItem === 'home' },
    { id: 'details', label: 'Details', icon: '📊' },
    { id: 'histogram', label: 'Histogram', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '⭐' },
    { id: 'product', label: 'Product', icon: '📄' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'btf', label: 'BTF', icon: '✅' },
    { id: 'borg', label: 'BORG', icon: '⭐' },
    { id: 'vspaces', label: 'vSpaces', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  return (
    <aside className="sidebar" aria-label="Side Navigation">
      {navItems.map((item) => (
        <div key={item.id} className="nav-section">
          <button 
            className={`nav-btn ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
            title={item.label}
          >
            <Text className="nav-icon">{item.icon}</Text>
            <Text className="nav-label">{item.label}</Text>
          </button>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;