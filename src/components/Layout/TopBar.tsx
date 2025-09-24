import React from 'react';
import { Text } from '@magnetic/text';
import './TopBar.css';

interface TopBarProps {
  userName?: string;
  userRole?: string;
}

const TopBar: React.FC<TopBarProps> = ({ 
  userName = 'soubera', 
  userRole = 'TAC Engineer' 
}) => {
  return (
    <header className="topbar" role="banner">
      <div className="cisco-logo">
        <svg viewBox="0 0 64 40" fill="#005073">
          <path d="M8 12h4v16H8zm8-4h4v24h-4zm8 8h4v8h-4zm8-8h4v24h-4zm8 4h4v16h-4zm8-8h4v32h-4z"/>
        </svg>
        <Text>cisco</Text>
      </div>
      
      <Text className="product-name">Quicker CSONE</Text>
      
      <div className="right-section">
        <Text className="confidential-banner">CISCO HIGHLY CONFIDENTIAL</Text>
        
        <div className="search-area">
          <input 
            type="text" 
            className="search-input" 
            placeholder="🔍 Open SR, Bug, RMA, BEMS" 
          />
        </div>
        
        <div className="top-actions">
          <div className="icon-btn" title="Notifications">🔔</div>
          <div className="icon-btn" title="Settings">⚙️</div>
          <div className="icon-btn" title="Tasks">📋</div>
          <div className="icon-btn" title="Refresh">🔄</div>
          
          <div className="user-info">
            <Text>👤 {userName}</Text>
            <Text>{userRole} ▼</Text>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;