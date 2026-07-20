import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  GraduationCap, Search, FileCheck, Bell, TrendingUp, Shield,
  ArrowRight, CheckCircle2, Star, ChevronDown, ChevronUp,
  BookOpen, Award, Users, Globe, Sparkles, Brain, Target,
  Briefcase, Code2, Rocket, Bot, BarChart3, FileText,
  Zap, ChevronRight, MessageSquare, Lightbulb, Map,
  Trophy, Building2, BadgeCheck, PlayCircle
} from 'lucide-react';

// ─── Animation Variants ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

// ─── Data ────────────────────────────────────────────────────────────
const modules = [
  { icon: Search, title: 'Scholarship Discovery', desc: 'Find 200+ verified scholarships from NSP, Karnataka SSP, AICTE, and top private providers matched to your exact profile.', color: 'from-blue-500 to-indigo-600', tag: 'Scholarships' },
  { icon: BadgeCheck, title: 'Eligibility Engine', desc: 'Instant AI eligibility check across CGPA, income, category, state, course, gender — with clear reasons and document checklist.', color: 'from-emerald-500 to-teal-600', tag: 'AI' },
  { icon: FileText, title: 'Resume Analyzer', desc: 'Upload your resume and get an ATS score, missing keywords, skill extraction, strengths, weaknesses, and improvement suggestions.', color: 'from-secondary-500 to-purple-600', tag: 'AI' },
  { icon: Target, title: 'Career Match Engine', desc: 'Get matched to jobs and internships based on your skills, education, and interests. Understand your fit percentage.', color: 'from-accent-500 to-blue-600', tag: 'Career' },
  { icon: Zap, title: 'Skill Gap Analyzer', desc: 'Compare your current skills against any job description. See match %, missing skills, and estimated learning time.', color: 'from-amber-500 to-orange-600', tag: 'Career' },
  { icon: Map, title: 'Learning Roadmap', desc: 'Get a personalized 30/60/90-day roadmap with projects, courses, YouTube resources, and practice platforms.', color: 'from-rose-500 to-pink-600', tag: 'Career' },
  { icon: Trophy, title: 'Interview Preparation', desc: 'Practice HR, technical, behavioral, and coding questions. Get mock interview scores and an interview readiness rating.', color: 'from-violet-500 to-secondary-600', tag: 'Placement' },
  { icon: Bot, title: 'AI Career Assistant', desc: 'Chat with your personal AI guide. Ask anything — scholarship eligibility, career paths, resume tips, project ideas.', color: 'from-primary-500 to-accent-500', tag: 'AI' },
];

const journey = [
  { step: '01', icon: GraduationCap, title: 'Admission', desc: 'Profile setup with academic details, branch, college, CGPA, income, and category.', color: 'from-primary-600 to-indigo-600' },
  { step: '02', icon: Search, title: 'Scholarship', desc: 'AI matches you with 200+ scholarships. Track applications, upload documents, meet deadlines.', color: 'from-emerald-500 to-teal-600' },
  { step: '03', icon: FileText, title: 'Resume & Skills', desc: 'Upload resume, get ATS score, fix gaps, build projects, earn certifications.', color: 'from-secondary-500 to-purple-600' },
  { step: '04', icon: Briefcase, title: 'Career & Internships', desc: 'Get matched to internships and jobs. Analyze skill gap vs job requirements.', color: 'from-accent-500 to-blue-600' },
  { step: '05', icon: Trophy, title: 'Placement', desc: 'Prepare for interviews, mock sessions, coding questions, and get placement-ready.', color: 'from-amber-500 to-orange-600' },
];

