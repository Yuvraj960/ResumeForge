import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const features = [
    {
        icon: "🤖",
        title: "AI-Powered Tailoring",
        desc: "Gemini AI reads your JD and intelligently selects the most relevant projects, skills, and certifications.",
    },
    {
        icon: "✨",
        title: "Token-Efficient Design",
        desc: "Static data goes directly into LaTeX. Only JD-specific content is processed by AI — saving your API credits.",
    },
    {
        icon: "📄",
        title: "ATS-Ready LaTeX",
        desc: "Output is a clean, Overleaf-compatible .tex file using Jake's Resume style — beats ATS scanners effortlessly.",
    },
    {
        icon: "🎯",
        title: "Multi-Profile Support",
        desc: "Manage multiple knowledge profiles (e.g., Data Science, Full Stack) with separate project and skill sets.",
    },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home">
            <div className="bg-glow" />

            {/* Hero */}
            <section className="hero animate-fadeInUp">
                <div className="hero-badge badge">✦ Powered by Gemini AI</div>
                <h1 className="hero-title">
                    Build the{" "}
                    <span className="gradient-text">Perfect Resume</span>
                    <br />
                    for Every Job
                </h1>
                <p className="hero-desc">
                    Enter a job description. Our AI analyzes it, selects your
                    best matching projects &amp; skills, and generates a
                    tailored, ATS-optimized LaTeX resume in seconds.
                </p>
                <div className="hero-actions">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate("/profile")}
                    >
                        Set Up Your Profile →
                    </button>
                    <button
                        className="btn btn-secondary btn-lg"
                        onClick={() => navigate("/builder")}
                    >
                        Generate Resume
                    </button>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <div
                        className="section-header"
                        style={{ textAlign: "center" }}
                    >
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">
                            Three simple steps to your perfect resume
                        </p>
                    </div>
                    <div className="steps-grid">
                        {[
                            {
                                step: "01",
                                title: "Build Your Profile",
                                desc: "Add all your projects, skills, certifications, and education once.",
                            },
                            {
                                step: "02",
                                title: "Paste the JD",
                                desc: "Copy-paste the job description from any job board.",
                            },
                            {
                                step: "03",
                                title: "Get Your LaTeX",
                                desc: "AI generates a tailored resume. Download and paste into Overleaf.",
                            },
                        ].map((s) => (
                            <div className="step-card card" key={s.step}>
                                <div className="step-number">{s.step}</div>
                                <h3 className="step-title">{s.title}</h3>
                                <p className="step-desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="container">
                    <div
                        className="section-header"
                        style={{ textAlign: "center" }}
                    >
                        <h2 className="section-title">Why ResumeForge?</h2>
                    </div>
                    <div className="features-grid">
                        {features.map((f) => (
                            <div className="feature-card card" key={f.title}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-box">
                    <h2>Ready to land your dream job?</h2>
                    <p>
                        Set up your profile once, generate tailored resumes
                        forever.
                    </p>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate("/profile")}
                    >
                        Get Started →
                    </button>
                </div>
            </section>
        </div>
    );
}
