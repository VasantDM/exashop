import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Shield, 
  UserCheck, 
  Briefcase, 
  Lock, 
  Mail, 
  Phone, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Users
} from 'lucide-react';
import { createAdminUser } from '../../services/adminService';

const AdminRegisterUser = () => {
  const navigate = useNavigate();

  const [regForm, setRegForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'customer', // 'customer', 'admin', 'staff'
    is_active: true, // Default active on creation
    is_verified: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setCreatedUser(null);

    if (regForm.password !== regForm.confirm_password) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (regForm.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        username: regForm.username.trim(),
        email: regForm.email.trim(),
        first_name: regForm.first_name.trim(),
        last_name: regForm.last_name.trim(),
        phone_number: regForm.phone_number.trim(),
        password: regForm.password,
        confirm_password: regForm.confirm_password,
        role: regForm.role,
        is_active: regForm.is_active,
        is_verified: regForm.is_verified,
      };

      const res = await createAdminUser(payload);
      setCreatedUser(res.user);
      setSuccessMessage(`User "${res.user?.email || regForm.email}" successfully registered as ${regForm.role.toUpperCase()}!`);
      
      // Reset form fields
      setRegForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        role: 'customer',
        is_active: true,
        is_verified: true,
      });

    } catch (err) {
      const detail = err.response?.data;
      if (detail && typeof detail === 'object') {
        const firstKey = Object.keys(detail)[0];
        const val = detail[firstKey];
        setErrorMessage(Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : 'User registration failed.'));
      } else {
        setErrorMessage('Failed to register user. Please review the details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0 }}>
            Register <span className="gradient-text">New User</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Admin user provisioning: Create Customer, Administrator, or Staff accounts with custom roles.
          </p>
        </div>

        <Link to="/admin/customers" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} /> View All Users
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        
        {/* Registration Form Card */}
        <div className="glass-card" style={{ padding: '2.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Account Registration Form
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                Assign credentials and account role permissions
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div style={{
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <XCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
              <Link to="/admin/customers" style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.82rem', textDecoration: 'underline' }}>
                View in Directory →
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* First & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John"
                  value={regForm.first_name}
                  onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doe"
                  value={regForm.last_name}
                  onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Username & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Username <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="johndoe"
                    required
                    value={regForm.username}
                    onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem 0.7rem 2.3rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <UserIcon size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Email Address <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem 0.7rem 2.3rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Mail size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={regForm.phone_number}
                  onChange={(e) => setRegForm({ ...regForm, phone_number: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem 0.7rem 2.3rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <Phone size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* ACCOUNT ROLE SELECTOR */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.55rem', color: '#ffffff' }}>
                Account Role <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                
                {/* Customer Option */}
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.95rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: regForm.role === 'customer' ? 'rgba(6, 182, 212, 0.16)' : 'var(--bg-surface)',
                  border: regForm.role === 'customer' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)'
                }}>
                  <input
                    type="radio"
                    name="register_account_role"
                    value="customer"
                    checked={regForm.role === 'customer'}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    style={{ display: 'none' }}
                  />
                  <UserCheck size={22} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>Customer</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Storefront Shopper</span>
                </label>

                {/* Admin Option */}
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.95rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: regForm.role === 'admin' ? 'rgba(236, 72, 153, 0.18)' : 'var(--bg-surface)',
                  border: regForm.role === 'admin' ? '2px solid #ec4899' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)'
                }}>
                  <input
                    type="radio"
                    name="register_account_role"
                    value="admin"
                    checked={regForm.role === 'admin'}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    style={{ display: 'none' }}
                  />
                  <Shield size={22} color="#ec4899" />
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>Admin</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Full Store Governance</span>
                </label>

                {/* Staff Option */}
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.95rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: regForm.role === 'staff' ? 'rgba(245, 158, 11, 0.18)' : 'var(--bg-surface)',
                  border: regForm.role === 'staff' ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)'
                }}>
                  <input
                    type="radio"
                    name="register_account_role"
                    value="staff"
                    checked={regForm.role === 'staff'}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    style={{ display: 'none' }}
                  />
                  <Briefcase size={22} color="var(--accent-amber)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>Staff</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Orders & Inventory</span>
                </label>

              </div>
            </div>

            {/* Password & Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem 0.7rem 2.3rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Confirm Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={regForm.confirm_password}
                    onChange={(e) => setRegForm({ ...regForm, confirm_password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem 0.7rem 2.3rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            {/* Status Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={regForm.is_active}
                  onChange={(e) => setRegForm({ ...regForm, is_active: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Active Account (Default)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={regForm.is_verified}
                  onChange={(e) => setRegForm({ ...regForm, is_verified: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Email Verified
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Creating Account...' : `Register & Create ${regForm.role.toUpperCase()} User`}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>

          </form>
        </div>

        {/* Role Architecture Guide Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--accent-primary)" />
              Role Permissions Overview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#ec4899', marginBottom: '0.25rem' }}>
                  <Shield size={16} /> Administrator Role
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  Full administration authority. Access to executive dashboard, products catalog, order fulfillment, customer accounts, user registration with role assignment, and store configuration.
                </div>
              </div>

              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--accent-amber)', marginBottom: '0.25rem' }}>
                  <Briefcase size={16} /> Staff Role
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  Operations & fulfillment privileges. Access to manage catalog items, update order statuses, add tracking numbers, and view customer directories.
                </div>
              </div>

              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                  <UserCheck size={16} /> Customer Role
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  Standard storefront shoppers. Can browse catalog, place orders with Razorpay/COD checkout, manage profile & addresses, and view order tracking timelines.
                </div>
              </div>

            </div>
          </div>

          {/* Direct link card */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.9rem' }}>Users & Accounts Directory</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Browse all registered users and manage active status</div>
            </div>
            <Link to="/admin/customers" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
              Open Directory →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminRegisterUser;
