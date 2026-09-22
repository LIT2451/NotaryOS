import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlass, PencilSimple, Trash, FloppyDisk, X, Receipt, ArrowsCounterClockwise, Camera, DownloadSimple, FileText } from '@phosphor-icons/react';
import type { Invoice, InvoicePayload } from '../types';
import { SERVICE_TYPES } from '../constants';

const FALLBACK_BANK_LIST = [
  'Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'Techcombank', 'MB Bank', 'ACB', 'VPBank',
  'Sacombank', 'HDBank', 'TPBank', 'SHB', 'SeABank', 'LienVietPostBank', 'VIB', 'MSB',
  'OCB', 'Eximbank', 'Nam A Bank', 'Bac A Bank', 'PVcomBank', 'ABBank', 'KienLong Bank',
  'Saigonbank', 'VietABank', 'NCB', 'PGBank', 'BaoViet Bank', 'DongA Bank',
];

type InvoiceTableProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterServiceType: number | 'all';
  setFilterServiceType: (id: number | 'all') => void;
  filterCategory: 'all' | 'CongChung' | 'ChungThuc' | 'SaoY';
  setFilterCategory: (cat: 'all' | 'CongChung' | 'ChungThuc' | 'SaoY') => void;
  filterBank: string;
  setFilterBank: (bank: string) => void;
  filteredInvoices: Invoice[];
  editingInvoiceId: number | null;
  editForm: InvoicePayload;
  setEditForm: (form: InvoicePayload) => void;
  startEditInvoice: (invoice: Invoice) => void;
  cancelEditInvoice: () => void;
  saveEditInvoice: (id: number) => void;
  removeInvoice: (id: number) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  serviceTypes: any[];
  banks?: any[];
  hasPermission: (permission: string) => boolean;
  currentUserId: number;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
};

