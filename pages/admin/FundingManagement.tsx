import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FundingCall } from '../../types';
import { PREDEFINED_DEPARTMENTS, PREDEFINED_AGENCIES } from '../../constants';
import { Plus, X, Edit, Trash } from 'lucide-react';

const FundingManagement = () => {
  const { fundingCalls, addFundingCall, updateFundingCall, deleteFundingCall } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    title: '',
    agency: PREDEFINED_AGENCIES[0],
    customAgency: '',
    deadline: '',
    departments: [] as string[],
    customDepartment: '',
    description: '',
    attachmentUrl: ''
  };

  const [form, setForm] = useState(initialFormState);

  // Filter only active calls for the main list
  const activeCalls = fundingCalls.filter(c => c.status === 'Active');

  const handleOpenModal = (call?: FundingCall) => {
    if (call) {
      setEditingId(call.id);
      
      // Determine if agency/depts are custom
      const isCustomAgency = !PREDEFINED_AGENCIES.includes(call.agency);
      
      const predefinedDepts = call.departments.filter(d => PREDEFINED_DEPARTMENTS.includes(d));
      const customDepts = call.departments.filter(d => !PREDEFINED_DEPARTMENTS.includes(d));

      setForm({
        title: call.title,
        agency: isCustomAgency ? 'Other' : call.agency,
        customAgency: isCustomAgency ? call.agency : '',
        deadline: call.deadline,
        departments: predefinedDepts.length > 0 ? predefinedDepts : [],
        customDepartment: customDepts.length > 0 ? customDepts[0] : '', // Simplified for PoC
        description: call.description,
        attachmentUrl: call.attachmentUrl || ''
      });
      // Add 'Other' to depts if custom exists so UI shows input
      if(customDepts.length > 0) {
         setForm(prev => ({...prev, departments: [...prev.departments, 'Other']}));
      }

    } else {
      setEditingId(null);
      setForm(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleDeptChange = (dept: string) => {
    setForm(prev => {
      if (prev.departments.includes(dept)) {
        return { ...prev, departments: prev.departments.filter(d => d !== dept) };
      }
      return { ...prev, departments: [...prev.departments, dept] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct final data
    const finalAgency = form.agency === 'Other' ? form.customAgency : form.agency;
    
    let finalDepts = form.departments.filter(d => d !== 'Other');
    if (form.departments.includes('Other') && form.customDepartment) {
      finalDepts.push(form.customDepartment);
    }

    if (editingId) {
      const existingCall = fundingCalls.find(c => c.id === editingId);
      if(existingCall) {
          updateFundingCall({
            ...existingCall,
            title: form.title,
            agency: finalAgency,
            deadline: form.deadline,
            departments: finalDepts,
            description: form.description,
            attachmentUrl: form.attachmentUrl
          });
      }
    } else {
      addFundingCall({
        title: form.title,
        agency: finalAgency,
        deadline: form.deadline,
        departments: finalDepts,
        description: form.description,
        attachmentUrl: form.attachmentUrl
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Funding Management</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="mr-2" /> Add Funding Call
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeCalls.length === 0 ? (
               <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No active calls.</td></tr>
            ) : (
                activeCalls.map(call => (
                <tr key={call.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{call.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.agency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.deadline}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                    <button onClick={() => handleOpenModal(call)} className="text-indigo-600 hover:text-indigo-900"><Edit size={18} /></button>
                    <button onClick={() => deleteFundingCall(call.id)} className="text-red-600 hover:text-red-900"><Trash size={18} /></button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl my-8 p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4 pr-8">{editingId ? 'Edit Call' : 'Add New Funding Call'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required type="text" className="w-full border rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              
              {/* Agency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agency</label>
                  <select className="w-full border rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500" value={form.agency} onChange={e => setForm({...form, agency: e.target.value})}>
                    {PREDEFINED_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                {form.agency === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Custom Agency Name</label>
                    <input required type="text" className="w-full border rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500" value={form.customAgency} onChange={e => setForm({...form, customAgency: e.target.value})} />
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline Date</label>
                <input required type="date" className="w-full border rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
              </div>

              {/* Departments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Departments</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded max-h-40 overflow-y-auto">
                  {PREDEFINED_DEPARTMENTS.map(dept => (
                    <label key={dept} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={form.departments.includes(dept)} 
                        onChange={() => handleDeptChange(dept)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{dept}</span>
                    </label>
                  ))}
                </div>
                {form.departments.includes('Other') && (
                  <div className="mt-2">
                    <input 
                      placeholder="Enter custom department"
                      type="text" 
                      className="w-full border rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      value={form.customDepartment} 
                      onChange={e => setForm({...form, customDepartment: e.target.value})} 
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required rows={3} className="w-full border rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Attachment / URL</label>
                <input type="url" className="w-full border rounded p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500" value={form.attachmentUrl} onChange={e => setForm({...form, attachmentUrl: e.target.value})} />
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto">
                  {editingId ? 'Update Call' : 'Post Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundingManagement;