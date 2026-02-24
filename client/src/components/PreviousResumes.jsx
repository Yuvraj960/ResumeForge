import React, { useState } from "react";
import { deleteResume } from "../services/api";
import "./PreviousResumes.css";

export default function PreviousResumes({
    resumes = [],
    onCopyData,
    onResumeDeleted,
}) {
    const [expanded, setExpanded] = useState(null); // index of expanded resume
    const [copied, setCopied] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const toggle = (idx) => setExpanded(expanded === idx ? null : idx);

    const handleCopyLatex = (latex, idx) => {
        navigator.clipboard.writeText(latex);
        setCopied(idx);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDownload = (latex, idx) => {
        const blob = new Blob([latex], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume_${idx + 1}.tex`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = async (resumeId, idx) => {
        if (!window.confirm("Delete this resume from history?")) return;
        setDeleting(idx);
        try {
            const { data } = await deleteResume(resumeId);
            onResumeDeleted(data.generatedResumes);
        } catch (e) {
            alert("Failed to delete resume.");
        }
        setDeleting(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (resumes.length === 0) {
        return (
            <div className="prev-empty card">
                <div className="prev-empty-icon">📂</div>
                <h3>No generated resumes yet</h3>
                <p>
                    Go to the <strong>Builder</strong> page, paste a JD, and
                    generate your first resume. It will be saved here
                    automatically.
                </p>
            </div>
        );
    }

    // Show newest first
    const sorted = [...resumes].reverse();

    return (
        <div className="prev-list">
            {sorted.map((resume, idx) => {
                const originalIdx = resumes.length - 1 - idx;
                const isExpanded = expanded === idx;
                const resumeId = resume._id;

                return (
                    <div className="prev-card card" key={resumeId || idx}>
                        {/* Header row */}
                        <div className="prev-card-header">
                            <div className="prev-card-meta">
                                <span className="badge">
                                    Resume #{resumes.length - idx}
                                </span>
                                <span className="prev-date">
                                    {formatDate(resume.createdAt)}
                                </span>
                            </div>
                            <div className="prev-card-actions">
                                <button
                                    className="btn btn-ghost"
                                    title="Load this profile snapshot back into your form"
                                    onClick={() =>
                                        onCopyData(resume.profileSnapshot)
                                    }
                                >
                                    📋 Copy Profile Data
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() =>
                                        handleDelete(resumeId, originalIdx)
                                    }
                                    disabled={deleting === originalIdx}
                                >
                                    {deleting === originalIdx ? "..." : "🗑"}
                                </button>
                            </div>
                        </div>

                        {/* JD Preview */}
                        <div className="prev-jd-preview">
                            <span className="prev-section-label">
                                🎯 Job Description
                            </span>
                            <p className="prev-jd-text">
                                {resume.jd.slice(0, 300)}
                                {resume.jd.length > 300 ? "..." : ""}
                            </p>
                        </div>

                        {/* AI Selection Summary */}
                        {resume.aiJson?.selected_projects?.length > 0 && (
                            <div className="prev-ai-picks">
                                <span className="prev-section-label">
                                    🤖 AI Selected Projects
                                </span>
                                <div className="insight-list">
                                    {resume.aiJson.selected_projects.map(
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

                        {/* Expand / Collapse LaTeX */}
                        <button
                            className="prev-toggle-btn"
                            onClick={() => toggle(idx)}
                        >
                            {isExpanded
                                ? "▲ Hide LaTeX"
                                : "▼ Show LaTeX Output"}
                        </button>

                        {isExpanded && (
                            <div className="prev-latex-section animate-fadeInUp">
                                <div className="prev-latex-actions">
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() =>
                                            handleCopyLatex(resume.latex, idx)
                                        }
                                    >
                                        {copied === idx
                                            ? "✓ Copied!"
                                            : "📋 Copy .tex"}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            handleDownload(resume.latex, idx)
                                        }
                                    >
                                        ⬇ Download .tex
                                    </button>
                                </div>
                                <pre className="prev-latex-code">
                                    <code>{resume.latex}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
