import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { materialNameService } from '../services/api';
import { MaterialName } from '../types';

const MaterialNames: React.FC = () => {
  const [materialNames, setMaterialNames] = useState<MaterialName[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchMaterialNames();
  }, []);

  const fetchMaterialNames = async () => {
    try {
      const response = await materialNameService.getAll();
      setMaterialNames(response.data);
    } catch (error) {
      console.error('Error fetching material names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await materialNameService.create(formData);
      fetchMaterialNames();
      resetForm();
    } catch (error) {
      console.error('Error saving material name:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this material name?')) {
      try {
        await materialNameService.delete(id);
        fetchMaterialNames();
      } catch (error) {
        console.error('Error deleting material name:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setShowForm(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Material Names</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Material Name
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Add New Material Name</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter material name"
              />
            </div>
            
            <div className="flex items-end space-x-3">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center">
                <FiSave className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialNames.map((material) => (
            <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="font-medium text-gray-900">{material.name}</span>
              <button
                onClick={() => handleDelete(material.id)}
                className="text-red-600 hover:text-red-900 p-1"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {materialNames.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No material names added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialNames;