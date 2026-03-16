import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX, FiEye, FiDollarSign, FiUnlock } from 'react-icons/fi';
import { billingService, materialListService } from '../services/api';
import { Billing, MaterialListItem, BillingItem } from '../types';

const BillingPage: React.FC = () => {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [materialList, setMaterialList] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    date: new Date().toISOString().split('T')[0],
    paid_amount: 0,
    items: [
      {
        material_name_id: '',
        selling_price: 0,
        quantity: 0,
        unit: 'kg' as 'kg' | 'liters' | 'packets' | 'units',
        total_amount: 0
      }
    ]
  });

  const isLockMode = localStorage.getItem('lockMode') === 'true';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isLockMode) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Re-request fullscreen after page reload
      const requestFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (error) {
          console.log('Fullscreen request failed');
        }
      };
      requestFullscreen();
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isLockMode]);

  const handleUnlock = async () => {
    localStorage.removeItem('lockMode');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log('Exit fullscreen failed');
    }
    window.location.reload();
  };

  const fetchData = async () => {
    try {
      const [billingsRes, materialListRes] = await Promise.all([
        billingService.getAll(),
        materialListService.getAll()
      ]);
      setBillings(billingsRes.data);
      setMaterialList(materialListRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await billingService.create(formData);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error creating billing:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          material_name_id: '',
          selling_price: 0,
          quantity: 0,
          unit: 'kg',
          total_amount: 0
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

    // Auto-fill selling price and unit when material is selected
    if (field === 'material_name_id') {
      const material = materialList.find(m => m.material_name_id.toString() === value);
      if (material) {
        updatedItems[index].selling_price = Number(material.sell_price);
        updatedItems[index].unit = material.unit;
      }
    }

    // Calculate total amount
    if (field === 'quantity' || field === 'selling_price') {
      updatedItems[index].total_amount = updatedItems[index].quantity * updatedItems[index].selling_price;
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      date: new Date().toISOString().split('T')[0],
      paid_amount: 0,
      items: [
        {
          material_name_id: '',
          selling_price: 0,
          quantity: 0,
          unit: 'kg',
          total_amount: 0
        }
      ]
    });
    setShowForm(false);
  };

  const viewBillingDetails = async (id: number) => {
    try {
      const response = await billingService.getById(id);
      setSelectedBilling(response.data);
    } catch (error) {
      console.error('Error fetching billing details:', error);
    }
  };

  const updatePayment = async (id: number, paidAmount: number) => {
    try {
      await billingService.updatePayment(id, { paid_amount: paidAmount });
      fetchData();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLockMode && (
        <div className="fixed top-2 right-8 z-50">
          <button
            onClick={handleUnlock}
            className="btn-primary flex items-center mb-2"
          >
            <FiUnlock className="w-4 h-4 mr-2 " />
            UNLOCK
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          New Bill
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create New Bill</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Items</h3>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
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
                        {materialList.filter(m => Number(m.total_quantity) > 0).map((material) => (
                          <option key={material.material_name_id} value={material.material_name_id}>
                            {material.material_name} (₹{Number(material.sell_price).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="input-field"
                        value={item.selling_price}
                        onChange={(e) => updateItem(index, 'selling_price', parseFloat(e.target.value) || 0)}
                      />
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
                      <input
                        type="text"
                        className="input-field bg-gray-50"
                        value={item.unit}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <input
                        type="text"
                        className="input-field bg-gray-50"
                        value={`₹${item.total_amount.toFixed(2)}`}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input-field"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="flex items-end">
                <div className="text-lg font-semibold">
                  Total Amount: ₹{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center">
                <FiSave className="w-4 h-4 mr-2" />
                Create Bill
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Bills</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billings.map((billing) => (
                <tr key={billing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {billing.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(billing.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{Number(billing.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{Number(billing.paid_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      billing.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {billing.is_paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewBillingDetails(billing.id)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {!billing.is_paid && (
                      <button
                        onClick={() => updatePayment(billing.id, Number(billing.total_amount))}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FiDollarSign className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBilling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bill Details</h3>
              <button
                onClick={() => setSelectedBilling(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Customer:</strong> {selectedBilling.customer_name}</p>
                <p><strong>Date:</strong> {new Date(selectedBilling.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Total:</strong> ₹{Number(selectedBilling.total_amount).toFixed(2)}</p>
                <p><strong>Paid:</strong> ₹{Number(selectedBilling.paid_amount).toFixed(2)}</p>
              </div>
            </div>
            
            {selectedBilling.items && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedBilling.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.material_name}</td>
                        <td className="px-4 py-2 text-sm">₹{Number(item.selling_price).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{Number(item.quantity).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{item.unit}</td>
                        <td className="px-4 py-2 text-sm">₹{Number(item.total_amount).toFixed(2)}</td>
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

export default BillingPage;