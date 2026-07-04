import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { scholarshipService } from '@/services/scholarships';
import toast from 'react-hot-toast';

const DOCUMENT_OPTIONS = ['aadhaar', 'pan', 'income_certificate', 'caste_certificate', 'bonafide', 'marks_card', 'transfer_certificate', 'passport_photo', 'bank_passbook'];
const STATE_OPTIONS = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Punjab', 'Bihar', 'Odisha', 'All India'];
const COURSE_OPTIONS = ['B.Tech', 'B.E', 'B.Sc', 'B.Com', 'BA', 'M.Tech', 'M.Sc', 'MBA', 'MBBS', 'BCA', 'MCA', 'Any'];
const CATEGORY_OPTIONS = ['General', 'SC', 'ST', 'OBC', 'EWS'];

export default function AddEditScholarship() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '', provider: '', provider_type: 'government', amount: '', amount_description: '',
      last_date: '', description: '', official_website: '', status: 'active',
      min_cgpa: '', max_income: '', eligible_gender: 'all',
      minority_only: false, disability_only: false, sports_quota: false, ncc_required: false,
      eligible_states: [] as string[],
      eligible_courses: [] as string[],
      eligible_categories: [] as string[],
      required_documents: [] as string[],
    }
  });

  const watchedStates = watch('eligible_states') as string[];
  const watchedCourses = watch('eligible_courses') as string[];
  const watchedCategories = watch('eligible_categories') as string[];
  const watchedDocs = watch('required_documents') as string[];

  useEffect(() => {
    if (!isEdit) return;
    scholarshipService.getById(Number(id)).then((s) => {
      setValue('title', s.title);
      setValue('provider', s.provider);
      setValue('provider_type', s.provider_type);
      setValue('amount', String(s.amount || ''));
      setValue('description', s.description || '');
      setValue('official_website', s.official_website || '');
      setValue('status', s.status);
      setValue('min_cgpa', String(s.min_cgpa || ''));
      setValue('max_income', String(s.max_income || ''));
      setValue('eligible_gender', s.eligible_gender || 'all');
      setValue('minority_only', s.minority_only);
      setValue('disability_only', s.disability_only);
      setValue('sports_quota', s.sports_quota);
      setValue('ncc_required', s.ncc_required);
      setValue('eligible_states', s.eligible_states || []);
      setValue('eligible_courses', s.eligible_courses || []);
      setValue('eligible_categories', s.eligible_categories || []);
      setValue('required_documents', s.required_documents || []);
      if (s.last_date) setValue('last_date', s.last_date.slice(0, 10));
    }).finally(() => setFetchLoading(false));
  }, [id]);

  const toggleItem = (field: any, arr: string[], val: string) => {
    setValue(field, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    const payload = {
      ...data,
      amount: data.amount ? Number(data.amount) : null,
      min_cgpa: data.min_cgpa ? Number(data.min_cgpa) : null,
      max_income: data.max_income ? Number(data.max_income) : null,
      last_date: data.last_date ? new Date(data.last_date).toISOString() : null,
    };
    try {
      if (isEdit) {
        await scholarshipService.update(Number(id), payload);
        toast.success('Scholarship updated!');
      } else {
        await scholarshipService.create(payload);
        toast.success('Scholarship created!');
      }
      navigate('/admin/scholarships');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save scholarship');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="skeleton h-96 rounded-2xl" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="section-title">{isEdit ? 'Edit' : 'Add'} Scholarship</h1>
          <p className="section-subtitle">{isEdit ? 'Update scholarship details' : 'Create a new scholarship listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
              <input {...register('title', { required: 'Title is required' })} type="text" placeholder="Scholarship title" className="input-field" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Provider *</label>
              <input {...register('provider', { required: true })} type="text" placeholder="Organization name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select {...register('provider_type')} className="input-field">
                <option value="government">Government</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹)</label>
              <input {...register('amount')} type="number" placeholder="e.g. 50000" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Last Date</label>
              <input {...register('last_date')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Official Website</label>
              <input {...register('official_website')} type="url" placeholder="https://..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea {...register('description')} rows={3} placeholder="Describe the scholarship..." className="input-field resize-none" />
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5">Eligibility Criteria</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Min CGPA</label>
              <input {...register('min_cgpa')} type="number" min="0" max="10" step="0.1" placeholder="e.g. 6.5" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Max Income (₹/yr)</label>
              <input {...register('max_income')} type="number" placeholder="e.g. 300000" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
              <select {...register('eligible_gender')} className="input-field">
                <option value="all">All Genders</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
          </div>

          {/* States */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Eligible States (leave empty for all)</label>
            <div className="flex flex-wrap gap-2">
              {STATE_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleItem('eligible_states', watchedStates, s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${watchedStates?.includes(s) ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Eligible Courses</label>
            <div className="flex flex-wrap gap-2">
              {COURSE_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => toggleItem('eligible_courses', watchedCourses, c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${watchedCourses?.includes(c) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Eligible Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => toggleItem('eligible_categories', watchedCategories, c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${watchedCategories?.includes(c) ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'minority_only', label: 'Minority Only' },
              { name: 'disability_only', label: 'Disability Only' },
              { name: 'sports_quota', label: 'Sports Quota' },
              { name: 'ncc_required', label: 'NCC Required' },
            ].map(f => (
              <label key={f.name} className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input {...register(f.name as any)} type="checkbox" className="accent-primary-600 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Required Documents</h3>
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_OPTIONS.map(d => (
              <button key={d} type="button" onClick={() => toggleItem('required_documents', watchedDocs, d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${watchedDocs?.includes(d) ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {d.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary px-8 py-3 rounded-2xl">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> {isEdit ? 'Update' : 'Create'} Scholarship</>}
          </button>
        </div>
      </form>
    </div>
  );
}
