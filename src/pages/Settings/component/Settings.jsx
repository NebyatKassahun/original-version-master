import React, { useState, useRef } from 'react';

const Settings = () => {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@storify.com',
    password: '',
    photo: null,
    photoURL: null
  });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Use FileReader to display the uploaded photo in the browser
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({
          ...profile,
          photo: file,
          photoURL: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEditMode(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handlePhotoClick = () => {
    if (editMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = () => {
    if (editMode) {
      setProfile({ ...profile, photo: null, photoURL: null });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
        {message && (
          <div className="mb-4 text-green-600 font-medium">{message}</div>
        )}
        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div className="flex items-center space-x-4">
            <div
              className={`relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 ${editMode ? 'border-blue-500' : 'border-gray-300'}`}
              onClick={handlePhotoClick}
              title={editMode ? "Click to change photo" : ""}
              style={{ transition: 'border 0.2s' }}
            >
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-3xl text-gray-400">
                  {profile.name ? profile.name[0] : 'U'}
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
                disabled={!editMode}
              />
              {editMode && profile.photoURL && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemovePhoto(); }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                  title="Remove photo"
                  tabIndex={-1}
                >
                  ×
                </button>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {editMode ? "Click photo to upload/change" : "Profile photo"}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!editMode}
              className="border px-3 py-2 rounded-lg w-full"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!editMode}
              className="border px-3 py-2 rounded-lg w-full"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={profile.password}
                onChange={handleChange}
                disabled={!editMode}
                className="border px-3 py-2 rounded-lg w-full pr-10"
                placeholder={editMode ? "Enter new password" : "********"}
                autoComplete="new-password"
              />
              {editMode && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setProfile({ ...profile, password: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;