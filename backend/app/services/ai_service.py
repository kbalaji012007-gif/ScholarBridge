"""
AI Service — wraps Google Gemini API with graceful mock fallback.

Provider selection is controlled by settings.AI_PROVIDER:
  "gemini" → uses google-generativeai
  "openai" → uses openai (optional)
  "mock"   → returns realistic pre-built responses (no API key needed)
"""
import logging
import json
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


# ─── Gemini Client (lazy init) ─────────────────────────────────────────
_gemini_model = None


def _get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    return _gemini_model


def _call_gemini(prompt: str) -> str:
    """Call Gemini API and return text response."""
    try:
        model = _get_gemini_model()
        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": settings.AI_MAX_TOKENS, "temperature": settings.AI_TEMPERATURE}
        )
        return response.text.strip()
    except Exception as e:
        logger.error("Gemini API error: %s", repr(e))
        raise


# ─── AI Functions ──────────────────────────────────────────────────────

def analyze_resume(resume_text: str, target_role: Optional[str] = None) -> dict:
    """
    Analyze a resume and return structured feedback.
    Returns: {ats_score, ats_grade, extracted_skills, strengths, weaknesses,
               missing_keywords, improvement_suggestions, ai_summary}
    """
    if settings.AI_PROVIDER == "mock" or not resume_text:
        return _mock_resume_analysis(target_role)

    role_ctx = f"Target role: {target_role}. " if target_role else ""
    prompt = f"""
You are an expert ATS resume analyzer and career coach.
{role_ctx}
Analyze the following resume and return a JSON object with exactly these keys:
{{
  "ats_score": <integer 0-100>,
  "ats_grade": "<Excellent|Good|Average|Poor>",
  "extracted_skills": ["skill1", "skill2", ...],
  "extracted_experience": [{{"company": "...", "role": "...", "duration": "..."}}],
  "extracted_education": [{{"degree": "...", "institution": "...", "year": "..."}}],
  "extracted_projects": [{{"name": "...", "description": "...", "tech_stack": ["..."]}}],
  "extracted_achievements": ["achievement1", ...],
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "improvement_suggestions": ["suggestion1", "suggestion2", ...],
  "ai_summary": "<2-3 sentence professional summary>"
}}

RESUME TEXT:
{resume_text[:4000]}

Return ONLY valid JSON, no markdown, no explanation.
"""
    try:
        response_text = _call_gemini(prompt)
        # Strip potential markdown code fences
        if "```" in response_text:
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text.strip())
    except Exception as e:
        logger.warning("AI resume analysis failed, using mock: %s", repr(e))
        return _mock_resume_analysis(target_role)


def analyze_skill_gap(resume_skills: list, job_description: str) -> dict:
    """
    Compare resume skills against a job description.
    Returns: {match_percent, matched_skills, missing_skills, recommended_technologies, learning_time}
    """
    if settings.AI_PROVIDER == "mock":
        return _mock_skill_gap(resume_skills)

    prompt = f"""
You are a technical recruiter and career advisor.
Analyze the skill gap between this candidate's skills and the job description.

Candidate Skills: {', '.join(resume_skills) if resume_skills else 'Not provided'}

Job Description:
{job_description[:2000]}

Return a JSON object:
{{
  "match_percent": <integer 0-100>,
  "matched_skills": ["skill1", ...],
  "missing_skills": ["skill1", ...],
  "recommended_technologies": ["tech1", ...],
  "learning_resources": [{{"skill": "...", "resource": "...", "url": "..."}}],
  "estimated_learning_weeks": <integer>,
  "priority_skills": ["skill1", "skill2"],
  "summary": "<1-2 sentence gap summary>"
}}

Return ONLY valid JSON.
"""
    try:
        response_text = _call_gemini(prompt)
        if "```" in response_text:
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text.strip())
    except Exception as e:
        logger.warning("Skill gap analysis failed, using mock: %s", repr(e))
        return _mock_skill_gap(resume_skills)


