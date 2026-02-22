const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: [String],
    liveLink: String,
    repoLink: String,
    tags: [String],
    profileTag: String,
});

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuer: String,
    date: String,
    credentialLink: String,
    tags: [String],
    profileTag: String,
});

const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: String,
    location: String,
    bullets: [String],
});

const educationSchema = new mongoose.Schema({
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: String,
    gpa: String,
    coursework: [String],
});

// ── Stores each AI-generated resume for history ──
const generatedResumeSchema = new mongoose.Schema({
    jd: { type: String, required: true },          // The job description used
    aiJson: { type: mongoose.Schema.Types.Mixed }, // AI-selected JSON output
    latex: { type: String, required: true },        // Final LaTeX string
    profileSnapshot: { type: mongoose.Schema.Types.Mixed }, // User profile at time of generation
    createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
    {
        personalInfo: {
            name: { type: String, required: true },
            email: String,
            phone: String,
            location: String,
            github: String,
            linkedin: String,
            portfolio: String,
        },
        profiles: [{ name: String, summary: String }],
        education: [educationSchema],
        experience: [experienceSchema],
        projects: [projectSchema],
        skills: {
            languages: [String],
            frameworks: [String],
            tools: [String],
            databases: [String],
            other: [String],
        },
        certifications: [certificationSchema],
        generatedResumes: [generatedResumeSchema], // ← History of all generated resumes
        isSeeded: { type: Boolean, default: false }, // ← true = auto-generated dummy data
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