// Row with staggered animation on mount
const AnimatedRow: React.FC<{ children: React.ReactNode; delay: number }> = ({ children, delay }) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <tr
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {children}
    </tr>
  );
};

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  searchTerm,
  setSearchTerm,
  filterServiceType,
  setFilterServiceType,
  filterCategory,
  setFilterCategory,
  filterBank,
  setFilterBank,
  filteredInvoices,
  editingInvoiceId,
  editForm,
  setEditForm,
  startEditInvoice,
  cancelEditInvoice,
  saveEditInvoice,
  removeInvoice,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  serviceTypes,
  banks = [],
  hasPermission,
  currentUserId,
  onExportExcel,
  onExportPdf,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [subTab, setSubTab] = useState<'active' | 'deleted'>('active');
  
  const bankList = React.useMemo(() => {
    return banks && banks.length > 0 ? banks.map((b: any) => b.bankName) : FALLBACK_BANK_LIST;
  }, [banks]);

  // Reset to page 1 when search, filters, or subTab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, filterServiceType, filterCategory, filterBank, subTab]);

  const invoicesToDisplay = React.useMemo(() => {
    return filteredInvoices.filter(inv => subTab === 'active' ? !inv.isDeleted : inv.isDeleted);
  }, [filteredInvoices, subTab]);

  const totalPages = Math.ceil(invoicesToDisplay.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoicesToDisplay.slice(indexOfFirstItem, indexOfLastItem);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      removeInvoice(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="hist-root">
      <div className="page-title-block" style={{ marginBottom: '24px' }}>
        <p className="text-muted">
          Tra cứu và quản lý danh sách các hồ sơ đã thực hiện trên hệ thống.
        </p>
      </div>

      <div className="sub-tab-segmented-control">
        <button
          className={`sub-tab-btn ${subTab === 'active' ? 'active' : ''}`}
          onClick={() => setSubTab('active')}
        >
          Hóa đơn hoạt động
        </button>
        <button
          className={`sub-tab-btn ${subTab === 'deleted' ? 'active' : ''}`}
          onClick={() => setSubTab('deleted')}
        >
          Hợp đồng đã xóa / Sổ trống
        </button>
      </div>
      {/* Delete Modal */}
      {deleteConfirmId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap del-warn">
              <Trash size={32} weight="duotone" />
            </div>
            <h3 className="modal-title">Xác nhận xóa?</h3>
            <p className="modal-desc">
              Bạn có chắc chắn muốn xóa hóa đơn này? <br/>
              Hành động này không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-secondary" onClick={() => setDeleteConfirmId(null)}>Hủy bỏ</button>
              <button className="modal-btn-danger" onClick={confirmDelete}>Xóa dữ liệu</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="hist-toolbar">
        {/* Search */}
        <div className="hist-search-wrap">
          <MagnifyingGlass size={17} className="hist-search-icon" />
          <input
            className="hist-search-input"
            placeholder="Tìm số hóa đơn, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onExportExcel && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', gap: '6px', background: '#e1f5fe', color: '#01579b', border: '1px solid #b3e5fc', display: 'flex', alignItems: 'center' }}
              onClick={onExportExcel}
            >
              <ArrowsCounterClockwise size={18} weight="bold" style={{ display: 'none' }} /> 
              <DownloadSimple size={18} weight="bold" />
              <span>Xuất Excel</span>
            </button>
          )}
          
          {onExportPdf && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', gap: '6px', background: '#fce4ec', color: '#880e4f', border: '1px solid #f8bbd0', display: 'flex', alignItems: 'center' }}
              onClick={onExportPdf}
            >
              <FileText size={18} weight="bold" />
              <span>Xuất PDF</span>
            </button>
          )}
        </div>


        {/* Date Filters */}
        <div className="hist-filters">
          <div className="dash-filter-group">
            <select 
              className="dash-date-input" 
              style={{ minWidth: '130px' }}
              value={filterCategory} 
              onChange={(e) => {
                setFilterCategory(e.target.value as any);
                setFilterServiceType('all');
              }}
            >
              <option value="all">Tất cả loại hình</option>
              <option value="CongChung">Công chứng</option>
              <option value="ChungThuc">Chứng thực</option>
              <option value="SaoY">Sao y</option>
            </select>
          </div>

          <div className="dash-filter-group">
            <select 
              className="dash-date-input"
              style={{ minWidth: '150px' }}
              value={filterServiceType} 
              onChange={(e) => setFilterServiceType(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">Tất cả dịch vụ</option>
               {Array.isArray(serviceTypes) && serviceTypes
                .filter(t => filterCategory === 'all' || t.category === filterCategory)
                .map(t => (
                  <option key={t.id} value={t.id}>{t.typeName}</option>
                ))
               }
            </select>
          </div>

          <div className="dash-filter-group">
            <select 
              className="dash-date-input" 
              style={{ minWidth: '130px' }}
              value={filterBank} 
              onChange={(e) => setFilterBank(e.target.value)}
            >
              <option value="all">Tất cả ngân hàng</option>
              {bankList.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div className="dash-filter-group">
            <span className="dash-filter-label">Từ</span>
            <input type="date" className="dash-date-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <span className="dash-filter-sep">→</span>
          <div className="dash-filter-group">
            <span className="dash-filter-label">Đến</span>
            <input type="date" className="dash-date-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button 
            className="hist-clear-btn" 
            onClick={() => { 
              setStartDate(''); 
              setEndDate(''); 
              setSearchTerm(''); 
              setFilterServiceType('all'); 
              setFilterCategory('all');
              setFilterBank('all');
            }}
          >
            <ArrowsCounterClockwise size={14} weight="bold" /> Xóa lọc
          </button>
        </div>
      </div>

      {/* Result count */}
      <div className="hist-meta">
        <span className="hist-count">{invoicesToDisplay.length}</span> {subTab === 'active' ? 'hóa đơn' : 'hợp đồng trống'}
        {totalPages > 1 && (
          <span className="hist-page-info"> — Trang {currentPage}/{totalPages}</span>
        )}
      </div>

      {/* Empty state */}
      {invoicesToDisplay.length === 0 ? (
        <div className="hist-empty">
          <Receipt size={48} weight="thin" />
          <p>{subTab === 'active' ? 'Không tìm thấy hóa đơn nào' : 'Không có hợp đồng trống nào'}</p>
        </div>
      ) : (
        <>
          <div className="hist-table-wrap">
            <table className="hist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Số HD</th>
                  <th>Khách hàng</th>
                  <th>CCCD / Email</th>
                  <th>Dịch vụ</th>
                  <th style={{ textAlign: 'right' }}>Số tiền</th>
                  <th>Ngân hàng</th>
                  <th>Người tạo</th>
                  <th>Ngày</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(currentInvoices) && currentInvoices.map((invoice, index) => {
                  const isEditing = editingInvoiceId === invoice.id;
                  const displayIndex = indexOfFirstItem + index + 1;
                  const isOwner = invoice.createdBy !== undefined && invoice.createdBy !== null && Number(invoice.createdBy) === Number(currentUserId);
                  const canEdit = hasPermission('Invoices.EditAll') || hasPermission('Invoices.FullControl') || isOwner || invoice.isDeleted;
                  const canDelete = hasPermission('Invoices.DeleteAll') || hasPermission('Invoices.FullControl') || isOwner;

                  return (
                    <AnimatedRow key={invoice.id} delay={index * 30}>
                      <td className="hist-td-index">{displayIndex}</td>

                      {isEditing ? (
                        <>
                          <td>
                            <input className="hist-inline-input" value={editForm.invoiceNumber}
                              onChange={(e) => setEditForm({ ...editForm, invoiceNumber: e.target.value })} />
                          </td>
                          <td>
                            <input className="hist-inline-input" value={editForm.clientName}
                              onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input className="hist-inline-input" placeholder="CCCD" value={editForm.clientIdNumber}
                                onChange={(e) => setEditForm({ ...editForm, clientIdNumber: e.target.value })} />
                              <input className="hist-inline-input" placeholder="Email" value={editForm.clientEmail}
                                onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })} />
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select className="hist-inline-input" 
                                value={serviceTypes.find(t => t.id === editForm.serviceTypeId)?.category || 'CongChung'}
                                disabled={true}
                                title="Không thể đổi loại dịch vụ sau khi đã tạo mã hóa đơn"
                                onChange={(e) => {
                                  const newCat = e.target.value;
                                  const firstInCat = serviceTypes.find(t => t.category === newCat);
                                  if (firstInCat) {
                                    setEditForm({ ...editForm, serviceTypeId: firstInCat.id });
                                  }
                                }}>
                                <option value="CongChung">Công chứng</option>
                                <option value="ChungThuc">Chứng thực</option>
                                <option value="SaoY">Sao y</option>
                              </select>
                              <select className="hist-inline-input" value={editForm.serviceTypeId}
                                onChange={(e) => setEditForm({ ...editForm, serviceTypeId: Number(e.target.value) })}>
                                {Array.isArray(serviceTypes) && serviceTypes
                                  .filter(t => t.category === (serviceTypes.find(st => st.id === editForm.serviceTypeId)?.category || 'CongChung'))
                                  .map((type) => (
                                    <option key={type.id} value={type.id}>{type.typeName}</option>
                                  ))}
                              </select>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              type="text" 
                              className="hist-inline-input" 
                              style={{ textAlign: 'right', width: '120px' }}
                              value={editForm.amount === 0 ? '' : editForm.amount.toLocaleString('vi-VN')}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setEditForm({ ...editForm, amount: val === '' ? 0 : Number(val) });
                              }} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select className="hist-inline-input" 
                                value={editForm.bankName || ''}
                                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}>
                                <option value="">-- Ngân hàng --</option>
                                {bankList.map((bank) => (
                                  <option key={bank} value={bank}>{bank}</option>
                                ))}
                              </select>
                              <input className="hist-inline-input" placeholder="STK" value={editForm.bankAccount || ''}
                                onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })} />
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontWeight: 500 }}>
                              {invoice.user?.fullName || invoice.user?.username || '—'}
                            </span>
                          </td>
                          <td>
                            <input type="date" className="hist-inline-input" value={editForm.notaryDate}
                              onChange={(e) => setEditForm({ ...editForm, notaryDate: e.target.value })} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="hist-actions">
                              <button className="hist-btn hist-btn-save" onClick={() => saveEditInvoice(invoice.id)} title="Lưu">
                                <FloppyDisk size={16} />
                              </button>
                              <button className="hist-btn hist-btn-cancel" onClick={cancelEditInvoice} title="Hủy">
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <span className="hist-invoice-num">{invoice.invoiceNumber}</span>
                          </td>
                          <td className="hist-td-name">
                            {invoice.isDeleted ? (
                              <span style={{ color: 'var(--ink-muted)', fontStyle: 'italic', fontWeight: 400 }}>
                                Số trống (Đã xóa)
                              </span>
                            ) : (
                              invoice.clientName
                            )}
                          </td>
                          <td>
                            <div className="hist-td-id">
                              <span className="hist-id-num">{invoice.clientIdNumber || '—'}</span>
                              <span className="hist-id-email">{invoice.clientEmail || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="hist-badge">{invoice.serviceType?.typeName ?? '—'}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="hist-amount">
                              {invoice.isDeleted ? '—' : `${invoice.amount.toLocaleString('vi-VN')} đ`}
                            </span>
                          </td>
                          <td>
                            <div className="hist-td-id">
                              <span className="hist-id-num">{invoice.bankName || '—'}</span>
                              <span className="hist-id-email">{invoice.bankAccount || '—'}</span>
                            </div>
                            {!invoice.isDeleted && (invoice.idCardFrontPath || invoice.idCardBackPath) && (
                              <div style={{ marginTop: '4px' }}>
                                <button 
                                  className="btn-text-small"
                                  onClick={() => {
                                    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5202';
                                    if (invoice.idCardFrontPath) window.open(`${baseUrl}${invoice.idCardFrontPath}`, '_blank');
                                    if (invoice.idCardBackPath) window.open(`${baseUrl}${invoice.idCardBackPath}`, '_blank');
                                  }}
                                >
                                  <Camera size={14} style={{ marginRight: '4px' }} /> Xem ảnh
                                </button>
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
                              {invoice.user?.fullName || invoice.user?.username || '—'}
                            </span>
                          </td>
                          <td className="hist-td-date">
                            {new Date(invoice.notaryDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="hist-actions">
                              {canEdit && (
                                <button 
                                  className="hist-btn hist-btn-edit" 
                                  onClick={() => startEditInvoice(invoice)} 
                                  title={invoice.isDeleted ? "Nhập lại số này" : "Sửa"}
                                >
                                  <PencilSimple size={16} />
                                </button>
                              )}
                              {!invoice.isDeleted && canDelete && (
                                <button 
                                  className="hist-btn hist-btn-del" 
                                  onClick={() => handleDeleteClick(invoice.id)} 
                                  title="Xóa"
                                >
                                  <Trash size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </AnimatedRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pag-btn" 
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                Trước
              </button>
              
              <div className="pag-numbers">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show only limited numbers if too many
                  if (totalPages > 7) {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button 
                          key={page} 
                          className={`pag-num ${currentPage === page ? 'active' : ''}`}
                          onClick={() => paginate(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pag-dots">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <button 
                      key={page} 
                      className={`pag-num ${currentPage === page ? 'active' : ''}`}
                      onClick={() => paginate(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button 
                className="pag-btn" 
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvoiceTable;
