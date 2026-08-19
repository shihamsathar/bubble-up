export type UserRole = 'ADMIN' | 'TECHNICIAN';

export const COMPANY_INFO = {
  nameEn: 'Bubble Up Trading & Maintenance',
  nameAr: 'بابل اب للتجارة والصيانة',
  crNumber: '181087',
  address: 'C.R. No:181087 I Office No: 61, Building No:43 Zone:56, Street: 100 I Doha - Qatar',
  officeNumber: 'Office No: 61, Building No: 43',
  zone: '56',
  street: '100',
  city: 'Doha',
  country: 'Qatar',
  email: 'bubbleuptrading@gmail.com',
  mobile: '+97 4 3339 335',
  whatsapp: '+97 4 3339 335',
  whatsappClean: '9743339335',
  website: 'www.bubbleuptrading.qa'
};

export type JobPriority = 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CustomerSatisfactionRating = 
  | 'SATISFIED' 
  | 'HIGHLY_SATISFIED' 
  | 'NEUTRAL' 
  | 'DISSATISFIED' 
  | 'NEEDS_FOLLOW_UP';

export type JobEscalationType = 
  | 'NONE' 
  | 'CHIEF_TECHNICIAN_REQUESTED' 
  | 'TEAM_BACKUP_REQUESTED' 
  | 'SPECIALIST_REQUIRED';

export interface TeamMemberSupport {
  technicianId: string;
  technicianName: string;
  role: string;
  assignedAt: string;
  notes?: string;
}

export type ServiceType = 
  | 'INSTALLATION' 
  | 'PREVENTATIVE_MAINTENANCE' 
  | 'BREAKDOWN_REPAIR' 
  | 'WARRANTY_SERVICE' 
  | 'EMERGENCY_CALLOUT' 
  | 'SAFETY_INSPECTION'
  | string;

export type JobStatus = 
  | 'NEW'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'PARTS_REQUIRED'
  | 'WAITING_FOR_CUSTOMER'
  | 'ESCALATED_TO_CHIEF'
  | 'TEAM_SUPPORT_ACTIVE'
  | 'COMPLETED'
  | 'INCOMPLETE'
  | 'REVISIT_REQUIRED'
  | 'REASSIGNED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'CREDIT_ACCOUNT';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHEQUE' | 'ONLINE_PORTAL' | 'CREDIT_ACCOUNT';

export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export type TechnicianDutyStatus = 'ON_DUTY' | 'OFF_DUTY' | 'ON_BREAK' | 'IN_TRANSIT';
export type DutyStatus = TechnicianDutyStatus;
export type TechnicianStatus = 'ACTIVE' | 'INACTIVE';

export type MachineCategory = 
  | 'COMMERCIAL_WASHER_EXTRACTOR'
  | 'TUMBLE_DRYER'
  | 'BARRIER_WASHER'
  | 'FLATWORK_IRONER'
  | 'STEAM_BOILER'
  | 'DRY_CLEANING_MACHINE'
  | 'HYDRO_EXTRACTOR'
  | 'FOLDING_SYSTEM'
  | string;

export type WarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'VOID' | 'EXTENDED_WARRANTY';

export type PartCategory = 
  | 'MECHANICAL' 
  | 'ELECTRICAL' 
  | 'VALVES_PLUMBING' 
  | 'HEATING_STEAM' 
  | 'BELTS_BEARINGS' 
  | 'CHEMICAL_DOSING'
  | 'BELTS' 
  | 'VALVES' 
  | 'HEATING' 
  | 'INVERTERS_BOARDS' 
  | 'BEARINGS_SEALS' 
  | 'PUMPS' 
  | 'MOTORS' 
  | 'SENSORS' 
  | 'STEAM_TRAPS' 
  | 'GASKETS'
  | string;

export type CustomerType = 
  | 'HOTEL' 
  | 'HOSPITAL' 
  | 'COMMERCIAL_LAUNDRY' 
  | 'RESORT' 
  | 'DRY_CLEANER' 
  | 'INSTITUTION' 
  | 'RESTAURANT' 
  | 'CATERING_FACILITY'
  | string;

export type ContractType = 'ANNUAL_MAINTENANCE_CONTRACT' | 'WARRANTY' | 'ON_DEMAND_SERVICE';
export type PaymentTerms = 'IMMEDIATE' | 'NET_15' | 'NET_30' | 'NET_60' | 'CREDIT_ACCOUNT';

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  whatsapp?: string;
  telephone: string;
  email: string;
  address: string;
  buildingNo?: string;
  zoneNo?: string;
  streetNo?: string;
  officeNo?: string;
  area: string;
  city: string;
  country: string;
  crNumber?: string;
  taxVatNumber?: string;
  customerType: CustomerType;
  contractType?: ContractType;
  paymentTerms?: PaymentTerms;
  totalMachines: number;
  totalServiceCalls: number;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  customerId: string;
  customerName: string;
  category: MachineCategory;
  brand: string;
  model: string;
  serialNumber: string;
  capacityKg: number;
  powerSupply: string;
  installationDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyStatus: WarrantyStatus;
  machineLocation: string;
  lastServiceDate?: string;
  nextServiceDueDate?: string;
  totalRepairsCount: number;
  status: 'OPERATIONAL' | 'NEEDS_ATTENTION' | 'BREAKDOWN' | 'DECOMMISSIONED';
  qrCodeId: string;
}

