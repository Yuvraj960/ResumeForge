/**
 * Seed script — creates a starter user document in MongoDB
 * Run with: node server/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedData = {
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
        { name: 'Full Stack', summary: 'Full Stack developer proficient in MERN stack.' },
        { name: 'Data Science', summary: 'Data scientist with ML/AI experience.' },
    ],
    education: [
        {
            degree: 'B.Tech in Computer Science',
            institution: 'Your University',
            year: '2024',
            gpa: '8.5',
            coursework: ['Data Structures', 'Algorithms', 'Machine Learning', 'DBMS'],
        },
    ],
    experience: [],
    projects: [
        {
            title: 'Sample Full Stack Project',
            description: 'Built a MERN stack web application with JWT authentication and REST APIs.',
            techStack: ['React', 'Node.js', 'Express', 'MongoDB'],
            liveLink: '',
            repoLink: 'https://github.com/yourusername/project',
            tags: ['MERN', 'Full Stack', 'REST API', 'React'],
            profileTag: 'Full Stack',
        },
        {
            title: 'Sample ML Project',
            description: 'Trained a classification model using scikit-learn on a Kaggle dataset achieving 95% accuracy.',
            techStack: ['Python', 'scikit-learn', 'Pandas', 'Matplotlib'],
            liveLink: '',
            repoLink: 'https://github.com/yourusername/ml-project',
            tags: ['ML', 'Python', 'Data Science', 'scikit-learn'],
            profileTag: 'Data Science',
        },
    ],
    skills: {
        languages: ['JavaScript', 'Python', 'Java'],
        frameworks: ['React', 'Node.js', 'Express', 'scikit-learn'],
        tools: ['Git', 'Docker', 'VS Code', 'Postman'],
        databases: ['MongoDB', 'MySQL', 'PostgreSQL'],
        other: ['REST APIs', 'Machine Learning', 'Data Analysis'],
    },
    certifications: [
        {
            name: 'AWS Cloud Practitioner',
            issuer: 'Amazon Web Services',
            date: '2023-06',
            credentialLink: '',
            tags: ['AWS', 'Cloud', 'DevOps'],
            profileTag: 'Full Stack',
        },
    ],
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB:', process.env.MONGO_URI);

        const existing = await User.findOne();
        if (existing) {
            console.log('ℹ️  User already exists. Skipping seed.');
            console.log('   → Delete the existing user in MongoDB Compass to re-seed.');
        } else {
            const user = await User.create(seedData);
            console.log('✅ Seed user created! ID:', user._id);
            console.log('   → Open http://localhost:3000/profile to edit your profile.');
        }
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
};

seed();
