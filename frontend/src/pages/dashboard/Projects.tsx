import React from 'react';
import { motion } from 'framer-motion';
import { Code2, ExternalLink, GitBranch, Star } from 'lucide-react';

const projects = [
  { title: 'Data Analytics Dashboard', tech: ['Python', 'Streamlit', 'Pandas', 'Plotly'], difficulty: 'Beginner', description: 'Build an interactive dashboard analyzing real-world sales data with filters, charts, and insights.', github: '#', time: '2-3 days' },
  { title: 'URL Shortener API', tech: ['FastAPI', 'PostgreSQL', 'Redis', 'Docker'], difficulty: 'Intermediate', description: 'RESTful URL shortener with click analytics, expiry, and rate limiting.', github: '#', time: '4-5 days' },
  { title: 'ML Salary Predictor', tech: ['Python', 'Scikit-learn', 'Flask', 'Heroku'], difficulty: 'Intermediate', description: 'End-to-end ML pipeline predicting tech salaries. Includes model training, API, and simple frontend.', github: '#', time: '5-7 days' },
  { title: 'Student Notes App', tech: ['React', 'Node.js', 'MongoDB', 'JWT'], difficulty: 'Beginner', description: 'Full-stack CRUD app for student notes with auth, categories, and search.', github: '#', time: '3-4 days' },
  { title: 'Campus Lost & Found Portal', tech: ['Django', 'PostgreSQL', 'Tailwind', 'Cloudinary'], difficulty: 'Intermediate', description: 'Community portal for campus lost & found items with image uploads and notifications.', github: '#', time: '7-10 days' },
  { title: 'Resume Parser CLI', tech: ['Python', 'pdfplumber', 'spaCy', 'argparse'], difficulty: 'Beginner', description: 'Command-line tool that extracts skills, experience, and education from PDF resumes.', github: '#', time: '2-3 days' },
];

const diffColor = (d: string) => d === 'Beginner' ? 'badge-eligible' : d === 'Hard' ? 'badge-not-eligible' : 'badge-partial';

export default function Projects() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Code2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Project Ideas</h1>
          <p className="section-subtitle text-sm">Portfolio-worthy projects that impress recruiters</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="career-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`badge ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
              <span className="text-xs text-slate-500">⏱ {p.time}</span>
            </div>
            <h3 className="font-bold text-slate-100 mb-2">{p.title}</h3>
            <p className="text-slate-400 text-xs mb-3 leading-relaxed">{p.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.tech.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700">{t}</span>
              ))}
            </div>
            <a href={p.github} className="btn-ghost text-xs gap-1.5">
              <Github size={13} /> View on GitHub <ExternalLink size={11} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
