import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SparePart, PartCategory } from '../../types';
import { ItemRemovalModal } from '../common/ItemRemovalModal';
import { RemovalLogsModal } from '../common/RemovalLogsModal';
import { 
  Package, Plus, Search, AlertCircle, Wrench, 
  DollarSign, ArrowUpRight, CheckCircle, X, Edit, Trash2, ClipboardList, Tag
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { 
    spareParts, addSparePart, updateSparePart, deleteSparePart, 
    removalLogs, showNotification, partCategories, addPartCategory 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [partToRemove, setPartToRemove] = useState<SparePart | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // New Part Form
  const [partNo, setPartNo] = useState('');
  const [partName, setPartName] = useState('');
  const [category, setCategory] = useState<string>(partCategories[0]?.id || 'MECHANICAL');
  const [brand, setBrand] = useState('Universal / OEM');
  const [costPrice, setCostPrice] = useState(150);
  const [sellingPrice, setSellingPrice] = useState(280);
  const [stockQty, setStockQty] = useState(10);
  const [minStock, setMinStock] = useState(3);
  const [location, setLocation] = useState('Depot Aisle B-12');
  const [barcode, setBarcode] = useState('');

  const filteredParts = spareParts.filter(p => {
    const matchesSearch = 
      p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.compatibleBrands.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    addSparePart({
      partNumber: partNo,
      name: partName,
      category: category as any,
      compatibleBrands: brand,
      costPrice,
      sellingPrice,
      stockQuantity: stockQty,
      minStockLevel: minStock,
      storageLocation: location,
      barcode: barcode || `BC-${Date.now().toString().slice(-6)}`
    });

    setShowAddModal(false);
    setPartNo('');
    setPartName('');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = newCatName.trim().toUpperCase().replace(/\s+/g, '_');
    addPartCategory(catId, newCatName.trim());
    setCategory(catId);
    setNewCatName('');
    setShowAddCategoryModal(false);
  };

  const handleRestock = (partId: string, currentStock: number) => {
    updateSparePart(partId, { stockQuantity: currentStock + 5 });
    showNotification('Restocked +5 units to inventory');
  };

  const handleConfirmRemoval = (reason: string, details?: string) => {
    if (!partToRemove) return;
    deleteSparePart(partToRemove.id, reason, details);
    setPartToRemove(null);
  };

  const partLogsCount = removalLogs.filter(l => l.itemType === 'SPARE_PART').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Spare Parts & Warehouse Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stock control of commercial laundry components (valves, motors, bearings, VFD inverters, seals, heating elements).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            title="Create a new spare parts category"
          >
            <Tag className="w-3.5 h-3.5 text-sky-700" />
            <span>+ Add Part Category</span>
          </button>

          <button
            onClick={() => setShowLogsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            title="View Written-Off / Removed Spare Parts Audit Log"
          >
            <ClipboardList className="w-4 h-4 text-slate-500" />
            <span>Removal Logs ({partLogsCount})</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Spare Part Item
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
            placeholder="Search by Part #, Name, or Compatible Brand..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Categories ({spareParts.length})</option>
            {partCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Part Number & Barcode</th>
                <th className="py-3 px-4 font-semibold">Part Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Compatible Brands</th>
                <th className="py-3 px-4 font-semibold text-right">Cost (QAR)</th>
                <th className="py-3 px-4 font-semibold text-right">Selling Price (QAR)</th>
                <th className="py-3 px-4 font-semibold text-center">Stock Level</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredParts.map((p) => {
                const isLow = p.stockQuantity <= p.minStockLevel;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sky-900 text-sm block">{p.partNumber}</span>
                      <span className="font-mono text-[10px] text-slate-400">{p.barcode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-[11px] text-slate-500">{p.storageLocation}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {p.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.compatibleBrands}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      QAR {(p.costPrice ?? p.unitCost ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      QAR {p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded text-xs ${
                        isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isLow && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {p.stockQuantity} units
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Min: {p.minStockLevel}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRestock(p.id, p.stockQuantity)}
                          className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded text-[11px] border border-sky-200 cursor-pointer"
                          title="Restock +5 units"
                        >
                          +5 Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => setPartToRemove(p)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 rounded border border-rose-200 transition-colors cursor-pointer"
                          title="Remove / Write-off Part with Reason"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h2 className="text-base font-bold text-white">Add Spare Part to Warehouse Inventory</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Part Number / SKU *</label>
                  <input
                    type="text"
                    required
                    value={partNo}
                    onChange={(e) => setPartNo(e.target.value)}
                    placeholder="e.g. PRM-DRAIN-3IN"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Part Name / Description *</label>
                  <input
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="e.g. 3-inch Motorized Drain Valve"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[10px] text-sky-700 font-bold hover:underline flex items-center gap-0.5"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  >
                    {partCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Compatible OEM Brands</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Primus, Speed Queen, Unimac..."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost Price (QAR) *</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selling Price (QAR) *</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Threshold Level</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Bin / Storage Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Warehouse Shelf A-4"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded shadow-xs"
                >
                  Save Spare Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Part Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" />
                Add New Spare Part Category
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Water Recovery Filters, Steam Traps, Gaskets"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-700 mb-1">Existing Categories:</p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {partCategories.map((c) => (
                    <span key={c.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-medium">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Spare Part with Reason Modal */}
      {partToRemove && (
        <ItemRemovalModal
          item={{
            id: partToRemove.id,
            type: 'SPARE_PART',
            name: partToRemove.name,
            identifier: partToRemove.partNumber,
            category: partToRemove.category.replace(/_/g, ' '),
            location: partToRemove.storageLocation,
            extraInfo: `Current Stock: ${partToRemove.stockQuantity} units | Price: QAR ${partToRemove.sellingPrice}`
          }}
          onClose={() => setPartToRemove(null)}
          onConfirm={handleConfirmRemoval}
        />
      )}

      {/* Removal Logs Modal */}
      {showLogsModal && (
        <RemovalLogsModal
          defaultFilter="SPARE_PART"
          onClose={() => setShowLogsModal(false)}
        />
      )}

    </div>
  );
};