const stats = [
  { value: '200+', label: 'Verified Scholarships', icon: BookOpen },
  { value: '15', label: 'AI-Powered Modules', icon: Brain },
  { value: '₹50Cr+', label: 'Funds Facilitated', icon: Award },
  { value: '1 Platform', label: 'From Admission to Placement', icon: Rocket },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'B.Tech CSE, IIT Delhi', text: 'CareerBridge AI found me 12 scholarships I never knew existed! The eligibility engine is incredibly accurate. Got the Tata Trust scholarship worth ₹1 lakh.', rating: 5, avatar: 'PS', highlight: '₹1 Lakh Scholarship' },
  { name: 'Rahul Patil', role: 'MCA, Pune University', text: 'The resume analyzer gave me a 91 ATS score after just 2 revisions. The skill gap tool showed me exactly what to learn for a Data Analyst role. Placed at Infosys!', rating: 5, avatar: 'RP', highlight: 'Placed at Infosys' },
  { name: 'Ananya Krishnan', role: 'B.Com, Bangalore University', text: 'The AI Career Assistant answered all my questions instantly. The roadmap feature built me a complete 60-day learning plan. I went from 0 to Python in 2 months!', rating: 5, avatar: 'AK', highlight: 'Learned Python in 60 Days' },
];

const faqs = [
  { q: 'Is CareerBridge AI completely free for students?', a: 'Yes! CareerBridge AI is completely free for students. We believe every student, regardless of background, should have access to career and scholarship guidance.' },
  { q: 'How does the AI eligibility engine work?', a: 'Our engine compares your complete profile (CGPA, family income, category, state, course, gender, minority status, disability, NCC, sports quota) against each scholarship\'s criteria and instantly shows Eligible, Partially Eligible, or Not Eligible — with exact reasons and the required document checklist.' },
  { q: 'What AI technology powers the Career Assistant?', a: 'We use Google Gemini AI with a custom context layer built around your profile, skills, and career goals. This means every response is personalized to you, not generic advice.' },
  { q: 'How does the Resume Analyzer work?', a: 'Upload your PDF resume. Our AI extracts skills, experience, projects, and education. It then checks against ATS systems, identifies missing keywords for your target role, and gives you an actionable improvement report.' },
  { q: 'Can I track my scholarship application status?', a: 'Yes! The Application Tracker shows real-time status from Draft → Submitted → Verified → Approved/Rejected with admin remarks and deadline reminders.' },
  { q: 'What scholarship sources are covered?', a: 'We cover National Scholarship Portal (NSP), Karnataka SSP, AICTE, UGC, Reliance Foundation, HDFC Parivartan, Tata Capital Pankh, ONGC, LIC Golden Jubilee, Kotak Kanya, SBI Asha, and many state government portals — all verified from official sources.' },
];

const partners = [
  'National Scholarship Portal', 'AICTE', 'UGC', 'Reliance Foundation',
  'Tata Trusts', 'HDFC Bank', 'Karnataka SSP', 'ONGC', 'LIC', 'SBI Foundation'
];

