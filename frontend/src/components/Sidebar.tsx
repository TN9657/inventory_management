import React from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiPackage, 
  FiList, 
  FiShoppingCart, 
  FiFileText, 
  FiPlus 
} from 'react-icons/fi';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'suppliers', label: 'Suppliers', icon: FiUsers },
    { id: 'add-materials', label: 'Add Materials', icon: FiPackage },
    { id: 'material-list', label: 'Material List', icon: FiList },
    { id: 'show-materials', label: 'Show Materials', icon: FiPackage },
    { id: 'material-names', label: 'Material Names', icon: FiPlus },
    { id: 'billing', label: 'Billing', icon: FiShoppingCart },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Inventory Manager</h1>
        <p className="text-sm text-gray-600 mt-1">General Store</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;