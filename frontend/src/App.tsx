import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import AddMaterials from './pages/AddMaterials';
import MaterialNames from './pages/MaterialNames';
import MaterialList from './pages/MaterialList';
import ShowMaterials from './pages/ShowMaterials';
import Billing from './pages/Billing';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lockMode, setLockMode] = useState(localStorage.getItem('lockMode') === 'true');

  useEffect(() => {
    const handleStorageChange = () => {
      setLockMode(localStorage.getItem('lockMode') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (lockMode) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50">
        <main className="h-full w-full p-8 overflow-y-auto">
          <Billing />
        </main>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'suppliers':
        return <Suppliers />;
      case 'add-materials':
        return <AddMaterials />;
      case 'material-names':
        return <MaterialNames />;
      case 'material-list':
        return <MaterialList />;
      case 'show-materials':
        return <ShowMaterials />;
      case 'billing':
        return <Billing />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;