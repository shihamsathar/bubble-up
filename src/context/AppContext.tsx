import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Customer, Machine, Technician, Vehicle, SparePart, ServiceJobCard, 
  VehicleDutyLog, UserRole, JobStatus, JobPartUsed, JobPhoto, PaymentMethod, PaymentStatus, ItemRemovalLog, JobComment
} from '../types';
import { 
  INITIAL_CUSTOMERS, INITIAL_MACHINES, INITIAL_TECHNICIANS, 
  INITIAL_VEHICLES, INITIAL_SPARE_PARTS, INITIAL_JOB_CARDS, INITIAL_DUTY_LOGS, INITIAL_REMOVAL_LOGS,
  INITIAL_MACHINE_CATEGORIES, INITIAL_PART_CATEGORIES, INITIAL_SERVICE_TYPES, INITIAL_CUSTOMER_TYPES
} from '../data/mockData';

interface AppContextType {
  // Auth & Role
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: {
    id: string;
    name: string;
    username: string;
    role: UserRole;
    technicianId?: string;
  };
  adminPassword: string;
  updateAdminPassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  loginAs: (username: string, role: UserRole, technicianId?: string) => void;
  logout: () => void;

  // Data Collections
  customers: Customer[];
  machines: Machine[];
  technicians: Technician[];
  vehicles: Vehicle[];
  spareParts: SparePart[];
  jobCards: ServiceJobCard[];
  dutyLogs: VehicleDutyLog[];
  removalLogs: ItemRemovalLog[];

  // Dynamic Categories
  machineCategories: string[];
  partCategories: string[];
  serviceTypes: string[];
  customerTypes: string[];
  addMachineCategory: (cat: string) => void;
  addPartCategory: (cat: string) => void;
  addServiceType: (type: string) => void;
  addCustomerType: (type: string) => void;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalMachines' | 'totalServiceCalls' | 'outstandingBalance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Machine Actions
  addMachine: (machine: Omit<Machine, 'id' | 'totalRepairsCount'>) => Machine;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  deleteMachine: (id: string, reason?: string, details?: string) => void;
  removeMachineWithReason: (id: string, reason: string, details?: string) => void;

  // Technician Actions
  addTechnician: (tech: Omit<Technician, 'id' | 'completedJobsCount' | 'rating'>) => Technician;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  deleteTechnician: (id: string, reason?: string, details?: string) => void;

  // Vehicle Actions
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Vehicle & Duty Workflow
  startTechnicianDuty: (technicianId: string, vehicleId: string, startMileage: number, notes?: string) => boolean;
  endTechnicianDuty: (technicianId: string, endMileage: number, notes?: string) => boolean;

  // Spare Parts Actions
  addSparePart: (part: Omit<SparePart, 'id'>) => SparePart;
  updateSparePart: (id: string, updates: Partial<SparePart>) => void;
  deleteSparePart: (id: string, reason?: string, details?: string) => void;
  removeSparePartWithReason: (id: string, reason: string, details?: string) => void;
  adjustStock: (partId: string, deltaQty: number) => void;

  // Job Cards Actions
  createJobCard: (job: Partial<ServiceJobCard>) => ServiceJobCard;
  updateJobCard: (id: string, updates: Partial<ServiceJobCard>) => void;
  updateJobStatus: (id: string, newStatus: JobStatus) => void;
  startJobWorkTimer: (jobId: string) => void;
  pauseJobWorkTimer: (jobId: string) => void;
  stopJobWorkTimer: (jobId: string, markCompleted?: boolean) => void;
  addPartToJob: (jobId: string, partId: string, quantity: number) => void;
  removePartFromJob: (jobId: string, partUsedId: string) => void;
  addPhotoToJob: (jobId: string, photo: Omit<JobPhoto, 'id' | 'timestamp'>) => void;
  addJobComment: (jobId: string, text: string, isUrgent?: boolean) => void;
  recordJobPayment: (jobId: string, amount: number, method: PaymentMethod, invoiceNumber?: string) => void;
  deleteJobCard: (id: string) => void;

  // Reset & Clear records
  clearAllRecords: () => void;
  resetAllData: () => void;

  // Global Search / Notification toast
  notification: string | null;
  showNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH_STATE: 'bubbleup_clean_auth_v2',
  CUSTOMERS: 'bubbleup_clean_customers_v2',
  MACHINES: 'bubbleup_clean_machines_v2',
  TECHNICIANS: 'bubbleup_clean_technicians_v2',
  VEHICLES: 'bubbleup_clean_vehicles_v2',
  PARTS: 'bubbleup_clean_parts_v2',
  JOBS: 'bubbleup_clean_jobs_v2',
  DUTY_LOGS: 'bubbleup_clean_duty_logs_v2',
  REMOVAL_LOGS: 'bubbleup_clean_removal_logs_v2',
  CURRENT_ROLE: 'bubbleup_clean_role_v2',
  CURRENT_USER: 'bubbleup_clean_user_v2',
  ADMIN_PASSWORD: 'bubbleup_admin_password_v2',
};

