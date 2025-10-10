import React from 'react';

const UserProfile = ({ user, size = 'medium', showName = false, className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-16 h-16 text-base',
    xlarge: 'w-24 h-24 text-xl'
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRandomColor = (firstName, lastName) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    
    const name = (firstName + lastName).toLowerCase();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold ${className}`}>
        <span>?</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full ${getRandomColor(user?.firstName, user?.lastName)} flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden border-2 border-white`}>
        {user?.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={`${user.firstName} ${user.lastName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, show initials
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full">
            {getInitials(user?.firstName, user?.lastName)}
          </span>
        )}
      </div>
      
      {showName && user && (
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          {/* Remove the role line below to hide "PATRON" */}
          {/* <p className="text-xs text-gray-500 capitalize">{user.role || 'user'}</p> */}
        </div>
      )}
    </div>
  );
};

export default UserProfile;