import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX, FiEye } from 'react-icons/fi';
import { materialService, supplierService, materialNameService } from '../services/api';
import { Supplier, MaterialName, Material } from '../types';
import { formatCurrencyWithCommas } from '../utils/currency';

const AddMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materialNames, setMaterialNames] = useState<MaterialName[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    date: new Date().toISOString().split('T')[0],
    tax: 0,
    items: [
      {
        material_name_id: '',
        quantity: 0,
        unit: 'kg',
        cost: 0,
        items: 1
      }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsRes, suppliersRes, materialNamesRes] = await Promise.all([
        materialService.getAll(),
        supplierService.getAll(),
        materialNameService.getAll()
      ]);
      setMaterials(materialsRes.data);
      setSuppliers(suppliersRes.data);
      setMaterialNames(materialNamesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const processedFormData = {
        ...formData,
        items: formData.items.map(item => ({
          ...item,
          quantity: item.unit === 'packets' ? item.quantity * (item.items || 1) : item.quantity
        }))
      };
      await materialService.create(processedFormData);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          material_name_id: '',
          quantity: 0,
          unit: 'kg',
          cost: 0,
          items: 1
        }
      ]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      date: new Date().toISOString().split('T')[0],
      tax: 0,
      items: [
        {
          material_name_id: '',
          quantity: 0,
          unit: 'kg',
          cost: 0,
          items: 1
        }
      ]
    });
    setShowForm(false);
  };

  const viewMaterialDetails = async (id: number) => {
    try {
      const response = await materialService.getById(id);
      setSelectedMaterial(response.data);
    } catch (error) {
      console.error('Error fetching material details:', error);
    }
  };

  const totalCost = formData.items.reduce((sum, item) => sum + item.cost, 0);

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
        <h1 className="text-2xl font-bold text-gray-900">Add Materials</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Material Purchase
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Add Material Purchase</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  required
                  className="input-field"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.company_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Materials</h3>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className={`grid gap-4 p-4 border border-gray-200 rounded-lg ${item.unit === 'packets' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-1 md:grid-cols-6'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                      <select
                        required
                        className="input-field"
                        value={item.material_name_id}
                        onChange={(e) => updateItem(index, 'material_name_id', e.target.value)}
                        autoFocus={index === formData.items.length - 1}
                      >
                        <option value="">Select Material</option>
                        {materialNames.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="input-field"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        key={`unit-${index}-${item.unit}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.unit}
                        onChange={(e) => {
                          console.log('Changing unit from', item.unit, 'to', e.target.value);
                          const newItems = [...formData.items];
                          newItems[index] = { ...newItems[index], unit: e.target.value };
                          if (e.target.value !== 'packets') {
                            newItems[index].items = 1;
                          }
                          setFormData({ ...formData, items: newItems });
                        }}
                      >
                        <option value="kg">KG</option>
                        <option value="liters">Liters</option>
                        <option value="packets">Packets</option>
                        <option value="units">Units</option>
                      </select>
                    </div>
                    
                    {item.unit === 'packets' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                        <input
                          type="number"
                          step="1"
                          required
                          className="input-field"
                          value={item.items || 1}
                          onChange={(e) => updateItem(index, 'items', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="input-field"
                        value={item.cost}
                        onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Per Item Cost</label>
                      <input
                        type="text"
                        className="input-field bg-gray-50"
                        value={
                          item.unit === 'packets' && item.items > 0 && item.quantity > 0
                            ? (item.cost / (item.quantity * item.items)).toFixed(2)
                            : item.quantity > 0
                            ? (item.cost / item.quantity).toFixed(2)
                            : '0.00'
                        }
                        readOnly
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900 p-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button type="button" onClick={addItem} className="btn-secondary flex items-center mt-4">
                <FiPlus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-lg font-semibold">
                Total Cost: <span className="text-green-600">{formatCurrencyWithCommas(totalCost)}</span>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center">
                  <FiSave className="w-4 h-4 mr-2" />
                  Save Purchase
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Material Purchases</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {material.supplier_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(material.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrencyWithCommas(Number(material.total_cost || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewMaterialDetails(material.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Material Purchase Details</h3>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Supplier:</strong> {selectedMaterial.supplier_name}</p>
                <p><strong>Date:</strong> {new Date(selectedMaterial.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Tax:</strong> {Number(selectedMaterial.tax || 0).toFixed(2)}%</p>
                <p><strong>Total Cost:</strong> <span className="text-green-600 font-medium">{formatCurrencyWithCommas(Number(selectedMaterial.total_cost || 0))}</span></p>
              </div>
            </div>
            
            {selectedMaterial.items && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Per Item</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedMaterial.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.material_name}</td>
                        <td className="px-4 py-2 text-sm">{Number(item.quantity || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{item.unit}</td>
                        <td className="px-4 py-2 text-sm text-green-600 font-medium">{formatCurrencyWithCommas(Number(item.cost || 0))}</td>
                        <td className="px-4 py-2 text-sm text-green-600 font-medium">{formatCurrencyWithCommas(Number(item.cost_per_item || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMaterials;