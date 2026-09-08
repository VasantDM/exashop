import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Save,
  Lock,
  Sparkles,
  ArrowRight,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getAddresses, 
  createAddress, 
  deleteAddress, 
  changePassword 
} from '../services/authService';
import { lookupPincode } from '../utils/pincodeLookup';

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'addresses' | 'security'
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_type: 'shipping',
    full_name: '',
    phone_number: '',
    street_address: '',
    apartment_suite: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [pincodeStatus, setPincodeStatus] = useState({ loading: false, message: '', success: false });

  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [addressStatus, setAddressStatus] = useState({ type: '', message: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Smart Pincode Lookup Handler for Profile Address
  const handlePincodeChange = async (pinValue) => {
    setNewAddress((prev) => ({ ...prev, postal_code: pinValue }));
    const cleanPin = pinValue.trim().replace(/\s+/g, '');

    if (cleanPin.length >= 5) {
      setPincodeStatus({ loading: true, message: 'Detecting City & State...', success: false });
      const result = await lookupPincode(cleanPin);

      if (result.success) {
        setNewAddress((prev) => ({
          ...prev,
          city: result.city || prev.city,
          state: result.state || prev.state,
          country: result.country || prev.country,
        }));
        setPincodeStatus({
          loading: false,
          message: `Auto-filled: ${result.city}, ${result.state}`,
          success: true
        });
      } else {
        setPincodeStatus({
          loading: false,
          message: 'Pincode not auto-detected. You can enter City & State manually.',
          success: false
        });
      }
    } else {
      setPincodeStatus({ loading: false, message: '', success: false });
    }
  };

  // Sync profile form with authenticated user
  useEffect(() => {
    if (user) {
      const resolvedName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '';
      const resolvedPhone = user.phone_number || '';

      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: resolvedPhone,
      });

      setNewAddress((prev) => ({
        ...prev,
        full_name: prev.full_name || resolvedName,
        phone_number: prev.phone_number || resolvedPhone,
      }));
    }
  }, [user]);

  // Load addresses when addresses tab is selected
  useEffect(() => {
    if (isAuthenticated && activeTab === 'addresses') {
      loadAddresses();
    }
  }, [isAuthenticated, activeTab]);

  const loadAddresses = async () => {
    setAddressLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileStatus({ type: '', message: '' });

    try {
      await updateProfile(profileForm);
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setProfileStatus({ type: '', message: '' }), 4000);
    } catch (err) {
      setProfileStatus({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setAddressStatus({ type: '', message: '' });

    try {
      const added = await createAddress(newAddress);
      setAddresses((prev) => [added, ...prev]);
      setAddressStatus({ type: 'success', message: 'New address saved to your address book!' });
      setShowAddAddress(false);
      setNewAddress({
        address_type: 'shipping',
        full_name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
        phone_number: user?.phone_number || '',
        street_address: '',
        apartment_suite: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States',
        is_default: false,
      });
      setPincodeStatus({ loading: false, message: '', success: false });
    } catch (err) {
      setAddressStatus({ type: 'error', message: err.message || 'Failed to create address.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;

    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setAddressStatus({ type: 'success', message: 'Address removed successfully.' });
    } catch (err) {
      setAddressStatus({ type: 'error', message: err.message || 'Failed to delete address.' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(passwordForm);
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswordForm({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      const msg = err.data?.old_password?.[0] || err.data?.confirm_new_password?.[0] || err.message || 'Failed to change password.';
      setPasswordStatus({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading user profile...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Lock size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Authentication Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Please sign in to view and manage your ExaShop customer profile, shipping addresses, and security settings.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              Sign In <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem' }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase() +
                   (user.last_name?.[0] || (user.username?.[1] || '')).toUpperCase();

  return (
    <div>
      {/* Profile Header Banner */}
      <div className="glass-card" style={{ padding: '2rem 2.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: '800',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0
            }}>
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  {user.full_name || user.username}
                </h1>
                <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                  {user.role?.toUpperCase()} ROLE
                </span>
                {user.is_verified && (
                  <span className="badge badge-success">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="var(--accent-orange)" /> {user.email}
                </span>
                {user.phone_number && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} color="var(--accent-primary)" /> {user.phone_number}
                  </span>
                )}
                {user.created_at && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} /> Member since {new Date(user.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/orders" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={16} /> My Orders
            </Link>
            <button onClick={logout} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'overview' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--accent-orange)' : 'var(--text-secondary)',
            border: activeTab === 'overview' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
            fontWeight: activeTab === 'overview' ? '700' : '600',
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem'
          }}
        >
          <User size={16} /> Personal Details
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'addresses' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            color: activeTab === 'addresses' ? 'var(--accent-orange)' : 'var(--text-secondary)',
            border: activeTab === 'addresses' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
            fontWeight: activeTab === 'addresses' ? '700' : '600',
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem'
          }}
        >
          <MapPin size={16} /> Address Book
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'security' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            color: activeTab === 'security' ? 'var(--accent-orange)' : 'var(--text-secondary)',
            border: activeTab === 'security' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
            fontWeight: activeTab === 'security' ? '700' : '600',
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem'
          }}
        >
          <Key size={16} /> Security & Password
        </button>
      </div>

      {/* TAB 1: Personal Details */}
      {activeTab === 'overview' && (
        <div className="profile-overview-grid">
          {/* Edit Profile Form */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Edit Personal Details
            </h3>

            {profileStatus.message && (
              <div style={{
                backgroundColor: profileStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${profileStatus.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                color: profileStatus.type === 'success' ? '#059669' : '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {profileStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="profile-form-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Email Address <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Read-Only)</span>
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#f5f5f4',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone_number}
                  onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Save size={16} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Account & Role Summary Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Role & System Permissions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Shield size={16} color="var(--accent-orange)" />
                  <strong>Current Role</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Assigned as <strong style={{ color: 'var(--accent-orange)' }}>{user.role?.toUpperCase()}</strong>.
                  {user.role === 'admin' ? ' Full administrative read/write access.' : ' Standard customer shopping & checkout access.'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Key size={16} color="var(--accent-emerald)" />
                  <strong>Session & JWT Tokens</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Active JWT session with 60-minute access token and 7-day auto-rotating refresh token.
                </div>
              </div>

              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline" style={{ marginTop: '0.5rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-orange)' }}>
                  <Sparkles size={16} color="var(--accent-orange)" /> Go to Admin Console
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Address Book */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>Customer Address Book</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Manage your saved shipping and billing destinations for quick 1-click checkout.
              </p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
            >
              <Plus size={16} /> {showAddAddress ? 'Cancel' : 'Add New Address'}
            </button>
          </div>

          {addressStatus.message && (
            <div style={{
              backgroundColor: addressStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${addressStatus.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              color: addressStatus.type === 'success' ? '#059669' : '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {addressStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{addressStatus.message}</span>
            </div>
          )}

          {/* Add Address Form Accordion */}
          {showAddAddress && (
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Add Shipping Destination
              </h4>
              <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1. Recipient Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      Full Recipient Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                      placeholder="Alex Taylor"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      Phone Number <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={newAddress.phone_number}
                      onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                      placeholder="+91 98765 43210 or +1 (555) 019-2834"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* 2. Pincode / Postal Code First (Auto-detects City & State) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Pincode / Postal Code <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    {pincodeStatus.message && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        color: pincodeStatus.success ? 'var(--accent-emerald)' : 'var(--accent-orange)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {pincodeStatus.success ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {pincodeStatus.message}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={newAddress.postal_code}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter 6-digit Pincode (e.g. 560001) or 5-digit ZIP"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: pincodeStatus.success ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 3. City & State */}
                <div className="profile-form-2col">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      City / District <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="City or District"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      State / Province <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="State"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* 4. Street Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Street Address (Flat/House No., Building, Street/Road, Area) <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddress.street_address}
                    onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                    placeholder="742 Evergreen Terrace / MG Road"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 5. Apartment & Country */}
                <div className="profile-form-2col">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      Apt / Suite / Landmark <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.apartment_suite}
                      onChange={(e) => setNewAddress({ ...newAddress, apartment_suite: e.target.value })}
                      placeholder="Apt 4B / Near City Mall"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      Country <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      placeholder="India / United States"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <label htmlFor="is_default" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    Set as default shipping address
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={isSaving} className="btn btn-primary">
                    <Save size={16} /> Save Address
                  </button>
                  <button type="button" onClick={() => setShowAddAddress(false)} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address Cards List */}
          {addressLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading saved addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <MapPin size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No addresses saved yet</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Add your primary delivery address to speed up checkout.
              </p>
              <button onClick={() => setShowAddAddress(true)} className="btn btn-primary">
                <Plus size={16} /> Add First Address
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', display: 'block', color: 'var(--text-primary)' }}>{addr.full_name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{addr.phone_number}</span>
                    </div>
                    {addr.is_default && (
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        Default
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {addr.street_address} {addr.apartment_suite ? `, ${addr.apartment_suite}` : ''}<br />
                    {addr.city}, {addr.state} {addr.postal_code}<br />
                    {addr.country}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                      {addr.address_type?.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{ background: 'none', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Security & Password */}
      {activeTab === 'security' && (
        <div style={{ maxWidth: '520px' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Change Account Password
            </h3>

            {passwordStatus.message && (
              <div style={{
                backgroundColor: passwordStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${passwordStatus.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                color: passwordStatus.type === 'success' ? '#059669' : '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {passwordStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm_new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Key size={16} /> {isSaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .profile-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: 2rem;
        }

        .profile-form-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 680px) {
          .profile-overview-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .profile-form-2col {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
