import React, { useState, useEffect } from 'react';
import api, { getUsers, updateUser, resetPassword, deleteUser } from '../services/api';
import { 
  Users, 
  UserGear, 
  Key, 
  Trash, 
  PencilSimple, 
  Check, 
  X,
  IdentificationCard,
  ShieldCheck,
  User,
  UserPlus,
  Plus,
  Eye,
  EyeSlash,
  Lock,
  LockOpen
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { showSuccess, showError } from '../utils/toast';

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [targetUser, setTargetUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  const [addForm, setAddForm] = useState({ username: '', password: '', fullName: '', roleId: 2 });
  const [editForm, setEditForm] = useState({ fullName: '', roleId: 2 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        getUsers(),
        api.get('/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách người dùng:', err);
      showError('Lỗi', 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setAddForm({ username: '', password: '', fullName: '', roleId: 2 });
    setShowAddPassword(false);
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!addForm.username || !addForm.password || !addForm.fullName) {
      showError('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường bắt buộc.');
      return;
    }
    try {
      await api.post('/auth/register', addForm);
      showSuccess('Thành công', `Đã tạo tài khoản @${addForm.username} thành công.`);
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể tạo tài khoản.');
      showError('Lỗi', msg);
    }
  };

  const openEditModal = (user: any) => {
    setTargetUser(user);
    setEditForm({ fullName: user.fullName, roleId: user.roleId });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!targetUser) return;
    try {
      await updateUser(targetUser.id, editForm);
      showSuccess('Thành công', 'Đã cập nhật thông tin người dùng.');
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể cập nhật.');
      showError('Lỗi', msg);
    }
  };

  const openResetModal = (user: any) => {
    setTargetUser(user);
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!targetUser) return;
    try {
      await resetPassword(targetUser.id);
      showSuccess('Thành công', `Mật khẩu của @${targetUser.username} đã được reset về 123456.`);
      setShowResetModal(false);
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể reset mật khẩu.');
      showError('Lỗi', msg);
    }
  };

  const openDeleteModal = (user: any) => {
    setTargetUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!targetUser) return;
    try {
      await deleteUser(targetUser.id);
      showSuccess('Thành công', 'Đã xóa tài khoản.');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể xóa tài khoản.');
      showError('Lỗi', msg);
      setShowDeleteModal(false);
    }
  };
  
  const handleToggleLock = async (user: any) => {
    try {
      await api.put(`/users/${user.id}/toggle-lock`);
      showSuccess('Thành công', `Đã ${user.isLocked ? 'mở khóa' : 'khóa'} tài khoản @${user.username}.`);
      fetchUsers();
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Không thể thay đổi trạng thái khóa.');
      showError('Lỗi', msg);
    }
  };

  return (
    <div className="hist-root">
      <div className="page-title-block" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Quản lý tài khoản
          </h1>
          <p className="text-muted">
            Quản lý danh sách nhân viên, phân quyền và bảo mật tài khoản.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={20} weight="bold" />
          <span>Thêm nhân viên mới</span>
        </button>
      </div>

      {loading ? (
        <div className="hist-empty">
          <div className="loading-spinner" />
          <p>Đang tải danh sách tài khoản...</p>
        </div>
      ) : (
        <div className="hist-table-wrap" style={{ marginTop: '24px' }}>
          <div className="table-responsive">
            <table className="hist-table">
              <thead>
                <tr>
                  <th style={{ width: '250px' }}>Thông tin nhân viên</th>
                  <th style={{ width: '180px' }}>Vai trò / Quyền hạn</th>
                  <th>Ngày gia nhập</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Thao tác bảo mật</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: user.roleName === 'Admin' ? 'var(--primary-soft)' : 'var(--surface-secondary)',
                          color: user.roleName === 'Admin' ? 'var(--primary)' : 'var(--ink-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '16px',
                          border: '1px solid var(--border-soft)'
                        }}>
                          {user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{user.fullName || 'Chưa đặt tên'}</span>
                            {user.isLocked && (
                              <span className="badge danger" style={{ fontSize: '10px', padding: '2px 6px' }}>Bị khóa</span>
                            )}
                          </div>
                          <span className="text-muted" style={{ fontSize: '12px' }}>@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${user.roleName === 'Admin' ? 'create' : 'success'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                        {user.roleName === 'Admin' ? <ShieldCheck size={14} weight="bold" /> : <User size={14} weight="bold" />}
                        {user.roleName}
                      </div>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '14px' }}>
                        {new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="hist-actions">
                        <button className="hist-btn hist-btn-edit" onClick={() => openEditModal(user)} title="Sửa thông tin">
                          <PencilSimple size={18} />
                        </button>
                        <button 
                          className="hist-btn" 
                          style={{ 
                            background: user.isLocked ? 'var(--success-soft)' : 'var(--surface-secondary)', 
                            color: user.isLocked ? 'var(--success)' : 'var(--ink-muted)' 
                          }} 
                          onClick={() => handleToggleLock(user)} 
                          title={user.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          {user.isLocked ? <LockOpen size={18} /> : <Lock size={18} />}
                        </button>
                        <button className="hist-btn" style={{ background: 'var(--surface-secondary)', color: 'var(--warning)' }} onClick={() => openResetModal(user)} title="Đặt lại mật khẩu">
                          <Key size={18} />
                        </button>
                        <button className="hist-btn hist-btn-del" onClick={() => openDeleteModal(user)} title="Xóa tài khoản">
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap info">
              <UserPlus size={32} weight="duotone" />
            </div>
            <h3>Thêm nhân viên mới</h3>
            <p className="text-muted">Tạo tài khoản truy cập hệ thống cho nhân viên mới</p>
            
            <div className="modal-form-fields" style={{ marginTop: '32px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="field-group">
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên đăng nhập</label>
                  <input 
                    className="underline-input" 
                    style={{ width: '100%', padding: '10px 0', fontSize: '16px' }}
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="Ví dụ: nguyenvan_a"
                    autoFocus
                  />
                </div>
                <div className="field-group">
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showAddPassword ? "text" : "password"}
                      className="underline-input" 
                      style={{ width: '100%', padding: '10px 32px 10px 0', fontSize: '16px' }}
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Nhập ít nhất 6 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--ink-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showAddPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="field-group" style={{ marginTop: '24px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Họ và tên</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '10px 0', fontSize: '16px' }}
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="Nhập đầy đủ tên nhân viên"
                />
              </div>

              <div className="field-group" style={{ marginTop: '24px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vai trò hệ thống</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {roles.map(r => {
                    const isSel = addForm.roleId === r.id;
                    return (
                      <label 
                        key={r.id} 
                        style={{ 
                          padding: '12px', 
                          borderRadius: '12px', 
                          border: '1px solid',
                          borderColor: isSel ? 'var(--primary)' : 'var(--border-soft)',
                          background: isSel ? 'rgba(0, 102, 255, 0.05)' : 'var(--surface-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSel ? 'var(--primary)' : 'var(--ink-muted)',
                          backgroundColor: isSel ? 'var(--primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isSel && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isSel ? 'var(--primary)' : 'var(--ink)' }}>{r.roleName}</span>
                        <input type="radio" style={{ display: 'none' }} name="role" checked={isSel} onChange={() => setAddForm({ ...addForm, roleId: r.id })} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '40px' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ paddingLeft: '32px', paddingRight: '32px' }} onClick={handleAdd}>Tạo nhân viên</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && targetUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap info">
              <UserGear size={32} weight="duotone" />
            </div>
            <h3>Cập nhật tài khoản</h3>
            <p className="text-muted">Chỉnh sửa thông tin cho nhân viên <strong>@{targetUser.username}</strong></p>
            
            <div className="modal-form-fields" style={{ marginTop: '32px', textAlign: 'left' }}>
              <div className="field-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Họ và tên</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '10px 0', fontSize: '16px' }}
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vai trò mới</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  {roles.map(r => {
                    const isSel = editForm.roleId === r.id;
                    return (
                      <label 
                        key={r.id} 
                        style={{ 
                          padding: '12px', 
                          borderRadius: '12px', 
                          border: '1px solid',
                          borderColor: isSel ? 'var(--primary)' : 'var(--border-soft)',
                          background: isSel ? 'rgba(0, 102, 255, 0.05)' : 'var(--surface-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSel ? 'var(--primary)' : 'var(--ink-muted)',
                          backgroundColor: isSel ? 'var(--primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isSel && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isSel ? 'var(--primary)' : 'var(--ink)' }}>{r.roleName}</span>
                        <input type="radio" style={{ display: 'none' }} name="role-edit" checked={isSel} onChange={() => setEditForm({ ...editForm, roleId: r.id })} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '40px' }}>
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ paddingLeft: '32px', paddingRight: '32px' }} onClick={handleUpdate}>Cập nhật ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {showResetModal && targetUser && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-box" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap warn">
              <Key size={32} weight="duotone" />
            </div>
            <h3>Đặt lại mật khẩu?</h3>
            <p className="text-muted">Mật khẩu của tài khoản <strong>@{targetUser.username}</strong> sẽ được trả về mặc định là <strong>123456</strong>.</p>
            
            <div className="modal-footer" style={{ marginTop: '32px' }}>
              <button className="btn btn-ghost" onClick={() => setShowResetModal(false)}>Hủy bỏ</button>
              <button className="btn btn-warning" style={{ paddingLeft: '24px', paddingRight: '24px' }} onClick={handleResetPassword}>Xác nhận đặt lại</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && targetUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap del-warn">
              <Trash size={32} weight="duotone" />
            </div>
            <h3>Xóa tài khoản nhân viên?</h3>
            <p className="text-muted">Hành động này không thể hoàn tác. Nhân viên <strong>@{targetUser.username}</strong> sẽ không thể truy cập vào hệ thống nữa.</p>
            
            <div className="modal-footer" style={{ marginTop: '32px' }}>
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button className="btn btn-danger" style={{ paddingLeft: '24px', paddingRight: '24px' }} onClick={confirmDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
