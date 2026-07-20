import api from './api';

export const careerService = {
  analyzeSkillGap: async (jobDescription: string, targetRole?: string) => {
    const res = await api.post('/career/skill-gap', { job_description: jobDescription, target_role: targetRole });
    return res.data;
  },

  getJobs: async (params?: { search?: string; job_type?: string; work_mode?: string }) => {
    const res = await api.get('/career/jobs', { params });
    return res.data;
  },

  getInternships: async (params?: { search?: string; work_mode?: string }) => {
    const res = await api.get('/career/internships', { params });
    return res.data;
  },

  getCareerPaths: async () => {
    const res = await api.get('/career/career-paths');
    return res.data;
  },
};
