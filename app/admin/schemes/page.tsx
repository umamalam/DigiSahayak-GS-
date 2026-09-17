'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Plus, Filter, Edit2, ToggleLeft, ToggleRight,
  ArrowLeft, CheckCircle, AlertCircle, X, Loader2, Eye, ChevronDown,
  ChevronUp, ExternalLink, Tag,
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Scheme {
  id: number;
  title: string;
  slug: string;
  ministry: string;
  description: string;
  benefits: string;
  eligibility: string | null;
  notEligible: string | null;
  requiredDocuments: string | null;
  howToApply: string | null;
  processingTime: string | null;
  schemeValidity: string | null;
  officialLink: string | null;
  launchYear: string | null;
  helplinePhone: string | null;
  helplineEmail: string | null;
  commonMistakes: string | null;
  additionalNotes: string | null;
  isActive: boolean;
  createdAt: string;
  categoryId: number;
  categoryName: string | null;
}

const EMPTY_FORM = {
  title: '', ministry: '', categoryId: '', description: '', benefits: '',
  eligibility: '', notEligible: '', requiredDocuments: '', howToApply: '',
  processingTime: '', schemeValidity: '', officialLink: '', launchYear: '',
  helplinePhone: '', helplineEmail: '', commonMistakes: '', additionalNotes: '',
  isActive: true,
};

type FormData = typeof EMPTY_FORM;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextArea({ label, name, value, onChange, required, placeholder, rows = 3, hint }:
  { label: string; name: string; value: string; onChange: (e: any) => void; required?: boolean; placeholder?: string; rows?: number; hint?: string }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-y"
      />
    </div>
  );
}

function TextField({ label, name, value, onChange, required, placeholder, type = 'text' }:
  { label: string; name: string; value: string; onChange: (e: any) => void; required?: boolean; placeholder?: string; type?: string }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
      />
    </div>
  );
}

