import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";
const UPLOADS_URL = "http://localhost:5000/uploads";

const SEARCH_SUGGESTIONS = [
  "Find me a senior React developer",
  "Who has Python and machine learning experience?",
  "Show candidates with AWS and DevOps skills",
  "Find a full-stack developer with Node.js",
];

const TABS = [
  { key: "upload", label: "📤 Upload CV" },
  { key: "search", label: "🔍 Talent Search" },
];

const safeArray = (val) => (Array.isArray(val) && val.length > 0 ? val : null);

const cn = (...args) => args.filter(Boolean).join(" ");

function Spinner({ size }) {
  if (size === "lg") {
    return <span className="w-10 h-10 border-[3px] border-indigo-900 border-t-indigo-400 rounded-full animate-spin inline-block" />;
  }
  return <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block flex-shrink-0" />;
}

function Badge({ label, variant }) {
  const base = "inline-block text-xs font-medium px-2.5 py-1 rounded-md";
  const color = variant === "teal"
    ? "bg-teal-950/50 border border-teal-600/25 text-teal-300"
    : "bg-indigo-950/60 border border-indigo-600/30 text-indigo-300";
  return <span className={base + " " + color}>{label}</span>;
}

function SectionBlock({ emoji, title, children }) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-800/70">
      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2.5">
        <span>{emoji}</span>{title}
      </h4>
      {children}
    </div>
  );
}

function ListItems({ items, dotColor }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-snug">
          <span className={"mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 " + dotColor} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ViewCvButton({ filename }) {
  if (!filename) return null;
  const cvUrl = UPLOADS_URL + "/" + filename;
  const linkClass = "flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-400 border border-slate-700 rounded-lg px-2.5 py-1.5 transition-all duration-150 hover:text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-950/30";
  return (
    <a href={cvUrl} target="_blank" rel="noopener noreferrer" title="View original CV (PDF)" className={linkClass}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
        <polyline points="9 9 10 9" />
      </svg>
      View CV
    </a>
  );
}

function CandidateCard({ candidate }) {
  const { name, email, phone, summary, reason, filename } = candidate;

  const skills = safeArray(candidate.skills);
  const interests = safeArray(candidate.interests);
  const experience = safeArray(candidate.experience);
  const education = safeArray(candidate.education);

  return (
    <article className="bg-[#13161e] border border-slate-800 rounded-2xl p-5 transition-all duration-200 hover:border-indigo-500/30 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.08)]">

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-lg select-none">
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-slate-100 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{name}</h3>
            <ViewCvButton filename={filename} />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            {email && <span className="text-xs text-slate-500">✉ {email}</span>}
            {phone && <span className="text-xs text-slate-500">📞 {phone}</span>}
          </div>
        </div>
      </div>

      {reason && (
        <div className="flex gap-2.5 items-start mt-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl px-3.5 py-2.5">
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500 text-white rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0 whitespace-nowrap">Match Reason</span>
          <p className="text-xs text-indigo-200 leading-relaxed">{reason}</p>
        </div>
      )}

      {summary && (
        <p className="mt-3 text-sm text-slate-400 leading-relaxed border-l-2 border-slate-700/80 pl-3">{summary}</p>
      )}

      {skills && (
        <SectionBlock emoji="🛠️" title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => <Badge key={i} label={s} variant="indigo" />)}
          </div>
        </SectionBlock>
      )}

      {experience && (
        <SectionBlock emoji="💼" title="Experience">
          <ListItems items={experience} dotColor="bg-indigo-500" />
        </SectionBlock>
      )}

      {education && (
        <SectionBlock emoji="🎓" title="Education">
          <ListItems items={education} dotColor="bg-teal-500" />
        </SectionBlock>
      )}

      {interests && (
        <SectionBlock emoji="🎯" title="Interests">
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest, i) => <Badge key={i} label={interest} variant="teal" />)}
          </div>
        </SectionBlock>
      )}

    </article>
  );
}