def generate_roadmap(goal: str, current_skills: list, duration_days: int) -> dict:
    """
    Generate a personalized learning roadmap.
    Returns: {phases: [{phase, title, days, topics, resources, projects, platforms}]}
    """
    if settings.AI_PROVIDER == "mock":
        return _mock_roadmap(goal, duration_days)

    skills_ctx = f"Current skills: {', '.join(current_skills)}" if current_skills else "Beginner level"
    num_phases = 3 if duration_days >= 60 else 2

    prompt = f"""
You are a senior software engineer and career mentor.
Create a detailed {duration_days}-day learning roadmap for: {goal}
{skills_ctx}

Return a JSON object:
{{
  "title": "<Roadmap title>",
  "summary": "<2-3 sentence overview>",
  "phases": [
    {{
      "phase": 1,
      "title": "<Phase name>",
      "days": "<start-end>",
      "description": "<what they'll achieve>",
      "topics": ["topic1", "topic2"],
      "resources": [
        {{"type": "youtube", "title": "...", "channel": "...", "url": "#"}},
        {{"type": "documentation", "title": "...", "url": "#"}}
      ],
      "projects": ["project1", "project2"],
      "platforms": ["LeetCode", "HackerRank"]
    }}
  ],
  "final_project": "<Capstone project idea>",
  "career_outcome": "<Expected outcome after completion>"
}}

Make it specific, practical, and achievable. Return ONLY valid JSON.
"""
    try:
        response_text = _call_gemini(prompt)
        if "```" in response_text:
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text.strip())
    except Exception as e:
        logger.warning("Roadmap generation failed, using mock: %s", repr(e))
        return _mock_roadmap(goal, duration_days)


def generate_interview_questions(role: str, category: str, count: int = 10) -> list:
    """
    Generate interview questions for a given role and category.
    """
    if settings.AI_PROVIDER == "mock":
        return _mock_interview_questions(role, category)

    prompt = f"""
You are a senior interviewer at a top tech company.
Generate {count} {category} interview questions for the role: {role}

Return a JSON array:
[
  {{
    "question": "<question text>",
    "difficulty": "<Easy|Medium|Hard>",
    "expected_answer": "<key points to cover>",
    "tips": "<tip for answering>",
    "category": "{category}"
  }}
]

Return ONLY valid JSON array.
"""
    try:
        response_text = _call_gemini(prompt)
        if "```" in response_text:
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text.strip())
    except Exception as e:
        logger.warning("Interview question generation failed, using mock: %s", repr(e))
        return _mock_interview_questions(role, category)


def chat_with_assistant(message: str, user_context: dict, history: list) -> str:
    """
    Generate AI Career Assistant response.
    user_context: {name, college, course, cgpa, skills, career_interests, ...}
    history: [{role, message}] — recent chat history
    """
    if settings.AI_PROVIDER == "mock":
        return _mock_chat_response(message, user_context)

    # Build context string
    ctx_parts = []
    if user_context.get("name"):
        ctx_parts.append(f"Student: {user_context['name']}")
    if user_context.get("college"):
        ctx_parts.append(f"College: {user_context['college']}")
    if user_context.get("course"):
        ctx_parts.append(f"Course: {user_context['course']}, Branch: {user_context.get('branch', '')}")
    if user_context.get("cgpa"):
        ctx_parts.append(f"CGPA: {user_context['cgpa']}")
    if user_context.get("skills"):
        ctx_parts.append(f"Skills: {', '.join(user_context['skills'][:10])}")
    if user_context.get("career_interests"):
        ctx_parts.append(f"Career interests: {', '.join(user_context['career_interests'])}")

    context_str = "\n".join(ctx_parts) if ctx_parts else "No profile data available."

    # Build conversation history
    history_str = ""
    for h in history[-6:]:  # Last 6 messages
        role_label = "Student" if h["role"] == "user" else "CareerBridge AI"
        history_str += f"\n{role_label}: {h['message']}"

    prompt = f"""You are CareerBridge AI, a friendly and knowledgeable career and scholarship advisor for Indian students.
You help students with: scholarship eligibility, career guidance, resume improvement, skill development, internships, placement preparation.
Always be encouraging, specific, and practical. Use Indian context (rupees, NSP, AICTE, etc.).
Keep responses concise but complete. Use bullet points for lists.

Student Profile:
{context_str}

Conversation History:{history_str}

Student: {message}

CareerBridge AI:"""

    try:
        return _call_gemini(prompt)
    except Exception as e:
        logger.warning("Chat assistant failed, using mock: %s", repr(e))
        return _mock_chat_response(message, user_context)


