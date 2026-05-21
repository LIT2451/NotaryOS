import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { InvoicePayload } from '../types';
import { Camera, X } from '@phosphor-icons/react';
import { getNextInvoiceNumber } from '../services/api';

const BANK_LIST = [
  'Vietcombank',
  'VietinBank',
  'BIDV',
  'Agribank',
  'Techcombank',
  'MB Bank',
  'ACB',
  'VPBank',
  'Sacombank',
  'HDBank',
  'TPBank',
  'SHB',
  'SeABank',
  'LienVietPostBank',
  'VIB',
  'MSB',
  'OCB',
  'Eximbank',
  'Nam A Bank',
  'Bac A Bank',
  'PVcomBank',
  'ABBank',
  'KienLong Bank',
  'Saigonbank',
  'VietABank',
  'NCB',
  'PGBank',
  'BaoViet Bank',
  'DongA Bank',
];

type InvoiceFormProps = {
  createForm: InvoicePayload;
  setCreateForm: React.Dispatch<React.SetStateAction<InvoicePayload>>;
  handleCreateInvoice: (event: React.FormEvent, frontFile?: File | null, backFile?: File | null) => void;
  loading: boolean;
  serviceTypes: any[];
  refreshTrigger?: number;
  userRole?: string;
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({ createForm, setCreateForm, handleCreateInvoice, loading, serviceTypes, refreshTrigger, userRole }) => {
  const [idCardFrontImage, setIdCardFrontImage] = useState<string | null>(null);
  const [idCardBackImage, setIdCardBackImage] = useState<string | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isFirstInvoice, setIsFirstInvoice] = useState(false);

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);

  // Xác định loại dịch vụ hiện tại
  const selectedServiceType = useMemo(() => {
    return serviceTypes.find((t: any) => t.id === createForm.serviceTypeId);
  }, [serviceTypes, createForm.serviceTypeId]);

  const currentCategory = selectedServiceType?.category || 'CongChung';
  const isChungThuc = currentCategory === 'ChungThuc' || currentCategory === 'SaoY';
  const prevServiceTypeIdRef = useRef(createForm.serviceTypeId);

  // Auto-select first service type on mount if none is selected
  useEffect(() => {
    if (Array.isArray(serviceTypes) && serviceTypes.length > 0) {
      if (!createForm.serviceTypeId || createForm.serviceTypeId === 0) {
        const filtered = serviceTypes.filter(t => t.category === 'CongChung');
        if (filtered.length > 0) {
          setCreateForm(prev => ({ ...prev, serviceTypeId: filtered[0].id }));
        }
      }
    }
  }, [serviceTypes]);

  // Tự động lấy số hợp đồng tiếp theo khi có serviceTypeId
  useEffect(() => {
    if (createForm.serviceTypeId && createForm.serviceTypeId > 0) {
      // Nếu đã có invoiceNumber (như được truyền từ màn Khởi tạo) và serviceTypeId chưa hề thay đổi từ lúc mount, thì bỏ qua việc overwrite
      if (createForm.invoiceNumber && prevServiceTypeIdRef.current === createForm.serviceTypeId) {
        return;
      }
      
      prevServiceTypeIdRef.current = createForm.serviceTypeId;

      getNextInvoiceNumber(createForm.serviceTypeId)
        .then(res => {
          if (res.data && res.data.nextNumber) {
            setCreateForm(prev => ({ ...prev, invoiceNumber: res.data.nextNumber }));
            setIsFirstInvoice(res.data.isFirst || false);
          }
        })
        .catch(err => console.error("Error fetching next number:", err));
    }
  }, [createForm.serviceTypeId, refreshTrigger]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setIdCardFrontImage(reader.result as string);
          setFrontFile(file);
        } else {
          setIdCardBackImage(reader.result as string);
          setBackFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent, side: 'front' | 'back') => {
    e.stopPropagation();
    if (side === 'front') {
      setIdCardFrontImage(null);
      setFrontFile(null);
      if (fileInputFrontRef.current) fileInputFrontRef.current.value = '';
    } else {
      setIdCardBackImage(null);
      setBackFile(null);
      if (fileInputBackRef.current) fileInputBackRef.current.value = '';
    }
  };

  // Xây dựng danh sách fields động
  const fields: { label: string; node: React.ReactNode; required?: boolean }[] = [
    { label: 'Ngày công chứng', required: true, node: (
      <input type="date" className="underline-input" value={createForm.notaryDate}
        onChange={(e) => setCreateForm({ ...createForm, notaryDate: e.target.value })} />
    )},
    { label: 'Loại hình', required: true, node: (
      <select className="underline-input underline-select" value={currentCategory}
        onChange={(e) => {
          const newCat = e.target.value;
          // Tự động chọn dịch vụ đầu tiên của nhóm đó
          const firstInCat = serviceTypes.find(t => t.category === newCat);
          if (firstInCat) {
            setCreateForm({ ...createForm, serviceTypeId: firstInCat.id });
          }
        }}>
        <option value="CongChung">Công chứng</option>
        <option value="ChungThuc">Chứng thực</option>
        <option value="SaoY">Sao y</option>
      </select>
    )},
    { label: 'Số hợp đồng', required: true, node: (() => {
      const isEditable = isFirstInvoice;
      return (
        <input 
          readOnly={!isEditable}
          className="underline-input" 
          style={!isEditable ? { color: 'var(--text-muted)', backgroundColor: 'transparent', cursor: 'not-allowed' } : { fontWeight: 700, color: 'var(--primary)' }}
          value={createForm.invoiceNumber}
          onChange={(e) => {
            if (isEditable) {
              setCreateForm({ ...createForm, invoiceNumber: e.target.value });
            }
          }}
          placeholder={isEditable ? "Nhập số hợp đồng" : "Hệ thống tự động cấp số"} />
      );
    })()},
    { label: 'Dịch vụ cụ thể', required: true, node: (
      <select className="underline-input underline-select" value={createForm.serviceTypeId}
        onChange={(e) => setCreateForm({ ...createForm, serviceTypeId: Number(e.target.value) })}>
        {Array.isArray(serviceTypes) && serviceTypes
          .filter(t => t.category === currentCategory)
          .map((type: any) => (
            <option key={type.id} value={type.id}>{type.typeName}</option>
          ))
        }
      </select>
    )},
    { label: 'Tên khách hàng', required: true, node: (
      <input required className="underline-input" value={createForm.clientName}
        onChange={(e) => setCreateForm({ ...createForm, clientName: e.target.value })}
        placeholder="Nhập tên khách hàng" />
    )},
    { label: 'Số CCCD/CMND', node: (
      <input className="underline-input" value={createForm.clientIdNumber}
        onChange={(e) => setCreateForm({ ...createForm, clientIdNumber: e.target.value })}
        placeholder="Nhập số CCCD/CMND" />
    )},
    { label: 'Email khách hàng', node: (
      <input type="email" className="underline-input" value={createForm.clientEmail}
        onChange={(e) => setCreateForm({ ...createForm, clientEmail: e.target.value })}
        placeholder="email@example.com" />
    )},
    { label: 'Số tiền (VNĐ)', required: true, node: (
      <input 
        type="text" 
        required 
        className="underline-input" 
        value={createForm.amount === 0 ? '' : createForm.amount.toLocaleString('vi-VN')}
        onChange={(e) => {
          const val = e.target.value.replace(/\./g, '');
          if (val === '' || /^\d+$/.test(val)) {
            setCreateForm({ ...createForm, amount: val === '' ? 0 : Number(val) });
          }
        }}
        placeholder="0" />
    )},
  ];

  fields.push(
    { label: 'Ngân hàng', node: (
      <select className="underline-input underline-select" 
        value={createForm.bankName || ''}
        onChange={(e) => setCreateForm({ ...createForm, bankName: e.target.value })}>
        <option value="">-- Chọn ngân hàng --</option>
        {BANK_LIST.map((bank) => (
          <option key={bank} value={bank}>{bank}</option>
        ))}
      </select>
    )},
    { label: 'Số tài khoản / Thẻ', node: (
      <input className="underline-input" value={createForm.bankAccount || ''}
        onChange={(e) => setCreateForm({ ...createForm, bankAccount: e.target.value })}
        placeholder="Nhập số tài khoản" />
    )},
  );

  return (
    <form onSubmit={(e) => handleCreateInvoice(e, frontFile, backFile)} className="invoice-frameless-form">
      <div className="page-title-block">
        <p className="text-muted">
          Khởi tạo hồ sơ công chứng mới với đầy đủ thông tin khách hàng.
        </p>
      </div>
      <div className="invoice-frameless-grid">

        {/* LEFT: Form Fields */}
        <div className="invoice-fields-col">
          {fields.map(({ label, node, required }) => (
            <div key={label} className="underline-field">
              <label className="underline-label">
                {label} {required && <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>}
              </label>
              {node}
            </div>
          ))}
        </div>

        {/* RIGHT: ID Card Upload */}
        <div className="invoice-upload-col">
          <p className="upload-section-title">Ảnh CCCD <span>(Không bắt buộc)</span></p>

          {/* Mặt trước */}
          <div className="upload-slot-label">Mặt trước</div>
          <input type="file" accept="image/*" ref={fileInputFrontRef} style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e, 'front')} />
          <div className="upload-slot" onClick={() => fileInputFrontRef.current?.click()}>
            {idCardFrontImage ? (
              <div className="image-preview-container">
                <img src={idCardFrontImage} alt="Mặt trước CCCD" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={(e) => removeImage(e, 'front')}>
                  <X size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon-wrap"><Camera size={24} weight="regular" /></div>
                <span className="upload-hint">Nhấp để tải lên</span>
              </>
            )}
          </div>

          {/* Mặt sau */}
          <div className="upload-slot-label" style={{ marginTop: '20px' }}>Mặt sau</div>
          <input type="file" accept="image/*" ref={fileInputBackRef} style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e, 'back')} />
          <div className="upload-slot" onClick={() => fileInputBackRef.current?.click()}>
            {idCardBackImage ? (
              <div className="image-preview-container">
                <img src={idCardBackImage} alt="Mặt sau CCCD" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={(e) => removeImage(e, 'back')}>
                  <X size={14} weight="bold" />
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon-wrap"><Camera size={24} weight="regular" /></div>
                <span className="upload-hint">Nhấp để tải lên</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit — floating right */}
      <div className="invoice-frameless-actions">
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ borderRadius: '100px', padding: '12px 36px' }}>
          {loading ? 'Đang lưu...' : 'Lưu hóa đơn vào hệ thống'}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