function UploadTab() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (f?.type === "application/pdf") setFile(f);
    else alert("Please select a PDF file.");
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onSubmit = async () => {
    if (!file) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("cv", file);
    try {
      const { data } = await axios.post(API_BASE + "/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(data.candidate);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
      setStatus("error");
    }
  };

  const dropzoneClass = cn(
    "cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200",
    dragging && "border-indigo-400 bg-indigo-950/20 text-slate-100",
    !dragging && file && "border-emerald-500/50 bg-emerald-950/10 text-slate-100",
    !dragging && !file && "border-slate-700 bg-[#0e1117] text-slate-400 hover:border-indigo-500/50 hover:bg-indigo-950/10"
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>Upload Candidate CV</h2>
        <p className="text-sm text-slate-400 mt-1">Upload a PDF resume.</p>
      </div>

      <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => document.getElementById("cv-file-input").click()} className={dropzoneClass}>
        <input id="cv-file-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        <div className="text-3xl mb-3">{file ? "📄" : "⬆"}</div>
        <p className="text-sm font-medium">{file ? file.name : "Click or drag & drop a PDF here"}</p>
        {file && <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>}
      </div>

      <button onClick={onSubmit} disabled={!file || status === "loading"} className="self-start flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-200 hover:opacity-90 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed">
        {status === "loading" && <Spinner />}
        {status === "loading" ? "Parsing resume…" : "Upload & Analyze"}
      </button>

      {status === "error" && (
        <div className="text-sm font-medium text-red-400 bg-red-950/30 border border-red-700/30 rounded-xl px-4 py-3">❌ {errorMsg}</div>
      )}

      {status === "success" && result && (
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-700/30 rounded-xl px-4 py-3">✅ Candidate indexed successfully.</div>
          <CandidateCard candidate={result} />
        </div>
      )}
    </div>
  );
}

function SearchTab() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [matches, setMatches] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [searched, setSearched] = useState(false);

  const onSearch = async () => {
    if (!query.trim()) return;
    setStatus("loading");
    setMatches([]);
    setErrorMsg("");
    setSearched(false);
    try {
      const { data } = await axios.post(API_BASE + "/search", { prompt: query });
      setMatches(data.matches || []);
      setStatus("success");
      setSearched(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>Talent Search</h2>
        <p className="text-sm text-slate-400 mt-1">Describe the profile you are looking for.</p>
      </div>

      <div className="flex gap-2">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} placeholder="e.g. Senior React developer with TypeScript and 5+ years experience" className="flex-1 bg-[#0e1117] border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 outline-none transition-colors duration-200 focus:border-indigo-500" />
        <button onClick={onSearch} disabled={!query.trim() || status === "loading"} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-200 hover:opacity-90 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed">
          {status === "loading" ? <Spinner /> : "Search"}
        </button>
      </div>

      {status === "error" && (
        <div className="text-sm font-medium text-red-400 bg-red-950/30 border border-red-700/30 rounded-xl px-4 py-3">❌ {errorMsg}</div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
          <Spinner size="lg" />
          <p className="text-sm">Scanning talent pool…</p>
        </div>
      )}

      {searched && status === "success" && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{matches.length} candidate{matches.length !== 1 ? "s" : ""} matched</p>
          {matches.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-600 gap-3">
              <span className="text-4xl">🔍</span>
              <p className="text-sm">No candidates matched this query. Try uploading more resumes.</p>
            </div>
          ) : (
            matches.map((c) => <CandidateCard key={c.id} candidate={c} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100">

      <header className="border-b border-slate-800/80 bg-[#0d1117]">
        <div className="max-w-full w-full px-8 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚡</span>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent" style={{ fontFamily: "'Syne', sans-serif" }}>
                HireFlow <sup className="text-slate-600 font-semibold" style={{ fontSize: "9px" }}>ATS</sup>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">Applicant Tracking System</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 border border-slate-800 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Online
          </span>
        </div>
      </header>

      <main className="max-w-full w-full px-8 py-8">
        <div className="flex gap-1 border-b border-slate-800 mb-6">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={"px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-150 " + (activeTab === key ? "text-indigo-400 border-indigo-400" : "text-slate-500 border-transparent hover:text-slate-300")}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-[#0e1117] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {activeTab === "upload" ? <UploadTab /> : <SearchTab />}
        </div>
      </main>

    </div>
  );
}