def recommend_certifications(skills: list, career_interests: list) -> list:
    """
    Recommend certifications based on skills and career interests.
    Returns a list of certification names to look up from DB.
    """
    if settings.AI_PROVIDER == "mock":
        return ["Google Data Analytics", "AWS Cloud Practitioner", "Python for Everybody"]

    prompt = f"""
Student skills: {', '.join(skills) if skills else 'beginner'}
Career interests: {', '.join(career_interests) if career_interests else 'general software development'}

List the top 5 most valuable certifications for this student. Focus on free or affordable options.
Return a JSON array of certification names only: ["cert1", "cert2", ...]
"""
    try:
        response_text = _call_gemini(prompt)
        if "```" in response_text:
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text.strip())
    except Exception:
        return ["Google Data Analytics", "AWS Cloud Practitioner", "Python for Everybody"]


# ─── Mock Responses ────────────────────────────────────────────────────

def _mock_resume_analysis(target_role: Optional[str] = None) -> dict:
    return {
        "ats_score": 72,
        "ats_grade": "Good",
        "extracted_skills": ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Excel", "Data Visualization"],
        "extracted_experience": [
            {"company": "TechCorp Pvt Ltd", "role": "Python Intern", "duration": "June 2024 - Aug 2024"}
        ],
        "extracted_education": [
            {"degree": "B.Tech Computer Science", "institution": "VTU Bangalore", "year": "2022-2026"}
        ],
        "extracted_projects": [
            {"name": "Student Grade Predictor", "description": "ML model to predict grades", "tech_stack": ["Python", "Scikit-learn"]},
            {"name": "E-Commerce Dashboard", "description": "Analytics dashboard", "tech_stack": ["Python", "Streamlit", "SQL"]}
        ],
        "extracted_achievements": ["Finalist - National Hackathon 2024", "Dean's List 2023"],
        "strengths": [
            "Strong technical skills section with relevant technologies",
            "Project descriptions include tech stack",
            "Internship experience adds industry credibility",
        ],
        "weaknesses": [
            "No quantified achievements (add numbers like '20% improvement')",
            "Summary/objective section is missing",
            "Action verbs could be stronger (use 'Developed', 'Engineered', 'Optimized')",
        ],
        "missing_keywords": ["TensorFlow", "Power BI", "A/B Testing", "Statistical Analysis", "Tableau"],
        "improvement_suggestions": [
            "Add a 2-3 line professional summary at the top targeting your goal role",
            "Quantify each bullet point: e.g., 'Improved model accuracy by 15% using feature engineering'",
            "Add GitHub links to all projects",
            "Include relevant coursework: Machine Learning, DBMS, Data Structures",
            "Add a certifications section with Google Data Analytics or similar",
        ],
        "ai_summary": "This is a solid resume for a B.Tech student with good technical skills and relevant internship experience. With quantified achievements and a targeted summary, it could reach a 85+ ATS score."
    }


