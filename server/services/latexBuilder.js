/**
 * LaTeX Boilerplate Builder
 * Combines static user data from DB with AI-generated JSON to produce a full .tex string.
 * Uses Jake's Resume style (ATS-friendly, clean, Overleaf-compatible).
 */

const escapeLatex = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
};

const buildSkillsSection = (skillsObj) => {
    const rows = Object.entries(skillsObj)
        .filter(([_, arr]) => arr && arr.length > 0)
        .map(([cat, items]) => `    \\textbf{${escapeLatex(cat)}}{: ${escapeLatex(items.join(', '))}}\\\\`)
        .join('\n');

    return `
%----------- TECHNICAL SKILLS -----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
${rows}
  }}
\\end{itemize}`;
};

const buildProjectsSection = (projects) => {
    const items = projects
        .map((p) => {
            const links = [];
            if (p.liveLink && p.liveLink.trim()) links.push(`\\href{${p.liveLink}}{\\underline{Live}}`);
            if (p.repoLink && p.repoLink.trim()) links.push(`\\href{${p.repoLink}}{\\underline{Code}}`);
            const linksStr = links.length > 0 ? ` $|$ ${links.join(' $|$ ')}` : '';
            const tech = p.techStack && p.techStack.length > 0 ? `\\emph{${escapeLatex(p.techStack.join(', '))}}` : '';

            return `
    \\resumeProjectHeading
      {\\textbf{${escapeLatex(p.title)}}${linksStr}}
      {${tech}}
    \\resumeItemListStart
      \\resumeItem{${escapeLatex(p.description)}}
    \\resumeItemListEnd`;
        })
        .join('\n');

    return `
%----------- PROJECTS -----------
\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd
\\end{itemize}`;
};

const buildExperienceSection = (experience) => {
    if (!experience || experience.length === 0) return '';
    const items = experience
        .map((exp) => {
            const bullets = (exp.bullets || [])
                .map((b) => `      \\resumeItem{${escapeLatex(b)}}`)
                .join('\n');
            return `
    \\resumeSubheading
      {${escapeLatex(exp.role)}}{${escapeLatex(exp.duration || '')}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location || '')}}
    \\resumeItemListStart
${bullets}
    \\resumeItemListEnd`;
        })
        .join('\n');

    return `
%----------- EXPERIENCE -----------
\\section{Experience}
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd`;
};

const buildEducationSection = (education) => {
    const items = education
        .map(
            (edu) => `
    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.year || '')}}
      {${escapeLatex(edu.degree)}}{}
      ${edu.gpa ? `\\resumeItem{GPA: ${escapeLatex(edu.gpa)}}` : ''}
      ${edu.coursework && edu.coursework.length > 0 ? `\\resumeItem{Relevant Coursework: ${escapeLatex(edu.coursework.join(', '))}}` : ''}`
        )
        .join('\n');

    return `
%----------- EDUCATION -----------
\\section{Education}
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd`;
};

const buildCertificationsSection = (certifications) => {
    if (!certifications || certifications.length === 0) return '';
    const items = certifications
        .map((c) => {
            const nameStr = c.credentialLink
                ? `\\href{${c.credentialLink}}{\\underline{${escapeLatex(c.name)}}}`
                : escapeLatex(c.name);
            return `      \\resumeItem{${nameStr} ${c.issuer ? `-- ${escapeLatex(c.issuer)}` : ''} ${c.date ? `(${escapeLatex(c.date)})` : ''}}`;
        })
        .join('\n');

    return `
%----------- CERTIFICATIONS -----------
\\section{Certifications}
  \\resumeItemListStart
${items}
  \\resumeItemListEnd`;
};

const buildHeaderSection = (personalInfo, summary) => {
    const { name, email, phone, location, github, linkedin, portfolio } = personalInfo;

    const links = [];
    if (linkedin) links.push(`\\href{${linkedin}}{\\underline{LinkedIn}}`);
    if (github) links.push(`\\href{${github}}{\\underline{GitHub}}`);
    if (portfolio) links.push(`\\href{${portfolio}}{\\underline{Portfolio}}`);

    const contactLine = [
        phone ? escapeLatex(phone) : null,
        email ? `\\href{mailto:${email}}{\\underline{${escapeLatex(email)}}}` : null,
        ...links,
        location ? escapeLatex(location) : null,
    ]
        .filter(Boolean)
        .join(' $|$ ');

    return `
\\begin{center}
  {\\Huge \\scshape ${escapeLatex(name)}} \\\\ \\vspace{4pt}
  \\small ${contactLine}
\\end{center}

%----------- PROFESSIONAL SUMMARY -----------
\\section{Professional Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{${escapeLatex(summary)}}}
\\end{itemize}`;
};

/**
 * Main function: combines static user data from DB + AI JSON to build a full LaTeX string.
 * @param {object} user    - Full user document from MongoDB
 * @param {object} aiJson  - Structured JSON returned by Gemini
 * @returns {string}       - Complete LaTeX document string
 */
const buildLatex = (user, aiJson) => {
    const { personalInfo, education, experience } = user;
    const { professional_summary, skills, selected_projects, selected_certifications } = aiJson;

    // Rehydrate full project data (add links from original DB records)
    const rehydratedProjects = (selected_projects || []).map((aiProj) => {
        const original = (user.projects || []).find(
            (p) => p.title.toLowerCase() === aiProj.title.toLowerCase()
        );
        return {
            ...aiProj,
            liveLink: original?.liveLink || aiProj.liveLink || '',
            repoLink: original?.repoLink || aiProj.repoLink || '',
        };
    });

    // Rehydrate certifications (add credentialLink from DB)
    const rehydratedCerts = (selected_certifications || []).map((aiCert) => {
        const original = (user.certifications || []).find(
            (c) => c.name.toLowerCase() === aiCert.name.toLowerCase()
        );
        return { ...aiCert, credentialLink: original?.credentialLink || '' };
    });

    return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

%--- Custom Commands ---%
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1 \\vspace{-2pt}}
}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}
${buildHeaderSection(personalInfo, professional_summary)}

${buildEducationSection(education)}

${buildExperienceSection(experience)}

${buildProjectsSection(rehydratedProjects)}

${buildSkillsSection(skills)}

${buildCertificationsSection(rehydratedCerts)}

\\end{document}
`;
};

module.exports = { buildLatex };
