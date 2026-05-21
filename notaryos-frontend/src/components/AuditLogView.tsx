import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/api';
import { 
  ArrowClockwise, 
  Tag, 
  Plus,
  PencilSimple,
  Trash,
  ArrowRight,
  ArrowDown,
  Note
} from '@phosphor-icons/react';

const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogs();
      setLogs(res.data);
    } catch (err) {
      console.error('Lỗi lấy nhật ký:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Created': return <Plus size={16} weight="bold" />;
      case 'Updated': return <PencilSimple size={16} weight="bold" />;
      case 'Deleted': return <Trash size={16} weight="bold" />;
      default: return <Note size={16} />;
    }
  };

  const getActionClass = (action: string) => {
    switch (action) {
      case 'Created': return 'audit-badge-create';
      case 'Updated': return 'audit-badge-update';
      case 'Deleted': return 'audit-badge-delete';
      default: return '';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const FIELD_MAP: Record<string, string> = {
    InvoiceNumber: 'Số hóa đơn',
    ClientName: 'Khách hàng',
    ClientIdNumber: 'CCCD/CMND',
    ClientEmail: 'Email',
    Amount: 'Số tiền',
    ServiceTypeId: 'Mã dịch vụ',
    NotaryDate: 'Ngày công chứng',
    TypeName: 'Tên dịch vụ',
    Description: 'Mô tả'
  };

  const renderJson = (jsonStr: string | null) => {
    if (!jsonStr) return <span className="text-muted">N/A</span>;
    try {
      const obj = JSON.parse(jsonStr);
      const entries = Object.entries(obj).filter(([key]) => 
        !['Id', 'CreatedBy', 'CreatedAt', 'UpdatedAt', 'User', 'ServiceType', 'Role', 'Invoices', 'PasswordHash'].includes(key)
      );

      if (entries.length === 0) return <span className="text-muted">Không có dữ liệu chi tiết</span>;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {entries.map(([key, val]) => {
            const label = FIELD_MAP[key] || key;
            let displayVal = val === null || val === undefined ? 'Trống' : String(val);
            
            if (key === 'Amount' && typeof val === 'number') {
              displayVal = val.toLocaleString('vi-VN') + ' ₫';
            }
            if (key === 'NotaryDate' && typeof val === 'string') {
              displayVal = new Date(val).toLocaleDateString('vi-VN');
            }
            
            return (
              <div key={key} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                <span style={{ fontWeight: 700, color: 'var(--ink-muted)', minWidth: '110px' }}>{label}:</span>
                <span style={{ color: 'var(--ink)', wordBreak: 'break-all' }}>{displayVal}</span>
              </div>
            );
          })}
        </div>
      );
    } catch {
      return <span className="text-muted">{jsonStr}</span>;
    }
  };

  return (
    <div className="audit-root">
      <div className="page-title-block" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Nhật ký hệ thống
        </h1>
        <p className="text-muted">
          Lưu vết tất cả các thao tác thay đổi dữ liệu trên hệ thống.
        </p>
      </div>

      {loading ? (
        <div className="loading-state" style={{ padding: '60px 0' }}>
          <div className="loading-spinner" />
          <p className="text-muted" style={{ marginTop: '16px' }}>Đang tải dữ liệu nhật ký...</p>
        </div>
      ) : (
        <div className="audit-table-wrap">
          {/* Header Row - Desktop Only */}
          <div className="audit-header">
            <div className="audit-col-time">THỜI GIAN</div>
            <div className="audit-col-user">NGƯỜI THỰC HIỆN</div>
            <div className="audit-col-action">THAO TÁC</div>
            <div className="audit-col-entity">ĐỐI TƯỢNG</div>
            <div className="audit-col-details">CHI TIẾT THAY ĐỔI</div>
          </div>

          {logs.length === 0 ? (
            <div className="empty-state" style={{ padding: '80px 0' }}>
              <Note size={48} weight="thin" />
              <p className="text-muted">Chưa có nhật ký hoạt động nào.</p>
            </div>
          ) : (
            <div className="audit-body">
              {logs.map((log) => (
                <div className="audit-row" key={log.id}>
                  {/* Top: Meta Info */}
                  <div className="audit-row-main">
                    <div className="audit-col-time">
                      <div className="audit-val-time">
                        <ArrowClockwise size={16} />
                        <span>{formatTime(log.timestamp)}</span>
                      </div>
                    </div>

                    <div className="audit-col-user">
                      <div className="audit-val-user">
                        <div className="audit-avatar">
                          {log.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="audit-user-meta">
                          <span className="audit-user-name">{log.user?.fullName || log.user?.username || 'Hệ thống'}</span>
                          <span className="audit-user-sub">@{log.user?.username || 'system'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="audit-col-action">
                      <span className={`audit-badge ${getActionClass(log.action)}`}>
                        {log.action === 'Created' && <Plus size={14} weight="bold" />}
                        {log.action === 'Updated' && <PencilSimple size={14} weight="bold" />}
                        {log.action === 'Deleted' && <Trash size={14} weight="bold" />}
                        {log.action}
                      </span>
                    </div>

                    <div className="audit-col-entity">
                      <div className="audit-entity-tag">
                        <Tag size={16} weight="bold" />
                        <span>{log.entityType} #{log.entityId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Details (Full Width) */}
                  <div className="audit-row-details">
                    <div className="audit-diff-box">
                      {log.action === 'Updated' ? (
                        <div className="diff-grid">
                          <div className="diff-panel">
                            <span className="diff-title">Giá trị cũ</span>
                            <div className="json-content">
                              {renderJson(log.oldValues)}
                            </div>
                          </div>
                          
                          <div className="diff-arrow-wrap">
                            <ArrowRight size={22} weight="bold" className="arrow-desktop" />
                            <ArrowDown size={22} weight="bold" className="arrow-mobile" />
                          </div>

                          <div className="diff-panel">
                            <span className="diff-title">Giá trị mới</span>
                            <div className="json-content">
                              {renderJson(log.newValues)}
                            </div>
                          </div>
                        </div>
                      ) : log.action === 'Created' ? (
                        <div className="diff-panel">
                          <span className="diff-title">Dữ liệu khởi tạo</span>
                          <div className="json-content">
                            {renderJson(log.newValues)}
                          </div>
                        </div>
                      ) : (
                        <div className="diff-panel">
                          <span className="diff-title">Dữ liệu đã xóa</span>
                          <div className="json-content">
                            {renderJson(log.oldValues)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogView;
