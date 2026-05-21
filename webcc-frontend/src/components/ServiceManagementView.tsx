import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  ListBullets, 
  Info,
  X,
  DotsThreeVertical,
  ListChecks,
  Briefcase
} from '@phosphor-icons/react';
import { getServiceTypes, createServiceType, updateServiceType, deleteServiceType } from '../services/api';
import { showSuccess, showError } from '../utils/toast';

interface ServiceManagementViewProps {
  onServiceChange?: () => void;
}

const ServiceManagementView: React.FC<ServiceManagementViewProps> = ({ onServiceChange }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [targetService, setTargetService] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({ typeName: '', description: '', category: 'CongChung' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getServiceTypes();
      setServices(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách dịch vụ:', err);
      showError('Lỗi', 'Không thể tải danh sách loại dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ typeName: '', description: '', category: 'CongChung' });
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!form.typeName.trim()) {
      showError('Lỗi', 'Tên loại dịch vụ không được để trống.');
      return;
    }
    try {
      await createServiceType(form);
      showSuccess('Thành công', 'Đã thêm loại dịch vụ mới.');
      setShowAddModal(false);
      fetchServices();
      if (onServiceChange) onServiceChange();
    } catch (err: any) {
      showError('Lỗi', err.response?.data || 'Không thể thêm dịch vụ.');
    }
  };

  const openEditModal = (service: any) => {
    setTargetService(service);
    setForm({ 
      typeName: service.typeName, 
      description: service.description || '',
      category: service.category || 'CongChung'
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!targetService) return;
    if (!form.typeName.trim()) {
      showError('Lỗi', 'Tên loại dịch vụ không được để trống.');
      return;
    }
    try {
      await updateServiceType(targetService.id, form);
      showSuccess('Thành công', 'Đã cập nhật loại dịch vụ.');
      setShowEditModal(false);
      fetchServices();
      if (onServiceChange) onServiceChange();
    } catch (err: any) {
      showError('Lỗi', err.response?.data || 'Không thể cập nhật.');
    }
  };

  const openDeleteModal = (service: any) => {
    setTargetService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!targetService) return;
    try {
      await deleteServiceType(targetService.id);
      showSuccess('Thành công', 'Đã xóa loại dịch vụ.');
      setShowDeleteModal(false);
      fetchServices();
      if (onServiceChange) onServiceChange();
    } catch (err: any) {
      showError('Lỗi', err.response?.data || 'Không thể xóa loại dịch vụ.');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="hist-root">
      <div className="page-title-block" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Quản lý dịch vụ
          </h1>
          <p className="text-muted">
            Danh mục các loại hình dịch vụ công chứng đang cung cấp.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={20} weight="bold" />
          <span>Thêm dịch vụ mới</span>
        </button>
      </div>

      {loading ? (
        <div className="hist-empty">
          <div className="loading-spinner" />
          <p>Đang tải danh sách dịch vụ...</p>
        </div>
      ) : (
        <div className="hist-table-wrap" style={{ marginTop: '24px' }}>
          <div className="table-responsive">
            <table className="hist-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th style={{ width: '150px' }}>Phân loại</th>
                  <th style={{ width: '250px' }}>Tên loại dịch vụ</th>
                  <th>Mô tả chi tiết</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="hist-td-index">#{service.id}</td>
                    <td>
                      <span className={`badge ${service.category === 'ChungThuc' ? 'info' : service.category === 'SaoY' ? 'warning' : 'success'}`} style={{ fontSize: '12px', fontWeight: 600 }}>
                        {service.category === 'ChungThuc' ? 'Chứng thực' : service.category === 'SaoY' ? 'Sao y' : 'Công chứng'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{service.typeName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '14px' }}>
                        {service.description || 'Chưa có mô tả'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="hist-actions">
                        <button className="hist-btn hist-btn-edit" onClick={() => openEditModal(service)} title="Sửa dịch vụ">
                          <PencilSimple size={18} />
                        </button>
                        <button className="hist-btn hist-btn-del" onClick={() => openDeleteModal(service)} title="Xóa dịch vụ">
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
          <div className="modal-box" style={{ maxWidth: '540px', padding: '56px 48px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap" style={{ background: 'var(--surface-secondary)', color: 'var(--primary)', marginBottom: '32px' }}>
              <Plus size={32} weight="bold" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Thêm dịch vụ mới</h3>
            <p className="text-muted" style={{ fontSize: '15px', marginBottom: '48px' }}>Nhập thông tin để tạo loại hình dịch vụ công chứng mới cho hệ thống.</p>
            
            <div className="modal-form-fields" style={{ textAlign: 'left' }}>
              <div className="field-group" style={{ marginBottom: '32px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', display: 'block' }}>Phân loại</label>
                <select 
                  className="form-control" 
                  style={{ width: '100%', borderRadius: '12px', height: '48px', padding: '0 16px', fontSize: '15px' }}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="CongChung">Công chứng (CC)</option>
                  <option value="ChungThuc">Chứng thực (CT)</option>
                  <option value="SaoY">Sao y (SY)</option>
                </select>
              </div>
              <div className="field-group" style={{ marginBottom: '32px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', display: 'block' }}>Tên dịch vụ</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '12px 0', fontSize: '18px', fontWeight: 500, borderBottomWidth: '1.5px' }}
                  value={form.typeName}
                  onChange={(e) => setForm({ ...form, typeName: e.target.value })}
                  placeholder="Ví dụ: Hợp đồng Mua bán"
                  autoFocus
                />
              </div>
              <div className="field-group">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', display: 'block' }}>Mô tả chi tiết</label>
                <textarea 
                  className="modal-textarea" 
                  style={{ minHeight: '120px', borderRadius: '16px', padding: '16px', fontSize: '15px', background: 'var(--surface-secondary)', border: 'none' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Nhập mô tả về phạm vi và quy trình của dịch vụ này..."
                />
              </div>
            </div>
<br/>
            <div className="modal-footer" style={{ marginTop: '48px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, height: '54px', borderRadius: '14px' }} onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ flex: 2, height: '54px', borderRadius: '14px', fontSize: '16px' }} onClick={handleAdd}>Tạo dịch vụ ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && targetService && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap info">
              <Briefcase size={32} weight="duotone" />
            </div>
            <h3>Cập nhật dịch vụ</h3>
            <p className="text-muted">Chỉnh sửa thông tin cho loại dịch vụ <strong>#{targetService.typeName}</strong></p>
            
            <div className="modal-form-fields" style={{ marginTop: '32px', textAlign: 'left' }}>
              <div className="field-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phân loại</label>
                <select 
                  className="form-control" 
                  style={{ width: '100%', borderRadius: '10px', height: '42px', padding: '0 12px', fontSize: '14px' }}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="CongChung">Công chứng (CC)</option>
                  <option value="ChungThuc">Chứng thực (CT)</option>
                </select>
              </div>
              <div className="field-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên dịch vụ</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '10px 0', fontSize: '16px', fontWeight: 500 }}
                  value={form.typeName}
                  onChange={(e) => setForm({ ...form, typeName: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mô tả chi tiết</label>
                <textarea 
                  className="modal-textarea" 
                  style={{ minHeight: '100px', borderRadius: '12px', padding: '12px' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '40px' }}>
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ paddingLeft: '32px', paddingRight: '32px' }} onClick={handleUpdate}>Cập nhật ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && targetService && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap del-warn">
              <Trash size={32} weight="duotone" />
            </div>
            <h3>Xóa loại dịch vụ?</h3>
            <p className="text-muted">Hành động này không thể hoàn tác. Loại dịch vụ <strong>{targetService.typeName}</strong> sẽ bị gỡ bỏ khỏi hệ thống.</p>
            <div className="modal-footer" style={{ marginTop: '40px' }}>
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button className="btn btn-danger" style={{ paddingLeft: '24px', paddingRight: '24px' }} onClick={confirmDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagementView;