const getStoredItem = (primaryKey: string, legacyKey?: string) => {
  const item = localStorage.getItem(primaryKey);
  if (item) return item;
  if (legacyKey) {
    const legacyItem = localStorage.getItem(legacyKey);
    if (legacyItem) return legacyItem;
  }
  return null;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Admin password management (persisted in localStorage, default 'admin123')
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    return saved ? saved : 'admin123';
  });

  // Clean empty initial data collections for fresh records entry
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MACHINES);
    return saved ? JSON.parse(saved) : [];
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : [];
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [jobCards, setJobCards] = useState<ServiceJobCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    return saved ? JSON.parse(saved) : [];
  });

  const [dutyLogs, setDutyLogs] = useState<VehicleDutyLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DUTY_LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [removalLogs, setRemovalLogs] = useState<ItemRemovalLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMOVAL_LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [machineCategories, setMachineCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('bubbleup_cat_machines_v2');
    return saved ? JSON.parse(saved) : INITIAL_MACHINE_CATEGORIES;
  });

  const [partCategories, setPartCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('bubbleup_cat_parts_v2');
    return saved ? JSON.parse(saved) : INITIAL_PART_CATEGORIES;
  });

  const [serviceTypes, setServiceTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('bubbleup_cat_services_v2');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_TYPES;
  });

  const [customerTypes, setCustomerTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('bubbleup_cat_customertypes_v2');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_TYPES;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return saved ? JSON.parse(saved) : false;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
    return (saved as UserRole) || 'ADMIN';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : {
      id: 'admin-1',
      name: 'System Administrator',
      username: 'admin',
      role: 'ADMIN' as UserRole
    };
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const updateAdminPassword = (oldPass: string, newPass: string): { success: boolean; message: string } => {
    if (oldPass !== adminPassword) {
      return { success: false, message: 'Current password does not match.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }
    const cleanPass = newPass.trim();
    setAdminPassword(cleanPass);
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, cleanPass);
    showNotification('Admin password updated successfully');
    return { success: true, message: 'Password successfully changed.' };
  };

  const clearAllRecords = () => {
    setCustomers([]);
    setMachines([]);
    setVehicles([]);
    setSpareParts([]);
    setJobCards([]);
    setDutyLogs([]);
    setRemovalLogs([]);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DUTY_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REMOVAL_LOGS, JSON.stringify([]));
    showNotification('All records cleared. The system is ready for fresh data entry.');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(spareParts));
  }, [spareParts]);

  useEffect(() => {
    localStorage.setItem('bubbleup_cat_machines_v1', JSON.stringify(machineCategories));
  }, [machineCategories]);

  useEffect(() => {
    localStorage.setItem('bubbleup_cat_parts_v1', JSON.stringify(partCategories));
  }, [partCategories]);

  useEffect(() => {
    localStorage.setItem('bubbleup_cat_services_v1', JSON.stringify(serviceTypes));
  }, [serviceTypes]);

  useEffect(() => {
    localStorage.setItem('bubbleup_cat_customertypes_v1', JSON.stringify(customerTypes));
  }, [customerTypes]);

  const addMachineCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    const formatted = trimmed.toUpperCase().replace(/\s+/g, '_');
    if (machineCategories.includes(formatted)) {
      showNotification(`Category "${trimmed}" already exists`);
      return;
    }
    setMachineCategories(prev => [...prev, formatted]);
    showNotification(`New Machine Category added: ${trimmed}`);
  };

  const addPartCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    const formatted = trimmed.toUpperCase().replace(/\s+/g, '_');
    if (partCategories.includes(formatted)) {
      showNotification(`Part Category "${trimmed}" already exists`);
      return;
    }
    setPartCategories(prev => [...prev, formatted]);
    showNotification(`New Spare Part Category added: ${trimmed}`);
  };

  const addServiceType = (type: string) => {
    const trimmed = type.trim();
    if (!trimmed) return;
    const formatted = trimmed.toUpperCase().replace(/\s+/g, '_');
    if (serviceTypes.includes(formatted)) {
      showNotification(`Service Type "${trimmed}" already exists`);
      return;
    }
    setServiceTypes(prev => [...prev, formatted]);
    showNotification(`New Service Type added: ${trimmed}`);
  };

  const addCustomerType = (type: string) => {
    const trimmed = type.trim();
    if (!trimmed) return;
    const formatted = trimmed.toUpperCase().replace(/\s+/g, '_');
    if (customerTypes.includes(formatted)) {
      showNotification(`Customer Type "${trimmed}" already exists`);
      return;
    }
    setCustomerTypes(prev => [...prev, formatted]);
    showNotification(`New Customer Type added: ${trimmed}`);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DUTY_LOGS, JSON.stringify(dutyLogs));
  }, [dutyLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMOVAL_LOGS, JSON.stringify(removalLogs));
  }, [removalLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    if (role === 'ADMIN') {
      setCurrentUser({
        id: 'admin-1',
        name: 'Operations Director (Admin)',
        username: 'admin',
        role: 'ADMIN'
      });
      showNotification('Switched to Administrator Workspace');
    } else {
      const defaultTech = technicians[0] || INITIAL_TECHNICIANS[0] || {
        id: 'tech-1',
        fullName: 'Tariq Mansoor',
        username: 'tariq.m',
        email: 'tariq@bubbleup.qa',
        phone: '+974 5551 2345',
        specialization: 'Industrial Washers & Hydro Extractors',
        status: 'AVAILABLE',
        completedJobsCount: 0,
        rating: 4.9
      };
      setCurrentUser({
        id: defaultTech.id,
        name: defaultTech.fullName,
        username: defaultTech.username,
        role: 'TECHNICIAN',
        technicianId: defaultTech.id
      });
      showNotification(`Switched to Field Technician Workspace (${defaultTech.fullName})`);
    }
  };

  const loginAs = (username: string, role: UserRole, technicianId?: string) => {
    setCurrentRoleState(role);
    setIsAuthenticated(true);
    if (role === 'ADMIN') {
      setCurrentUser({
        id: 'admin-1',
        name: 'Operations Director (Admin)',
        username: username || 'admin',
        role: 'ADMIN'
      });
      showNotification('Successfully authenticated as Administrator');
    } else {
      const cleanUser = (username || '').trim().toLowerCase();
      const defaultTech = INITIAL_TECHNICIANS[0] || {
        id: 'tech-1',
        fullName: 'Tariq Mansoor',
        username: 'tariq.m',
        email: 'tariq@bubbleup.qa',
        phone: '+974 5551 2345',
        specialization: 'Industrial Washers & Hydro Extractors',
        status: 'AVAILABLE',
        completedJobsCount: 0,
        rating: 4.9
      };

      const matchedTech = technicians.find(t => 
        (technicianId && t.id === technicianId) ||
        (cleanUser && t.username.toLowerCase() === cleanUser) ||
        (cleanUser && t.id.toLowerCase() === cleanUser) ||
        (cleanUser && t.employeeId?.toLowerCase() === cleanUser)
      ) || technicians[0] || defaultTech;

      setCurrentUser({
        id: matchedTech.id,
        name: matchedTech.fullName,
        username: matchedTech.username,
        role: 'TECHNICIAN',
        technicianId: matchedTech.id
      });
      showNotification(`Successfully authenticated as Technician (${matchedTech.fullName})`);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRoleState('ADMIN');
    setCurrentUser({
      id: 'admin-1',
      name: 'System Administrator',
      username: 'admin',
      role: 'ADMIN'
    });
    showNotification('Logged out from Bubble Up Portal');
  };

  // --- Customer Handlers ---
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalMachines' | 'totalServiceCalls' | 'outstandingBalance'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalMachines: 0,
      totalServiceCalls: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);
    showNotification(`Customer "${newCust.companyName}" registered`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showNotification('Customer record updated');
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showNotification('Customer record deleted');
  };

  // --- Machine Handlers ---
  const addMachine = (machineData: Omit<Machine, 'id' | 'totalRepairsCount'>) => {
    const newMach: Machine = {
      ...machineData,
      id: `mach-${Date.now()}`,
      totalRepairsCount: 0,
    };
    setMachines(prev => [newMach, ...prev]);
    // update customer machine count
    setCustomers(prev => prev.map(c => c.id === newMach.customerId ? { ...c, totalMachines: c.totalMachines + 1 } : c));
    showNotification(`Machine "${newMach.brand} ${newMach.model}" registered`);
    return newMach;
  };

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    showNotification('Machine equipment details updated');
  };

  const deleteMachine = (id: string, reason?: string, details?: string) => {
    const machine = machines.find(m => m.id === id);
    if (!machine) return;

    // Log removal with audit trace
    const auditReason = reason || 'Equipment decommissioned/removed from active registry';
    const newLog: ItemRemovalLog = {
      id: `rem-${Date.now()}`,
      itemType: 'MACHINE',
      itemId: machine.id,
      itemIdentifier: machine.serialNumber,
      itemName: `${machine.brand} ${machine.model}`,
      removedByUserId: currentUser.id,
      removedByUserName: currentUser.name,
      removedByUserRole: currentRole,
      reason: auditReason,
      removedAt: new Date().toISOString(),
      details: details || `Removed from ${machine.customerName} (${machine.machineLocation})`
    };

    setRemovalLogs(prev => [newLog, ...prev]);

    setCustomers(prev => prev.map(c => c.id === machine.customerId ? { ...c, totalMachines: Math.max(0, c.totalMachines - 1) } : c));
    setMachines(prev => prev.filter(m => m.id !== id));
    showNotification(`Machine "${machine.brand} ${machine.model}" removed. Audit reason logged.`);
  };

  const removeMachineWithReason = (id: string, reason: string, details?: string) => {
    deleteMachine(id, reason, details);
  };

  // --- Technician Handlers ---
  const addTechnician = (techData: Omit<Technician, 'id' | 'completedJobsCount' | 'rating'>) => {
    const newTech: Technician = {
      ...techData,
      id: `tech-${Date.now()}`,
      completedJobsCount: 0,
      rating: 5.0,
      currentDutyStatus: 'OFF_DUTY'
    };
    setTechnicians(prev => [...prev, newTech]);
    showNotification(`Technician "${newTech.fullName}" added`);
    return newTech;
  };

  const updateTechnician = (id: string, updates: Partial<Technician>) => {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showNotification('Technician profile updated');
  };

  const deleteTechnician = (id: string, reason?: string, details?: string) => {
    const tech = technicians.find(t => t.id === id);
    if (!tech) return;

    // Log removal with audit trace
    const auditReason = reason || 'Technician staff profile decommissioned / removed';
    const newLog: ItemRemovalLog = {
      id: `rem-${Date.now()}`,
      itemType: 'TECHNICIAN',
      itemId: tech.id,
      itemIdentifier: tech.employeeId,
      itemName: tech.fullName,
      removedByUserId: currentUser.id,
      removedByUserName: currentUser.name,
      removedByUserRole: currentRole,
      reason: auditReason,
      removedAt: new Date().toLocaleString(),
      details: details || `Designation: ${tech.position} | Specialization: ${tech.specialization}`
    };
    setRemovalLogs(prev => [newLog, ...prev]);

    // Release assigned vehicle if any
    if (tech.assignedVehicleId) {
      setVehicles(prev => prev.map(v => v.id === tech.assignedVehicleId ? {
        ...v,
        status: 'AVAILABLE',
        assignedTechnicianId: undefined,
        assignedTechnicianName: undefined
      } : v));
    }

    setTechnicians(prev => prev.filter(t => t.id !== id));
    showNotification(`Technician "${tech.fullName}" removed from registry`);
  };

  // --- Vehicle Handlers ---
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`
    };
    setVehicles(prev => [...prev, newVeh]);
    showNotification(`Vehicle "${newVeh.registrationNumber}" registered`);
    return newVeh;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    showNotification('Vehicle information updated');
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    showNotification('Vehicle deleted');
  };

  // --- Vehicle & Duty Workflow ---
  const startTechnicianDuty = (technicianId: string, vehicleId: string, startMileage: number, notes?: string): boolean => {
    const targetVehicle = vehicles.find(v => v.id === vehicleId);
    const targetTech = technicians.find(t => t.id === technicianId);

    if (!targetVehicle || !targetTech) return false;

    // Check if vehicle already assigned to someone else
    if (targetVehicle.status === 'ASSIGNED' && targetVehicle.assignedTechnicianId !== technicianId) {
      showNotification(`Vehicle ${targetVehicle.registrationNumber} is currently assigned to another technician!`);
      return false;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isoString = now.toISOString();

    // 1. Update Technician
    setTechnicians(prev => prev.map(t => t.id === technicianId ? {
      ...t,
      currentDutyStatus: 'ON_DUTY',
      assignedVehicleId: vehicleId,
      dutyStartTime: isoString,
      dutyEndTime: undefined,
      dutyStartMileage: startMileage,
      currentDutyVehicleReg: targetVehicle.registrationNumber
    } : t));

    // 2. Update Vehicle
    setVehicles(prev => prev.map(v => v.id === vehicleId ? {
      ...v,
      status: 'ASSIGNED',
      assignedTechnicianId: technicianId,
      assignedTechnicianName: targetTech.fullName,
      currentMileage: startMileage,
      lastAssignedAt: isoString
    } : v));

    // 3. Create Duty Log
    const newLog: VehicleDutyLog = {
      id: `duty-${Date.now()}`,
      technicianId,
      technicianName: targetTech.fullName,
      vehicleId,
      vehicleReg: targetVehicle.registrationNumber,
      vehicleModel: `${targetVehicle.make} ${targetVehicle.model}`,
      date: now.toISOString().split('T')[0],
      startTime: timeString,
      startMileage,
      status: 'ACTIVE',
      notes: notes || 'Daily field service dispatch started'
    };
    setDutyLogs(prev => [newLog, ...prev]);

    showNotification(`Duty Started: ${targetTech.fullName} assigned to ${targetVehicle.registrationNumber} at ${startMileage} km`);
    return true;
  };

  const endTechnicianDuty = (technicianId: string, endMileage: number, notes?: string): boolean => {
    const targetTech = technicians.find(t => t.id === technicianId);
    if (!targetTech || targetTech.currentDutyStatus !== 'ON_DUTY') return false;

    const vehicleId = targetTech.assignedVehicleId;
    const startMileage = targetTech.dutyStartMileage || endMileage;
    const distanceKm = Math.max(0, endMileage - startMileage);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isoString = now.toISOString();

    // Calculate duration in minutes if startTime is known
    let durationMins = 0;
    if (targetTech.dutyStartTime) {
      const startMs = new Date(targetTech.dutyStartTime).getTime();
      const endMs = now.getTime();
      durationMins = Math.max(1, Math.round((endMs - startMs) / 60000));
    }

    // 1. Update Technician to OFF_DUTY & free vehicle
    setTechnicians(prev => prev.map(t => t.id === technicianId ? {
      ...t,
      currentDutyStatus: 'OFF_DUTY',
      dutyEndTime: isoString,
      assignedVehicleId: undefined,
      currentDutyVehicleReg: undefined
    } : t));

    // 2. Update Vehicle back to AVAILABLE
    if (vehicleId) {
      setVehicles(prev => prev.map(v => v.id === vehicleId ? {
        ...v,
        status: 'AVAILABLE',
        assignedTechnicianId: undefined,
        assignedTechnicianName: undefined,
        currentMileage: Math.max(v.currentMileage, endMileage)
      } : v));
    }

    // 3. Update active Duty Log
    setDutyLogs(prev => prev.map(log => {
      if (log.technicianId === technicianId && log.status === 'ACTIVE') {
        return {
          ...log,
          endTime: timeString,
          endMileage,
          distanceCoveredKm: distanceKm,
          durationMinutes: durationMins,
          status: 'COMPLETED',
          notes: notes ? `${log.notes} | End: ${notes}` : log.notes
        };
      }
      return log;
    }));

    showNotification(`Duty Completed: ${targetTech.fullName} logged ${distanceKm} km covered (${durationMins} mins total)`);
    return true;
  };

  // --- Spare Parts Handlers ---
  const addSparePart = (partData: Omit<SparePart, 'id'>) => {
    const newPart: SparePart = {
      ...partData,
      id: `part-${Date.now()}`
    };
    setSpareParts(prev => [...prev, newPart]);
    showNotification(`Part "${newPart.partNumber}" added to catalog`);
    return newPart;
  };

  const updateSparePart = (id: string, updates: Partial<SparePart>) => {
    setSpareParts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showNotification('Spare part details updated');
  };

  const deleteSparePart = (id: string, reason?: string, details?: string) => {
    const part = spareParts.find(p => p.id === id);
    if (!part) return;

    const auditReason = reason || 'Spare part written off / removed from inventory';
    const newLog: ItemRemovalLog = {
      id: `rem-${Date.now()}`,
      itemType: 'SPARE_PART',
      itemId: part.id,
      itemIdentifier: part.partNumber,
      itemName: part.name,
      removedByUserId: currentUser.id,
      removedByUserName: currentUser.name,
      removedByUserRole: currentRole,
      reason: auditReason,
      removedAt: new Date().toISOString(),
      details: details || `Category: ${part.category}, Bin: ${part.storageLocation}, Stock removed: ${part.stockQuantity} units`
    };

    setRemovalLogs(prev => [newLog, ...prev]);
    setSpareParts(prev => prev.filter(p => p.id !== id));
    showNotification(`Part "${part.partNumber}" removed from inventory. Audit reason logged.`);
  };

  const removeSparePartWithReason = (id: string, reason: string, details?: string) => {
    deleteSparePart(id, reason, details);
  };

  const adjustStock = (partId: string, deltaQty: number) => {
    setSpareParts(prev => prev.map(p => {
      if (p.id === partId) {
        const newStock = Math.max(0, p.stockQuantity + deltaQty);
        return { ...p, stockQuantity: newStock };
      }
      return p;
    }));
  };

  // --- Job Cards Handlers ---
  const createJobCard = (jobData: Partial<ServiceJobCard>): ServiceJobCard => {
    const seqNum = jobCards.length + 101;
    const year = new Date().getFullYear();
    const jobCardNumber = `JC-${year}-${String(seqNum).padStart(6, '0')}`;

    const newJob: ServiceJobCard = {
      id: `job-${Date.now()}`,
      jobCardNumber,
      customerId: jobData.customerId || '',
      customerName: jobData.customerName || 'Unknown Customer',
      customerContact: jobData.customerContact || '',
      customerPhone: jobData.customerPhone || '',
      customerEmail: jobData.customerEmail || '',
      customerAddress: jobData.customerAddress || '',
      customerArea: jobData.customerArea || '',
      customerCity: jobData.customerCity || 'Dubai',
      customerTaxNumber: jobData.customerTaxNumber || '',
      
      machineId: jobData.machineId || '',
      machineBrand: jobData.machineBrand || 'General',
      machineModel: jobData.machineModel || 'Commercial Model',
      machineSerial: jobData.machineSerial || 'N/A',
      machineCategory: jobData.machineCategory || 'COMMERCIAL_WASHER_EXTRACTOR',
      machineCapacity: jobData.machineCapacity || 20,
      machineLocation: jobData.machineLocation || 'Main Laundry Area',
      installationDate: jobData.installationDate || '',
      warrantyStatus: jobData.warrantyStatus || 'ACTIVE',
      warrantyEndDate: jobData.warrantyEndDate || '',

      serviceRequestDate: jobData.serviceRequestDate || new Date().toISOString().split('T')[0],
      scheduledDate: jobData.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: jobData.scheduledTime || '10:00 AM',
      assignedTechnicianId: jobData.assignedTechnicianId || '',
      assignedTechnicianName: jobData.assignedTechnicianName || 'Unassigned',
      priority: jobData.priority || 'MEDIUM',
      serviceType: jobData.serviceType || 'BREAKDOWN_REPAIR',

      problemDescription: jobData.problemDescription || '',
      customerComplaint: jobData.customerComplaint || '',
      initialDiagnosis: jobData.initialDiagnosis || '',
      faultCause: jobData.faultCause || '',
      repairRequired: jobData.repairRequired || '',
      workPerformed: jobData.workPerformed || '',
      finalDiagnosis: jobData.finalDiagnosis || '',
      status: jobData.status || (jobData.assignedTechnicianId ? 'ASSIGNED' : 'NEW'),

      partsUsed: jobData.partsUsed || [],
      photos: jobData.photos || [],

      laborCharges: jobData.laborCharges || 150.00,
      travelCharges: jobData.travelCharges || 50.00,
      partsTotal: jobData.partsTotal || 0,
      subtotal: (jobData.laborCharges || 150) + (jobData.travelCharges || 50) + (jobData.partsTotal || 0),
      taxRatePercent: 5.0,
      taxAmount: ((jobData.laborCharges || 150) + (jobData.travelCharges || 50) + (jobData.partsTotal || 0)) * 0.05,
      discountAmount: 0,
      totalAmount: ((jobData.laborCharges || 150) + (jobData.travelCharges || 50) + (jobData.partsTotal || 0)) * 1.05,

      advancePaid: jobData.advancePaid || 0,
      paidAmount: jobData.paidAmount || 0,
      outstandingBalance: (((jobData.laborCharges || 150) + (jobData.travelCharges || 50) + (jobData.partsTotal || 0)) * 1.05) - (jobData.paidAmount || 0),
      paymentStatus: jobData.paymentStatus || 'UNPAID',
      paymentMethod: jobData.paymentMethod,
      invoiceNumber: jobData.invoiceNumber || `INV-${year}-${String(seqNum).padStart(5, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],

      technicianRemarks: jobData.technicianRemarks || '',
      customerRemarks: jobData.customerRemarks || '',
      
      // Initialize live work timer if technician is assigned
      workStartedAt: jobData.assignedTechnicianId ? (jobData.workStartedAt || new Date().toISOString()) : undefined,
      isWorkTimerRunning: !!jobData.assignedTechnicianId,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setJobCards(prev => [newJob, ...prev]);

    // Update customer service call count
    if (newJob.customerId) {
      setCustomers(prev => prev.map(c => c.id === newJob.customerId ? { ...c, totalServiceCalls: c.totalServiceCalls + 1 } : c));
    }

    showNotification(`Job Card ${newJob.jobCardNumber} created successfully!`);
    return newJob;
  };

  const updateJobCard = (id: string, updates: Partial<ServiceJobCard>) => {
    setJobCards(prev => prev.map(job => {
      if (job.id === id) {
        const merged = { ...job, ...updates, updatedAt: new Date().toISOString() };
        // Recalculate totals
        const partsTotal = merged.partsUsed.reduce((sum, p) => sum + p.totalPrice, 0);
        const subtotal = merged.laborCharges + merged.travelCharges + partsTotal;
        const discount = merged.discountAmount || 0;
        const subtotalAfterDisc = Math.max(0, subtotal - discount);
        const taxAmount = (subtotalAfterDisc * (merged.taxRatePercent || 5.0)) / 100;
        const totalAmount = subtotalAfterDisc + taxAmount;
        const outstanding = Math.max(0, totalAmount - (merged.paidAmount || 0));

        let paymentStatus: PaymentStatus = merged.paymentStatus;
        if (merged.paidAmount >= totalAmount && totalAmount > 0) {
          paymentStatus = 'PAID';
        } else if (merged.paidAmount > 0) {
          paymentStatus = 'PARTIAL';
        } else if (totalAmount === 0 && merged.serviceType === 'WARRANTY_SERVICE') {
          paymentStatus = 'PAID';
        }

        return {
          ...merged,
          partsTotal,
          subtotal,
          taxAmount,
          totalAmount,
          outstandingBalance: outstanding,
          paymentStatus
        };
      }
      return job;
    }));
    showNotification('Job card updated');
  };

  const startJobWorkTimer = (jobId: string) => {
    const now = new Date().toISOString();
    setJobCards(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          workStartedAt: job.workStartedAt || now,
          isWorkTimerRunning: true,
          workCompletedAt: undefined,
          status: job.status === 'NEW' || job.status === 'ASSIGNED' ? 'IN_PROGRESS' : job.status,
          updatedAt: now
        };
      }
      return job;
    }));
    showNotification('Live job work timer started');
  };

  const pauseJobWorkTimer = (jobId: string) => {
    const now = new Date().toISOString();
    setJobCards(prev => prev.map(job => {
      if (job.id === jobId) {
        // Compute duration up to pause
        let currentDuration = job.actualWorkDurationMinutes || 0;
        if (job.workStartedAt) {
          const startMs = new Date(job.workStartedAt).getTime();
          const nowMs = Date.now();
          currentDuration += Math.max(1, Math.round((nowMs - startMs) / 60000));
        }
        return {
          ...job,
          isWorkTimerRunning: false,
          actualWorkDurationMinutes: currentDuration,
          updatedAt: now
        };
      }
      return job;
    }));
    showNotification('Job work timer paused');
  };

  const stopJobWorkTimer = (jobId: string, markCompleted: boolean = true) => {
    const now = new Date();
    const nowIso = now.toISOString();
    setJobCards(prev => prev.map(job => {
      if (job.id === jobId) {
        let durationMins = job.actualWorkDurationMinutes || 0;
        if (job.workStartedAt) {
          const startMs = new Date(job.workStartedAt).getTime();
          durationMins = Math.max(1, Math.round((now.getTime() - startMs) / 60000));
        }

        if (markCompleted && job.assignedTechnicianId && job.status !== 'COMPLETED') {
          // Increment technician's completed count
          setTechnicians(tList => tList.map(t => t.id === job.assignedTechnicianId ? { ...t, completedJobsCount: (t.completedJobsCount || 0) + 1 } : t));
        }

        return {
          ...job,
          isWorkTimerRunning: false,
          workCompletedAt: nowIso,
          actualWorkDurationMinutes: durationMins,
          status: markCompleted ? 'COMPLETED' : job.status,
          completedAt: markCompleted ? nowIso : job.completedAt,
          updatedAt: nowIso
        };
      }
      return job;
    }));
    showNotification(`Work Finished! Duration logged & synced to Admin Dashboard.`);
  };

  const updateJobStatus = (id: string, newStatus: JobStatus) => {
    setJobCards(prev => prev.map(job => {
      if (job.id === id) {
        const isCompleting = newStatus === 'COMPLETED' && job.status !== 'COMPLETED';
        const nowIso = new Date().toISOString();

        if (isCompleting && job.assignedTechnicianId) {
          // Increment technician's completed count
          setTechnicians(tList => tList.map(t => t.id === job.assignedTechnicianId ? { ...t, completedJobsCount: (t.completedJobsCount || 0) + 1 } : t));
        }

        let durationMins = job.actualWorkDurationMinutes;
        if (isCompleting && job.workStartedAt) {
          const startMs = new Date(job.workStartedAt).getTime();
          durationMins = Math.max(1, Math.round((Date.now() - startMs) / 60000));
        }

        return {
          ...job,
          status: newStatus,
          isWorkTimerRunning: isCompleting ? false : job.isWorkTimerRunning,
          workStartedAt: (newStatus === 'IN_PROGRESS' || newStatus === 'ARRIVED') && !job.workStartedAt ? nowIso : job.workStartedAt,
          workCompletedAt: isCompleting ? nowIso : job.workCompletedAt,
          actualWorkDurationMinutes: isCompleting ? durationMins : job.actualWorkDurationMinutes,
          completedAt: isCompleting ? nowIso : job.completedAt,
          updatedAt: nowIso
        };
      }
      return job;
    }));
    showNotification(`Job status changed to: ${newStatus.replace(/_/g, ' ')}`);
  };

  const addPartToJob = (jobId: string, partId: string, quantity: number) => {
    const part = spareParts.find(p => p.id === partId);
    if (!part) return;

    // Deduct from inventory
    adjustStock(partId, -quantity);

    const lineTotal = part.sellingPrice * quantity;
    const newPartUsed: JobPartUsed = {
      id: `pu-${Date.now()}`,
      partId: part.id,
      partNumber: part.partNumber,
      partName: part.name,
      unitPrice: part.sellingPrice,
      quantity,
      totalPrice: lineTotal
    };

    setJobCards(prev => prev.map(job => {
      if (job.id === jobId) {
        const updatedParts = [...job.partsUsed, newPartUsed];
        const partsTotal = updatedParts.reduce((sum, p) => sum + p.totalPrice, 0);
        const subtotal = job.laborCharges + job.travelCharges + partsTotal;
        const taxAmount = (subtotal * (job.taxRatePercent || 5)) / 100;
        const totalAmount = subtotal + taxAmount;
        const outstanding = Math.max(0, totalAmount - job.paidAmount);

        return {
          ...job,
          partsUsed: updatedParts,
          partsTotal,
          subtotal,
          taxAmount,
          totalAmount,
          outstandingBalance: outstanding,
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    }));

    showNotification(`Added ${quantity}x ${part.partNumber} to Job Card. Stock deducted.`);
  };

  const removePartFromJob = (jobId: string, partUsedId: string) => {
    const job = jobCards.find(j => j.id === jobId);
    if (!job) return;

    const partUsed = job.partsUsed.find(p => p.id === partUsedId);
    if (partUsed) {
      // Return stock
      adjustStock(partUsed.partId, partUsed.quantity);
    }

    setJobCards(prev => prev.map(j => {
      if (j.id === jobId) {
        const updatedParts = j.partsUsed.filter(p => p.id !== partUsedId);
        const partsTotal = updatedParts.reduce((sum, p) => sum + p.totalPrice, 0);
        const subtotal = j.laborCharges + j.travelCharges + partsTotal;
        const taxAmount = (subtotal * (j.taxRatePercent || 5)) / 100;
        const totalAmount = subtotal + taxAmount;
        const outstanding = Math.max(0, totalAmount - j.paidAmount);

        return {
          ...j,
          partsUsed: updatedParts,
          partsTotal,
          subtotal,
          taxAmount,
          totalAmount,
          outstandingBalance: outstanding,
          updatedAt: new Date().toISOString()
        };
      }
      return j;
    }));

    showNotification('Spare part removed from job card and returned to stock');
  };

  const addPhotoToJob = (jobId: string, photoData: Omit<JobPhoto, 'id' | 'timestamp'>) => {
    const newPhoto: JobPhoto = {
      ...photoData,
      id: `ph-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
    };

    setJobCards(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          photos: [...job.photos, newPhoto],
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    }));

    showNotification('Job photo attached successfully');
  };

  const addJobComment = (jobId: string, text: string, isUrgent: boolean = false) => {
    if (!text.trim()) return;
    const authorName = currentUser.name || (currentRole === 'ADMIN' ? 'Operations Admin' : 'Field Technician');
    const newComment: JobComment = {
      id: `comm-${Date.now()}`,
      jobId,
      authorId: currentUser.id || currentUser.username,
      authorName,
      authorRole: currentRole,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isUrgent,
    };

    setJobCards(prev => prev.map(job => {
      if (job.id === jobId) {
        const comments = job.comments || [];
        return {
          ...job,
          comments: [...comments, newComment],
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    }));

    showNotification(`Note logged on Job Card by ${currentRole === 'ADMIN' ? 'Admin' : 'Technician'}`);
  };

  const recordJobPayment = (jobId: string, amount: number, method: PaymentMethod, invoiceNumber?: string) => {
    setJobCards(prev => prev.map(job => {
      if (job.id === jobId) {
        const newPaid = job.paidAmount + amount;
        const outstanding = Math.max(0, job.totalAmount - newPaid);
        let paymentStatus: PaymentStatus = 'PARTIAL';
        if (outstanding <= 0) {
          paymentStatus = 'PAID';
        }

        return {
          ...job,
          paidAmount: newPaid,
          outstandingBalance: outstanding,
          paymentStatus,
          paymentMethod: method,
          invoiceNumber: invoiceNumber || job.invoiceNumber,
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    }));

    showNotification(`Payment of QAR ${amount.toFixed(2)} recorded via ${method.replace(/_/g, ' ')}`);
  };

  const deleteJobCard = (id: string) => {
    setJobCards(prev => prev.filter(j => j.id !== id));
    showNotification('Job Card deleted');
  };

  const resetAllData = () => {
    localStorage.clear();
    setCustomers(INITIAL_CUSTOMERS);
    setMachines(INITIAL_MACHINES);
    setTechnicians(INITIAL_TECHNICIANS);
    setVehicles(INITIAL_VEHICLES);
    setSpareParts(INITIAL_SPARE_PARTS);
    setJobCards(INITIAL_JOB_CARDS);
    setDutyLogs(INITIAL_DUTY_LOGS);
    setRemovalLogs(INITIAL_REMOVAL_LOGS);
    setIsAuthenticated(false);
    setCurrentRoleState('ADMIN');
    setCurrentUser({
      id: 'admin-1',
      name: 'System Administrator',
      username: 'admin',
      role: 'ADMIN'
    });
    showNotification('System database reset to clean demonstration state');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentRole,
        setCurrentRole,
        currentUser,
        adminPassword,
        updateAdminPassword,
        loginAs,
        logout,
        customers,
        machines,
        technicians,
        vehicles,
        spareParts,
        jobCards,
        dutyLogs,
        removalLogs,
        machineCategories,
        partCategories,
        serviceTypes,
        customerTypes,
        addMachineCategory,
        addPartCategory,
        addServiceType,
        addCustomerType,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addMachine,
        updateMachine,
        deleteMachine,
        removeMachineWithReason,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        startTechnicianDuty,
        endTechnicianDuty,
        addSparePart,
        updateSparePart,
        deleteSparePart,
        removeSparePartWithReason,
        adjustStock,
        createJobCard,
        updateJobCard,
        updateJobStatus,
        startJobWorkTimer,
        pauseJobWorkTimer,
        stopJobWorkTimer,
        addPartToJob,
        removePartFromJob,
        addPhotoToJob,
        addJobComment,
        recordJobPayment,
        deleteJobCard,
        clearAllRecords,
        resetAllData,
        notification,
        showNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
