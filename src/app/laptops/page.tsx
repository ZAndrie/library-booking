'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import {
  Laptop,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  Wrench,
  Check,
  X,
  FileText,
  UserCheck,
  AlertCircle,
  Tag,
  Boxes,
} from 'lucide-react';

interface LaptopItem {
  _id: string;
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string;
  specs: string;
  status: 'available' | 'borrowed' | 'under_maintenance' | 'decommissioned';
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  accessoriesIncluded: string[];
  location: string;
  notes?: string;
}

interface LaptopLoan {
  _id: string;
  laptopId: LaptopItem;
  borrowerName: string;
  borrowerId: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  isOverdue?: boolean;
  staffIssuerId?: { name: string; employeeId: string };
  staffReceiverId?: { name: string; employeeId: string };
  checkoutAccessories: string[];
  checkoutNotes?: string;
  returnCondition?: string;
  returnNotes?: string;
}

export default function LaptopsPage() {
  const [activeTab, setActiveTab] = useState<'desk' | 'overdue' | 'inventory'>('desk');
  const [laptops, setLaptops] = useState<LaptopItem[]>([]);
  const [loans, setLoans] = useState<LaptopLoan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('all');

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    laptopId: '',
    borrowerName: '',
    borrowerId: '',
    borrowerEmail: '',
    borrowerContact: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    checkoutAccessories: ['65W Charger', 'Padded Sleeve'],
    checkoutNotes: '',
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // Return Modal State
  const [returningLoan, setReturningLoan] = useState<LaptopLoan | null>(null);
  const [returnCondition, setReturnCondition] = useState<'excellent' | 'good' | 'fair' | 'damaged'>('excellent');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState('');

  // Add Laptop Modal State
  const [showAddLaptopModal, setShowAddLaptopModal] = useState(false);
  const [newLaptopData, setNewLaptopData] = useState({
    assetTag: '',
    serialNumber: '',
    brand: 'Lenovo',
    model: '',
    specs: '',
    condition: 'excellent' as 'excellent' | 'good' | 'fair' | 'damaged',
    location: 'Counter Desk Shelf A',
    accessories: 'Charger, Padded Sleeve',
    notes: '',
  });
  const [addLaptopError, setAddLaptopError] = useState('');
  const [addLaptopSubmitting, setAddLaptopSubmitting] = useState(false);

  const fetchLaptops = async () => {
    try {
      const res = await fetch('/api/laptops');
      if (res.ok) {
        const data = await res.json();
        setLaptops(data.laptops || []);
      }
    } catch (err) {
      console.error('Failed to load laptops:', err);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/laptop-loans');
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans || []);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaptops();
    fetchLoans();
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setCheckoutSubmitting(true);

    try {
      const dueDateTime = new Date(`${checkoutData.dueDate}T${checkoutData.dueTime}:00`);

      const res = await fetch('/api/laptop-loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          laptopId: checkoutData.laptopId,
          borrowerName: checkoutData.borrowerName,
          borrowerId: checkoutData.borrowerId,
          borrowerEmail: checkoutData.borrowerEmail,
          borrowerContact: checkoutData.borrowerContact,
          dueAt: dueDateTime.toISOString(),
          checkoutAccessories: checkoutData.checkoutAccessories,
          checkoutNotes: checkoutData.checkoutNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to checkout laptop');
      }

      setShowCheckoutModal(false);
      setCheckoutData({
        laptopId: '',
        borrowerName: '',
        borrowerId: '',
        borrowerEmail: '',
        borrowerContact: '',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '18:00',
        checkoutAccessories: ['65W Charger', 'Padded Sleeve'],
        checkoutNotes: '',
      });
      fetchLaptops();
      fetchLoans();
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningLoan) return;

    setReturnError('');
    setReturnSubmitting(true);

    try {
      const res = await fetch(`/api/laptop-loans/${returningLoan._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnCondition,
          returnNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process return');
      }

      setReturningLoan(null);
      setReturnNotes('');
      fetchLaptops();
      fetchLoans();
    } catch (err: any) {
      setReturnError(err.message);
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleAddLaptopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLaptopError('');
    setAddLaptopSubmitting(true);

    try {
      const accessoriesArray = newLaptopData.accessories
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await fetch('/api/laptops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: newLaptopData.assetTag,
          serialNumber: newLaptopData.serialNumber,
          brand: newLaptopData.brand,
          model: newLaptopData.model,
          specs: newLaptopData.specs,
          condition: newLaptopData.condition,
          location: newLaptopData.location,
          accessoriesIncluded: accessoriesArray,
          notes: newLaptopData.notes,
          status: 'available',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register laptop');
      }

      setShowAddLaptopModal(false);
      setNewLaptopData({
        assetTag: '',
        serialNumber: '',
        brand: 'Lenovo',
        model: '',
        specs: '',
        condition: 'excellent',
        location: 'Counter Desk Shelf A',
        accessories: 'Charger, Padded Sleeve',
        notes: '',
      });
      fetchLaptops();
    } catch (err: any) {
      setAddLaptopError(err.message);
    } finally {
      setAddLaptopSubmitting(false);
    }
  };

  const activeLoans = loans.filter((l) => l.status === 'active');
  const overdueLoans = loans.filter((l) => l.status === 'active' && new Date(l.dueAt) < new Date());
  const availableLaptops = laptops.filter((l) => l.status === 'available');

  const filteredInventory = laptops.filter((l) => {
    const matchesStatus =
      inventoryStatusFilter === 'all' || l.status === inventoryStatusFilter;
    const matchesSearch =
      searchQuery === '' ||
      l.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with Subsystem 2 Identifier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                System 2
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Laptop Borrowing Management System
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Counter desk workflow: fast student checkout, condition inspection check-in, and fleet management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCheckoutModal(true)}
              disabled={availableLaptops.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Checkout Laptop ({availableLaptops.length} Ready)
            </button>
            <button
              onClick={() => setShowAddLaptopModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
            >
              <Boxes className="w-4 h-4 text-slate-400" />
              Add Device to Fleet
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('desk')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'desk'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Counter Desk & Active Loans ({activeLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overdue'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Overdue Loans Tracker ({overdueLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Hardware Inventory Fleet ({laptops.length})
          </button>
        </div>

        {/* TAB 1: COUNTER DESK & ACTIVE LOANS */}
        {activeTab === 'desk' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Currently <strong>{activeLoans.length}</strong> devices out on loan across campus.
              </span>
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                + Issue New Loan Over Counter
              </button>
            </div>

            {activeLoans.length === 0 ? (
              <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl py-12 text-center text-xs text-slate-400">
                <Laptop className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                No laptops currently checked out. All available devices are safe in inventory.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLoans.map((loan) => {
                  const isOverdue = new Date(loan.dueAt) < new Date();
                  const borrowedTime = new Date(loan.borrowedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dueTime = new Date(loan.dueAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dueDateStr = new Date(loan.dueAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={loan._id}
                      className={`bg-slate-800/90 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                        isOverdue
                          ? 'border-rose-500/80 shadow-rose-950/40'
                          : 'border-slate-700/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-white">
                              {loan.laptopId?.assetTag}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                              {loan.laptopId?.brand} {loan.laptopId?.model}
                            </span>
                          </div>

                          {isOverdue ? (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              OVERDUE
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              ACTIVE LOAN
                            </span>
                          )}
                        </div>

                        {/* Borrower Details */}
                        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 text-xs space-y-1 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Borrower:</span>
                            <span className="font-bold text-white">{loan.borrowerName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Student/Staff ID:</span>
                            <span className="font-mono text-emerald-400">{loan.borrowerId}</span>
                          </div>
                          {loan.borrowerContact && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Phone:</span>
                              <span className="text-slate-300">{loan.borrowerContact}</span>
                            </div>
                          )}
                          {loan.borrowerEmail && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Email:</span>
                              <span className="text-slate-300">{loan.borrowerEmail}</span>
                            </div>
                          )}
                        </div>

                        {/* Timeline & Accessories */}
                        <div className="text-xs text-slate-400 space-y-1 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Borrowed at <strong>{borrowedTime}</strong>
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 font-medium ${
                              isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'
                            }`}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>
                              Due: <strong>{dueDateStr} at {dueTime}</strong>
                            </span>
                          </div>

                          {loan.checkoutAccessories?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {loan.checkoutAccessories.map((acc, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800"
                                >
                                  ✓ {acc}
                                </span>
                              ))}
                            </div>
                          )}

                          {loan.checkoutNotes && (
                            <p className="text-[11px] text-slate-400 italic mt-1">
                              Note: {loan.checkoutNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Return Action Button */}
                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Issued by {loan.staffIssuerId?.name || 'Staff'}
                        </span>
                        <button
                          onClick={() => {
                            setReturningLoan(loan);
                            setReturnCondition('excellent');
                            setReturnNotes('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Process Return & Inspection
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OVERDUE LOANS TRACKER */}
        {activeTab === 'overdue' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-300">Overdue Equipment Radar</h3>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Laptops below have exceeded their expected return timestamp. Staff should contact borrowers immediately.
                </p>
              </div>
            </div>

            {overdueLoans.length === 0 ? (
              <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl py-12 text-center text-xs text-emerald-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span>Zero overdue devices! All equipment is accounted for within schedule.</span>
              </div>
            ) : (
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Asset Tag</th>
                      <th className="py-3 px-4">Borrower Info</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Was Due At</th>
                      <th className="py-3 px-4 text-right">Desk Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {overdueLoans.map((loan) => (
                      <tr key={loan._id} className="hover:bg-slate-800 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{loan.laptopId?.assetTag}</div>
                          <div className="text-[11px] text-slate-400">
                            {loan.laptopId?.brand} {loan.laptopId?.model}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{loan.borrowerName}</div>
                          <div className="text-[11px] text-emerald-400 font-mono">
                            ID: {loan.borrowerId}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{loan.borrowerContact || 'No phone'}</div>
                          <div className="text-[11px] text-slate-400">{loan.borrowerEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-400">
                          {new Date(loan.dueAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setReturningLoan(loan);
                              setReturnCondition('excellent');
                              setReturnNotes('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                          >
                            Check-in Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HARDWARE INVENTORY FLEET */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Asset Tag, Brand, Model, Serial Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Device Statuses</option>
                  <option value="available">Available on Shelf</option>
                  <option value="borrowed">Currently Borrowed</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 ml-auto">
                Fleet Total: <strong className="text-white">{filteredInventory.length}</strong> devices
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">{item.assetTag}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            SN: {item.serialNumber}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-emerald-400 mt-0.5">
                          {item.brand} {item.model}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          item.status === 'available'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'borrowed'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <p>
                        <strong className="text-slate-400">Specs:</strong> {item.specs}
                      </p>
                      <p>
                        <strong className="text-slate-400">Shelf Location:</strong> {item.location}
                      </p>
                      <p>
                        <strong className="text-slate-400">Condition:</strong>{' '}
                        <span className="capitalize font-medium text-emerald-300">
                          {item.condition}
                        </span>
                      </p>
                      {item.notes && (
                        <p className="text-slate-400 italic text-[11px] mt-1">{item.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.accessoriesIncluded?.map((acc, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
                        >
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    {item.status === 'available' ? (
                      <button
                        onClick={() => {
                          setCheckoutData({ ...checkoutData, laptopId: item._id });
                          setShowCheckoutModal(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                      >
                        Direct Checkout
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        {item.status === 'borrowed' ? 'Out with student' : 'Unavailable'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: CHECKOUT LAPTOP */}
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-emerald-400" />
                  Issue Laptop Checkout Over Counter
                </h3>
                <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400">
                  ✕
                </button>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Available Laptop *
                  </label>
                  <select
                    required
                    value={checkoutData.laptopId}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, laptopId: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">-- Choose Laptop from Shelf --</option>
                    {availableLaptops.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.assetTag} - {l.brand} {l.model} ({l.condition} condition)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Student / Borrower Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={checkoutData.borrowerName}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, borrowerName: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Student / Staff ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU-1092"
                      value={checkoutData.borrowerId}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, borrowerId: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1 555-7721"
                      value={checkoutData.borrowerContact}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, borrowerContact: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Borrower Email
                    </label>
                    <input
                      type="email"
                      placeholder="alex.rivera@student.edu"
                      value={checkoutData.borrowerEmail}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, borrowerEmail: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Return Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={checkoutData.dueDate}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, dueDate: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Return Due Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={checkoutData.dueTime}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, dueTime: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Accessories Handed Out Over Desk
                  </label>
                  <div className="flex gap-4 text-xs text-slate-300 mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkoutData.checkoutAccessories.includes('65W Charger')}
                        onChange={(e) => {
                          const accs = e.target.checked
                            ? [...checkoutData.checkoutAccessories, '65W Charger']
                            : checkoutData.checkoutAccessories.filter((a) => a !== '65W Charger');
                          setCheckoutData({ ...checkoutData, checkoutAccessories: accs });
                        }}
                        className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                      />
                      Power Charger
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkoutData.checkoutAccessories.includes('Padded Sleeve')}
                        onChange={(e) => {
                          const accs = e.target.checked
                            ? [...checkoutData.checkoutAccessories, 'Padded Sleeve']
                            : checkoutData.checkoutAccessories.filter((a) => a !== 'Padded Sleeve');
                          setCheckoutData({ ...checkoutData, checkoutAccessories: accs });
                        }}
                        className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                      />
                      Padded Sleeve
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkoutData.checkoutAccessories.includes('Mouse')}
                        onChange={(e) => {
                          const accs = e.target.checked
                            ? [...checkoutData.checkoutAccessories, 'Mouse']
                            : checkoutData.checkoutAccessories.filter((a) => a !== 'Mouse');
                          setCheckoutData({ ...checkoutData, checkoutAccessories: accs });
                        }}
                        className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                      />
                      Wireless Mouse
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Staff Checkout Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Clean device handed over, battery at 100%"
                    value={checkoutData.checkoutNotes}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, checkoutNotes: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={checkoutSubmitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {checkoutSubmitting ? 'Recording Loan...' : 'Hand Over & Authorize Loan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RETURN INSPECTION */}
        {returningLoan && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-emerald-400" />
                  Laptop Return & Condition Inspection
                </h3>
                <button onClick={() => setReturningLoan(null)} className="text-slate-400">
                  ✕
                </button>
              </div>

              {returnError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {returnError}
                </div>
              )}

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                <div>
                  Device:{' '}
                  <strong className="text-white">
                    {returningLoan.laptopId?.assetTag} ({returningLoan.laptopId?.brand}{' '}
                    {returningLoan.laptopId?.model})
                  </strong>
                </div>
                <div>
                  Returned by:{' '}
                  <strong className="text-emerald-400">
                    {returningLoan.borrowerName} ({returningLoan.borrowerId})
                  </strong>
                </div>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hardware Return Condition Assessment *
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e: any) => setReturnCondition(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="excellent">Excellent - No scratches, clean, fully functional</option>
                    <option value="good">Good - Normal minor cosmetic wear</option>
                    <option value="fair">Fair - Heavy smudges, noticeable scuffs</option>
                    <option value="damaged">Damaged - Cracked screen, liquid, key missing (Sent to Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Inspection / Damage Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Charger returned in pouch, no physical damage detected."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReturningLoan(null)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {returnSubmitting ? 'Checking In...' : 'Confirm Return & Restock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REGISTER NEW LAPTOP TO FLEET */}
        {showAddLaptopModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-400" />
                  Add Hardware Device to Fleet
                </h3>
                <button onClick={() => setShowAddLaptopModal(false)} className="text-slate-400">
                  ✕
                </button>
              </div>

              {addLaptopError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {addLaptopError}
                </div>
              )}

              <form onSubmit={handleAddLaptopSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Asset Tag (Barcode) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LAP-006"
                      value={newLaptopData.assetTag}
                      onChange={(e) =>
                        setNewLaptopData({ ...newLaptopData, assetTag: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Serial Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SN-992140"
                      value={newLaptopData.serialNumber}
                      onChange={(e) =>
                        setNewLaptopData({ ...newLaptopData, serialNumber: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Lenovo, Dell, Apple, HP"
                      value={newLaptopData.brand}
                      onChange={(e) =>
                        setNewLaptopData({ ...newLaptopData, brand: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ThinkPad E14"
                      value={newLaptopData.model}
                      onChange={(e) =>
                        setNewLaptopData({ ...newLaptopData, model: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hardware Specifications *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="i5 12th Gen, 16GB RAM, 512GB SSD, 14&quot; FHD"
                    value={newLaptopData.specs}
                    onChange={(e) =>
                      setNewLaptopData({ ...newLaptopData, specs: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Shelf Storage Location
                  </label>
                  <input
                    type="text"
                    placeholder="Counter Desk Shelf A"
                    value={newLaptopData.location}
                    onChange={(e) =>
                      setNewLaptopData({ ...newLaptopData, location: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLaptopModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLaptopSubmitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {addLaptopSubmitting ? 'Registering...' : 'Add Device'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
