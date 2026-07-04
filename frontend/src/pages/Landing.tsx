import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Search, FileCheck, Bell, TrendingUp, Shield,
  ArrowRight, CheckCircle2, Star, ChevronDown, ChevronUp,
  BookOpen, Award, Users, Globe, ExternalLink,
  BarChart3, Sparkles
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  }),
};

const features = [
  { icon: Search, title: 'Smart Discovery', desc: 'Find scholarships tailored to your profile with intelligent filtering and search.', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { icon: Sparkles, title: 'AI Eligibility Engine', desc: 'Instantly know if you qualify based on CGPA, income, category, state, and more.', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { icon: FileCheck, title: 'Document Wallet', desc: 'Securely store and manage all your documents — Aadhaar, income cert, marks card.', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { icon: Bell, title: 'Deadline Reminders', desc: 'Never miss a deadline with smart notifications and calendar integration.', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { icon: TrendingUp, title: 'Application Tracker', desc: 'Track every application from draft to approval with real-time status updates.', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { icon: Shield, title: 'Secure & Private', desc: 'Bank-grade security with JWT auth and encrypted document storage.', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
];

const steps = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up and fill in your academic, personal and financial details.' },
  { step: '02', title: 'Discover Scholarships', desc: 'Our AI engine instantly shows eligible scholarships matching your profile.' },
  { step: '03', title: 'Upload Documents', desc: 'Add required documents to your secure wallet for easy access.' },
  { step: '04', title: 'Apply & Track', desc: 'Apply with one click and track your applications in real-time.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'B.Tech Student, IIT Delhi', text: 'ScholarBridge helped me discover 12 scholarships I never knew about! Got the Tata Trust scholarship worth ₹1 lakh.', rating: 5, avatar: 'P' },
  { name: 'Rahul Patil', role: 'M.Sc Student, Pune University', text: 'The eligibility engine saved me hours of research. It instantly told me which scholarships I qualify for with reasons!', rating: 5, avatar: 'R' },
  { name: 'Ananya Krishnan', role: 'BA Student, JNU', text: 'The document wallet is amazing. I uploaded everything once and it auto-fills for every application. Life-changing!', rating: 5, avatar: 'A' },
];

const faqs = [
  { q: 'Is ScholarBridge free to use?', a: 'Yes! ScholarBridge is completely free for students. We believe access to education funding information should be accessible to everyone.' },
  { q: 'How does the eligibility engine work?', a: 'Our engine compares your profile (CGPA, income, category, state, course, gender, minority status, etc.) against each scholarship\'s criteria and shows you Eligible, Partially Eligible, or Not Eligible status with reasons.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted, documents are stored securely, and we use JWT-based authentication. We never sell your personal information.' },
  { q: 'How many scholarships are listed?', a: 'We list hundreds of government and private scholarships across India, updated regularly with new opportunities.' },
  { q: 'Can I track my application status?', a: 'Yes! The application tracker shows you real-time status updates from Draft to Approved with admin remarks.' },
];

const stats = [
  { value: '500+', label: 'Scholarships Listed', icon: BookOpen },
  { value: '50,000+', label: 'Students Helped', icon: Users },
  { value: '₹10Cr+', label: 'Funds Facilitated', icon: Award },
  { value: '98%', label: 'Satisfaction Rate', icon: Star },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 bg-hero-pattern dark:hero-gradient-dark overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6"
            >
              <Sparkles size={14} />
              AI-Powered Scholarship Discovery
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6"
            >
              Find Scholarships{' '}
              <span className="gradient-text">You Deserve</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              ScholarBridge uses AI to match your profile with hundreds of scholarships, verify your documents, and track every application — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/auth/signup" className="btn-primary text-base px-8 py-3.5 rounded-2xl shadow-glow">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/auth/login" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
                Sign In
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
            >
              {['No Credit Card Required', 'Free Forever', '100% Secure'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <stat.icon size={24} className="text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make your scholarship journey effortless and effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="card-hover group"
              >
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Get Started in <span className="gradient-text">4 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              From signup to scholarship approval — we guide you every step.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-300 to-indigo-300 dark:from-primary-800 dark:to-indigo-800" />
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="relative text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-glow mb-5">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/auth/signup" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
              Get Started Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Students Love <span className="gradient-text">ScholarBridge</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Join thousands of students who found their scholarship with us.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left p-1"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-primary-600 shrink-0" />
                    : <ChevronDown size={18} className="text-gray-400 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Find Your Scholarship?
            </h2>
            <p className="text-primary-100 text-xl mb-8">
              Join 50,000+ students who discovered their dream scholarship on ScholarBridge.
            </p>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary-700 font-bold text-base hover:bg-primary-50 shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <span className="font-bold text-white">ScholarBridge</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered scholarship discovery and document verification platform for Indian students.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth/signup" className="hover:text-primary-400 transition-colors">Get Started</Link></li>
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-primary-400 transition-colors">FAQ</a></li>
                <li><a href="mailto:support@scholarbridge.com" className="hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-3">
                {['Twitter', 'GitHub', 'LinkedIn'].map((name, i) => (
                  <a key={i} href="#" className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white text-xs font-medium transition-colors">
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © {new Date().getFullYear()} ScholarBridge. All rights reserved. Made with ❤️ for Indian students.
          </div>
        </div>
      </footer>
    </div>
  );
}
