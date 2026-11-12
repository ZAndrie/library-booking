'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/frontend/components/AppShell';
import {
  Laptop,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  ShieldAlert,
  AlertCircle,
  Boxes,
  X,
  Send,
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

export default function LaptopsView() {
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
      setLoading(true);
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

  const availableLaptops = laptops.filter((l) => l.status === 'available');
  const activeLoans = loans.filter((l) => l.status === 'active');
  const overdueLoans = loans.filter(
    (l) => l.status === 'active' && new Date(l.dueAt) < new Date()
  );

  const filteredInventory = laptops.filter((item) => {
    const matchesSearch =
      item.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      inventoryStatusFilter === 'all' || item.status === inventoryStatusFilter;

    return matchesSearch && matchesStatus;
  });

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
          borrowerEmail: checkoutData.borrowerEmail || undefined,
          borrowerContact: checkoutData.borrowerContact || undefined,
          dueAt: dueDateTime.toISOString(),
          checkoutAccessories: checkoutData.checkoutAccessories,
          checkoutNotes: checkoutData.checkoutNotes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || 'Failed to checkout laptop');
      } else {
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
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Error occurred while checking out');
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
        setReturnError(data.error || 'Failed to return laptop');
      } else {
        setReturningLoan(null);
        fetchLaptops();
        fetchLoans();
      }
    } catch (err: any) {
      setReturnError(err.message || 'Error during return');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleAddLaptopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLaptopError('');
    setAddLaptopSubmitting(true);

    try {
      const accessories = newLaptopData.accessories
        ? newLaptopData.accessories.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await fetch('/api/laptops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLaptopData,
          accessoriesIncluded: accessories,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddLaptopError(data.error || 'Failed to add laptop');
      } else {
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
      }
    } catch (err: any) {
      setAddLaptopError(err.message || 'Error adding laptop');
    } finally {
      setAddLaptopSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with Subsystem Identifier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                System 2 Desk
              </span>
              <h1 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
                Laptop Borrowing Management System
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Counter checkout terminal for portable hardware, condition inspection, and overdue monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setCheckoutData({ ...checkoutData, laptopId: availableLaptops[0]?._id || '' });
                setShowCheckoutModal(true);
              }}
              disabled={availableLaptops.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-emerald-300" />
              Checkout Laptop
            </button>
            <button
              onClick={() => setShowAddLaptopModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              Add Device to Fleet
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('desk')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'desk'
                ? 'border-[#8B1515] text-[#8B1515]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Active Loans Desk ({activeLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overdue'
                ? 'border-[#8B1515] text-[#8B1515]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Overdue Tracker ({overdueLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-[#8B1515] text-[#8B1515]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Hardware Fleet Inventory ({laptops.length})
          </button>
        </div>

        {/* TAB 1: ACTIVE LOANS */}
        {activeTab === 'desk' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Currently <strong>{activeLoans.length}</strong> devices out on loan across campus.
              </span>
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="text-[#8B1515] hover:underline font-semibold"
              >
                + Issue New Loan Over Counter
              </button>
            </div>

            {activeLoans.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl py-12 text-center text-xs text-slate-500 shadow-sm">
                <Laptop className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
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
                      className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                        isOverdue
                          ? 'border-rose-300 ring-1 ring-rose-200'
                          : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-slate-900 font-mono">
                              {loan.laptopId?.assetTag}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                              {loan.laptopId?.brand} {loan.laptopId?.model}
                            </span>
                          </div>

                          {isOverdue ? (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              OVERDUE
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              ACTIVE LOAN
                            </span>
                          )}
                        </div>

                        {/* Borrower Details */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Borrower:</span>
                            <span className="font-bold text-slate-900">{loan.borrowerName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Student/Staff ID:</span>
                            <span className="font-mono text-[#8B1515] font-semibold">{loan.borrowerId}</span>
                          </div>
                          {loan.borrowerContact && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Phone:</span>
                              <span className="text-slate-700">{loan.borrowerContact}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Borrowed at <strong>{borrowedTime}</strong></span>
                          </div>
                          <div
                            className={`flex items-center gap-2 font-medium ${
                              isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Due: <strong>{dueDateStr} at {dueTime}</strong></span>
                          </div>

                          {loan.checkoutAccessories?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {loan.checkoutAccessories.map((acc, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                                >
                                  ✓ {acc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Issued by {loan.staffIssuerId?.name || 'Staff'}
                        </span>
                        <button
                          onClick={() => {
                            setReturningLoan(loan);
                            setReturnCondition('excellent');
                            setReturnNotes('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Process Return & Restock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OVERDUE RADAR */}
        {activeTab === 'overdue' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-900">Overdue Equipment Radar</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Devices below have passed their expected checkout duration. Staff should prompt borrowers to return the units immediately.
                </p>
              </div>
            </div>

            {overdueLoans.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl py-12 text-center text-xs text-emerald-700 flex flex-col items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>Zero overdue devices! All equipment is accounted for within schedule.</span>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Asset Tag</th>
                      <th className="py-3 px-4">Borrower Info</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Was Due At</th>
                      <th className="py-3 px-4 text-right">Desk Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueLoans.map((loan) => (
                      <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono">{loan.laptopId?.assetTag}</div>
                          <div className="text-[11px] text-slate-500">
                            {loan.laptopId?.brand} {loan.laptopId?.model}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{loan.borrowerName}</div>
                          <div className="text-[11px] text-[#8B1515] font-mono">
                            ID: {loan.borrowerId}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{loan.borrowerContact || 'No phone'}</div>
                          <div className="text-[11px] text-slate-500">{loan.borrowerEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-600">
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
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
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
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Asset Tag, Brand, Model, Serial Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1515]"
                />
              </div>

              <div>
                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1515]"
                >
                  <option value="all">All Device Statuses</option>
                  <option value="available">Available on Shelf</option>
                  <option value="borrowed">Currently Borrowed</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 ml-auto font-medium">
                Fleet Total: <strong className="text-slate-800">{filteredInventory.length}</strong> devices
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInventory.map((item) => (
                <div
                  key={item._id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="bg-slate-800 text-white p-3.5 flex items-start justify-between">
                      <div>
                        <div className="font-mono font-bold text-sm text-white">{item.assetTag}</div>
                        <div className="text-xs text-slate-300">{item.brand} {item.model}</div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'available'
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-900/80 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="p-4 space-y-2 text-xs text-slate-600">
                      <p>
                        <strong className="text-slate-700">Specs:</strong> {item.specs}
                      </p>
                      <p>
                        <strong className="text-slate-700">Shelf Location:</strong> {item.location}
                      </p>
                      <p>
                        <strong className="text-slate-700">Condition:</strong>{' '}
                        <span className="capitalize font-semibold text-emerald-700">{item.condition}</span>
                      </p>
                      {item.notes && (
                        <p className="text-slate-500 italic text-[11px]">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                    {item.status === 'available' ? (
                      <button
                        onClick={() => {
                          setCheckoutData({ ...checkoutData, laptopId: item._id });
                          setShowCheckoutModal(true);
                        }}
                        className="px-3 py-1.5 bg-[#8B1515] hover:bg-[#721111] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        Direct Checkout
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.status === 'borrowed' ? 'Out on active loan' : 'In repair'}
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-emerald-600" />
                  Issue Laptop Checkout Over Counter
                </h3>
                <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Available Laptop *
                  </label>
                  <select
                    required
                    value={checkoutData.laptopId}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, laptopId: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
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
                    <label className="block font-semibold text-slate-700 mb-1">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1 555-7721"
                      value={checkoutData.borrowerContact}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, borrowerContact: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Borrower Email
                    </label>
                    <input
                      type="email"
                      placeholder="alex.rivera@student.edu"
                      value={checkoutData.borrowerEmail}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, borrowerEmail: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Return Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={checkoutData.dueDate}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, dueDate: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Return Due Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={checkoutData.dueTime}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, dueTime: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={checkoutSubmitting}
                    className="px-4 py-2 rounded-lg bg-[#8B1515] hover:bg-[#721111] text-white font-semibold shadow-sm disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-emerald-600" />
                  Laptop Return & Condition Inspection
                </h3>
                <button onClick={() => setReturningLoan(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {returnError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {returnError}
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div>
                  Device:{' '}
                  <strong className="text-slate-900">
                    {returningLoan.laptopId?.assetTag} ({returningLoan.laptopId?.brand}{' '}
                    {returningLoan.laptopId?.model})
                  </strong>
                </div>
                <div>
                  Returned by:{' '}
                  <strong className="text-[#8B1515]">
                    {returningLoan.borrowerName} ({returningLoan.borrowerId})
                  </strong>
                </div>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Condition Assessment *
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e: any) => setReturnCondition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  >
                    <option value="excellent">Excellent - No scratches, clean, fully functional</option>
                    <option value="good">Good - Normal minor cosmetic wear</option>
                    <option value="fair">Fair - Heavy smudges, noticeable scuffs</option>
                    <option value="damaged">Damaged - Cracked screen or key issue (Sent to repair)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Inspection Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Charger returned in pouch, no physical damage detected."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReturningLoan(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm disabled:opacity-50"
                  >
                    {returnSubmitting ? 'Checking In...' : 'Confirm Return & Restock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD LAPTOP */}
        {showAddLaptopModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-600" />
                  Add Hardware Device to Fleet
                </h3>
                <button onClick={() => setShowAddLaptopModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {addLaptopError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {addLaptopError}
                </div>
              )}

              <form onSubmit={handleAddLaptopSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Asset Tag *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LAP-006"
                      value={newLaptopData.assetTag}
                      onChange={(e) =>
                        setNewLaptopData({ ...newLaptopData, assetTag: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Lenovo, Dell, HP, Apple"
                      value={newLaptopData.brand}
                      onChange={(e) =>
                        setNewLaptopData({ ...newLaptopData, brand: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shelf Storage Location
                  </label>
                  <input
                    type="text"
                    placeholder="Counter Desk Shelf A"
                    value={newLaptopData.location}
                    onChange={(e) =>
                      setNewLaptopData({ ...newLaptopData, location: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#8B1515] outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLaptopModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLaptopSubmitting}
                    className="px-4 py-2 rounded-lg bg-[#8B1515] hover:bg-[#721111] text-white font-semibold shadow-sm"
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
