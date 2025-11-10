/*
ResumeBuilderReact.jsx
Single-file React component for a modern resume builder (Tailwind CSS required)

How to use
1. npm install react react-dom
2. Ensure Tailwind CSS is configured in your project (this component uses Tailwind classes)
3. Install supporting libs for PDF export: npm install html2canvas jspdf
4. Optionally install shadcn/ui and lucide-react for UI components (not required)

This component exports default ResumeBuilder and is ready to drop into a page. It provides:
- Form inputs for personal info, summary, skills, experience, education
- Live preview with two template styles
- Add / remove items
- Download preview as PDF using html2canvas + jsPDF
- Save/Load draft to localStorage

Notes:
- Tailwind must be present in your app. If you want plain CSS, replace classes accordingly.
- For production, you might want to move large form sections into subcomponents and handle validation.
*/

import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const defaultData = {
  personal: {
    firstName: 'Jane',
    lastName: 'Doe',
    title: 'Product Manager',
    email: 'jane.doe@example.com',
    phone: '(555) 555-5555',
    location: 'Wilmington, DE',
    linkedin: 'linkedin.com/in/janedoe',
    website: 'janedoe.com'
  },
  summary: 'Product manager with 5+ years of experience launching customer-focused features and leading cross-functional teams.',
  skills: ['Product Strategy', 'Roadmapping', 'User Research', 'Stakeholder Management'],
  experience: [
    {
      id: Date.now(),
      title: 'Associate Product Manager',
      company: 'TechCorp',
      start: 'Jan 2021',
      end: 'Present',
      description: 'Owned feature lifecycle from discovery to launch. Led A/B tests and improved retention by 12%.'
    }
  ],
  education: [
    { id: Date.now()+1, degree: 'B.A. Business Administration', school: 'University of Delaware', year: '2019' }
  ],
  template: 'modern' // 'modern' or 'classic'
};

