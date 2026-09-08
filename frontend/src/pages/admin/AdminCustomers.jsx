import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  UserCheck,
  UserX,
  UserPlus,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  X,
  Briefcase,
  Edit3,
  PowerOff,
  UserMinus,
  Filter
} from 'lucide-react';
import { 
  getAdminCustomers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  toggleAdminCustomerActive 
} from '../../services/adminService';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, customers: 0, admins: 0, staff: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all'); // 'all', 'customer', 'admin', 'staff'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [toast, setToast] = useState(null);

  // Register Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regForm, setRegForm] = useState({
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
  const [regError, setRegError] = useState('');

  // Edit Role Modal State
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('customer');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedRole && selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

      const data = await getAdminCustomers(params);
      if (data && data.results) {
        setCustomers(data.results);
        if (data.stats) {
          setStats(data.stats);
        }
      } else if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load accounts directory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [selectedRole, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleToggleActive = async (cust) => {
    try {
      const res = await toggleAdminCustomerActive(cust.id);
      showToast(res.message);
      loadCustomers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to update account status', 'error');
    }
  };

  // Soft Delete handler: Marks as inactive instead of permanent SQL delete
  const handleSoftDeleteUser = async (cust) => {
    if (!window.confirm(`Deactivate account "${cust.email}"?\n\nNOTE: The account will be marked as INACTIVE (soft-deleted). It will NOT be deleted permanently from the database.`)) {
      return;
    }
    try {
      const res = await deleteAdminUser(cust.id);
      showToast(res.message || 'User account marked as inactive.');
      loadCustomers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to deactivate account.', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (regForm.password !== regForm.confirm_password) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regForm.password.length < 6) {
      setRegError('Password must be at least 6 characters long.');
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
      showToast(res.message || `Account created with role ${regForm.role.toUpperCase()}!`);
      setIsRegisterOpen(false);
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
      loadCustomers();
    } catch (err) {
      const detail = err.response?.data;
      if (detail && typeof detail === 'object') {
        const firstKey = Object.keys(detail)[0];
        const val = detail[firstKey];
        setRegError(Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : 'Registration failed.'));
      } else {
        setRegError('Registration failed. Please check field details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    setIsUpdatingRole(true);
    try {
      const res = await updateAdminUser(editUser.id, { role: editRole });
      showToast(res.message || `User role updated to ${editRole.toUpperCase()}!`);
      setEditUser(null);
      loadCustomers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to update user role', 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          backgroundColor: toast.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
          color: '#ffffff',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header with Title & Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0 }}>
            Users & <span className="gradient-text">Account Management</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Directory of registered shoppers, administrators, and staff with soft deletion & role governance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => setIsRegisterOpen(true)} 
            className="btn btn-primary" 
            style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={16} /> Register New User
          </button>
          <button onClick={loadCustomers} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.65rem 0.95rem' }}>
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Role & Status Stats Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                All Accounts
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {stats.total}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}>
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                {stats.active ?? stats.total}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)'
            }}>
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Inactive / Soft-Deleted
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-rose)', marginTop: '0.25rem' }}>
                {stats.inactive ?? 0}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-rose)'
            }}>
              <UserX size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Customers
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '0.25rem' }}>
                {stats.customers}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}>
              <UserIcon size={22} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admins / Staff
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '0.25rem' }}>
                {(stats.admins || 0) + (stats.staff || 0)}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}>
              <Shield size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Checking & Status Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Role Filter Tabs (Default: All) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Role:
            </span>
            {[
              { key: 'all', label: 'All Accounts', count: stats.total },
              { key: 'customer', label: 'Customers', count: stats.customers },
              { key: 'admin', label: 'Admins', count: stats.admins },
              { key: 'staff', label: 'Staff', count: stats.staff },
            ].map((tab) => {
              const isActive = selectedRole === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedRole(tab.key)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-orange)' : '#ffffff',
                    border: isActive ? '1px solid var(--accent-orange)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: isActive ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.06)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)'
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Tabs & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ffffff', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {[
                { key: 'all', label: 'All Status' },
                { key: 'active', label: 'Active Only' },
                { key: 'inactive', label: 'Inactive Only' },
              ].map((st) => {
                const isSelected = selectedStatus === st.key;
                return (
                  <button
                    key={st.key}
                    onClick={() => setSelectedStatus(st.key)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? '700' : '600',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      backgroundColor: isSelected ? 'var(--accent-orange)' : 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.8rem 0.5rem 2.3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </form>
          </div>

        </div>
      </div>

      {/* Accounts Directory Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            Loading accounts directory...
          </div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No accounts found matching the current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>User Profile</th>
                  <th style={{ padding: '0.75rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem' }}>Account Role</th>
                  <th style={{ padding: '0.75rem' }}>Total Orders</th>
                  <th style={{ padding: '0.75rem' }}>Total Spent</th>
                  <th style={{ padding: '0.75rem' }}>Joined Date</th>
                  <th style={{ padding: '0.75rem' }}>Account State</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const isRoleAdmin = cust.role === 'admin';
                  const isRoleStaff = cust.role === 'staff';

                  let roleBadgeBg = 'rgba(245, 158, 11, 0.12)';
                  let roleBadgeBorder = 'rgba(245, 158, 11, 0.35)';
                  let roleBadgeColor = 'var(--accent-orange)';
                  let RoleIcon = UserIcon;

                  if (isRoleAdmin) {
                    roleBadgeBg = 'rgba(234, 88, 12, 0.12)';
                    roleBadgeBorder = 'rgba(234, 88, 12, 0.35)';
                    roleBadgeColor = 'var(--accent-orange)';
                    RoleIcon = Shield;
                  } else if (isRoleStaff) {
                    roleBadgeBg = 'rgba(245, 158, 11, 0.15)';
                    roleBadgeBorder = 'rgba(245, 158, 11, 0.4)';
                    roleBadgeColor = 'var(--accent-primary)';
                    RoleIcon = Briefcase;
                  }

                  return (
                    <tr 
                      key={cust.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        opacity: cust.is_active ? 1 : 0.65,
                        backgroundColor: cust.is_active ? 'transparent' : 'rgba(244, 63, 94, 0.03)'
                      }}
                    >
                      {/* User Profile */}
                      <td style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: !cust.is_active ? 'var(--text-muted)' : (isRoleAdmin ? 'var(--accent-gradient)' : isRoleStaff ? 'var(--accent-gradient)' : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          boxShadow: cust.is_active ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
                        }}>
                          {cust.first_name ? cust.first_name[0].toUpperCase() : (cust.username ? cust.username[0].toUpperCase() : 'U')}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {cust.full_name || cust.username}
                            {!cust.is_active && (
                              <span style={{ fontSize: '0.68rem', color: '#fb7185', marginLeft: '0.5rem', fontWeight: '600' }}>
                                (Inactive)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{cust.username}</div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{cust.email}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cust.phone_number || 'No phone'}</div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: roleBadgeBg,
                          border: `1px solid ${roleBadgeBorder}`,
                          color: roleBadgeColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          <RoleIcon size={12} />
                          {cust.role || 'customer'}
                        </span>
                      </td>

                      {/* Orders */}
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {cust.total_orders || 0} orders
                      </td>

                      {/* Spent */}
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                        ₹{cust.total_spent || '0.00'}
                      </td>

                      {/* Joined Date */}
                      <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {cust.joined_date || 'Recent'}
                      </td>

                      {/* State Badge */}
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span className={`badge ${cust.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                          {cust.is_active ? 'Active' : 'Inactive (Soft-Deleted)'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          
                          {/* Role edit button */}
                          <button
                            onClick={() => {
                              setEditUser(cust);
                              setEditRole(cust.role || 'customer');
                            }}
                            className="btn btn-outline"
                            style={{
                              padding: '0.3rem 0.55rem',
                              fontSize: '0.75rem',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-secondary)'
                            }}
                            title="Change Account Role"
                          >
                            <Edit3 size={12} />
                          </button>

                          {/* Toggle Active / Inactive (Soft Delete) */}
                          <button
                            onClick={() => handleToggleActive(cust)}
                            className="btn btn-outline"
                            style={{
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.75rem',
                              borderColor: cust.is_active ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                              color: cust.is_active ? '#fb7185' : 'var(--accent-emerald)'
                            }}
                            title={cust.is_active ? 'Deactivate (Set Inactive)' : 'Reactivate (Set Active)'}
                          >
                            {cust.is_active ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <UserX size={12} /> Deactivate
                              </span>
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <UserCheck size={12} /> Activate
                              </span>
                            )}
                          </button>

                          {/* Soft Delete / Remove button */}
                          {!cust.is_superuser && cust.is_active && (
                            <button
                              onClick={() => handleSoftDeleteUser(cust)}
                              className="btn btn-outline"
                              style={{
                                padding: '0.3rem 0.55rem',
                                fontSize: '0.75rem',
                                borderColor: 'rgba(244, 63, 94, 0.3)',
                                color: '#fb7185'
                              }}
                              title="Soft Delete (Set Inactive, no permanent DB loss)"
                            >
                              <UserMinus size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= REGISTER NEW USER MODAL (WITH ROLE SELECTOR) ================= */}
      {isRegisterOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <div className="glass-card" style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
                }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    Register New User
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Admin Panel Account Creation with Role Assignment
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsRegisterOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {regError && (
              <div style={{
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <XCircle size={16} />
                <span>{regError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* First & Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alexander"
                    value={regForm.first_name}
                    onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wright"
                    value={regForm.last_name}
                    onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Username & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Username <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="username"
                      required
                      value={regForm.username}
                      onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                    <UserIcon size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Email Address <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                    <Mail size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
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
                      padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* ACCOUNT ROLE SELECTOR (Admin Exclusive Feature) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Assign Account Role <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  
                  {/* Customer Option */}
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: regForm.role === 'customer' ? 'rgba(245, 158, 11, 0.15)' : '#ffffff',
                    border: regForm.role === 'customer' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)'
                  }}>
                    <input
                      type="radio"
                      name="admin_role"
                      value="customer"
                      checked={regForm.role === 'customer'}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      style={{ display: 'none' }}
                    />
                    <UserIcon size={20} color="var(--accent-orange)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>Customer</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Storefront Shopper</span>
                  </label>

                  {/* Admin Option */}
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: regForm.role === 'admin' ? 'rgba(234, 88, 12, 0.15)' : '#ffffff',
                    border: regForm.role === 'admin' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)'
                  }}>
                    <input
                      type="radio"
                      name="admin_role"
                      value="admin"
                      checked={regForm.role === 'admin'}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      style={{ display: 'none' }}
                    />
                    <Shield size={20} color="var(--accent-orange)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>Admin</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Full Store Control</span>
                  </label>

                  {/* Staff Option */}
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: regForm.role === 'staff' ? 'rgba(245, 158, 11, 0.15)' : '#ffffff',
                    border: regForm.role === 'staff' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)'
                  }}>
                    <input
                      type="radio"
                      name="admin_role"
                      value="staff"
                      checked={regForm.role === 'staff'}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      style={{ display: 'none' }}
                    />
                    <Briefcase size={20} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>Staff</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Operations & Orders</span>
                  </label>

                </div>
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Set Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
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
                        padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                    <Lock size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
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
                        padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                    <Lock size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                    style={{ accentColor: 'var(--accent-orange)' }}
                  />
                  Active Immediately (default)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={regForm.is_verified}
                    onChange={(e) => setRegForm({ ...regForm, is_verified: e.target.checked })}
                    style={{ accentColor: 'var(--accent-orange)' }}
                  />
                  Verified Account
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create User Account'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT USER ROLE MODAL ================= */}
      {editUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Update User Role
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  User: {editUser.email}
                </div>
              </div>
              <button 
                onClick={() => setEditUser(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateRoleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { value: 'customer', label: 'Customer', desc: 'Standard shopping privileges', icon: UserIcon, color: 'var(--accent-orange)' },
                  { value: 'admin', label: 'Admin', desc: 'Full administration & settings access', icon: Shield, color: 'var(--accent-orange)' },
                  { value: 'staff', label: 'Staff', desc: 'Order and inventory management', icon: Briefcase, color: 'var(--accent-primary)' },
                ].map((r) => {
                  const Icon = r.icon;
                  const isSelected = editRole === r.value;
                  return (
                    <label
                      key={r.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                        border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <input
                        type="radio"
                        name="edit_role_select"
                        value={r.value}
                        checked={isSelected}
                        onChange={(e) => setEditRole(e.target.value)}
                        style={{ accentColor: 'var(--accent-orange)' }}
                      />
                      <Icon size={18} color={r.color} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{r.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{r.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRole}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', opacity: isUpdatingRole ? 0.7 : 1 }}
                >
                  {isUpdatingRole ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCustomers;
