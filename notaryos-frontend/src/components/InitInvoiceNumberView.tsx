import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlass, CheckCircle, XCircle, Warning, ArrowCounterClockwise } from '@phosphor-icons/react';
import { getServiceTypes, getNextInvoiceNumber, checkInvoiceNumber } from '../services/api';
import type { TabType } from './Navbar';
import type { InvoicePayload } from '../types';

type CheckStatus = 'idle' | 'checking' | 'available' | 'taken';

interface InitInvoiceNumberViewProps {
  setActiveTab: (tab: TabType) => void;
  setCreateForm: React.Dispatch<React.SetStateAction<InvoicePayload>>;
  refreshTrigger?: number;
  setIsManualInit?: (val: boolean) => void;
}

const InitInvoiceNumberView: React.FC<InitInvoiceNumberViewProps> = ({ setActiveTab, setCreateForm, refreshTrigger, setIsManualInit }) => {
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'CongChung' | 'ChungThuc' | 'SaoY'>('CongChung');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number>(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle');
  const [autoSuggested, setAutoSuggested] = useState('');
  const [loadingNext, setLoadingNext] = useState(false);

  // Load service types
  useEffect(() => {
    getServiceTypes().then(res => {
      setServiceTypes(res.data);
    }).catch(() => {});
  }, []);

  // Auto-select first service type when category changes
  useEffect(() => {
    const filtered = serviceTypes.filter(t => t.category === selectedCategory);
    if (filtered.length > 0) {
      setSelectedServiceTypeId(filtered[0].id);
    } else {
      setSelectedServiceTypeId(0);
    }
    setInvoiceNumber('');
    setCheckStatus('idle');
    setAutoSuggested('');
  }, [selectedCategory, serviceTypes]);

  // Load next auto-number when service type changes
  useEffect(() => {
    if (selectedServiceTypeId > 0) {
      setLoadingNext(true);
      setCheckStatus('idle');
      getNextInvoiceNumber(selectedServiceTypeId)
        .then(res => {
          setAutoSuggested(res.data.nextNumber ?? '');
        })
        .catch(() => setAutoSuggested(''))
        .finally(() => setLoadingNext(false));
    }
  }, [selectedServiceTypeId, refreshTrigger]);

  // Reset input when service type changes
  useEffect(() => {
    setInvoiceNumber('');
    setCheckStatus('idle');
  }, [selectedServiceTypeId]);

  const handleCheck = useCallback(async () => {
    const trimmed = invoiceNumber.trim();
    if (!trimmed) return;
    setCheckStatus('checking');
    try {
      const res = await checkInvoiceNumber(trimmed);
      setCheckStatus(res.data.exists ? 'taken' : 'available');
    } catch {
      setCheckStatus('idle');
    }
  }, [invoiceNumber]);

  const handleUseAutoNumber = () => {
    setInvoiceNumber(autoSuggested);
    setCheckStatus('idle');
  };

  const handleUseAndCreate = () => {
    setCreateForm(prev => ({
      ...prev,
      invoiceNumber: invoiceNumber.trim(),
      serviceTypeId: selectedServiceTypeId > 0 ? selectedServiceTypeId : prev.serviceTypeId,
    }));
    if (setIsManualInit) setIsManualInit(true);
    setActiveTab('create');
  };

  const filteredTypes = serviceTypes.filter(t => t.category === selectedCategory);

  const statusConfig: Record<CheckStatus, { icon: React.ReactNode; text: string; color: string; bg: string } | null> = {
    idle: null,
    checking: {
      icon: <MagnifyingGlass size={18} className="spin-icon" />,
      text: 'Đang kiểm tra...',
      color: 'var(--text-muted)',
      bg: 'var(--surface)',
    },
    available: {
      icon: <CheckCircle size={18} weight="fill" />,
      text: 'Số hợp đồng hợp lệ, chưa tồn tại trong hệ thống.',
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    taken: {
      icon: <XCircle size={18} weight="fill" />,
      text: 'Số hợp đồng này đã tồn tại trong hệ thống! Vui lòng chọn số khác.',
      color: 'var(--error)',
      bg: '#fff5f5',
    },
  };

  return (
    <div className="container" style={{ maxWidth: '680px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          Khởi tạo số hợp đồng
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '15px' }}>
          Kiểm tra hoặc xác nhận số hợp đồng (SHD) trước khi nhập vào hệ thống. Tránh trùng lặp và sai sót.
        </p>
      </div>

      <div className="card" style={{ padding: '32px', borderRadius: '20px' }}>

        {/* Step 1: Chọn loại hình */}
        <div className="underline-field" style={{ marginBottom: '28px' }}>
          <label className="underline-label">
            Loại hình <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>
          </label>
          <select
            className="underline-input underline-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
          >
            <option value="CongChung">Công chứng</option>
            <option value="ChungThuc">Chứng thực</option>
            <option value="SaoY">Sao y</option>
          </select>
        </div>

        {/* Step 2: Chọn loại dịch vụ */}
        <div className="underline-field" style={{ marginBottom: '28px' }}>
          <label className="underline-label">
            Dịch vụ cụ thể <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>
          </label>
          <select
            className="underline-input underline-select"
            value={selectedServiceTypeId}
            onChange={e => setSelectedServiceTypeId(Number(e.target.value))}
          >
            {filteredTypes.length === 0 && (
              <option value={0}>-- Không có dịch vụ --</option>
            )}
            {filteredTypes.map((t: any) => (
              <option key={t.id} value={t.id}>{t.typeName}</option>
            ))}
          </select>
        </div>

        {/* Gợi ý tự động */}
        {autoSuggested && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'var(--primary-pale, #eef2ff)',
              marginBottom: '24px',
              border: '1px solid var(--primary-light, #c7d2fe)',
            }}
          >
            <Warning size={20} weight="fill" color="var(--primary)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, marginBottom: '2px' }}>
                Số tiếp theo theo hệ thống
              </p>
              <p style={{ fontSize: '15px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.05em' }}>
                {loadingNext ? 'Đang tải...' : autoSuggested}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '100px', whiteSpace: 'nowrap' }}
              onClick={handleUseAutoNumber}
              title="Dùng số này"
            >
              <ArrowCounterClockwise size={15} />
              Dùng số này
            </button>
          </div>
        )}

        {/* Step 3: Nhập SHD cần kiểm tra */}
        <div className="underline-field" style={{ marginBottom: '8px' }}>
          <label className="underline-label">
            Số hợp đồng cần kiểm tra <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              className="underline-input"
              style={{ flex: 1, fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}
              placeholder="VD: CC-2026-000042"
              value={invoiceNumber}
              onChange={e => {
                setInvoiceNumber(e.target.value);
                setCheckStatus('idle');
              }}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ borderRadius: '100px', padding: '10px 22px', whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={handleCheck}
              disabled={!invoiceNumber.trim() || checkStatus === 'checking'}
            >
              <MagnifyingGlass size={16} weight="bold" />
              Kiểm tra
            </button>
          </div>
        </div>

        {/* Kết quả kiểm tra */}
        {checkStatus !== 'idle' && statusConfig[checkStatus] && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: statusConfig[checkStatus]!.bg,
              border: `1px solid ${statusConfig[checkStatus]!.color}33`,
              marginTop: '16px',
              color: statusConfig[checkStatus]!.color,
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {statusConfig[checkStatus]!.icon}
              <span>{statusConfig[checkStatus]!.text}</span>
            </div>
            
            {checkStatus === 'available' && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ borderRadius: '100px', padding: '6px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                onClick={handleUseAndCreate}
              >
                Sử dụng số này
              </button>
            )}
          </div>
        )}

        {/* Hướng dẫn định dạng */}
        <div style={{ marginTop: '32px', padding: '16px 20px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '8px' }}>
            📋 Định dạng số hợp đồng
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.8', margin: 0, paddingLeft: '18px' }}>
            <li><b>Công chứng:</b> <code style={{ background: 'var(--border)', padding: '1px 6px', borderRadius: '4px' }}>CC-2026-000001</code></li>
            <li><b>Chứng thực:</b> <code style={{ background: 'var(--border)', padding: '1px 6px', borderRadius: '4px' }}>CT-2026-000001</code></li>
            <li><b>Sao y:</b> <code style={{ background: 'var(--border)', padding: '1px 6px', borderRadius: '4px' }}>SY-2026-000001</code></li>
            <li>Phần số cuối là 6 chữ số, bắt đầu từ 000001</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InitInvoiceNumberView;
