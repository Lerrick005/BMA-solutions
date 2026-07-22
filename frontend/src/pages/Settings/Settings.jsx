import { useState } from 'react';
import { 
  User, 
  Building, 
  Bell, 
  Palette, 
  Moon,
  Sun,
  Shield,
  Save,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { settings, updateSetting, toggleDarkMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Nairobi, Kenya',
      ip: '192.168.1.100',
      lastActive: '2026-07-16T15:30:00',
      current: true,
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Nairobi, Kenya',
      ip: '192.168.1.101',
      lastActive: '2026-07-15T10:00:00',
      current: false,
    },
    {
      id: 3,
      device: 'Firefox on MacBook',
      location: 'Nairobi, Kenya',
      ip: '192.168.1.102',
      lastActive: '2026-07-14T08:30:00',
      current: false,
    },
  ]);

  const [profile, setProfile] = useState({
    name: 'Brian Arika',
    email: 'brianarika4@gmail.com',
    phone: '+1 (555) 123-4567',
    position: 'CEO & Founder',
    department: 'Management',
    company: 'BMA Solutions',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    leadUpdates: true,
    systemUpdates: false,
    marketingEmails: true,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      toast.success('✅ Settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    toast.success(settings.darkMode ? '☀️ Light mode enabled!' : '🌙 Dark mode enabled!');
  };

  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success(`📢 ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${!notifications[key] ? 'enabled' : 'disabled'}!`);
  };

  const handleFontSizeChange = (value) => {
    updateSetting('fontSize', value);
    toast.success(`🔤 Font size changed to ${value}!`);
  };

  const handlePrimaryColorChange = (color) => {
    updateSetting('primaryColor', color);
    const colorNames = {
      'brand-green': 'Green',
      'blue-500': 'Blue',
      'purple-500': 'Purple',
      'orange-500': 'Orange',
      'red-500': 'Red',
    };
    toast.success(`🎨 Primary color changed to ${colorNames[color]}!`);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('❌ New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('❌ Password must be at least 6 characters!');
      return;
    }
    
    toast.success('🔒 Password changed successfully!');
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handle2FA = () => {
    if (!twoFAEnabled) {
      toast.success('📱 2FA code sent to your email!');
      setTimeout(() => {
        setTwoFAEnabled(true);
        toast.success('✅ 2FA enabled successfully!');
        setShow2FA(false);
      }, 2000);
    } else {
      setTwoFAEnabled(false);
      toast.info('🔓 2FA disabled!');
    }
  };

  const handleLogoutSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast.success('🔒 Session logged out successfully!');
  };

  const handleLogoutAllOthers = () => {
    setSessions(sessions.filter(s => s.current));
    toast.success('🔒 All other sessions logged out!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const Check = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const colorMap = {
    'brand-green': '#16a34a',
    'blue-500': '#3b82f6',
    'purple-500': '#8b5cf6',
    'orange-500': '#f59e0b',
    'red-500': '#ef4444',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>⚙️</span> Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage your account preferences</p>
        </div>
        <div className="flex gap-3">
          {saved && (
            <span className="text-green-600 flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <Check className="w-4 h-4" />
              Saved successfully!
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50">
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">👤 Profile Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <input type="email" value={profile.email} onChange={(e) => handleProfileChange('email', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
              <input type="tel" value={profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                <input type="text" value={profile.position} onChange={(e) => handleProfileChange('position', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                <input type="text" value={profile.department} onChange={(e) => handleProfileChange('department', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">🏢 Company Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
              <input type="text" value={profile.company} onChange={(e) => handleProfileChange('company', e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <textarea value={profile.address} onChange={(e) => handleProfileChange('address', e.target.value)} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Default Currency</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="USD">💵 USD - US Dollar</option>
                <option value="EUR">💶 EUR - Euro</option>
                <option value="GBP">💷 GBP - British Pound</option>
                <option value="NGN">₦ NGN - Nigerian Naira</option>
                <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                <option value="ZAR">🇿🇦 ZAR - South African Rand</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">🔔 Notifications</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                  <p className="text-xs text-gray-400">Receive notifications via {key.includes('email') ? '📧 email' : '📱 app'}</p>
                </div>
                <button onClick={() => handleNotificationToggle(key)} className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : ''}`}></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">🎨 Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-700">🌙 Dark Mode</p>
                  <p className="text-xs text-gray-400">Toggle dark theme</p>
                </div>
              </div>
              <button 
                onClick={handleToggleDarkMode} 
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-gray-800' : 'bg-primary'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : ''}`}></span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">📏 Font Size</label>
              <div className="grid grid-cols-3 gap-2">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      settings.fontSize === size
                        ? 'border-primary bg-primary/10 text-primary font-medium ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`${
                      size === 'small' ? 'text-xs' : 
                      size === 'medium' ? 'text-base' : 
                      'text-lg'
                    }`}>
                      {size === 'small' && '🔤 Small'}
                      {size === 'medium' && '🔤 Medium'}
                      {size === 'large' && '🔤 Large'}
                    </span>
                    {settings.fontSize === size && (
                      <span className="block text-xs text-primary">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">🎯 Primary Color</label>
              <div className="flex gap-3 flex-wrap">
                {['brand-green', 'blue-500', 'purple-500', 'orange-500', 'red-500'].map(color => (
                  <button
                    key={color}
                    onClick={() => handlePrimaryColorChange(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      settings.primaryColor === color 
                        ? 'border-gray-800 ring-2 ring-offset-2 ring-primary/30 scale-110' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: colorMap[color] }}
                    title={color.replace('-', ' ').toUpperCase()}
                  />
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Current: <span className="font-medium" style={{ color: colorMap[settings.primaryColor] }}>
                  {settings.primaryColor.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-800">🛡️ Security</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowChangePassword(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">🔑 Change Password</p>
                <p className="text-xs text-gray-400">Update your password</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShow2FA(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg group-hover:bg-${twoFAEnabled ? 'green' : 'purple'}-100 transition-colors`}>
                <Smartphone className={`w-5 h-5 ${twoFAEnabled ? 'text-green-500' : 'text-purple-500'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-800">📱 Two-Factor Auth</p>
                <p className="text-xs text-gray-400">{twoFAEnabled ? '✅ Enabled' : 'Enable 2FA for security'}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShowSessions(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <Monitor className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">💻 Sessions</p>
                <p className="text-xs text-gray-400">Manage active sessions</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                🔑 Change Password
              </h2>
              <button onClick={() => setShowChangePassword(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter new password (min 6 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  🔒 Update Password
                </button>
                <button type="button" onClick={() => setShowChangePassword(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {show2FA && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-500" />
                📱 Two-Factor Authentication
              </h2>
              <button onClick={() => setShow2FA(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {twoFAEnabled ? '✅ 2FA is Enabled' : '🔐 Enable 2FA'}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {twoFAEnabled 
                    ? 'Your account is protected with two-factor authentication.' 
                    : 'Add an extra layer of security to your account.'}
                </p>
              </div>

              {!twoFAEnabled && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    A verification code will be sent to your email.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    className="w-full mt-3 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    maxLength="6"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={handle2FA} className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  {twoFAEnabled ? '🔓 Disable 2FA' : '🔐 Enable 2FA'}
                </button>
                <button onClick={() => setShow2FA(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSessions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-orange-500" />
                💻 Active Sessions
              </h2>
              <button onClick={() => setShowSessions(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Monitor className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No active sessions found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className={`p-4 rounded-lg border ${session.current ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-800">{session.device}</p>
                            {session.current && (
                              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">📍 {session.location}</p>
                          <p className="text-xs text-gray-500">🌐 IP: {session.ip}</p>
                          <p className="text-xs text-gray-400 mt-1">🕐 Last active: {formatDate(session.lastActive)}</p>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => handleLogoutSession(session.id)}
                            className="px-3 py-1 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Logout
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                {sessions.filter(s => !s.current).length > 0 && (
                  <button
                    onClick={handleLogoutAllOthers}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🔒 Logout All Others
                  </button>
                )}
                <button onClick={() => setShowSessions(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;