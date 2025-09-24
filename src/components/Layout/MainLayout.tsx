import React, { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import CaseHeader from '../Case/CaseHeader';
import EnvironmentPanel from '../Environment/EnvironmentPanel';
import './MainLayout.css';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeNavItem, setActiveNavItem] = useState('home');

  const handleNavClick = (itemId: string) => {
    setActiveNavItem(itemId);
    console.log(`Navigated to: ${itemId}`);
  };

  const handleCaseUpdate = () => {
    console.log('Case update triggered');
  };

  const handleAddNote = () => {
    console.log('Add note triggered');
  };

  return (
    <div className="app-container">
      <TopBar 
        userName="soubera" 
        userRole="TAC Engineer" 
      />
      
      <div className="workspace">
        <Sidebar 
          activeItem={activeNavItem}
          onItemClick={handleNavClick}
        />
        
        <main className="main-area" role="main">
          <CaseHeader 
            onUpdate={handleCaseUpdate}
            onAddNote={handleAddNote}
          />
          
          <EnvironmentPanel />
          
          {children}
        </main>
      </div>
      
      <footer className="page-foot">
        <p>© 2025 Cisco Systems, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;