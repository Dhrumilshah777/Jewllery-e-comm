import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-user-circle text-3xl"></i>
            User Profile
          </h1>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-800 flex items-center gap-3">
                <i className="fas fa-user text-indigo-500"></i>
                {user.name}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-800 flex items-center gap-3">
                <i className="fas fa-envelope text-indigo-500"></i>
                {user.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-800 flex items-center gap-3">
                <i className="fas fa-phone text-indigo-500"></i>
                {user.phone || 'Not provided'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account Role</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-800 flex items-center gap-3 capitalize">
                <i className={`fas ${user.role === 'admin' ? 'fa-shield-alt' : 'fa-user-tag'} text-indigo-500`}></i>
                {user.role}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