export default function ResumeBuilder() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_resume_draft');
      return saved ? JSON.parse(saved) : defaultData;
    } catch (e) {
      return defaultData;
    }
  });

  const previewRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('wf_resume_draft', JSON.stringify(data));
  }, [data]);

  // Generic field change helpers
  const setPersonalField = (field, value) => {
    setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const setSummary = (value) => setData(prev => ({ ...prev, summary: value }));
  const setTemplate = (tpl) => setData(prev => ({ ...prev, template: tpl }));

  // Skills
  const addSkill = (skill) => {
    if (!skill) return;
    setData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
  };
  const removeSkill = (index) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  // Experience
  const addExperience = () => {
    const newExp = { id: Date.now(), title: '', company: '', start: '', end: '', description: '' };
    setData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };
  const updateExperience = (id, field, value) => {
    setData(prev => ({ ...prev, experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  };
  const removeExperience = (id) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  // Education
  const addEducation = () => {
    const newEd = { id: Date.now(), degree: '', school: '', year: '' };
    setData(prev => ({ ...prev, education: [...prev.education, newEd] }));
  };
  const updateEducation = (id, field, value) => {
    setData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === id ? { ...ed, [field]: value } : ed) }));
  };
  const removeEducation = (id) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    const node = previewRef.current;
    // Slight scale up for higher resolution
    const scale = 2;
    const rect = node.getBoundingClientRect();
    const canvas = await html2canvas(node, { scale, useCORS: true, allowTaint: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: [rect.width, rect.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, rect.width, rect.height);
    pdf.save(`${data.personal.firstName || 'resume'}-${data.personal.lastName || 'resume'}.pdf`);
  };

  // Reset draft
  const resetDraft = () => {
    if (confirm('Reset resume to default template? This will clear your current draft.')) {
      setData(defaultData);
      localStorage.removeItem('wf_resume_draft');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="bg-white rounded-2xl shadow p-6 md:p-8 overflow-auto">
          <h2 className="text-2xl font-bold mb-2">Resume Builder</h2>
          <p className="text-sm text-gray-500 mb-6">Fill out the form and preview your resume in real time. Choose a template, then download it as a PDF.</p>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={data.personal.firstName} onChange={(e) => setPersonalField('firstName', e.target.value)} className="input" placeholder="First name" />
              <input value={data.personal.lastName} onChange={(e) => setPersonalField('lastName', e.target.value)} className="input" placeholder="Last name" />
              <input value={data.personal.title} onChange={(e) => setPersonalField('title', e.target.value)} className="input col-span-1 md:col-span-2" placeholder="Title (e.g. Senior Designer)" />
              <input value={data.personal.email} onChange={(e) => setPersonalField('email', e.target.value)} className="input" placeholder="Email" />
              <input value={data.personal.phone} onChange={(e) => setPersonalField('phone', e.target.value)} className="input" placeholder="Phone" />
              <input value={data.personal.location} onChange={(e) => setPersonalField('location', e.target.value)} className="input" placeholder="Location" />
              <input value={data.personal.linkedin} onChange={(e) => setPersonalField('linkedin', e.target.value)} className="input" placeholder="LinkedIn" />
              <input value={data.personal.website} onChange={(e) => setPersonalField('website', e.target.value)} className="input" placeholder="Website" />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Professional Summary</h3>
            <textarea value={data.summary} onChange={(e) => setSummary(e.target.value)} className="input h-24" placeholder="A short professional summary..."></textarea>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="flex gap-2 items-center mb-3">
              <SkillAdder onAdd={(s) => addSkill(s)} />
              <button onClick={() => { setData(prev => ({ ...prev, skills: [] })); }} className="btn-outline">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <div className="px-3 py-1 rounded-full bg-gray-100 flex items-center gap-2" key={i}>
                  <span className="text-sm">{s}</span>
                  <button onClick={() => removeSkill(i)} className="text-xs text-red-500">✕</button>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Experience</h3>
            <div className="space-y-3">
              {data.experience.map((exp) => (
                <div key={exp.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex gap-2">
                    <input value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} className="input" placeholder="Job title" />
                    <input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="input" placeholder="Company" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input value={exp.start} onChange={(e) => updateExperience(exp.id, 'start', e.target.value)} className="input" placeholder="Start (e.g. Jan 2020)" />
                    <input value={exp.end} onChange={(e) => updateExperience(exp.id, 'end', e.target.value)} className="input" placeholder="End (e.g. Present)" />
                  </div>
                  <textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} className="input h-20 mt-2" placeholder="Describe responsibilities & achievements"></textarea>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => removeExperience(exp.id)} className="btn-danger">Remove</button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <button onClick={addExperience} className="btn">Add experience</button>
                <button onClick={() => setData(prev => ({ ...prev, experience: [defaultData.experience[0]] }))} className="btn-outline">Reset to sample</button>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold">Education</h3>
            <div className="space-y-3">
              {data.education.map((ed) => (
                <div key={ed.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex gap-2">
                    <input value={ed.degree} onChange={(e) => updateEducation(ed.id, 'degree', e.target.value)} className="input" placeholder="Degree" />
                    <input value={ed.school} onChange={(e) => updateEducation(ed.id, 'school', e.target.value)} className="input" placeholder="School" />
                    <input value={ed.year} onChange={(e) => updateEducation(ed.id, 'year', e.target.value)} className="input" placeholder="Year" />
                  </div>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => removeEducation(ed.id)} className="btn-danger">Remove</button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <button onClick={addEducation} className="btn">Add education</button>
              </div>
            </div>
          </section>

          <section className="mt-6 flex flex-wrap items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold mb-2">Template</h3>
              <div className="flex gap-2">
                <button onClick={() => setTemplate('modern')} className={`btn ${data.template === 'modern' ? 'btn-primary' : 'btn-outline'}`}>Modern</button>
                <button onClick={() => setTemplate('classic')} className={`btn ${data.template === 'classic' ? 'btn-primary' : 'btn-outline'}`}>Classic</button>
              </div>
            </div>

            <div className="ml-auto flex gap-2">
              <button onClick={downloadPDF} className="btn-primary">Download PDF</button>
              <button onClick={resetDraft} className="btn-outline">Reset</button>
            </div>
          </section>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col gap-4">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div ref={previewRef} className="bg-white p-6 rounded-2xl shadow max-w-[850px]">
              {data.template === 'modern' ? (
                <ModernTemplate data={data} />
              ) : (
                <ClassicTemplate data={data} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tiny styles for inputs and buttons using Tailwind utility classes */}
      <style jsx>{`
        .input { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; border-radius: 0.5rem; width: 100%; }
        .btn { background: #f3f4f6; padding: 0.5rem 0.75rem; border-radius: 0.5rem; }
        .btn-primary { background: #111827; color: white; padding: 0.5rem 0.75rem; border-radius: 0.5rem; }
        .btn-outline { background: transparent; border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; border-radius: 0.5rem; }
        .btn-danger { background: transparent; color: #b91c1c; border: 1px solid #fca5a5; padding: 0.5rem 0.75rem; border-radius: 0.5rem; }
      `}</style>
    </div>
  );
}

/* Skill adder small component */
function SkillAdder({ onAdd }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(val); setVal(''); } }} placeholder="Add skill and press Enter" className="input" />
      <button onClick={() => { if (val) { onAdd(val); setVal(''); } }} className="btn">Add</button>
    </div>
  );
}

/* Modern template component */
function ModernTemplate({ data }) {
  const p = data.personal;
  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{p.firstName} {p.lastName}</h1>
          <h2 className="text-md text-gray-600 mt-1">{p.title}</h2>
        </div>
        <div className="text-sm text-right">
          <div>{p.email}</div>
          <div>{p.phone}</div>
          <div>{p.location}</div>
          <div className="truncate max-w-[200px]">{p.linkedin}</div>
          <div className="truncate max-w-[200px]">{p.website}</div>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      <section className="mb-4">
        <h3 className="font-semibold">Summary</h3>
        <p className="text-sm text-gray-700 mt-2">{data.summary}</p>
      </section>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <section className="mb-4">
            <h3 className="font-semibold">Experience</h3>
            <div className="mt-2 space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{exp.title}</div>
                      <div className="text-sm text-gray-600">{exp.company}</div>
                    </div>
                    <div className="text-sm text-gray-600">{exp.start} — {exp.end}</div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold">Education</h3>
            <div className="mt-2 space-y-2">
              {data.education.map((ed) => (
                <div key={ed.id}>
                  <div className="font-semibold">{ed.degree}</div>
                  <div className="text-sm text-gray-600">{ed.school} • {ed.year}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="col-span-1">
          <h3 className="font-semibold">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <span key={i} className="text-sm px-2 py-1 bg-gray-100 rounded">{s}</span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Classic template component */
function ClassicTemplate({ data }) {
  const p = data.personal;
  return (
    <div className="text-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{p.firstName} {p.lastName}</h1>
        <div className="text-sm text-gray-600">{p.title} • {p.location}</div>
        <div className="text-sm text-gray-600 mt-1">{p.email} • {p.phone} • {p.linkedin}</div>
      </div>

      <hr className="my-4 border-gray-200" />

      <section className="mb-4">
        <h3 className="font-semibold">Professional Summary</h3>
        <p className="text-sm text-gray-700 mt-2">{data.summary}</p>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Experience</h3>
        <div className="mt-2 space-y-3">
          {data.experience.map((exp) => (
            <div key={exp.id} className="flex justify-between">
              <div>
                <div className="font-semibold">{exp.title} — <span className="text-gray-600">{exp.company}</span></div>
                <div className="text-sm text-gray-700">{exp.description}</div>
              </div>
              <div className="text-sm text-gray-600">{exp.start} — {exp.end}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Education</h3>
        <div className="mt-2 space-y-2">
          {data.education.map((ed) => (
            <div key={ed.id}>
              <div className="font-semibold">{ed.degree}</div>
              <div className="text-sm text-gray-600">{ed.school} • {ed.year}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold">Skills</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.skills.map((s, i) => (
            <span key={i} className="text-sm px-2 py-1 bg-gray-100 rounded">{s}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
