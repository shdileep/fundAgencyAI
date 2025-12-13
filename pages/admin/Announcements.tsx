import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Clock, Edit2, Trash2, X, Check } from 'lucide-react';

const Announcements = () => {
  const { addAnnouncement, updateAnnouncement, deleteAnnouncement, announcements } = useApp();
  const [message, setMessage] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addAnnouncement(message);
      setMessage('');
      alert('Announcement sent to all users.');
    }
  };

  const startEdit = (ann: { id: string, message: string }) => {
    setEditingId(ann.id);
    setEditMessage(ann.message);
  };

  const saveEdit = () => {
    if (editingId && editMessage.trim()) {
      updateAnnouncement(editingId, editMessage);
      setEditingId(null);
      setEditMessage('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMessage('');
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Announcements</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Broadcast a new message</h3>
        <form onSubmit={handlePost}>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            placeholder="Type your announcement here... All users will be notified."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-indigo-700"
            >
              <Send size={18} className="mr-2" /> Post Announcement
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">History</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {announcements.length === 0 ? (
            <li className="p-6 text-gray-500 text-center">No announcements posted yet.</li>
          ) : (
            announcements.map(ann => (
              <li key={ann.id} className="p-6">
                {editingId === ann.id ? (
                  <div className="flex flex-col gap-3">
                    <textarea
                      className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                       <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded"><Check size={20}/></button>
                       <button onClick={cancelEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded"><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-900">{ann.message}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Clock size={14} className="mr-1" />
                            {new Date(ann.createdAt).toLocaleDateString()} {new Date(ann.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                    <div className="flex space-x-1 ml-4">
                        <button onClick={() => startEdit(ann)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                            <Edit2 size={18} />
                        </button>
                        <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Announcements;