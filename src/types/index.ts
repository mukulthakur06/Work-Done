// Workdone TypeScript Core Types & Domain Models

export type UserRole = 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'IDENTITY_VERIFIED'
  | 'BUSINESS_VERIFIED'
  | 'FULLY_VERIFIED'
  | 'REJECTED';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'TEMPORARILY_UNAVAILABLE';

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'RESCHEDULE_PROPOSED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type EstimateStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REVISED'
  | 'DECLINED'
  | 'EXPIRED';

export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export type ComplaintCategory =
  | 'INCOMPLETE_WORK'
  | 'SCOPE_DISPUTE'
  | 'SUSPECTED_FRAUD'
  | 'INAPPROPRIATE_CONDUCT'
  | 'NO_SHOW'
  | 'OTHER';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  address?: string | null;
  city?: string | null;
  locality?: string | null;
  pinCode?: string | null;
  preferredContact: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  bannerImage?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProfessionalService {
  id: string;
  proProfileId: string;
  categoryId: string;
  serviceName: string;
  description?: string | null;
  baseRate?: number | null;
  rateType?: 'PER_HOUR' | 'PER_JOB' | 'PER_SQFT' | string;
  isPrimary: boolean;
  category?: ServiceCategory;
}

export interface ServiceArea {
  id: string;
  proProfileId: string;
  city: string;
  locality: string;
  pinCode?: string | null;
}

export interface PortfolioMedia {
  id: string;
  projectId: string;
  mediaUrl: string;
  caption?: string | null;
  isCover: boolean;
  sortOrder: number;
}

export interface PortfolioProject {
  id: string;
  proProfileId: string;
  title: string;
  description: string;
  categoryName: string;
  projectCost?: number | null;
  completionDate?: string | null;
  createdAt: string;
  updatedAt: string;
  media: PortfolioMedia[];
}

export interface AvailabilitySchedule {
  id: string;
  proProfileId: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  isWorkingDay: boolean;
}

export interface UnavailableDate {
  id: string;
  proProfileId: string;
  date: string;
  reason?: string | null;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  businessName?: string | null;
  bio: string;
  yearsExperience: number;
  city: string;
  locality?: string | null;
  pinCode?: string | null;
  languages?: string | null;
  workingHours?: string | null;
  startingPrice?: number | null;
  pricingNotes?: string | null;
  availabilityStatus: AvailabilityStatus;
  availabilityUpdatedAt: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string | null;
  averageRating: number;
  totalReviews: number;
  completedJobsCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  services?: ProfessionalService[];
  serviceAreas?: ServiceArea[];
  portfolios?: PortfolioProject[];
  availabilitySchedules?: AvailabilitySchedule[];
  reviews?: Review[];
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  proProfileId: string;
  categoryId: string;
  serviceTitle: string;
  description: string;
  approximateLocation: string;
  city: string;
  locality?: string | null;
  pinCode?: string | null;
  requestedDate: string;
  confirmedDate?: string | null;
  rescheduledDate?: string | null;
  budgetRangeMin?: number | null;
  budgetRangeMax?: number | null;
  finalAmount?: number | null;
  status: BookingStatus;
  cancellationReason?: string | null;
  rescheduleNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerProfile & { user?: User };
  proProfile?: ProfessionalProfile & { user?: User };
  category?: ServiceCategory;
  estimates?: Estimate[];
  review?: Review | null;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus?: BookingStatus | null;
  toStatus: BookingStatus;
  actorRole: UserRole;
  actorId: string;
  note?: string | null;
  createdAt: string;
}

export interface Estimate {
  id: string;
  bookingId: string;
  estimateNumber: string;
  labourCost: number;
  materialCost: number;
  additionalCharges: number;
  totalCost: number;
  estimatedDuration: string;
  workIncluded: string;
  workExcluded?: string | null;
  paymentTerms?: string | null;
  expiresAt: string;
  status: EstimateStatus;
  customerAcceptedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateRevision {
  id: string;
  estimateId: string;
  revisionNumber: number;
  labourCost: number;
  materialCost: number;
  additionalCharges: number;
  totalCost: number;
  changeReason: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  proProfileId: string;
  overallRating: number;
  punctualityRating: number;
  workmanshipRating: number;
  communicationRating: number;
  valueRating: number;
  comment: string;
  photos?: string | null;
  proResponse?: string | null;
  proResponseDate?: string | null;
  isVerifiedBooking: boolean;
  isModerated: boolean;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerCity?: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reportedBy: string;
  reason: string;
  status: 'PENDING' | 'DISMISSED' | 'ACTIONED';
  actionTaken?: string | null;
  createdAt: string;
}

export interface SavedProfessional {
  id: string;
  customerId: string;
  proProfileId: string;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  proProfileId: string;
  stage: string;
  documentType?: string | null;
  documentNumber?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CustomerComplaint {
  id: string;
  complaintNumber: string;
  bookingId: string;
  customerId: string;
  proProfileId: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customerEmail?: string;
  customerName?: string;
  proName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  customerProfileId?: string;
  proProfileId?: string;
  expiresAt: number;
}
