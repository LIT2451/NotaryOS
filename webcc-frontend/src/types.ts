export type User = {
  id: number;
  username: string;
  fullName: string;
  role: 'Admin' | 'Staff' | string;
  permissions?: string[];
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientIdNumber?: string;
  clientEmail?: string;
  amount: number;
  serviceTypeId: number;
  serviceType?: { id: number; typeName: string; category?: string };
  notaryDate: string;
  bankName?: string;
  bankAccount?: string;
  createdBy?: number;
  idCardFrontPath?: string;
  idCardBackPath?: string;
  isDeleted?: boolean;
};

export type Stats = {
  totalAmount: number;
  totalCount: number;
  uniqueClients: number;
  countByService: Array<{ serviceType: string; count: number }>;
};

export type InvoicePayload = {
  invoiceNumber: string;
  clientName: string;
  clientIdNumber: string;
  clientEmail: string;
  amount: number;
  serviceTypeId: number;
  notaryDate: string;
  bankName?: string;
  bankAccount?: string;
};

export type AuditLog = {
  id: number;
  userId: number;
  user?: User;
  action: string;
  entityType: string;
  entityId: number;
  oldValues: string;
  newValues: string;
  timestamp: string;
};