export interface Technician {
  id: string;
  employeeId: string;
  fullName: string;
  username: string;
  password?: string;
  mobile: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  joiningDate?: string;
  position: string;
  isChiefTechnician?: boolean;
  roleGrade?: 'CHIEF_TECHNICIAN' | 'SENIOR_ENGINEER' | 'FIELD_TECHNICIAN' | 'APPRENTICE';
  specialization: string | string[];
  hourlyRate?: number;
  experienceYears?: number;
  status: 'ACTIVE' | 'INACTIVE';
  assignedVehicleId?: string;
  currentDutyStatus: TechnicianDutyStatus;
  dutyStartTime?: string;
  dutyEndTime?: string;
  dutyStartMileage?: number;
  currentDutyVehicleReg?: string;
  notes?: string;
  profilePhoto?: string;
  completedJobsCount?: number;
  rating: number;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: 'SERVICE_VAN' | 'UTILITY_TRUCK' | 'PICKUP' | 'ESTATE';
  make: string;
  model: string;
  year: number;
  color: string;
  vinChassisNumber: string;
  engineNumber: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  serviceDueDate: string;
  currentMileage: number;
  status: VehicleStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  lastAssignedAt?: string;
  notes?: string;
}

export interface VehicleDutyLog {
  id: string;
  technicianId: string;
  technicianName: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleModel: string;
  date: string;
  startTime: string;
  startMileage: number;
  endTime?: string;
  endMileage?: number;
  distanceCoveredKm?: number;
  durationMinutes?: number;
  status: 'ACTIVE' | 'COMPLETED';
  notes?: string;
}

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: PartCategory;
  compatibleBrands: string | string[];
  costPrice?: number;
  unitCost?: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  storageLocation?: string;
  locationBin?: string;
  barcode?: string;
  supplier?: string;
}

export interface JobPartUsed {
  id: string;
  partId: string;
  partNumber: string;
  partName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  type: 'BEFORE_REPAIR' | 'FAULT_POINT' | 'PARTS_REPLACED' | 'AFTER_REPAIR' | 'SITE_OVERVIEW';
  timestamp: string;
}

export interface JobComment {
  id: string;
  jobId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
  isUrgent?: boolean;
}

export interface ServiceJobCard {
  id: string;
  jobCardNumber: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerArea: string;
  customerCity: string;
  customerTaxNumber?: string;
  
  machineId: string;
  machineBrand: string;
  machineModel: string;
  machineSerial: string;
  machineCategory: MachineCategory;
  machineCapacity: number;
  machineLocation: string;
  installationDate?: string;
  warrantyStatus: WarrantyStatus;
  warrantyEndDate?: string;
  
  serviceRequestDate: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  priority: JobPriority;
  serviceType: ServiceType;
  
  problemDescription: string;
  customerComplaint: string;
  initialDiagnosis?: string;
  faultCause?: string;
  repairRequired?: string;
  workPerformed?: string;
  finalDiagnosis?: string;
  status: JobStatus;
  
  partsUsed: JobPartUsed[];
  photos: JobPhoto[];
  comments?: JobComment[];
  
  laborCharges: number;
  travelCharges: number;
  partsTotal: number;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  advancePaid: number;
  paidAmount: number;
  outstandingBalance: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  invoiceNumber?: string;
  invoiceDate?: string;
  
  technicianRemarks?: string;
  customerRemarks?: string;
  revisitReason?: string;
  customerSignature?: string;
  technicianSignature?: string;
  customerSignedByName?: string;
  technicianSignedByName?: string;
  signatureDate?: string;
  
  // Customer Satisfaction & Feedback
  customerSatisfaction?: CustomerSatisfactionRating;
  customerSatisfactionNotes?: string;
  customerSatisfactionGivenAt?: string;

  // Pathway: Chief Technician & Team Escalation
  escalationStatus?: JobEscalationType;
  escalatedToChiefTechId?: string;
  escalatedToChiefTechName?: string;
  escalationReason?: string;
  escalatedAt?: string;
  teamSupportMembers?: TeamMemberSupport[];
  teamSupportNotes?: string;

  completedAt?: string;
  dutyLogId?: string;

  // Live Work Timer Tracking
  workStartedAt?: string;
  workCompletedAt?: string;
  actualWorkDurationMinutes?: number;
  isWorkTimerRunning?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface FinancialStats {
  todayRevenue: number;
  thisMonthRevenue: number;
  thisYearRevenue: number;
  totalOutstanding: number;
  totalAdvancePaid: number;
  totalCompletedRevenue: number;
  partsRevenue: number;
  laborRevenue: number;
}

export interface ItemRemovalLog {
  id: string;
  itemType: 'MACHINE' | 'SPARE_PART' | 'TECHNICIAN';
  itemId: string;
  itemIdentifier: string; // Serial number, Part number, or Employee ID
  itemName: string;
  removedByUserId: string;
  removedByUserName: string;
  removedByUserRole: UserRole;
  reason: string;
  removedAt: string;
  details?: string;
}

export interface ServiceStats {
  totalJobs: number;
  todayJobs: number;
  pendingJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  incompleteJobs: number;
  revisitRequired: number;
  partsRequired: number;
  waitingForCustomer: number;
  warrantyJobs: number;
  nonWarrantyJobs: number;
  emergencyJobs: number;
}
