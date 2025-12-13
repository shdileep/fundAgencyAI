import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Shield, BookOpen, Microscope, User } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    navigate('/signup', { state: { role } });
  };

  const roles = [
    { id: UserRole.ADMIN, label: 'Admin', icon: Shield, desc: 'Manage calls & users', color: 'bg-red-100 text-red-600' },
    { id: UserRole.STUDENT, label: 'Student', icon: BookOpen, desc: 'View opportunities', color: 'bg-blue-100 text-blue-600' },
    { id: UserRole.RESEARCHER, label: 'Researcher', icon: Microscope, desc: 'Find grants', color: 'bg-green-100 text-green-600' },
    { id: UserRole.OTHER, label: 'Other', icon: User, desc: 'General access', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Welcome</h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600">Select your role to continue</p>
      </div>

      <div className="max-w-md sm:max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelectRole(role.id)}
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex sm:flex-col items-center text-left sm:text-center border-2 border-transparent hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <div className={`p-3 sm:p-4 rounded-full ${role.color} flex-shrink-0 sm:mb-4 mr-4 sm:mr-0 transition-transform group-hover:scale-110`}>
              <role.icon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{role.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{role.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;