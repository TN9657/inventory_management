import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { materialListService } from '../services/api';
import { MaterialListItem } from '../types';
import { formatCurrencyWithCommas, formatIndianCurrency } from '../utils/currency';

const MaterialList: React.FC = () => {
  const [materialList, setMaterialList] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    fetchMaterialList();
  }, []);

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

  const handleEdit = (item: MaterialListItem) => {
    setEditingId(item.id);
    setEditPrice(item.sell_price.toString());
  };

  const handleSave = async (id: number) => {
    try {
      await materialListService.update(id, { sell_price: parseFloat(editPrice) });
      fetchMaterialList();
      setEditingId(null);
      setEditPrice('');
    } catch (error) {
      console.error('Error updating selling price:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Material List</h1>
        <p className="text-gray-600">Manage inventory pricing and quantities</p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sell Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Selling
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materialList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.material_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrencyWithCommas(Number(item.cost_price))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      formatCurrencyWithCommas(Number(item.sell_price))
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(item.total_quantity).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrencyWithCommas(Number(item.total_cost_price))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrencyWithCommas(Number(item.total_selling_price))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${Number(item.total_profit_price) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrencyWithCommas(Number(item.total_profit_price))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === item.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(item.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiSave className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {materialList.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No materials in inventory yet.</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Investment</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatIndianCurrency(materialList.reduce((sum, item) => sum + Number(item.total_cost_price), 0))}
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Potential Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatIndianCurrency(materialList.reduce((sum, item) => sum + Number(item.total_selling_price), 0))}
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expected Profit</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatIndianCurrency(materialList.reduce((sum, item) => sum + Number(item.total_profit_price), 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaterialList;