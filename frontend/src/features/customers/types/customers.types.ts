export interface CustomerRecord {
  id: string;
  tenantId: string;
  fullName: string;
  mobileNumber: string;
  alternateNumber?: string;
  email?: string;
  address?: string;
  companyName?: string;
  taxNumber?: string;
  preferredCommunicationChannel?: 'EMAIL' | 'SMS' | 'WHATSAPP';
  marketingConsent: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomerCreatePayload = Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>;
export type CustomerUpdatePayload = Partial<CustomerCreatePayload>;
