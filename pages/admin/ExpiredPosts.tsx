import React from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCcw, Trash2 } from 'lucide-react';

const ExpiredPosts = () => {
  const { fundingCalls, deleteFundingCall, repostCall } = useApp();
  
  // Get Expired or Archived
  const expiredCalls = fundingCalls.filter(c => c.status === 'Expired' || c.status === 'Archived');

  const handleRepost = (id: string) => {
    const newDate = prompt("Enter new deadline (YYYY-MM-DD):");
    if (newDate) {
      repostCall(id, newDate);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Expired & Archived Posts</h2>
      
      <div className="grid gap-6">
        {expiredCalls.length === 0 ? (
          <p className="text-gray-500">No expired posts found.</p>
        ) : (
          expiredCalls.map(call => (
            <div key={call.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{call.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{call.agency} • <span className="text-red-500">Expired on {call.deadline}</span></p>
                  <p className="mt-2 text-gray-700">{call.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {call.departments.map(d => (
                        <span key={d} className="px-2 py-1 bg-gray-100 text-xs rounded-full">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleRepost(call.id)} 
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <RefreshCcw size={16} className="mr-1" /> Re-post
                  </button>
                  <button 
                    onClick={() => deleteFundingCall(call.id)} 
                    className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpiredPosts;
