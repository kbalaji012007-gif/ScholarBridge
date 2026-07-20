import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ExternalLink, Plus } from 'lucide-react';

const certifications = [
  { id: 1, name: 'Google Data Analytics', provider: 'Google / Coursera', level: 'Beginner', skills_covered: ['SQL', 'Data Analysis', 'Tableau', 'R'], is_free: true, cost: 'Free (audit)', url: 'https://coursera.org', rating: 4.8 },
  { id: 2, name: 'AWS Cloud Practitioner', provider: 'Amazon Web Services', level: 'Beginner', skills_covered: ['Cloud Computing', 'AWS', 'Networking'], is_free: false, cost: '$100 exam', url: 'https://aws.amazon.com', rating: 4.7 },
  { id: 3, name: 'Python for Everybody', provider: 'University of Michigan / Coursera', level: 'Beginner', skills_covered: ['Python', 'Data Structures', 'Databases'], is_free: true, cost: 'Free (audit)', url: 'https://coursera.org', rating: 4.9 },
  { id: 4, name: 'Meta Backend Developer', provider: 'Meta / Coursera', level: 'Intermediate', skills_covered: ['Django', 'REST APIs', 'MySQL', 'Python'], is_free: false, cost: '$49/month', url: 'https://coursera.org', rating: 4.6 },
  { id: 5, name: 'IBM Data Science Professional', provider: 'IBM / Coursera', level: 'Intermediate', skills_covered: ['Python', 'Machine Learning', 'SQL', 'Data Visualization'], is_free: false, cost: 'Free with audit', url: 'https://coursera.org', rating: 4.7 },
  { id: 6, name: 'Microsoft Azure Fundamentals AZ-900', provider: 'Microsoft', level: 'Beginner', skills_covered: ['Azure', 'Cloud Computing', 'Networking'], is_free: false, cost: '$165 exam', url: 'https://learn.microsoft.com', rating: 4.6 },
];

export default function Certifications() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
          <BadgeCheck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Certifications</h1>
          <p className="section-subtitle text-sm">Industry-recognized certifications matched to your career goals</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {certifications.map((cert, i) => (
          <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="career-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{cert.name}</h3>
                <p className="text-slate-400 text-xs">{cert.provider}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge ${cert.is_free ? 'badge-eligible' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {cert.is_free ? 'Free' : cert.cost}
                </span>
                <span className="text-xs text-slate-500">⭐ {cert.rating}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {cert.skills_covered.map(s => (
                <span key={s} className="px-2 py-0.5 rounded-lg bg-accent-950/40 text-accent-400 text-xs border border-accent-800/30">{s}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <a href={cert.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex-1 justify-center">
                View Course <ExternalLink size={12} />
              </a>
              <button className="btn-ghost text-xs"><Plus size={14} /> Track</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
