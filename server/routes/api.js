const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateResumeJson } = require('../services/gemini');
const { buildLatex } = require('../services/latexBuilder');

// ── Dummy template returned when DB is completely empty ────────────────────
const DUMMY_TEMPLATE = {
    isSeeded: true,
    personalInfo: {
        name: 'Your Name',
        email: 'you@email.com',
        phone: '+91-XXXXXXXXXX',
        location: 'City, Country',
        github: 'https://github.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        portfolio: '',
    },
    profiles: [
        { name: 'Full Stack', summary: 'Full Stack developer proficient in MERN stack building scalable web applications.' },
        { name: 'Data Science', summary: 'Data scientist with hands-on ML/AI experience in Python and deep learning.' },
    ],
    education: [
        { degree: 'B.Tech in Computer Science', institution: 'Your University', year: '2024', gpa: '8.5', coursework: ['Data Structures', 'Algorithms', 'Machine Learning', 'DBMS'] },
    ],
    experience: [],
    projects: [
        { title: 'Sample Full Stack Project', description: 'Built a MERN stack web application with JWT authentication, REST APIs, and real-time features.', techStack: ['React', 'Node.js', 'Express', 'MongoDB'], liveLink: '', repoLink: 'https://github.com/yourusername/project', tags: ['MERN', 'Full Stack', 'REST API', 'React'], profileTag: 'Full Stack' },
        { title: 'Sample ML Project', description: 'Trained a classification model using scikit-learn achieving 95% accuracy on Kaggle dataset.', techStack: ['Python', 'scikit-learn', 'Pandas', 'Matplotlib'], liveLink: '', repoLink: 'https://github.com/yourusername/ml-project', tags: ['ML', 'Python', 'Data Science', 'scikit-learn'], profileTag: 'Data Science' },
    ],
    skills: { languages: ['JavaScript', 'Python', 'Java'], frameworks: ['React', 'Node.js', 'Express', 'scikit-learn'], tools: ['Git', 'Docker', 'Postman'], databases: ['MongoDB', 'MySQL'], other: ['REST APIs', 'Machine Learning'] },
    certifications: [
        { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2023-06', credentialLink: '', tags: ['AWS', 'Cloud'], profileTag: 'Full Stack' },
    ],
    generatedResumes: [],
};

// ─────────────────────────────────────────────
// USER CRUD
// ─────────────────────────────────────────────

// GET /api/user
// Logic:
//   - Real user exists (isSeeded=false) → return real data
//   - Only seeded dummy exists → return dummy template (user hasn't saved yet)
//   - No user at all → return DUMMY_TEMPLATE in-memory (no DB write)
router.get('/user', async (req, res) => {
    try {
        const user = await User.findOne().sort({ createdAt: -1 });

        if (!user) {
            // DB is empty — return dummy template so UI doesn't break
            return res.json(DUMMY_TEMPLATE);
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/user — create or update
// When user explicitly saves, mark isSeeded=false so real data is preserved
router.post('/user', async (req, res) => {
    try {
        let user = await User.findOne().sort({ createdAt: -1 });
        const payload = { ...req.body, isSeeded: false }; // mark as real user data

        if (user) {
            // Preserve generatedResumes — don't overwrite with form data
            const savedResumes = user.generatedResumes;
            Object.assign(user, payload);
            user.generatedResumes = savedResumes;
            await user.save();
        } else {
            user = await User.create(payload);
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH /api/user — partial update
router.patch('/user', async (req, res) => {
    try {
        const user = await User.findOne().sort({ createdAt: -1 });
        if (!user) return res.status(404).json({ message: 'No user profile found' });
        Object.assign(user, req.body);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// RESUME GENERATION
// ─────────────────────────────────────────────

// POST /api/generate — takes { jd }, returns { latex, aiJson }
// Also saves the result to user.generatedResumes for history
router.post('/generate', async (req, res) => {
    try {
        const { jd } = req.body;
        if (!jd || jd.trim().length < 20) {
            return res.status(400).json({ message: 'Please provide a valid job description.' });
        }

        const user = await User.findOne({ isSeeded: false }).sort({ createdAt: -1 });
        if (!user) {
            return res.status(404).json({
                message: 'Please save your profile first before generating a resume.',
            });
        }

        // Only send lightweight data to AI (saves tokens)
        const lightweightUserData = {
            profiles: user.profiles,
            projects: user.projects.map((p) => ({
                title: p.title,
                description: p.description,
                techStack: p.techStack,
                tags: p.tags,
                profileTag: p.profileTag,
            })),
            certifications: user.certifications.map((c) => ({
                name: c.name,
                issuer: c.issuer,
                tags: c.tags,
            })),
            skills: user.skills,
        };

        // Step 1: Call AI — get structured JSON
        const aiJson = await generateResumeJson(lightweightUserData, jd);

        // Step 2: Map JSON + static user data into LaTeX boilerplate
        const latex = buildLatex(user, aiJson);

        // Step 3: Save to history (profile snapshot = everything minus generatedResumes)
        const profileSnapshot = {
            personalInfo: user.personalInfo,
            profiles: user.profiles,
            education: user.education,
            experience: user.experience,
            projects: user.projects,
            skills: user.skills,
            certifications: user.certifications,
        };

        user.generatedResumes.push({ jd, aiJson, latex, profileSnapshot });

        // Keep only the last 20 resumes to avoid unbounded growth
        if (user.generatedResumes.length > 20) {
            user.generatedResumes = user.generatedResumes.slice(-20);
        }

        await user.save();

        res.json({ latex, aiJson });
    } catch (err) {
        console.error('Generation error:', err);
        res.status(500).json({ message: err.message || 'Resume generation failed.' });
    }
});

// DELETE /api/resume/:id — delete a specific generated resume from history
router.delete('/resume/:resumeId', async (req, res) => {
    try {
        const user = await User.findOne({ isSeeded: false }).sort({ createdAt: -1 });
        if (!user) return res.status(404).json({ message: 'No user found' });

        user.generatedResumes = user.generatedResumes.filter(
            (r) => r._id.toString() !== req.params.resumeId
        );
        await user.save();
        res.json({ message: 'Deleted', generatedResumes: user.generatedResumes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
