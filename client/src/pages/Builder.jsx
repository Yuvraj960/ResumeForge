import React, { useState, useRef } from "react";
import { generateResume } from "../services/api";
import "./Builder.css";

export default function Builder() {
    const [jd, setJd] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { latex, aiJson }
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef(null);

    const handleGenerate = async () => {
        if (!jd.trim() || jd.trim().length < 20) {
            setError(
                "Please paste a valid job description (minimum 20 characters).",
            );
            return;
        }
        setError("");
        setLoading(true);
        setResult(null);
        try {
            const { data } = await generateResume(jd);
            setResult(data);
        } catch (e) {
            setError(
                e.response?.data?.message ||
                    "Something went wrong. Check backend & API key.",
            );
        }
        setLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result.latex);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([result.latex], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.tex";
        a.click();
        URL.revokeObjectURL(url);
    };

    const wordCount = jd.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="builder-page">
            <div className="bg-glow" />
            <div className="container">
                <div className="builder-header animate-fadeInUp">
                    <div className="section-header">
                        <h1 className="section-title">Generate Resume</h1>
                        <p className="section-subtitle">
                            Paste the job description — AI will tailor your
                            resume to it.
                        </p>
                    </div>
                </div>

                <div className="builder-layout">
                    {/* Left: JD Input */}
                    <div className="builder-left">
                        <div className="card jd-card animate-fadeInUp">
                            <div className="jd-card-header">
                                <div>
                                    <h2 className="card-title">
                                        Job Description
                                    </h2>
                                    <p className="card-sub">
                                        Paste the full JD from any job board
                                    </p>
                                </div>
                                <span className="badge">{wordCount} words</span>
                            </div>
                            <textarea
                                ref={textareaRef}
                                className="form-textarea jd-textarea"
                                placeholder="Paste job description here...

We are looking for a Senior Machine Learning Engineer to join our team.
Requirements:
• 3+ years experience with Python, TensorFlow/PyTorch
• Experience with MLOps tools like MLflow, Kubeflow
• Strong background in NLP and Computer Vision..."
                                value={jd}
                                onChange={(e) => setJd(e.target.value)}
                            />
                            {error && (
                                <div className="alert alert-error">{error}</div>
                            )}
                            <button
                                className="btn btn-primary generate-btn"
                                onClick={handleGenerate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span>
                                        <span>Generate Resume</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* AI Insights */}
                        {result?.aiJson && (
                            <div className="card insights-card animate-fadeInUp">
                                <h3 className="card-title">🤖 AI Insights</h3>
                                <p className="insights-summary">
                                    {result.aiJson.professional_summary}
                                </p>

                                {result.aiJson.selected_projects?.length >
                                    0 && (
                                    <div className="insight-section">
                                        <span className="insight-label">
                                            Selected Projects
                                        </span>
                                        <div className="insight-list">
                                            {result.aiJson.selected_projects.map(
                                                (p) => (
                                                    <span
                                                        className="badge"
                                                        key={p.title}
                                                    >
                                                        {p.title}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {result.aiJson.selected_certifications?.length >
                                    0 && (
                                    <div className="insight-section">
                                        <span className="insight-label">
                                            Selected Certifications
                                        </span>
                                        <div className="insight-list">
                                            {result.aiJson.selected_certifications.map(
                                                (c) => (
                                                    <span
                                                        className="badge"
                                                        key={c.name}
                                                    >
                                                        {c.name}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {result.aiJson.skills && (
                                    <div className="insight-section">
                                        <span className="insight-label">
                                            Curated Skills
                                        </span>
                                        <div className="insight-list">
                                            {Object.entries(
                                                result.aiJson.skills,
                                            )
                                                .flatMap(([, arr]) => arr)
                                                .slice(0, 10)
                                                .map((s) => (
                                                    <span
                                                        className="badge"
                                                        key={s}
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: LaTeX Output */}
                    <div className="builder-right">
                        {!result && !loading && (
                            <div className="card placeholder-card animate-fadeIn">
                                <div className="placeholder-inner">
                                    <div className="placeholder-icon">📄</div>
                                    <h3>Your LaTeX resume will appear here</h3>
                                    <p>
                                        Paste a JD on the left and click
                                        Generate to begin.
                                    </p>
                                    <div className="placeholder-steps">
                                        <div className="p-step">
                                            ① Make sure your profile is filled
                                            in
                                        </div>
                                        <div className="p-step">
                                            ② Paste the job description
                                        </div>
                                        <div className="p-step">
                                            ③ Copy the .tex output to Overleaf
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="card placeholder-card animate-fadeIn">
                                <div className="placeholder-inner">
                                    <div className="loading-animation">
                                        <div className="loading-dot" />
                                        <div className="loading-dot" />
                                        <div className="loading-dot" />
                                    </div>
                                    <h3>Analyzing JD & Building Resume...</h3>
                                    <p>
                                        Gemini is selecting your best projects
                                        and tailoring your summary.
                                    </p>
                                </div>
                            </div>
                        )}

                        {result?.latex && (
                            <div className="card latex-output-card animate-fadeInUp">
                                <div className="latex-header">
                                    <div>
                                        <h2 className="card-title">
                                            LaTeX Output
                                        </h2>
                                        <p className="card-sub">
                                            Ready for Overleaf or any LaTeX
                                            compiler
                                        </p>
                                    </div>
                                    <div className="latex-actions">
                                        <button
                                            className="btn btn-ghost"
                                            onClick={handleCopy}
                                        >
                                            {copied ? "✓ Copied!" : "📋 Copy"}
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleDownload}
                                        >
                                            ⬇ Download .tex
                                        </button>
                                    </div>
                                </div>
                                <div className="latex-hint alert alert-info">
                                    💡 Copy this code and paste it into{" "}
                                    <strong>Overleaf.com</strong> to compile
                                    your PDF resume.
                                </div>
                                <pre className="latex-code">
                                    <code>{result.latex}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
