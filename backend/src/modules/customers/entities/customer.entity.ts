import { BaseEntity } from '../../../shared/types/common';

export interface CustomerEntity extends BaseEntity {
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
  archivedAt?: Date;
}
