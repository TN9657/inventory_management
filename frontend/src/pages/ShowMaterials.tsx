import React, { useState, useEffect } from 'react';
import { FiPackage, FiAlertTriangle, FiTrendingUp, FiSearch } from 'react-icons/fi';
import { materialListService } from '../services/api';
import { MaterialListItem } from '../types';

const ShowMaterials: React.FC = () => {
  const [materialList, setMaterialList] = useState<MaterialListItem[]>([]);
  const [filteredList, setFilteredList] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low-stock' | 'profitable'>('all');

  useEffect(() => {
    fetchMaterialList();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materialList, searchTerm, filterType]);

  const fetchMaterialList = async () => {
    try {
      const response = await materialListService.getAll();
      setMaterialList(response.data);
    } catch (error) {
      console.error('Error fetching material list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materialList;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    switch (filterType) {
      case 'low-stock':
        filtered = filtered.filter(item => Number(item.total_quantity) < 10);
        break;
      case 'profitable':
        filtered = filtered.filter(item => Number(item.total_profit_price) > 0);
        break;
      default:
        break;
    }

    setFilteredList(filtered);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (quantity < 10) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    if (quantity < 50) return { status: 'Medium Stock', color: 'text-blue-600 bg-blue-100' };
    return { status: 'Good Stock', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const lowStockItems = materialList.filter(item => Number(item.total_quantity) < 10);
  const outOfStockItems = materialList.filter(item => Number(item.total_quantity) === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Show Materials</h1>
        <p className="text-gray-600">Current inventory status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{materialList.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{materialList.reduce((sum, item) => sum + Number(item.total_selling_price), 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search materials..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterType('low-stock')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'low-stock' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilterType('profitable')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'profitable' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Profitable
            </button>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item) => {
          const stockStatus = getStockStatus(Number(item.total_quantity));
          const profitMargin = Number(item.total_cost_price) > 0 
            ? ((Number(item.total_profit_price) / Number(item.total_cost_price)) * 100).toFixed(1)
            : '0';

          return (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.material_name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                  {stockStatus.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{Number(item.total_quantity).toFixed(2)} {item.unit}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Price:</span>
                  <span className="font-medium">₹{Number(item.cost_price).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Sell Price:</span>
                  <span className="font-medium">₹{Number(item.sell_price).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium">₹{Number(item.total_selling_price).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Profit:</span>
                  <span className={`font-medium ${Number(item.total_profit_price) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Number(item.total_profit_price).toFixed(2)} ({profitMargin}%)
                  </span>
                </div>
              </div>

              {/* Progress bar for stock level */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Stock Level</span>
                  <span>{Number(item.total_quantity).toFixed(0)} {item.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      Number(item.total_quantity) === 0 ? 'bg-red-500' :
                      Number(item.total_quantity) < 10 ? 'bg-yellow-500' :
                      Number(item.total_quantity) < 50 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((Number(item.total_quantity) / 100) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No materials found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ShowMaterials;