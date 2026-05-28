import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  Briefcase,
  Buildings
} from '@phosphor-icons/react';
import { getBanks, createBank, updateBank, deleteBank } from '../services/api';
import { showSuccess, showError } from '../utils/toast';

interface BankManagementViewProps {
  onBankChange?: () => void;
}

const BankManagementView: React.FC<BankManagementViewProps> = ({ onBankChange }) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [targetBank, setTargetBank] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({ bankName: '', code: '', description: '' });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const res = await getBanks();
      setBanks(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách ngân hàng:', err);
      showError('Lỗi', 'Không thể tải danh sách ngân hàng.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ bankName: '', code: '', description: '' });
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!form.bankName.trim()) {
      showError('Lỗi', 'Tên ngân hàng không được để trống.');
      return;
    }
    try {
      await createBank(form);
      showSuccess('Thành công', 'Đã thêm ngân hàng mới.');
      setShowAddModal(false);
      fetchBanks();
      if (onBankChange) onBankChange();
    } catch (err: any) {
      showError('Lỗi', err.response?.data || 'Không thể thêm ngân hàng.');
    }
  };

  const openEditModal = (bank: any) => {
    setTargetBank(bank);
    setForm({ 
      bankName: bank.bankName, 
      code: bank.code || '',
      description: bank.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!targetBank) return;
    if (!form.bankName.trim()) {
      showError('Lỗi', 'Tên ngân hàng không được để trống.');
      return;
    }
    try {
      await updateBank(targetBank.id, form);
      showSuccess('Thành công', 'Đã cập nhật thông tin ngân hàng.');
      setShowEditModal(false);
      fetchBanks();
      if (onBankChange) onBankChange();
    } catch (err: any) {
      showError('Lỗi', err.response?.data || 'Không thể cập nhật ngân hàng.');
    }
  };

  const openDeleteModal = (bank: any) => {
    setTargetBank(bank);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!targetBank) return;
    try {
      await deleteBank(targetBank.id);
      showSuccess('Thành công', 'Đã xóa ngân hàng.');
      setShowDeleteModal(false);
      fetchBanks();
      if (onBankChange) onBankChange();
    } catch (err: any) {
      showError('Lỗi', err.response?.data || 'Không thể xóa ngân hàng này.');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="hist-root">
      <div className="page-title-block" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Quản lý ngân hàng
          </h1>
          <p className="text-muted">
            Danh mục các ngân hàng hỗ trợ thanh toán và chuyển khoản của văn phòng công chứng.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={20} weight="bold" />
          <span>Thêm ngân hàng mới</span>
        </button>
      </div>

      {loading ? (
        <div className="hist-empty">
          <div className="loading-spinner" />
          <p>Đang tải danh sách ngân hàng...</p>
        </div>
      ) : (
        <div className="hist-table-wrap" style={{ marginTop: '24px' }}>
          <div className="table-responsive">
            <table className="hist-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th style={{ width: '150px' }}>Mã viết tắt</th>
                  <th style={{ width: '280px' }}>Tên ngân hàng</th>
                  <th>Mô tả / Tên đầy đủ</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank) => (
                  <tr key={bank.id}>
                    <td className="hist-td-index">#{bank.id}</td>
                    <td>
                      <span className="badge info" style={{ fontSize: '12px', fontWeight: 600 }}>
                        {bank.code || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{bank.bankName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '14px' }}>
                        {bank.description || 'Chưa có mô tả'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="hist-actions">
                        <button className="hist-btn hist-btn-edit" onClick={() => openEditModal(bank)} title="Sửa ngân hàng">
                          <PencilSimple size={18} />
                        </button>
                        <button className="hist-btn hist-btn-del" onClick={() => openDeleteModal(bank)} title="Xóa ngân hàng">
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {banks.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-muted)' }}>
                      Chưa có ngân hàng nào được đăng ký trong hệ thống.
                    </td>
                  </tr>
                )}
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
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Thêm ngân hàng mới</h3>
            <p className="text-muted" style={{ fontSize: '15px', marginBottom: '48px' }}>Thêm mới ngân hàng vào hệ thống để người dùng lựa chọn khi nhập hóa đơn.</p>
            
            <div className="modal-form-fields" style={{ textAlign: 'left' }}>
              <div className="field-group" style={{ marginBottom: '32px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', display: 'block' }}>Tên Ngân Hàng (Hiển thị chính)</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '12px 0', fontSize: '18px', fontWeight: 500, borderBottomWidth: '1.5px' }}
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="Ví dụ: Vietcombank"
                  autoFocus
                />
              </div>
              <div className="field-group" style={{ marginBottom: '32px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', display: 'block' }}>Mã viết tắt</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '10px 0', fontSize: '16px', fontWeight: 500 }}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Ví dụ: VCB"
                />
              </div>
              <div className="field-group">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px', display: 'block' }}>Mô tả / Tên đầy đủ</label>
                <textarea 
                  className="modal-textarea" 
                  style={{ minHeight: '100px', borderRadius: '16px', padding: '16px', fontSize: '15px', background: 'var(--surface-secondary)', border: 'none' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Nhập tên đầy đủ hoặc ghi chú..."
                />
              </div>
            </div>
            <br/>
            <div className="modal-footer" style={{ marginTop: '48px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, height: '54px', borderRadius: '14px' }} onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ flex: 2, height: '54px', borderRadius: '14px', fontSize: '16px' }} onClick={handleAdd}>Tạo ngân hàng ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && targetBank && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap info">
              <Buildings size={32} weight="duotone" />
            </div>
            <h3>Cập nhật ngân hàng</h3>
            <p className="text-muted">Chỉnh sửa thông tin cho ngân hàng <strong>{targetBank.bankName}</strong></p>
            
            <div className="modal-form-fields" style={{ marginTop: '32px', textAlign: 'left' }}>
              <div className="field-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên Ngân Hàng</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '10px 0', fontSize: '16px', fontWeight: 500 }}
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </div>
              <div className="field-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mã viết tắt</label>
                <input 
                  className="underline-input" 
                  style={{ width: '100%', padding: '10px 0', fontSize: '16px', fontWeight: 500 }}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mô tả / Tên đầy đủ</label>
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
      {showDeleteModal && targetBank && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap del-warn">
              <Trash size={32} weight="duotone" />
            </div>
            <h3>Xóa ngân hàng?</h3>
            <p className="text-muted">Hành động này không thể hoàn tác. Ngân hàng <strong>{targetBank.bankName}</strong> sẽ bị gỡ bỏ khỏi hệ thống.</p>
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

export default BankManagementView;
