import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerType, ContractType, PaymentTerms } from '../../types';
import { createWhatsAppLink, createMailtoLink } from '../../utils/contactHelpers';
import { 
  Building, Plus, Search, Phone, Mail, MapPin, 
  Wrench, DollarSign, X, CheckCircle, Edit, Trash2, ArrowRight,
  MessageSquare, FileText, ShieldCheck, Tag, ExternalLink, Calendar
} from 'lucide-react';

export const CustomersList: React.FC = () => {
  const { 
    customers, machines, jobCards, addCustomer, updateCustomer, deleteCustomer,
    customerTypes, addCustomerType 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // New customer form state
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [zoneNo, setZoneNo] = useState('');
  const [streetNo, setStreetNo] = useState('');
  const [officeNo, setOfficeNo] = useState('');
  const [area, setArea] = useState('West Bay');
  const [city, setCity] = useState('Doha');
  const [country, setCountry] = useState('Qatar');
  const [crNumber, setCrNumber] = useState('');
  const [taxVatNumber, setTaxVatNumber] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('HOTEL');
  const [contractType, setContractType] = useState<ContractType>('ANNUAL_MAINTENANCE_CONTRACT');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('NET_30');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.crNumber && c.crNumber.includes(searchTerm)) ||
      (c.zoneNo && c.zoneNo.includes(searchTerm));

    const matchesType = typeFilter === 'ALL' || c.customerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        companyName,
        contactPerson,
        mobile,
        whatsapp: whatsapp || mobile,
        telephone,
        email,
        address,
        buildingNo,
        zoneNo,
        streetNo,
        officeNo,
        area,
        city,
        country,
        crNumber,
        taxVatNumber,
        customerType,
        contractType,
        paymentTerms,
        notes
      });
      setEditingCustomer(null);
    } else {
      addCustomer({
        companyName,
        contactPerson,
        mobile,
        whatsapp: whatsapp || mobile,
        telephone,
        email,
        address,
        buildingNo,
        zoneNo,
        streetNo,
        officeNo,
        area,
        city,
        country,
        crNumber,
        taxVatNumber,
        customerType,
        contractType,
        paymentTerms,
        notes
      });
    }

    // Reset form
    resetForm();
    setShowAddModal(false);
  };

  const startEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setCompanyName(cust.companyName);
    setContactPerson(cust.contactPerson);
    setMobile(cust.mobile);
    setWhatsapp(cust.whatsapp || cust.mobile);
    setTelephone(cust.telephone || '');
    setEmail(cust.email);
    setAddress(cust.address);
    setBuildingNo(cust.buildingNo || '');
    setZoneNo(cust.zoneNo || '');
    setStreetNo(cust.streetNo || '');
    setOfficeNo(cust.officeNo || '');
    setArea(cust.area);
    setCity(cust.city);
    setCountry(cust.country || 'Qatar');
    setCrNumber(cust.crNumber || '');
    setTaxVatNumber(cust.taxVatNumber || '');
    setCustomerType(cust.customerType);
    setContractType(cust.contractType || 'ANNUAL_MAINTENANCE_CONTRACT');
    setPaymentTerms(cust.paymentTerms || 'NET_30');
    setNotes(cust.notes || '');
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setCompanyName('');
    setContactPerson('');
    setMobile('');
    setWhatsapp('');
    setTelephone('');
    setEmail('');
    setAddress('');
    setBuildingNo('');
    setZoneNo('');
    setStreetNo('');
    setOfficeNo('');
    setArea('West Bay');
    setCity('Doha');
    setCountry('Qatar');
    setCrNumber('');
    setTaxVatNumber('');
    setCustomerType('HOTEL');
    setContractType('ANNUAL_MAINTENANCE_CONTRACT');
    setPaymentTerms('NET_30');
    setNotes('');
  };

  const handleAddNewType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    addCustomerType(newTypeName);
    setNewTypeName('');
    setShowAddTypeModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Commercial Client Directory & Facilities</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">DOHA - QATAR</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of luxury hotels, healthcare facilities, commercial laundries, resorts & direct WhatsApp/Email contacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            title="Add a new customer category"
          >
            <Tag className="w-3.5 h-3.5 text-sky-600" />
            + Add Facility Category
          </button>

          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Customer
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Company, Contact Person, Zone, CR No, or Area..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Categories ({customerTypes.length})</option>
            {customerTypes.map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Customer Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm || typeFilter !== 'ALL' 
              ? 'No matching customer profiles match your search criteria.' 
              : 'The customer directory is currently empty. Click below to register your first enterprise client.'}
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Customer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const custMachines = machines.filter(m => m.customerId === cust.id);
            const custJobs = jobCards.filter(j => j.customerId === cust.id);

            const waUrl = createWhatsAppLink(
              cust.whatsapp || cust.mobile,
              `Hello ${cust.contactPerson}, this is Bubble Up Trading Operations regarding your laundry equipment service at ${cust.companyName}.`
            );

            const mailUrl = createMailtoLink(
              cust.email,
              `Bubble Up Trading Service Notice - ${cust.companyName}`,
              `Dear ${cust.contactPerson},\n\nWe hope this message finds you well.\n\nBest regards,\nBubble Up Trading & Contracting\nDoha - Qatar`
            );

            return (
              <div
                key={cust.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wide">
                      {cust.customerType.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      {cust.crNumber && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          CR: {cust.crNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 
                    onClick={() => setSelectedCustomer(cust)}
                    className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-sky-700 cursor-pointer"
                  >
                    {cust.companyName}
                  </h3>
                  
                  <div className="mt-2 text-xs text-slate-600 space-y-1.5">
                    <p className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{cust.contactPerson}</span>
                    </p>

                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cust.mobile}</span>
                    </p>

                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>
                        {cust.buildingNo ? `Bldg ${cust.buildingNo}, ` : ''}
                        {cust.zoneNo ? `Zone ${cust.zoneNo}, ` : ''}
                        {cust.streetNo ? `St ${cust.streetNo}, ` : ''}
                        {cust.area}, {cust.city}
                      </span>
                    </p>

                    {cust.contractType && (
                      <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{cust.contractType.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fast Contact & Action Buttons */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="Send WhatsApp Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={mailUrl}
                      className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="Send Official Email"
                    >
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      <span>Email</span>
                    </a>

                    <button
                      onClick={() => startEdit(cust)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-300 cursor-pointer"
                      title="Edit Customer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stats Footer */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div 
                      onClick={() => setSelectedCustomer(cust)}
                      className="bg-slate-50 hover:bg-sky-50 p-2 rounded cursor-pointer transition-colors"
                    >
                      <span className="text-[10px] text-slate-400 block">Machines</span>
                      <span className="font-bold text-slate-800">{custMachines.length || cust.totalMachines}</span>
                    </div>
                    <div 
                      onClick={() => setSelectedCustomer(cust)}
                      className="bg-slate-50 hover:bg-sky-50 p-2 rounded cursor-pointer transition-colors"
                    >
                      <span className="text-[10px] text-slate-400 block">Jobs</span>
                      <span className="font-bold text-slate-800">{custJobs.length || cust.totalServiceCalls}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-[10px] text-slate-400 block">Balance</span>
                      <span className="font-bold font-mono text-amber-700">QAR {cust.outstandingBalance.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add New Customer Category Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" />
                Add Customer / Facility Category
              </h2>
              <button onClick={() => setShowAddTypeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewType} className="p-5 space-y-4 text-xs text-slate-700">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Category Name *</label>
                <input
                  type="text"
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. SHIP_VESSEL, MILITARY_BASE, CRUISE_LINER"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Existing categories: {customerTypes.join(', ')}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded shadow-xs"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h2 className="text-base font-bold text-white">
                {editingCustomer ? `Edit Facility: ${editingCustomer.companyName}` : 'Register New Commercial Facility in Qatar'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                <div className="col-span-2 sm:col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">Company / Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. The Ritz-Carlton Doha Linen Services"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">Facility Category</label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
                  >
                    {customerTypes.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Contact Person & Title *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Faisal Al-Mansoor (Chief Engineer)"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+974 55..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+974 55..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineering@ritzcarlton-doha.qa"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Office Telephone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+974 44..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Commercial Reg. (CR) No.</label>
                  <input
                    type="text"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    placeholder="e.g. 104829"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                {/* Qatar Address Specifications */}
                <div className="col-span-2 sm:col-span-4 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block text-xs">Qatar Physical Address / Location Details:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Building No.</label>
                      <input
                        type="text"
                        value={buildingNo}
                        onChange={(e) => setBuildingNo(e.target.value)}
                        placeholder="e.g. 14"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Zone No.</label>
                      <input
                        type="text"
                        value={zoneNo}
                        onChange={(e) => setZoneNo(e.target.value)}
                        placeholder="e.g. 66"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Street No.</label>
                      <input
                        type="text"
                        value={streetNo}
                        onChange={(e) => setStreetNo(e.target.value)}
                        placeholder="e.g. 101"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Office / Gate No.</label>
                      <input
                        type="text"
                        value={officeNo}
                        onChange={(e) => setOfficeNo(e.target.value)}
                        placeholder="e.g. Engineering Level B1"
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Site Street / Landmark Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="West Bay Lagoon, Near Lagoon Gate"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Area / Municipality</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. West Bay, The Pearl, Al Sadd"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City & Country</label>
                  <input
                    type="text"
                    value={`${city}, ${country}`}
                    disabled
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-slate-100 text-slate-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contract / SLA Type</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
                  >
                    <option value="ANNUAL_MAINTENANCE_CONTRACT">Annual Maintenance Contract (AMC)</option>
                    <option value="ON_DEMAND_SERVICE">On-Demand Service</option>
                    <option value="WARRANTY">Warranty Coverage</option>
                    <option value="PAY_PER_VISIT">Pay Per Visit</option>
                    <option value="LEASE_RENTAL">Lease / Equipment Rental</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
                  >
                    <option value="IMMEDIATE">Immediate / On-Spot</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days (Standard)</option>
                    <option value="NET_60">Net 60 Days</option>
                    <option value="ADVANCE_DEPOSIT">Advance Deposit</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Tax / VAT Number</label>
                  <input
                    type="text"
                    value={taxVatNumber}
                    onChange={(e) => setTaxVatNumber(e.target.value)}
                    placeholder="QA-100..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="col-span-2 sm:col-span-4">
                  <label className="font-semibold text-slate-700 block mb-1">Special Site Instructions / Service Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Requires safety badge clearance at security gate. Barrier washer sterilization protocol required."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded shadow-xs"
                >
                  {editingCustomer ? 'Update Facility' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{selectedCustomer.companyName}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/30 text-sky-300 border border-sky-400/40">
                    {selectedCustomer.customerType.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {selectedCustomer.area}, {selectedCustomer.city} • Zone {selectedCustomer.zoneNo || '66'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { const c = selectedCustomer; setSelectedCustomer(null); startEdit(c); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              
              {/* Direct Communication Bar */}
              <div className="p-3 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Direct Facility Contact</span>
                  <span className="text-slate-500 text-[11px]">{selectedCustomer.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={createWhatsAppLink(
                      selectedCustomer.whatsapp || selectedCustomer.mobile,
                      `Hello ${selectedCustomer.contactPerson}, this is Bubble Up Trading Operations regarding your equipment service.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp ({selectedCustomer.whatsapp || selectedCustomer.mobile})</span>
                  </a>

                  <a
                    href={createMailtoLink(
                      selectedCustomer.email,
                      `Service Inquiry - ${selectedCustomer.companyName}`,
                      `Dear ${selectedCustomer.contactPerson},\n\n`
                    )}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email ({selectedCustomer.email})</span>
                  </a>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-500 block">Contact Person:</span>
                  <span className="font-bold text-slate-900">{selectedCustomer.contactPerson}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Mobile Phone:</span>
                  <span className="font-bold text-sky-800">{selectedCustomer.mobile}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">CR Registration:</span>
                  <span className="font-mono text-slate-800 font-bold">{selectedCustomer.crNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Contract Type:</span>
                  <span className="font-semibold text-emerald-700">{(selectedCustomer.contractType || 'AMC').replace(/_/g, ' ')}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-slate-500 block">Qatar Address:</span>
                  <span className="text-slate-800">
                    {selectedCustomer.buildingNo ? `Bldg ${selectedCustomer.buildingNo}, ` : ''}
                    {selectedCustomer.zoneNo ? `Zone ${selectedCustomer.zoneNo}, ` : ''}
                    {selectedCustomer.streetNo ? `St ${selectedCustomer.streetNo}, ` : ''}
                    {selectedCustomer.officeNo ? `${selectedCustomer.officeNo}, ` : ''}
                    {selectedCustomer.address}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Payment Terms:</span>
                  <span className="text-slate-800 font-semibold">{(selectedCustomer.paymentTerms || 'NET_30').replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Outstanding Balance:</span>
                  <span className="font-bold font-mono text-amber-700">QAR {selectedCustomer.outstandingBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Installed Machines */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-sky-700" />
                  Installed Equipment ({machines.filter(m => m.customerId === selectedCustomer.id).length})
                </h3>
                <div className="space-y-2">
                  {machines.filter(m => m.customerId === selectedCustomer.id).map(m => (
                    <div key={m.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{m.brand} {m.model}</span>
                        <span className="text-slate-500 text-[11px] block">SN: {m.serialNumber} • {m.capacityKg}kg • {m.machineLocation}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 font-bold rounded text-[11px] border border-teal-200">
                        {m.warrantyStatus}
                      </span>
                    </div>
                  ))}
                  {machines.filter(m => m.customerId === selectedCustomer.id).length === 0 && (
                    <p className="text-slate-400 italic text-[11px]">No machines directly mapped in preview database.</p>
                  )}
                </div>
              </div>

              {/* Service Job History */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-sky-700" />
                  Service Job History ({jobCards.filter(j => j.customerId === selectedCustomer.id).length})
                </h3>
                <div className="space-y-2">
                  {jobCards.filter(j => j.customerId === selectedCustomer.id).map(j => (
                    <div key={j.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-sky-900">{j.jobCardNumber}</span>
                        <span className="text-slate-600 block text-[11px]">{j.problemDescription}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-slate-800">QAR {j.totalAmount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 block">{j.scheduledDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

