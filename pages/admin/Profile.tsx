import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const AdminProfile = () => {
  const { currentUser, updateUserProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    designation: currentUser?.designation || '',
    mobile: currentUser?.mobile || '',
    location: currentUser?.location || ''
  });

  if (!currentUser) return null;

  const handleSave = () => {
    updateUserProfile({ ...currentUser, ...formData });
    setIsEditing(false);
    alert('Profile Updated Successfully');
  };

  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Profile</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Username</label>
            <p className="mt-1 text-lg text-gray-900">{currentUser.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-lg text-gray-900">{currentUser.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Password</label>
          <p className="mt-1 text-lg text-gray-900 tracking-widest">••••••••</p>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Designation</label>
            {isEditing ? (
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.designation}
                onChange={e => setFormData({...formData, designation: e.target.value})}
              />
            ) : (
              <p className="mt-1 text-gray-900">{formData.designation || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            {isEditing ? (
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
              />
            ) : (
              <p className="mt-1 text-gray-900">{formData.mobile || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Location</label>
            {isEditing ? (
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            ) : (
              <p className="mt-1 text-gray-900">{formData.location || 'Not set'}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded-md text-gray-700">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save Changes</button>
            </>
          ) : (
             <>
              <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md">Delete Account</button>
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Edit Profile</button>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