// ─── Animated Counter ─────────────────────────────────────────────────
function AnimatedStat({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <motion.div
      variants={fadeUp}
      className="glass-card p-6 text-center group hover:border-primary-700/40 transition-colors duration-300"
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-600/20 to-secondary-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon size={22} className="text-primary-400" />
      </div>
      <div className="text-3xl font-bold gradient-text mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </motion.div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────
function ModuleCard({ mod, index }: { mod: typeof modules[0]; index: number }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      custom={index}
      className="career-card group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <mod.icon size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-slate-100 text-sm">{mod.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              mod.tag === 'AI' ? 'bg-secondary-950/70 text-secondary-400 border border-secondary-700/30' :
              mod.tag === 'Career' ? 'bg-accent-950/70 text-accent-400 border border-accent-700/30' :
              mod.tag === 'Placement' ? 'bg-amber-950/70 text-amber-400 border border-amber-700/30' :
              'bg-primary-950/70 text-primary-400 border border-primary-700/30'
            }`}>{mod.tag}</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{mod.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [typedText, setTypedText] = useState('');
  const phrases = ['Scholarship Discovery', 'Career Guidance', 'Resume Analysis', 'Placement Prep'];
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Typing animation
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const phrase = phrases[phraseIndex];
    if (typedText.length < phrase.length) {
      timeout = setTimeout(() => setTypedText(phrase.slice(0, typedText.length + 1)), 60);
    } else {
      timeout = setTimeout(() => {
        setTypedText('');
        setPhraseIndex((phraseIndex + 1) % phrases.length);
      }, 2200);
    }
    return () => clearTimeout(timeout);
  }, [typedText, phraseIndex]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 hero-gradient mesh-grid overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center max-w-5xl mx-auto">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-950/60 border border-secondary-700/40 text-secondary-300 text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <Sparkles size={14} className="text-secondary-400" />
              India's Most Comprehensive Student Platform
              <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] mb-4 tracking-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <span className="text-slate-100">One Platform for </span>
              <br />
              <span className="gradient-text">Scholarships, Careers</span>
              <br />
              <span className="text-slate-100">&amp; </span>
              <span className="gradient-text-accent">Placement.</span>
            </motion.h1>

            {/* Typing subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg sm:text-xl text-slate-400 mb-4 font-medium"
            >
              AI-Powered{' '}
              <span className="text-secondary-300 font-semibold cursor-blink">{typedText}</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.35 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              From admission to placement — CareerBridge AI guides every student with scholarship matching, resume analysis, career roadmaps, and AI-powered interview prep.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link to="/auth/signup" className="btn-primary text-base px-8 py-3.5 rounded-2xl shadow-glow-violet text-white">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/auth/login" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
                Sign In <ChevronRight size={18} />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-slate-500"
            >
              {['Free Forever', '200+ Verified Scholarships', 'AI-Powered', '100% Secure'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── MODULES GRID ─────────────────────────────────────── */}
      <section id="features" className="py-28 bg-slate-950 relative">
        <div className="absolute inset-0 mesh-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-950/60 border border-secondary-700/30 text-secondary-400 text-xs font-medium mb-4">
              <Brain size={12} /> 15 Integrated Modules
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-100 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From scholarship discovery to placement — all 15 modules work together intelligently on your profile.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => <ModuleCard key={mod.title} mod={mod} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── STUDENT JOURNEY ──────────────────────────────────── */}
      <section id="journey" className="py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-950/60 border border-accent-700/30 text-accent-400 text-xs font-medium mb-4">
              <Rocket size={12} /> Complete Student Journey
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-100 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Admission <span className="gradient-text">→</span> Placement
            </h2>
            <p className="text-slate-400 text-lg">We guide you through every critical milestone of your academic career.</p>
          </motion.div>

          {/* Journey Steps */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary-600 via-accent-500 to-amber-500 opacity-30" />

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {journey.map((step, i) => (
                <motion.div
                  key={step.step}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i}
                  className="relative text-center group"
                >
                  <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon size={28} className="text-white mb-1" />
                    <span className="text-white/60 text-xs font-bold">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-slate-100 mb-2 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{step.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/auth/signup" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── AI ASSISTANT PREVIEW ─────────────────────────────── */}
      <section className="py-28 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary-600/8 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-950/60 border border-secondary-700/30 text-secondary-400 text-xs font-medium mb-6">
                <Bot size={12} /> AI Career Assistant
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-100 mb-6 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Ask Anything.<br />
                <span className="gradient-text">Get Smart Answers.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Your personal AI career guide knows your profile, your goals, and your skills. Ask it anything — from scholarship eligibility to the exact projects you should build.
              </p>
              <div className="space-y-3">
                {[
                  '"Which scholarships am I eligible for based on my 8.2 CGPA?"',
                  '"What skills do I need to become a Data Engineer?"',
                  '"Review my resume and suggest improvements."',
                  '"Build me a 60-day Python + SQL roadmap."',
                ].map((q) => (
                  <div key={q} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 hover:border-secondary-700/40 transition-colors cursor-pointer">
                    <MessageSquare size={14} className="text-secondary-400 shrink-0" />
                    {q}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chat UI preview */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={1}
              className="ai-card p-0 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">CareerBridge AI Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-xs text-slate-400">Online · Powered by Gemini AI</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="chat-user text-sm">Which scholarships am I eligible for?</div>
                <div className="chat-ai text-sm space-y-2">
                  <p>Based on your profile (B.Tech CSE, 8.2 CGPA, Karnataka, General Category, Income ₹4.5L/year), you are <strong className="text-emerald-400">eligible for 14 scholarships</strong>:</p>
                  <div className="space-y-1.5 mt-3">
                    {['🏆 Reliance Foundation Scholarship — ₹2,00,000', '✅ AICTE Merit Scholarship — ₹50,000', '✅ Karnataka Rajyotsava Scholarship — ₹25,000'].map((s) => (
                      <div key={s} className="text-xs text-slate-300 flex items-center gap-2">
                        <span>{s}</span>
                      </div>
                    ))}
                    <div className="text-xs text-secondary-400 mt-2">+ 11 more scholarships →</div>
                  </div>
                </div>
                <div className="chat-user text-sm">What documents do I need for Reliance Foundation?</div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                  CareerBridge AI is typing...
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                  <input className="flex-1 bg-transparent text-sm text-slate-300 outline-none placeholder-slate-500" placeholder="Ask anything about your career..." readOnly />
                  <button className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-600 to-primary-600 flex items-center justify-center">
                    <ArrowRight size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-28 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-100 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Students Love{' '}
              <span className="gradient-text">CareerBridge AI</span>
            </h2>
            <p className="text-slate-400 text-lg">Join thousands of students who transformed their careers.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className="glass-card p-6 hover:border-secondary-700/30 transition-colors duration-300"
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/30 text-emerald-400 text-xs font-medium mb-4">
                  <Trophy size={10} /> {t.highlight}
                </div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCHOLARSHIP PARTNERS ─────────────────────────────── */}
      <section className="py-16 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-widest font-medium">Scholarship Sources</p>
          <div className="flex flex-wrap justify-center gap-3">
            {partners.map((p) => (
              <div key={p} className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium hover:border-slate-700 transition-colors">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="py-28 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-100 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${openFaq === i ? 'border-secondary-700/40 bg-slate-900' : 'border-slate-800 bg-slate-900/50'}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left px-6 py-5 gap-4"
                >
                  <span className="font-semibold text-slate-100 text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-secondary-400 shrink-0" />
                    : <ChevronDown size={18} className="text-slate-500 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-4"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-secondary-900 to-slate-950" />
        <div className="absolute inset-0 mesh-grid opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center shadow-glow-violet">
              <Rocket size={28} className="text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ready to Unlock Your Future?
            </h2>
            <p className="text-primary-200 text-xl mb-10">
              Join students discovering scholarships, building careers, and getting placed — all from one platform.
            </p>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-primary-700 font-bold text-base hover:bg-primary-50 shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow">
                  <Rocket size={18} className="text-white" />
                </div>
                <div>
                  <span className="font-black text-slate-100 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>CareerBridge</span>
                  <span className="font-black gradient-text text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}> AI</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                India's most comprehensive AI-powered platform for scholarships, career guidance, and placement preparation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-4 text-sm uppercase tracking-wide">Platform</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link to="/auth/signup" className="hover:text-primary-400 transition-colors">Get Started</Link></li>
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#journey" className="hover:text-primary-400 transition-colors">Student Journey</a></li>
                <li><a href="#faq" className="hover:text-primary-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-4 text-sm uppercase tracking-wide">Modules</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><span className="hover:text-secondary-400 transition-colors cursor-default">Scholarship Discovery</span></li>
                <li><span className="hover:text-secondary-400 transition-colors cursor-default">Resume Analyzer</span></li>
                <li><span className="hover:text-secondary-400 transition-colors cursor-default">Career Match</span></li>
                <li><span className="hover:text-secondary-400 transition-colors cursor-default">AI Assistant</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-4 text-sm uppercase tracking-wide">Connect</h4>
              <div className="flex gap-2">
                {['Twitter', 'GitHub', 'LinkedIn'].map((name) => (
                  <a key={name} href="#" className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-secondary-900 border border-slate-800 hover:border-secondary-700/50 text-slate-500 hover:text-secondary-300 text-xs font-medium transition-all">
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <span>© {new Date().getFullYear()} CareerBridge AI. All rights reserved.</span>
            <span>Made with ❤️ for Indian students — from admission to placement.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
