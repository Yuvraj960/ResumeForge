import React, { useState, useEffect, useCallback } from "react";
import { getUser, saveUser } from "../services/api";
import TagInput from "../components/TagInput";
import PreviousResumes from "../components/PreviousResumes";
import "./Profile.css";

const PROFILE_TAGS = [
    "Data Science",
    "Full Stack",
    "DevOps",
    "Mobile",
    "AI/ML",
    "Backend",
    "Frontend",
];

const defaultPersonalInfo = {
    name: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
};
const defaultProject = {
    title: "",
    description: "",
    techStack: [],
    liveLink: "",
    repoLink: "",
    tags: [],
    profileTag: "",
};
const defaultCert = {
    name: "",
    issuer: "",
    date: "",
    credentialLink: "",
    tags: [],
    profileTag: "",
};
const defaultExp = {
    company: "",
    role: "",
    duration: "",
    location: "",
    bullets: [],
};
const defaultEdu = {
    degree: "",
    institution: "",
    year: "",
    gpa: "",
    coursework: [],
};

export default function Profile() {
    const [activeTab, setActiveTab] = useState("personal");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const [personalInfo, setPersonalInfo] = useState(defaultPersonalInfo);
    const [profiles, setProfiles] = useState([{ name: "", summary: "" }]);
    const [education, setEducation] = useState([{ ...defaultEdu }]);
    const [experience, setExperience] = useState([]);
    const [projects, setProjects] = useState([{ ...defaultProject }]);
    const [skills, setSkills] = useState({
        languages: [],
        frameworks: [],
        tools: [],
        databases: [],
        other: [],
    });
    const [certifications, setCertifications] = useState([]);
    const [generatedResumes, setGeneratedResumes] = useState([]);

    const showAlert = (msg, type = "success") => {
        setAlert({ msg, type });
        setTimeout(() => setAlert(null), 3500);
    };

    const applyUserData = (data) => {
        setPersonalInfo(data.personalInfo || defaultPersonalInfo);
        setProfiles(
            data.profiles?.length ? data.profiles : [{ name: "", summary: "" }],
        );
        setEducation(
            data.education?.length ? data.education : [{ ...defaultEdu }],
        );
        setExperience(data.experience || []);
        setProjects(
            data.projects?.length ? data.projects : [{ ...defaultProject }],
        );
        setSkills(
            data.skills || {
                languages: [],
                frameworks: [],
                tools: [],
                databases: [],
                other: [],
            },
        );
        setCertifications(data.certifications || []);
    };

    const loadUser = useCallback(async () => {
        try {
            const { data } = await getUser();
            if (data) {
                applyUserData(data);
                setGeneratedResumes(data.generatedResumes || []);
            }
        } catch (e) {
            /* no user yet */
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await saveUser({
                personalInfo,
                profiles,
                education,
                experience,
                projects,
                skills,
                certifications,
            });
            // Update generatedResumes from the response to keep in sync
            setGeneratedResumes(data.generatedResumes || []);
            showAlert("Profile saved successfully!", "success");
        } catch (e) {
            showAlert(
                e.response?.data?.message || "Error saving profile.",
                "error",
            );
        }
        setSaving(false);
    };

    // "Copy this data" — loads a previous profile snapshot back into the form
    const handleCopyData = (snapshot) => {
        if (!snapshot) return;
        applyUserData(snapshot);
        setActiveTab("personal");
        showAlert(
            "Profile data copied from history! Review and hit Save Profile to apply.",
            "info",
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Generic array helpers ──
    const addItem = (setter, template) =>
        setter((prev) => [...prev, { ...template }]);
    const removeItem = (setter, idx) =>
        setter((prev) => prev.filter((_, i) => i !== idx));
    const updateItem = (setter, idx, field, val) =>
        setter((prev) =>
            prev.map((item, i) =>
                i === idx ? { ...item, [field]: val } : item,
            ),
        );

    const tabs = [
        { id: "personal", label: "👤 Personal" },
        { id: "profiles", label: "🎯 Profiles" },
        { id: "education", label: "🎓 Education" },
        { id: "experience", label: "💼 Experience" },
        { id: "projects", label: "🚀 Projects" },
        { id: "skills", label: "⚡ Skills" },
        { id: "certifications", label: "🏆 Certs" },
        {
            id: "history",
            label: `📂 History${generatedResumes.length > 0 ? ` (${generatedResumes.length})` : ""}`,
        },
    ];

    if (loading)
        return (
            <div className="profile-loading">
                <div className="spinner" />
                <span>Loading profile...</span>
            </div>
        );

    return (
        <div className="profile-page">
            <div className="bg-glow" />
            <div className="container">
                <div className="profile-header animate-fadeInUp">
                    <div className="section-header">
                        <h1 className="section-title">Your Profile</h1>
                        <p className="section-subtitle">
                            Store all your experience once — AI will select the
                            best parts per JD.
                        </p>
                    </div>
                    {activeTab !== "history" && (
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="spinner" />
                                    Saving...
                                </>
                            ) : (
                                "💾 Save Profile"
                            )}
                        </button>
                    )}
                </div>

                {alert && (
                    <div className={`alert alert-${alert.type} animate-fadeIn`}>
                        {alert.msg}
                    </div>
                )}

                <div className="profile-layout">
                    {/* Sidebar Tabs */}
                    <nav className="profile-tabs">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                className={`tab-btn ${activeTab === t.id ? "active" : ""} ${t.id === "history" ? "tab-history" : ""}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </nav>

                    {/* Content */}
                    <div className="profile-content">
                        {/* Personal Info */}
                        {activeTab === "personal" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header">
                                    <h2
                                        className="section-title"
                                        style={{ fontSize: 18 }}
                                    >
                                        Personal Information
                                    </h2>
                                    <p className="section-subtitle">
                                        This data goes directly to your resume —
                                        no AI tokens used.
                                    </p>
                                </div>
                                <div className="form-grid-2">
                                    {[
                                        "name",
                                        "email",
                                        "phone",
                                        "location",
                                        "github",
                                        "linkedin",
                                        "portfolio",
                                    ].map((field) => (
                                        <div className="form-group" key={field}>
                                            <label className="form-label">
                                                {field.charAt(0).toUpperCase() +
                                                    field.slice(1)}
                                            </label>
                                            <input
                                                className="form-input"
                                                placeholder={
                                                    field === "github"
                                                        ? "https://github.com/..."
                                                        : field === "linkedin"
                                                          ? "https://linkedin.com/in/..."
                                                          : ""
                                                }
                                                value={
                                                    personalInfo[field] || ""
                                                }
                                                onChange={(e) =>
                                                    setPersonalInfo({
                                                        ...personalInfo,
                                                        [field]: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Profiles */}
                        {activeTab === "profiles" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header-row">
                                    <div className="section-header">
                                        <h2
                                            className="section-title"
                                            style={{ fontSize: 18 }}
                                        >
                                            Knowledge Profiles
                                        </h2>
                                        <p className="section-subtitle">
                                            Define your career tracks (e.g.,
                                            "Data Science", "Full Stack").
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            addItem(setProfiles, {
                                                name: "",
                                                summary: "",
                                            })
                                        }
                                    >
                                        + Add Profile
                                    </button>
                                </div>
                                {profiles.map((p, i) => (
                                    <div className="card item-card" key={i}>
                                        <div className="item-card-header">
                                            <span className="badge">
                                                Profile {i + 1}
                                            </span>
                                            {profiles.length > 1 && (
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        removeItem(
                                                            setProfiles,
                                                            i,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Profile Name
                                            </label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g. Data Science"
                                                value={p.name}
                                                onChange={(e) =>
                                                    updateItem(
                                                        setProfiles,
                                                        i,
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Summary (used as context for AI)
                                            </label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                placeholder="Brief summary of this profile..."
                                                value={p.summary}
                                                onChange={(e) =>
                                                    updateItem(
                                                        setProfiles,
                                                        i,
                                                        "summary",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Education */}
                        {activeTab === "education" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header-row">
                                    <div className="section-header">
                                        <h2
                                            className="section-title"
                                            style={{ fontSize: 18 }}
                                        >
                                            Education
                                        </h2>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            addItem(setEducation, {
                                                ...defaultEdu,
                                            })
                                        }
                                    >
                                        + Add
                                    </button>
                                </div>
                                {education.map((edu, i) => (
                                    <div className="card item-card" key={i}>
                                        <div className="item-card-header">
                                            <span className="badge">
                                                {edu.institution ||
                                                    `Education ${i + 1}`}
                                            </span>
                                            {education.length > 1 && (
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        removeItem(
                                                            setEducation,
                                                            i,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-grid-2">
                                            {[
                                                "degree",
                                                "institution",
                                                "year",
                                                "gpa",
                                            ].map((f) => (
                                                <div
                                                    className="form-group"
                                                    key={f}
                                                >
                                                    <label className="form-label">
                                                        {f
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            f.slice(1)}
                                                    </label>
                                                    <input
                                                        className="form-input"
                                                        value={edu[f] || ""}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                setEducation,
                                                                i,
                                                                f,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Relevant Coursework
                                                (comma-separated)
                                            </label>
                                            <input
                                                className="form-input"
                                                placeholder="Data Structures, Algorithms, ML..."
                                                value={(
                                                    edu.coursework || []
                                                ).join(", ")}
                                                onChange={(e) =>
                                                    updateItem(
                                                        setEducation,
                                                        i,
                                                        "coursework",
                                                        e.target.value
                                                            .split(",")
                                                            .map((s) =>
                                                                s.trim(),
                                                            )
                                                            .filter(Boolean),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Experience */}
                        {activeTab === "experience" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header-row">
                                    <div className="section-header">
                                        <h2
                                            className="section-title"
                                            style={{ fontSize: 18 }}
                                        >
                                            Work Experience
                                        </h2>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            addItem(setExperience, {
                                                ...defaultExp,
                                            })
                                        }
                                    >
                                        + Add
                                    </button>
                                </div>
                                {experience.length === 0 && (
                                    <div className="empty-state card">
                                        No experience added yet.
                                    </div>
                                )}
                                {experience.map((exp, i) => (
                                    <div className="card item-card" key={i}>
                                        <div className="item-card-header">
                                            <span className="badge">
                                                {exp.company ||
                                                    `Experience ${i + 1}`}
                                            </span>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    removeItem(setExperience, i)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="form-grid-2">
                                            {[
                                                "company",
                                                "role",
                                                "duration",
                                                "location",
                                            ].map((f) => (
                                                <div
                                                    className="form-group"
                                                    key={f}
                                                >
                                                    <label className="form-label">
                                                        {f
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            f.slice(1)}
                                                    </label>
                                                    <input
                                                        className="form-input"
                                                        value={exp[f] || ""}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                setExperience,
                                                                i,
                                                                f,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Bullet Points (one per line)
                                            </label>
                                            <textarea
                                                className="form-textarea"
                                                rows={4}
                                                placeholder="• Built a REST API that handled 1M+ requests/day..."
                                                value={(exp.bullets || []).join(
                                                    "\n",
                                                )}
                                                onChange={(e) =>
                                                    updateItem(
                                                        setExperience,
                                                        i,
                                                        "bullets",
                                                        e.target.value
                                                            .split("\n")
                                                            .filter(Boolean),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects */}
                        {activeTab === "projects" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header-row">
                                    <div className="section-header">
                                        <h2
                                            className="section-title"
                                            style={{ fontSize: 18 }}
                                        >
                                            Projects
                                        </h2>
                                        <p className="section-subtitle">
                                            AI will select the best ones based
                                            on the JD.
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            addItem(setProjects, {
                                                ...defaultProject,
                                            })
                                        }
                                    >
                                        + Add Project
                                    </button>
                                </div>
                                {projects.map((proj, i) => (
                                    <div className="card item-card" key={i}>
                                        <div className="item-card-header">
                                            <span className="badge">
                                                {proj.title ||
                                                    `Project ${i + 1}`}
                                            </span>
                                            {projects.length > 1 && (
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        removeItem(
                                                            setProjects,
                                                            i,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Title
                                            </label>
                                            <input
                                                className="form-input"
                                                value={proj.title}
                                                onChange={(e) =>
                                                    updateItem(
                                                        setProjects,
                                                        i,
                                                        "title",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Description
                                            </label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                value={proj.description}
                                                onChange={(e) =>
                                                    updateItem(
                                                        setProjects,
                                                        i,
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Live Link
                                                </label>
                                                <input
                                                    className="form-input"
                                                    placeholder="https://..."
                                                    value={proj.liveLink}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            setProjects,
                                                            i,
                                                            "liveLink",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Repo Link
                                                </label>
                                                <input
                                                    className="form-input"
                                                    placeholder="https://github.com/..."
                                                    value={proj.repoLink}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            setProjects,
                                                            i,
                                                            "repoLink",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Tech Stack (press Enter to add)
                                            </label>
                                            <TagInput
                                                tags={proj.techStack}
                                                onChange={(tags) =>
                                                    updateItem(
                                                        setProjects,
                                                        i,
                                                        "techStack",
                                                        tags,
                                                    )
                                                }
                                                placeholder="React, Node.js, MongoDB..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Tags / Keywords (press Enter to
                                                add)
                                            </label>
                                            <TagInput
                                                tags={proj.tags}
                                                onChange={(tags) =>
                                                    updateItem(
                                                        setProjects,
                                                        i,
                                                        "tags",
                                                        tags,
                                                    )
                                                }
                                                placeholder="ML, NLP, Python..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Profile Tag
                                            </label>
                                            <select
                                                className="form-select"
                                                value={proj.profileTag}
                                                onChange={(e) =>
                                                    updateItem(
                                                        setProjects,
                                                        i,
                                                        "profileTag",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    — Select Profile —
                                                </option>
                                                {PROFILE_TAGS.map((t) => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Skills */}
                        {activeTab === "skills" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header">
                                    <h2
                                        className="section-title"
                                        style={{ fontSize: 18 }}
                                    >
                                        Technical Skills
                                    </h2>
                                    <p className="section-subtitle">
                                        AI will curate and reorder these based
                                        on the JD.
                                    </p>
                                </div>
                                {[
                                    "languages",
                                    "frameworks",
                                    "tools",
                                    "databases",
                                    "other",
                                ].map((cat) => (
                                    <div className="card item-card" key={cat}>
                                        <div className="form-group">
                                            <label
                                                className="form-label"
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                {cat.charAt(0).toUpperCase() +
                                                    cat.slice(1)}
                                            </label>
                                            <TagInput
                                                tags={skills[cat] || []}
                                                onChange={(tags) =>
                                                    setSkills({
                                                        ...skills,
                                                        [cat]: tags,
                                                    })
                                                }
                                                placeholder={`Add ${cat}...`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {activeTab === "certifications" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header-row">
                                    <div className="section-header">
                                        <h2
                                            className="section-title"
                                            style={{ fontSize: 18 }}
                                        >
                                            Certifications
                                        </h2>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            addItem(setCertifications, {
                                                ...defaultCert,
                                            })
                                        }
                                    >
                                        + Add
                                    </button>
                                </div>
                                {certifications.length === 0 && (
                                    <div className="empty-state card">
                                        No certifications added yet.
                                    </div>
                                )}
                                {certifications.map((cert, i) => (
                                    <div className="card item-card" key={i}>
                                        <div className="item-card-header">
                                            <span className="badge">
                                                {cert.name || `Cert ${i + 1}`}
                                            </span>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    removeItem(
                                                        setCertifications,
                                                        i,
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Name
                                                </label>
                                                <input
                                                    className="form-input"
                                                    value={cert.name}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            setCertifications,
                                                            i,
                                                            "name",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Issuer
                                                </label>
                                                <input
                                                    className="form-input"
                                                    value={cert.issuer}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            setCertifications,
                                                            i,
                                                            "issuer",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Date
                                                </label>
                                                <input
                                                    className="form-input"
                                                    type="month"
                                                    value={cert.date}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            setCertifications,
                                                            i,
                                                            "date",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Credential Link
                                                </label>
                                                <input
                                                    className="form-input"
                                                    placeholder="https://..."
                                                    value={cert.credentialLink}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            setCertifications,
                                                            i,
                                                            "credentialLink",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Tags
                                            </label>
                                            <TagInput
                                                tags={cert.tags}
                                                onChange={(tags) =>
                                                    updateItem(
                                                        setCertifications,
                                                        i,
                                                        "tags",
                                                        tags,
                                                    )
                                                }
                                                placeholder="AWS, Cloud, ML..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Previous Resumes / History */}
                        {activeTab === "history" && (
                            <div className="tab-panel animate-fadeInUp">
                                <div className="section-header">
                                    <h2
                                        className="section-title"
                                        style={{ fontSize: 18 }}
                                    >
                                        Generated Resume History
                                    </h2>
                                    <p className="section-subtitle">
                                        All AI-generated resumes are saved here.
                                        Click <strong>Copy Profile Data</strong>{" "}
                                        to restore the profile state used for
                                        any past resume.
                                    </p>
                                </div>
                                <PreviousResumes
                                    resumes={generatedResumes}
                                    onCopyData={handleCopyData}
                                    onResumeDeleted={(updated) =>
                                        setGeneratedResumes(updated)
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
