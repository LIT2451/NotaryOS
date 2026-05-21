import React, { useState, useEffect } from 'react';
import { Plus, PencilSimple, Trash, ShieldCheck, ListChecks, WarningCircle, Info, Briefcase, UserGear } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

type Permission = { id: string; permissionName: string; description: string };
type Role = { id: number; roleName: string; permissions: string[] };

const RoleManagementView: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ roleName: '', permissions: [] as string[] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch {
      showError('Lỗi', 'Không thể tải danh sách vai trò.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditRole(null);
    setRoleForm({ roleName: '', permissions: [] });
    setShowModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditRole(role);
    setRoleForm({ roleName: role.roleName, permissions: [...role.permissions] });
    setShowModal(true);
  };

  const togglePermission = (permId: string) => {
    setRoleForm(prev => {
      let newPerms = new Set(prev.permissions);
      const isChecking = !newPerms.has(permId);

      if (isChecking) {
        newPerms.add(permId);
        // Tự động check các quyền gốc (đi theo bộ)
        if (permId === 'Invoices.ViewAll' || permId === 'Invoices.Create' || 
            permId === 'Invoices.Edit' || permId === 'Invoices.Delete' || 
            permId === 'Invoices.Export') {
          newPerms.add('Invoices.View');
        }
        if (permId === 'Invoices.EditAll') {
          newPerms.add('Invoices.Edit');
          newPerms.add('Invoices.ViewAll');
          newPerms.add('Invoices.View');
        }
        if (permId === 'Invoices.DeleteAll') {
          newPerms.add('Invoices.Delete');
          newPerms.add('Invoices.ViewAll');
          newPerms.add('Invoices.View');
        }
      } else {
        newPerms.delete(permId);
        // Tự động bỏ check các quyền phụ thuộc (đi theo bộ)
        if (permId === 'Invoices.View') {
          newPerms.delete('Invoices.ViewAll');
          newPerms.delete('Invoices.Create');
          newPerms.delete('Invoices.Edit');
          newPerms.delete('Invoices.EditAll');
          newPerms.delete('Invoices.Delete');
          newPerms.delete('Invoices.DeleteAll');
          newPerms.delete('Invoices.Export');
        }
        if (permId === 'Invoices.ViewAll') {
          newPerms.delete('Invoices.EditAll');
          newPerms.delete('Invoices.DeleteAll');
        }
        if (permId === 'Invoices.Edit') {
          newPerms.delete('Invoices.EditAll');
        }
        if (permId === 'Invoices.Delete') {
          newPerms.delete('Invoices.DeleteAll');
        }
      }

      return { ...prev, permissions: Array.from(newPerms) };
    });
  };

  const saveRole = async () => {
    if (!roleForm.roleName.trim()) {
      showError('Lỗi', 'Vui lòng nhập tên vai trò');
      return;
    }
    const toastId = toast.loading('Đang lưu...');
    try {
      if (editRole) {
        await api.put(`/roles/${editRole.id}`, roleForm);
        showSuccess('Thành công', 'Đã cập nhật vai trò');
      } else {
        await api.post('/roles', roleForm);
        showSuccess('Thành công', 'Đã tạo vai trò mới');
      }
      toast.dismiss(toastId);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.dismiss(toastId);
      showError('Lỗi', err.response?.data || 'Không thể lưu vai trò');
    }
  };

  const deleteRole = async (id: number) => {
    if (id === 1 || id === 2 || id === 3) {
      showError('Lỗi', 'Không thể xóa vai trò hệ thống');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa vai trò này?')) return;
    const toastId = toast.loading('Đang xóa...');
    try {
      await api.delete(`/roles/${id}`);
      toast.dismiss(toastId);
      showSuccess('Thành công', 'Đã xóa vai trò');
      fetchData();
    } catch (err: any) {
      toast.dismiss(toastId);
      showError('Lỗi', err.response?.data || 'Không thể xóa vai trò');
    }
  };

  return (
    <div className="hist-root">
      {/* Header */}
      <div className="page-title-block" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Quản lý vai trò
          </h1>
          <p className="text-muted">
            Thiết lập các quyền truy cập cho từng vai trò trên hệ thống.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} weight="bold" />
          <span>Thêm vai trò mới</span>
        </button>
      </div>

      {loading ? (
        <div className="hist-empty">
          <div className="loading-spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="hist-table-wrap" style={{ marginTop: '24px' }}>
          <div className="table-responsive">
            <table className="hist-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>STT</th>
                  <th style={{ width: '200px' }}>Tên vai trò</th>
                  <th>Quyền hạn được gán</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => (
                  <tr key={role.id}>
                    <td className="hist-td-index">{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="badge success" style={{ padding: '8px' }}>
                          <ShieldCheck size={20} weight="duotone" />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{role.roleName}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {role.permissions.map(p => {
                          const permInfo = permissions.find(x => x.id === p);
                          return (
                            <span 
                              key={p} 
                              className="hist-badge" 
                              style={{ 
                                background: 'var(--surface-secondary)', 
                                color: 'var(--ink-secondary)',
                                border: '1px solid var(--border-soft)',
                                fontSize: '12px'
                              }}
                              title={permInfo?.description}
                            >
                              {permInfo?.permissionName || p}
                            </span>
                          );
                        })}
                        {role.permissions.length === 0 && (
                          <span className="text-muted" style={{ fontStyle: 'italic', fontSize: '13px' }}>
                            Chưa được gán quyền
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="hist-actions">
                        <button className="hist-btn hist-btn-edit" onClick={() => openEditModal(role)} title="Sửa vai trò">
                          <PencilSimple size={18} />
                        </button>
                        <button 
                          className="hist-btn hist-btn-del" 
                          onClick={() => deleteRole(role.id)} 
                          title="Xóa vai trò"
                          disabled={role.id === 1 || role.id === 2}
                          style={{ opacity: (role.id === 1 || role.id === 2) ? 0.3 : 1 }}
                        >
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

      {/* --- ROLE MODAL --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: '750px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap info">
              <ListChecks size={32} weight="duotone" />
            </div>
            <h3>{editRole ? 'Cập nhật vai trò' : 'Tạo vai trò mới'}</h3>
            <p className="text-muted">Định nghĩa tên và các quyền hạn cho vai trò này</p>

            <div className="modal-form-fields" style={{ marginTop: '32px', textAlign: 'left' }}>
              <div className="field-group" style={{ marginBottom: '28px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên vai trò</label>
                <input
                  className="underline-input"
                  style={{ width: '100%', padding: '10px 0', fontSize: '18px', fontWeight: 500 }}
                  value={roleForm.roleName}
                  onChange={e => setRoleForm({ ...roleForm, roleName: e.target.value })}
                  placeholder="Ví dụ: Quản lý chi nhánh, Kế toán..."
                  autoFocus
                />
              </div>

              <div className="field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 0 }}>
                    Danh sách quyền hạn ({roleForm.permissions.length}/{permissions.length})
                  </label>
                  <button 
                    className="btn-ghost" 
                    style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-soft)' }}
                    onClick={() => setRoleForm(prev => ({ ...prev, permissions: permissions.map(p => p.id) }))}
                  >
                    <ListChecks size={14} weight="bold" /> Chọn tất cả
                  </button>
                </div>
                
                <div style={{ 
                  maxHeight: '420px', 
                  overflowY: 'auto', 
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }} className="modal-scroll-area">
                  
                <div style={{ 
                  maxHeight: '420px', 
                  overflowY: 'auto', 
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }} className="modal-scroll-area">
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {permissions.map(perm => {
                      const isSelected = roleForm.permissions.includes(perm.id);
                      return (
                        <label 
                          key={perm.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            cursor: 'pointer', 
                            padding: '12px 14px', 
                            borderRadius: '14px', 
                            backgroundColor: isSelected ? 'rgba(0, 102, 255, 0.05)' : 'var(--surface-secondary)', 
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--primary)' : 'var(--border-soft)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                          className="role-perm-item"
                        >
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '7px',
                            border: '2px solid',
                            borderColor: isSelected ? 'var(--primary)' : 'var(--ink-muted)',
                            backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}>
                            {isSelected && <ShieldCheck size={14} weight="bold" color="white" />}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePermission(perm.id)}
                              style={{ display: 'none' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--ink)' }}>
                              {perm.permissionName}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--ink-muted)', lineHeight: '1.2' }}>
                              {perm.description}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '40px' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ paddingLeft: '32px', paddingRight: '32px' }} onClick={saveRole}>
                {editRole ? 'Cập nhật ngay' : 'Tạo vai trò mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementView;
