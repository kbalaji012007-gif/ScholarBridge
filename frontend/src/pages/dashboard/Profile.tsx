import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Save, Camera, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin';
import toast from 'react-hot-toast';

const STATES = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Punjab', 'Bihar', 'Odisha'];
const COURSES = ['B.Tech', 'B.E', 'B.Sc', 'B.Com', 'BA', 'M.Tech', 'M.Sc', 'MBA', 'MBBS', 'BCA', 'MCA', 'B.Pharma', 'BBA', 'LLB'];
const CATEGORIES = ['General', 'SC', 'ST', 'OBC', 'EWS'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      dob: user?.dob || '',
      gender: user?.gender || '',
      phone: user?.phone || '',
      address: user?.address || '',
      state: user?.state || '',
      district: user?.district || '',
      college: user?.college || '',
      university: user?.university || '',
      course: user?.course || '',
      branch: user?.branch || '',
      semester: user?.semester || '',
      cgpa: user?.cgpa || '',
      category: user?.category || '',
      religion: user?.religion || '',
      is_minority: user?.is_minority || false,
      family_income: user?.family_income || '',
      has_disability: user?.has_disability || false,
      disability_type: user?.disability_type || '',
      has_sports_quota: user?.has_sports_quota || false,
      has_ncc: user?.has_ncc || false,
    }
  });

  useEffect(() => {
    if (user) reset({
      full_name: user.full_name || '',
      dob: user.dob || '',
      gender: user.gender || '',
      phone: user.phone || '',
      address: user.address || '',
      state: user.state || '',
      district: user.district || '',
      college: user.college || '',
      university: user.university || '',
      course: user.course || '',
      branch: user.branch || '',
      semester: user.semester || '',
      cgpa: user.cgpa || '',
      category: user.category || '',
      religion: user.religion || '',
      is_minority: user.is_minority || false,
      family_income: user.family_income || '',
      has_disability: user.has_disability || false,
      disability_type: '',
      has_sports_quota: user.has_sports_quota || false,
      has_ncc: user.has_ncc || false,
    });
  }, [user]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = { ...data, cgpa: data.cgpa ? Number(data.cgpa) : undefined, semester: data.semester ? Number(data.semester) : undefined, family_income: data.family_income ? Number(data.family_income) : undefined };
      await adminService.updateProfile(payload);
      await refreshUser();
      toast.success('Profile updated! 🎉');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      await adminService.uploadPhoto(file);
      await refreshUser();
      toast.success('Photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const completion = user?.profile_completion || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Keep your profile updated to get the most accurate scholarship matches.</p>
      </div>

      {/* Profile header card */}
      <div className="card flex flex-wrap items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold overflow-hidden">
            {user?.profile_photo
              ? <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              : (user?.full_name?.[0]?.toUpperCase() || user?.email[0].toUpperCase())
            }
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary-700 transition-colors">
            {photoLoading ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{user?.full_name || 'Complete your profile'}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2 rounded-full transition-all duration-700" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-sm font-bold text-primary-600">{completion}% Complete</span>
          </div>
        </div>
        {completion < 80 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertCircle size={16} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Complete your profile to see more scholarships</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <User size={18} className="text-primary-600" /> Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input {...register('full_name', { required: true })} type="text" placeholder="Your full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Date of Birth</label>
              <input {...register('dob')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
              <select {...register('gender')} className="input-field">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
              <textarea {...register('address')} rows={2} placeholder="Full address" className="input-field resize-none" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5">📍 Location</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">State</label>
              <select {...register('state')} className="input-field">
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">District</label>
              <input {...register('district')} type="text" placeholder="Your district" className="input-field" />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5">🎓 Academic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">College / Institute</label>
              <input {...register('college')} type="text" placeholder="College name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">University</label>
              <input {...register('university')} type="text" placeholder="University name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Course</label>
              <select {...register('course')} className="input-field">
                <option value="">Select course</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Branch / Specialization</label>
              <input {...register('branch')} type="text" placeholder="e.g. Computer Science" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Current Semester</label>
              <input {...register('semester')} type="number" min="1" max="12" placeholder="e.g. 5" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">CGPA</label>
              <input {...register('cgpa')} type="number" min="0" max="10" step="0.01" placeholder="e.g. 8.5" className="input-field" />
            </div>
          </div>
        </div>

        {/* Eligibility Info */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5">📋 Eligibility Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select {...register('category')} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Religion</label>
              <input {...register('religion')} type="text" placeholder="e.g. Hindu, Muslim, Christian" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Annual Family Income (₹)</label>
              <input {...register('family_income')} type="number" placeholder="e.g. 300000" className="input-field" />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'is_minority', label: 'Minority Status' },
              { name: 'has_disability', label: 'Disability' },
              { name: 'has_sports_quota', label: 'Sports Quota' },
              { name: 'has_ncc', label: 'NCC' },
            ].map((item) => (
              <label key={item.name} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input {...register(item.name as any)} type="checkbox" className="w-4 h-4 rounded accent-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary px-8 py-3 rounded-2xl">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
}