def _mock_skill_gap(resume_skills: list) -> dict:
    missing = ["Docker", "Kubernetes", "System Design", "Redis", "GraphQL"]
    matched = resume_skills[:5] if resume_skills else ["Python", "SQL"]
    return {
        "match_percent": 62,
        "matched_skills": matched,
        "missing_skills": missing,
        "recommended_technologies": ["Docker", "FastAPI", "Redis", "System Design Basics"],
        "learning_resources": [
            {"skill": "Docker", "resource": "Docker Official Docs", "url": "https://docs.docker.com"},
            {"skill": "System Design", "resource": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer"},
        ],
        "estimated_learning_weeks": 8,
        "priority_skills": ["Docker", "System Design"],
        "summary": "You match 62% of the job requirements. Focus on Docker and System Design as priority gaps."
    }


def _mock_roadmap(goal: str, duration_days: int) -> dict:
    return {
        "title": f"{goal} Roadmap — {duration_days} Days",
        "summary": f"A structured {duration_days}-day plan to become proficient in {goal}. This roadmap takes you from foundational concepts to job-ready skills with hands-on projects.",
        "phases": [
            {
                "phase": 1,
                "title": "Foundation",
                "days": f"1-{duration_days // 3}",
                "description": "Build core concepts and fundamentals",
                "topics": ["Python Basics", "Data Structures", "OOP Concepts", "Git & GitHub"],
                "resources": [
                    {"type": "youtube", "title": "Python for Beginners", "channel": "Corey Schafer", "url": "https://youtube.com"},
                    {"type": "documentation", "title": "Python Official Docs", "url": "https://docs.python.org"}
                ],
                "projects": ["Build a CLI calculator", "Create a to-do app"],
                "platforms": ["HackerRank", "W3Schools"]
            },
            {
                "phase": 2,
                "title": "Core Skills",
                "days": f"{duration_days // 3 + 1}-{2 * duration_days // 3}",
                "description": "Develop intermediate and domain-specific skills",
                "topics": ["SQL & Databases", "Data Analysis with Pandas", "Statistics & Probability", "Data Visualization"],
                "resources": [
                    {"type": "youtube", "title": "SQL Tutorial", "channel": "techTFQ", "url": "https://youtube.com"},
                    {"type": "platform", "title": "Mode Analytics SQL Tutorial", "url": "https://mode.com/sql-tutorial"}
                ],
                "projects": ["Data analysis on Kaggle dataset", "Sales dashboard with Matplotlib"],
                "platforms": ["Kaggle", "LeetCode"]
            },
            {
                "phase": 3,
                "title": "Advanced & Portfolio",
                "days": f"{2 * duration_days // 3 + 1}-{duration_days}",
                "description": "Build a job-ready portfolio with real projects",
                "topics": ["Machine Learning Basics", "Model Evaluation", "Deployment with Streamlit", "Interview Prep"],
                "resources": [
                    {"type": "youtube", "title": "Machine Learning Course", "channel": "StatQuest", "url": "https://youtube.com"},
                    {"type": "documentation", "title": "Scikit-learn Docs", "url": "https://scikit-learn.org"}
                ],
                "projects": ["End-to-end ML project", "Interactive dashboard deployed on Streamlit Cloud"],
                "platforms": ["Kaggle", "GitHub", "Streamlit Cloud"]
            }
        ],
        "final_project": f"Build a complete {goal.lower()} portfolio with 3 real-world projects and deploy it publicly",
        "career_outcome": f"After completing this roadmap, you'll be ready for {goal} internships and entry-level positions"
    }


def _mock_interview_questions(role: str, category: str) -> list:
    base_questions = {
        "HR": [
            {"question": "Tell me about yourself.", "difficulty": "Easy", "expected_answer": "Brief background, education, projects, and why you want this role.", "tips": "Keep it under 2 minutes. End with why you're excited about this company.", "category": "HR"},
            {"question": "Where do you see yourself in 5 years?", "difficulty": "Easy", "expected_answer": "Show ambition aligned with the company's growth.", "tips": "Be specific but flexible. Show you've thought about it.", "category": "HR"},
            {"question": "What is your greatest weakness?", "difficulty": "Medium", "expected_answer": "Choose a real weakness and explain how you're working on it.", "tips": "Never say 'I'm a perfectionist'. Be genuine.", "category": "HR"},
        ],
        "Technical": [
            {"question": f"Explain the core concepts of {role} that you use daily.", "difficulty": "Medium", "expected_answer": "List key concepts with brief explanations.", "tips": "Use examples from your projects.", "category": "Technical"},
            {"question": "How do you approach debugging a complex problem?", "difficulty": "Medium", "expected_answer": "Systematic approach: reproduce → isolate → fix → test.", "tips": "Walk through a real example from your experience.", "category": "Technical"},
            {"question": "Describe a challenging technical project you built.", "difficulty": "Hard", "expected_answer": "STAR format: Situation, Task, Action, Result.", "tips": "Quantify the impact. Mention tools and your specific contribution.", "category": "Technical"},
        ],
        "Behavioral": [
            {"question": "Describe a time you worked in a team under pressure.", "difficulty": "Medium", "expected_answer": "STAR format with emphasis on collaboration and outcome.", "tips": "Focus on your role and what you specifically did.", "category": "Behavioral"},
            {"question": "Tell me about a time you failed and what you learned.", "difficulty": "Medium", "expected_answer": "Show self-awareness and growth mindset.", "tips": "Don't choose a catastrophic failure. Show the lesson clearly.", "category": "Behavioral"},
        ],
        "Coding": [
            {"question": "Reverse a linked list.", "difficulty": "Easy", "expected_answer": "Iterative or recursive approach. O(n) time, O(1) space.", "tips": "Draw it out first. Handle edge cases (null, single node).", "category": "Coding"},
            {"question": "Find the most frequent element in an array.", "difficulty": "Easy", "expected_answer": "Use HashMap/Counter. O(n) time.", "tips": "Ask about constraints first. Mention multiple approaches.", "category": "Coding"},
        ]
    }
    return base_questions.get(category, base_questions["Technical"])


def _mock_chat_response(message: str, user_context: dict) -> str:
    message_lower = message.lower()
    name = user_context.get("name", "").split()[0] if user_context.get("name") else "there"

    if any(w in message_lower for w in ["scholarship", "eligible", "qualify"]):
        return f"""Hi {name}! Based on your profile, here are your top scholarship matches:

🏆 **Reliance Foundation Scholarship** — ₹2,00,000/year
   - Status: ✅ Eligible | Deadline: October 31, 2025

🎓 **AICTE Merit Scholarship** — ₹50,000
   - Status: ✅ Eligible | Deadline: September 15, 2025

📚 **NSP Central Sector Scheme** — ₹12,000/year
   - Status: ✅ Eligible | Deadline: November 30, 2025

**Required Documents**: Aadhaar, Income Certificate, Marks Card, Bank Passbook

Go to the **Scholarships** section to see all 14 eligible scholarships and apply directly! 🚀"""

    elif any(w in message_lower for w in ["resume", "cv", "improve"]):
        return """Here are my top resume improvement tips for you:

**1. Add a Professional Summary** (2-3 lines at the top)
> "Final year B.Tech CSE student with expertise in Python and ML, seeking a Data Analyst role..."

**2. Quantify Everything**
- ❌ "Improved model performance"
- ✅ "Improved model accuracy by 18% using feature engineering"

**3. Must-Have Sections**:
- Skills (Python, SQL, Tableau, Git)
- Projects with GitHub links
- Achievements with numbers
- Relevant Coursework

**4. ATS Keywords to Add**: TensorFlow, Power BI, Statistical Analysis, A/B Testing

Want me to analyze your uploaded resume? Upload it in the **Resume Analyzer** module! 📄"""

    elif any(w in message_lower for w in ["skill", "learn", "roadmap", "how to become"]):
        return f"""Great question, {name}! Here's a quick roadmap:

**Step 1: Foundation** (Week 1-2)
- Python → pandas, NumPy
- SQL → SELECT, GROUP BY, JOINs
- Git & GitHub

**Step 2: Core Skills** (Week 3-6)
- Data cleaning & EDA
- Data visualization (Matplotlib, Seaborn)
- Statistics & probability

**Step 3: Advanced** (Week 7-10)
- Machine Learning basics (Scikit-learn)
- Portfolio projects on Kaggle
- Deploy a dashboard on Streamlit

**Recommended Certifications**:
- Google Data Analytics (Coursera) — Free with financial aid
- IBM Data Science Professional

Would you like me to generate a detailed **30/60/90 day roadmap** in the Learning Roadmap module? 🗺️"""

    else:
        return f"""Hello {name}! I'm your CareerBridge AI Career Assistant, powered by Gemini AI. I can help you with:

🎓 **Scholarships** — Find scholarships you're eligible for
📄 **Resume** — Review and improve your resume
💼 **Career** — Get job/internship matches
🗺️ **Roadmap** — Build a personalized learning plan
🏆 **Interview** — Practice HR, Technical & Coding questions
🛠️ **Skills** — Identify and fill skill gaps

What would you like help with today? Just ask me anything!"""