export default function AdminSchemesPage() {
  const router = useRouter();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filtered, setFiltered] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form modal (add/edit)
  const [showForm, setShowForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Deactivate confirm modal
  const [confirmScheme, setConfirmScheme] = useState<Scheme | null>(null);
  const [toggling, setToggling] = useState(false);

  // Auth check
  useEffect(() => {
    fetch('/api/auth/check-session')
      .then((r) => r.json())
      .then((d) => { if (!d.authenticated || d.user?.role !== 'admin') router.push('/login'); })
      .catch(() => router.push('/login'));
  }, [router]);

  // Fetch categories once
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []));
  }, []);

  const fetchSchemes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/schemes');
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes || []);
      }
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  // Filter schemes locally
  useEffect(() => {
    let result = schemes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          (s.categoryName || '').toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.categoryId === parseInt(categoryFilter, 10));
    }
    if (statusFilter === 'active') result = result.filter((s) => s.isActive);
    else if (statusFilter === 'inactive') result = result.filter((s) => !s.isActive);
    setFiltered(result);
  }, [schemes, searchQuery, categoryFilter, statusFilter]);

  const openAdd = () => {
    setEditingScheme(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    setShowAdvanced(false);
    setShowForm(true);
  };

  const openEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setForm({
      title: scheme.title,
      ministry: scheme.ministry,
      categoryId: String(scheme.categoryId),
      description: scheme.description,
      benefits: scheme.benefits,
      eligibility: scheme.eligibility || '',
      notEligible: scheme.notEligible || '',
      requiredDocuments: scheme.requiredDocuments || '',
      howToApply: scheme.howToApply || '',
      processingTime: scheme.processingTime || '',
      schemeValidity: scheme.schemeValidity || '',
      officialLink: scheme.officialLink || '',
      launchYear: scheme.launchYear || '',
      helplinePhone: scheme.helplinePhone || '',
      helplineEmail: scheme.helplineEmail || '',
      commonMistakes: scheme.commonMistakes || '',
      additionalNotes: scheme.additionalNotes || '',
      isActive: scheme.isActive,
    });
    setFormError('');
    setFormSuccess('');
    setShowAdvanced(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingScheme(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.ministry.trim()) { setFormError('Ministry is required.'); return; }
    if (!form.categoryId) { setFormError('Please select a category.'); return; }
    if (!form.description.trim()) { setFormError('Description is required.'); return; }
    if (!form.benefits.trim()) { setFormError('Benefits are required.'); return; }

    setSubmitting(true);
    try {
      const url = editingScheme
        ? `/api/admin/schemes/${editingScheme.id}`
        : '/api/admin/schemes';
      const method = editingScheme ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save scheme.');
        return;
      }

      setFormSuccess(editingScheme ? 'Scheme updated successfully.' : 'Scheme created successfully.');
      fetchSchemes();
      setTimeout(() => closeForm(), 1200);
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (scheme: Scheme) => {
    // If deactivating, show confirmation
    if (scheme.isActive) {
      setConfirmScheme(scheme);
      return;
    }
    // Re-activating doesn't need confirmation
    await doToggle(scheme, true);
  };

  const doToggle = async (scheme: Scheme, newActive: boolean) => {
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/schemes/${scheme.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (res.ok) {
        setSchemes((prev) => prev.map((s) => s.id === scheme.id ? { ...s, isActive: newActive } : s));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setToggling(false);
      setConfirmScheme(null);
    }
  };

  const stats = {
    total: schemes.length,
    active: schemes.filter((s) => s.isActive).length,
    inactive: schemes.filter((s) => !s.isActive).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading schemes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Scheme Management</h1>
              <p className="text-xs text-gray-500">Create, edit, and manage government schemes</p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Scheme
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Schemes', value: stats.total, color: 'indigo' },
            { label: 'Active', value: stats.active, color: 'green' },
            { label: 'Inactive', value: stats.inactive, color: 'gray' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                <BookOpen className={`w-5 h-5 text-${s.color}-500`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, ministry, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2.5">Showing {filtered.length} of {schemes.length} schemes</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No schemes found</p>
              <p className="text-sm text-gray-400 mt-1">
                {schemes.length === 0 ? 'Click "Add Scheme" to create the first one.' : 'Try a different search or filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-4">Scheme</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-4">Ministry</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-4">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((scheme, idx) => (
                    <motion.tr
                      key={scheme.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{scheme.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{scheme.description.slice(0, 70)}{scheme.description.length > 70 ? '…' : ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 max-w-[160px] leading-tight">{scheme.ministry}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          <Tag className="w-3 h-3" />
                          {scheme.categoryName || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {scheme.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {/* View on site */}
                          <Link
                            href={`/schemes/${scheme.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View scheme"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(scheme)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit scheme"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Toggle active */}
                          <button
                            onClick={() => handleToggleActive(scheme)}
                            disabled={toggling}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              scheme.isActive
                                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={scheme.isActive ? 'Deactivate scheme' : 'Reactivate scheme'}
                          >
                            {scheme.isActive
                              ? <ToggleRight className="w-4 h-4" />
                              : <ToggleLeft className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Scheme Slide Panel ── */}
      <AnimatePresence>
        {showForm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="fixed inset-0 bg-black/40 z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingScheme ? 'Edit Scheme' : 'Add New Scheme'}
                  </h2>
                  {editingScheme && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{editingScheme.title}</p>
                  )}
                </div>
                <button onClick={closeForm} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body (scrollable) */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Feedback banners */}
                <AnimatePresence>
                  {formError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {formError}
                    </motion.div>
                  )}
                  {formSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {formSuccess}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Section: Basic Info */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basic Information</p>

                  <TextField label="Scheme Title" name="title" value={form.title} onChange={handleFormChange} required placeholder="e.g. PM-KISAN Scheme" />

                  <div className="grid grid-cols-2 gap-4">
                    <TextField label="Ministry" name="ministry" value={form.ministry} onChange={handleFormChange} required placeholder="e.g. Ministry of Agriculture" />
                    <div>
                      <FieldLabel required>Category</FieldLabel>
                      <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <TextArea label="Description" name="description" value={form.description} onChange={handleFormChange} required rows={3} placeholder="Brief overview of the scheme…" />
                  <TextArea label="Benefits" name="benefits" value={form.benefits} onChange={handleFormChange} required rows={3} placeholder="What does this scheme provide to beneficiaries?" hint="List the key benefits clearly." />
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Eligibility & Documents</p>
                  <TextArea label="Eligibility Criteria" name="eligibility" value={form.eligibility} onChange={handleFormChange} rows={3} placeholder="Who can apply? (income limits, age, category, etc.)" />
                  <TextArea label="Who is NOT Eligible" name="notEligible" value={form.notEligible} onChange={handleFormChange} rows={2} placeholder="Exclusion criteria…" />
                  <TextArea label="Required Documents" name="requiredDocuments" value={form.requiredDocuments} onChange={handleFormChange} rows={3} placeholder="List documents separated by commas or newlines…" />
                  <TextArea label="How to Apply" name="howToApply" value={form.howToApply} onChange={handleFormChange} rows={3} placeholder="Step-by-step application process…" />
                </div>

                {/* Advanced (collapsible) */}
                <div className="border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Fields
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Additional Details</p>

                          <div className="grid grid-cols-2 gap-4">
                            <TextField label="Processing Time" name="processingTime" value={form.processingTime} onChange={handleFormChange} placeholder="e.g. 30–60 days" />
                            <TextField label="Launch Year" name="launchYear" value={form.launchYear} onChange={handleFormChange} placeholder="e.g. 2019" />
                          </div>
                          <TextField label="Scheme Validity" name="schemeValidity" value={form.schemeValidity} onChange={handleFormChange} placeholder="e.g. Ongoing / Valid till 2025" />
                          <TextField label="Official Link" name="officialLink" value={form.officialLink} onChange={handleFormChange} placeholder="https://…" type="url" />

                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">Helpline</p>
                          <div className="grid grid-cols-2 gap-4">
                            <TextField label="Helpline Phone" name="helplinePhone" value={form.helplinePhone} onChange={handleFormChange} placeholder="1800-XXX-XXXX" />
                            <TextField label="Helpline Email" name="helplineEmail" value={form.helplineEmail} onChange={handleFormChange} placeholder="help@scheme.gov.in" type="email" />
                          </div>

                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">Tips & Notes</p>
                          <TextArea label="Common Mistakes to Avoid" name="commonMistakes" value={form.commonMistakes} onChange={handleFormChange} rows={2} placeholder="Things applicants often get wrong…" />
                          <TextArea label="Additional Notes" name="additionalNotes" value={form.additionalNotes} onChange={handleFormChange} rows={2} placeholder="Any other important information…" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active toggle */}
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Scheme Status</p>
                    <p className="text-xs text-gray-400">Inactive schemes won't appear in user searches</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </form>

              {/* Panel footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : editingScheme ? 'Save Changes' : 'Create Scheme'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Deactivate Confirmation Modal ── */}
      <AnimatePresence>
        {confirmScheme && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <ToggleLeft className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Deactivate Scheme?</h3>
                  <p className="text-sm text-gray-500">This scheme will be hidden from users</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-5">
                <p className="text-sm font-semibold text-gray-800">{confirmScheme.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{confirmScheme.ministry}</p>
              </div>

              <p className="text-sm text-gray-600 mb-5">
                Existing applications for this scheme will not be affected. You can reactivate it at any time.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmScheme(null)}
                  disabled={toggling}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => doToggle(confirmScheme, false)}
                  disabled={toggling}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {toggling ? 'Deactivating…' : 'Yes, Deactivate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
