import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg: "#0a0a0f",
  surface: "#111118",
  card: "#16161f",
  cardHover: "#1c1c28",
  border: "#ffffff0f",
  borderHover: "#ffffff1a",
  accent: "#7c5cfc",
  accentSoft: "#7c5cfc22",
  accentGlow: "#7c5cfc44",
  teal: "#0fd6c2",
  tealSoft: "#0fd6c218",
  gold: "#f5c542",
  text: "#f0f0f8",
  muted: "#8888aa",
  subtle: "#3a3a55",
};

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
const INITIAL_PROJECTS = [
  { id: 1, title: "Portfolio Website with Dark Mode", client: "Arjun Mehta", clientAvatar: "AM", budget: 8000, deadline: "2026-07-15", skills: ["React", "CSS", "Figma"], category: "Frontend", description: "Need a clean personal portfolio with dark mode toggle, animated transitions, contact form, and project gallery. Prefer React with Framer Motion.", proposals: 3, status: "open", postedAgo: "2 days ago" },
  { id: 2, title: "REST API for Food Delivery App", client: "Priya Sharma", clientAvatar: "PS", budget: 15000, deadline: "2026-07-30", skills: ["Node.js", "Express", "MongoDB"], category: "Backend", description: "Looking for someone to build REST APIs — user auth (JWT), order management, real-time order tracking, and payment webhook integration with Razorpay.", proposals: 6, status: "open", postedAgo: "5 days ago" },
  { id: 3, title: "E-commerce Admin Dashboard", client: "Rohan Gupta", clientAvatar: "RG", budget: 12000, deadline: "2026-08-05", skills: ["React", "Tailwind", "Chart.js"], category: "Frontend", description: "Need a fully responsive admin dashboard with charts, product CRUD, order management table, export to CSV, and real-time sales stats.", proposals: 2, status: "open", postedAgo: "1 day ago" },
  { id: 4, title: "Fix Bugs in Django Project", client: "Sneha Reddy", clientAvatar: "SR", budget: 4500, deadline: "2026-07-10", skills: ["Python", "Django", "PostgreSQL"], category: "Backend", description: "My college project has bugs in the login flow and DB queries. Need someone experienced to debug, fix, and clean up the code. Quick turnaround needed.", proposals: 8, status: "open", postedAgo: "3 hours ago" },
  { id: 5, title: "Mobile App UI/UX Design", client: "Kiran Rao", clientAvatar: "KR", budget: 9000, deadline: "2026-08-12", skills: ["Figma", "UI/UX", "Prototyping"], category: "Design", description: "Design a mobile app UI for a fitness tracker — onboarding screens, dashboard, workout logging, progress charts. Deliverable: Figma file with all components.", proposals: 4, status: "open", postedAgo: "6 hours ago" },
  { id: 6, title: "Chrome Extension for Productivity", client: "Dev Anand", clientAvatar: "DA", budget: 6500, deadline: "2026-07-25", skills: ["JavaScript", "Chrome API", "HTML/CSS"], category: "Web Dev", description: "Build a Chrome extension that blocks distracting websites, tracks time spent per tab, and gives a weekly focus report. Settings panel with custom rules.", proposals: 1, status: "open", postedAgo: "4 days ago" },
];

const CATEGORIES = ["All", "Frontend", "Backend", "Design", "Web Dev"];

const CAT_COLORS = {
  Frontend: { bg: "#7c5cfc22", text: "#a78bfa", dot: "#7c5cfc" },
  Backend: { bg: "#0fd6c218", text: "#2dd4bf", dot: "#0fd6c2" },
  Design: { bg: "#f5c54222", text: "#fbbf24", dot: "#f5c542" },
  "Web Dev": { bg: "#f472b622", text: "#f472b6", dot: "#f472b6" },
};

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: "Sarath Kumar", email: "sarath@gmail.com", password: "test123", role: "freelancer", skills: ["React", "Node.js", "PostgreSQL"], bio: "Final year student at Raghu Engineering College.", earnings: 0, projectsDone: 2, avatar: "SK" },
  ]);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [toast, setToast] = useState(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "freelancer" });
  const [postForm, setPostForm] = useState({ title: "", description: "", budget: "", deadline: "", skills: "", category: "Frontend" });
  const [proposalForm, setProposalForm] = useState({ message: "", bid: "" });
  const [filterCat, setFilterCat] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(u => u.email === authForm.email && u.password === authForm.password);
    if (!found) { showToast("Wrong email or password", "error"); return; }
    setUser(found);
    showToast(`Welcome back, ${found.name.split(" ")[0]}! 👋`);
    setPage("dashboard");
    setAuthForm({ name: "", email: "", password: "", role: "freelancer" });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (users.find(u => u.email === authForm.email)) { showToast("Email already registered", "error"); return; }
    const newUser = { id: Date.now(), name: authForm.name, email: authForm.email, password: authForm.password, role: authForm.role, skills: [], bio: "", earnings: 0, projectsDone: 0, avatar: authForm.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() };
    setUsers(p => [...p, newUser]);
    setUser(newUser);
    showToast("Account created! Welcome to SkillBridge 🎉");
    setPage("dashboard");
  };

  const handleLogout = () => { setUser(null); setPage("home"); showToast("See you soon!"); };

  const handlePostProject = (e) => {
    e.preventDefault();
    const proj = { id: Date.now(), title: postForm.title, client: user.name, clientAvatar: user.avatar, budget: parseInt(postForm.budget), deadline: postForm.deadline, skills: postForm.skills.split(",").map(s => s.trim()).filter(Boolean), category: postForm.category, description: postForm.description, proposals: 0, status: "open", postedAgo: "just now" };
    setProjects(p => [proj, ...p]);
    showToast("Project posted successfully!");
    setPostForm({ title: "", description: "", budget: "", deadline: "", skills: "", category: "Frontend" });
    setPage("projects");
  };

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    if (!user) { setPage("login"); return; }
    if (proposals.find(p => p.projectId === selectedProject.id && p.freelancerId === user.id)) { showToast("You already submitted a proposal", "error"); return; }
    setProposals(p => [...p, { id: Date.now(), projectId: selectedProject.id, freelancerId: user.id, freelancerName: user.name, message: proposalForm.message, bid: parseInt(proposalForm.bid), status: "pending" }]);
    setProjects(p => p.map(pr => pr.id === selectedProject.id ? { ...pr, proposals: pr.proposals + 1 } : pr));
    showToast("Proposal sent! The client will review it.");
    setProposalForm({ message: "", bid: "" });
  };

  const filtered = projects.filter(p => {
    const mCat = filterCat === "All" || p.category === filterCat;
    const mQ = p.title.toLowerCase().includes(searchQ.toLowerCase()) || p.skills.join(" ").toLowerCase().includes(searchQ.toLowerCase());
    return mCat && mQ;
  });

  const myProposals = user ? proposals.filter(p => p.freelancerId === user.id) : [];
  const myProjects = user ? projects.filter(p => p.client === user.name) : [];

  const nav = (p) => { setPage(p); };

  /* ── STYLES ── */
  const gs = {
    app: { fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", minHeight: "100vh", background: T.bg, color: T.text, margin: 0 },
  };

  return (
    <div style={gs.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.surface}; } ::-webkit-scrollbar-thumb { background: ${T.subtle}; border-radius: 2px; }
        input, textarea, select { font-family: inherit; color: ${T.text}; }
        input::placeholder, textarea::placeholder { color: ${T.muted}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px ${T.accentGlow}; } 50% { box-shadow: 0 0 40px ${T.accent}55; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .btn-primary { background: linear-gradient(135deg, ${T.accent}, #9d7bff); border: none; color: #fff; border-radius: 10px; padding: 11px 22px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px ${T.accentGlow}; filter: brightness(1.1); }
        .btn-ghost { background: ${T.accentSoft}; border: 1px solid ${T.border}; color: ${T.accent}; border-radius: 10px; padding: 11px 20px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .btn-ghost:hover { background: ${T.accentGlow}; border-color: ${T.accent}55; }
        .input-field { width: 100%; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: ${T.text}; outline: none; transition: border 0.2s, box-shadow 0.2s; }
        .input-field:focus { border-color: ${T.accent}88; box-shadow: 0 0 0 3px ${T.accentSoft}; }
        .card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 16px; transition: all 0.25s; }
        .card:hover { border-color: ${T.borderHover}; background: ${T.cardHover}; }
        .project-card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 16px; padding: 24px; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
        .project-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, ${T.accent}08, transparent); opacity: 0; transition: opacity 0.25s; border-radius: 16px; }
        .project-card:hover { border-color: ${T.accent}44; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${T.accent}22; }
        .project-card:hover::before { opacity: 1; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; cursor: pointer; transition: all 0.18s; color: ${T.muted}; font-size: 14px; font-weight: 500; text-decoration: none; border: none; background: none; width: 100%; }
        .nav-item:hover { background: ${T.accentSoft}; color: ${T.text}; }
        .nav-item.active { background: ${T.accentSoft}; color: ${T.accent}; font-weight: 600; }
        .stat-card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 14px; padding: 22px 24px; position: relative; overflow: hidden; }
        .stat-card::after { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; border-radius: 50%; background: ${T.accent}0a; }
        .tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.muted}; margin-bottom: 14px; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "error" ? "#ef4444" : "linear-gradient(135deg, #7c5cfc, #0fd6c2)", color: "#fff", padding: "14px 22px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 10, animation: "fadeUp 0.3s ease", maxWidth: 340 }}>
          <span>{toast.type === "error" ? "⚠️" : "✓"}</span> {toast.msg}
        </div>
      )}

      {/* ── LANDING ── */}
      {page === "home" && <LandingPage nav={nav} projects={projects.slice(0, 3)} setSelectedProject={setSelectedProject} />}

      {/* ── AUTH ── */}
      {(page === "login" || page === "register") && (
        <AuthPage page={page} authForm={authForm} setAuthForm={setAuthForm} handleLogin={handleLogin} handleRegister={handleRegister} nav={nav} />
      )}

      {/* ── APP SHELL (dashboard, projects, detail, post) ── */}
      {["dashboard", "projects", "project-detail", "post-project"].includes(page) && (
        <AppShell page={page} nav={nav} user={user} handleLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          {page === "dashboard" && <DashboardPage user={user} myProposals={myProposals} myProjects={myProjects} projects={projects} proposals={proposals} nav={nav} setSelectedProject={setSelectedProject} />}
          {page === "projects" && <ProjectsPage filtered={filtered} filterCat={filterCat} setFilterCat={setFilterCat} searchQ={searchQ} setSearchQ={setSearchQ} nav={nav} setSelectedProject={setSelectedProject} />}
          {page === "project-detail" && <ProjectDetailPage project={selectedProject} user={user} proposalForm={proposalForm} setProposalForm={setProposalForm} handleSubmitProposal={handleSubmitProposal} proposals={proposals} nav={nav} />}
          {page === "post-project" && <PostProjectPage user={user} postForm={postForm} setPostForm={setPostForm} handlePostProject={handlePostProject} nav={nav} />}
        </AppShell>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
function LandingPage({ nav, projects, setSelectedProject }) {
  const [count, setCount] = useState({ projects: 0, freelancers: 0, paid: 0 });
  useEffect(() => {
    const targets = { projects: 120, freelancers: 85, paid: 24 };
    const duration = 1800;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({ projects: Math.round(targets.projects * ease), freelancers: Math.round(targets.freelancers * ease), paid: Math.round(targets.paid * ease) });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: `${T.bg}cc`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>Skill<span style={{ color: T.accent }}>Bridge</span></span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" onClick={() => nav("login")}>Log in</button>
          <button className="btn-primary" onClick={() => nav("register")}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", padding: "100px 40px 80px", textAlign: "center", overflow: "hidden" }}>
        {/* Background orbs */}
        <div style={{ position: "absolute", top: -100, left: "20%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}18, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.teal}12, transparent 70%)`, pointerEvents: "none" }} />

        <div className="fade-up" style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accentSoft, border: `1px solid ${T.accent}44`, borderRadius: 20, padding: "6px 16px", marginBottom: 28, fontSize: 12, fontWeight: 600, color: T.accent }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, display: "inline-block", animation: "pulse 2s infinite" }} />
            85+ Freelancers · 120+ Projects · Live Platform
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
            Where{" "}
            <span style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Student Skills
            </span>
            <br />Meet Real Projects
          </h1>
          <p style={{ fontSize: 18, color: T.muted, maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.7, fontWeight: 400 }}>
            Post a project, get proposals from verified freelancers, sign a contract — all in one place built for the Indian dev ecosystem.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => nav("register")} style={{ padding: "14px 32px", fontSize: 15 }}>Start for Free</button>
            <button className="btn-ghost" onClick={() => nav("projects")} style={{ padding: "14px 28px", fontSize: 15 }}>Browse Projects</button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", justifyContent: "center", gap: 56, marginTop: 72, flexWrap: "wrap" }}>
          {[
            { val: `${count.projects}+`, label: "Projects Posted" },
            { val: `${count.freelancers}+`, label: "Freelancers" },
            { val: `₹${count.paid}L+`, label: "Earnings Paid Out" },
            { val: "4.8★", label: "Avg. Rating" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: -1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section style={{ padding: "20px 40px 80px", maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <p className="section-label">Live on Platform</p>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Open Projects</h2>
          </div>
          <button onClick={() => nav("projects")} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>View all →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {projects.map((p, i) => (
            <div key={p.id} style={{ animationDelay: `${i * 0.1}s` }} className="fade-up">
              <MiniProjectCard project={p} onClick={() => { setSelectedProject(p); nav("projects"); nav("project-detail"); }} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "60px 40px 80px", background: T.surface, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p className="section-label" style={{ textAlign: "center" }}>The Process</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 52, letterSpacing: -0.5 }}>How SkillBridge Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2, position: "relative" }}>
            {[
              { icon: "📝", title: "Post a Project", desc: "Describe what you need, set your budget and deadline. Takes under 2 minutes." },
              { icon: "📨", title: "Get Proposals", desc: "Freelancers review your brief and send a tailored proposal with their bid." },
              { icon: "🤝", title: "Pick & Hire", desc: "Compare proposals, chat with shortlisted freelancers, sign a contract." },
              { icon: "✅", title: "Work Gets Done", desc: "Track progress, review deliverables, release payment when satisfied." },
            ].map((s, i) => (
              <div key={s.title} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "28px 24px", position: "relative" }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ position: "absolute", top: 16, right: 16, fontSize: 11, fontWeight: 700, color: T.subtle, fontVariantNumeric: "tabular-nums" }}>0{i + 1}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center" }}>
        <div style={{ background: `linear-gradient(135deg, ${T.accent}22, ${T.teal}11)`, border: `1px solid ${T.accent}33`, borderRadius: 24, padding: "60px 40px", maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>Ready to start?</h2>
          <p style={{ color: T.muted, fontSize: 15, marginBottom: 32 }}>Join 85+ freelancers already earning on SkillBridge.</p>
          <button className="btn-primary" onClick={() => nav("register")} style={{ padding: "15px 40px", fontSize: 16 }}>Create Free Account</button>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${T.border}`, padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: T.muted, fontSize: 12, flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontWeight: 700, color: T.accent }}>SkillBridge</span>
        <span>Built with React · Jan–Mar 2026 · Freelance Collaboration Platform</span>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP SHELL — Sidebar + Content
   ═══════════════════════════════════════════════════════════════ */
function AppShell({ page, nav, user, handleLogout, sidebarOpen, setSidebarOpen, children }) {
  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "projects", icon: "◈", label: "Browse Projects" },
    { id: "post-project", icon: "+", label: "Post Project", iconStyle: { background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, color: "#fff", borderRadius: 6, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 } },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 240 : 68, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "20px 12px", transition: "width 0.25s ease", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 4px 20px", marginBottom: 4, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", flexShrink: 0 }}>S</div>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5, whiteSpace: "nowrap" }}>Skill<span style={{ color: T.accent }}>Bridge</span></span>}
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => nav(item.id)} title={!sidebarOpen ? item.label : undefined}>
              {item.iconStyle
                ? <span style={item.iconStyle}>{item.icon}</span>
                : <span style={{ fontSize: 18, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>}
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
              {page === item.id && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: T.accent, flexShrink: 0 }} />}
            </button>
          ))}
        </div>

        {/* User section */}
        {user && (
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 4px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user.avatar}</div>
              {sidebarOpen && (
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, textTransform: "capitalize" }}>{user.role}</div>
                </div>
              )}
            </div>
            <button className="nav-item" onClick={handleLogout} style={{ color: "#ef4444" }}>
              <span style={{ fontSize: 16 }}>⤷</span>
              {sidebarOpen && "Log out"}
            </button>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: T.card, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "8px", cursor: "pointer", marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          <span style={{ transform: sidebarOpen ? "none" : "rotate(180deg)", transition: "transform 0.25s", fontSize: 14 }}>◂</span>
        </button>
      </aside>

      {/* CONTENT */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: `${T.surface}cc`, backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.border}`, padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ fontSize: 14, color: T.muted }}>
            {page === "dashboard" && "👋 Welcome back, " + (user?.name?.split(" ")[0] || "")}
            {page === "projects" && "Browse open projects"}
            {page === "project-detail" && "Project details"}
            {page === "post-project" && "Post a new project"}
          </div>
          {!user && (
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" onClick={() => nav("login")} style={{ padding: "8px 16px", fontSize: 13 }}>Log in</button>
              <button className="btn-primary" onClick={() => nav("register")} style={{ padding: "8px 16px", fontSize: 13 }}>Sign Up</button>
            </div>
          )}
        </div>
        <div style={{ padding: "36px 32px" }}>{children}</div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
function DashboardPage({ user, myProposals, myProjects, projects, proposals, nav, setSelectedProject }) {
  if (!user) return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <p style={{ color: T.muted, marginBottom: 20 }}>Please log in to view your dashboard.</p>
      <button className="btn-primary" onClick={() => nav("login")}>Log In</button>
    </div>
  );

  const stats = [
    { label: "Active Proposals", value: myProposals.filter(p => p.status === "pending").length, icon: "📨", color: T.accent },
    { label: "My Projects", value: myProjects.length, icon: "📁", color: T.teal },
    { label: "Contracts", value: 0, icon: "📄", color: T.gold },
    { label: "Earnings", value: `₹${user.earnings.toLocaleString("en-IN")}`, icon: "💰", color: "#4ade80" },
  ];

  return (
    <div className="fade-up">
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: -1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 22, opacity: 0.7 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Proposals */}
        <div>
          <p className="section-label">My Proposals</p>
          {myProposals.length === 0 ? (
            <EmptyState icon="📋" message="No proposals yet." action="Browse Projects" onAction={() => nav("projects")} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myProposals.map(prop => {
                const proj = projects.find(p => p.id === prop.projectId);
                return (
                  <div key={prop.id} className="card" style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{proj?.title}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Bid: ₹{prop.bid?.toLocaleString("en-IN")} · {proj?.deadline}</div>
                    </div>
                    <span className="tag" style={{ background: "#fef3c733", color: "#fbbf24" }}>Pending</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Posted projects */}
        <div>
          <p className="section-label">My Posted Projects</p>
          {myProjects.length === 0 ? (
            <EmptyState icon="🗂️" message="No projects posted." action="Post a Project" onAction={() => nav("post-project")} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myProjects.map(p => (
                <div key={p.id} className="card" style={{ padding: "16px 18px", cursor: "pointer" }} onClick={() => { setSelectedProject(p); nav("project-detail"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                    <span className="tag" style={{ background: T.accentSoft, color: T.accent }}>₹{p.budget?.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{proposals.filter(pr => pr.projectId === p.id).length} proposals · {p.deadline}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick browse */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p className="section-label" style={{ margin: 0 }}>Recently Posted</p>
          <button onClick={() => nav("projects")} style={{ background: "none", border: "none", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>All projects →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {projects.slice(0, 3).map(p => (
            <MiniProjectCard key={p.id} project={p} onClick={() => { setSelectedProject(p); nav("project-detail"); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTS PAGE
   ═══════════════════════════════════════════════════════════════ */
function ProjectsPage({ filtered, filterCat, setFilterCat, searchQ, setSearchQ, nav, setSelectedProject }) {
  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Browse Projects</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>{filtered.length} open projects available</p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 15 }}>⌕</span>
          <input className="input-field" placeholder="Search by title or skill..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => {
            const active = filterCat === cat;
            return (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{ border: `1px solid ${active ? T.accent : T.border}`, background: active ? T.accentSoft : "transparent", color: active ? T.accent : T.muted, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p>No projects match your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <MiniProjectCard project={p} onClick={() => { setSelectedProject(p); nav("project-detail"); }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROJECT DETAIL
   ═══════════════════════════════════════════════════════════════ */
function ProjectDetailPage({ project, user, proposalForm, setProposalForm, handleSubmitProposal, proposals, nav }) {
  if (!project) return <div style={{ color: T.muted }}>No project selected.</div>;
  const cc = CAT_COLORS[project.category] || CAT_COLORS["Frontend"];
  const alreadyProposed = user && proposals.find(p => p.projectId === project.id && p.freelancerId === user.id);

  return (
    <div className="fade-up">
      <button onClick={() => nav("projects")} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", marginBottom: 28, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        {/* Left */}
        <div>
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="tag" style={{ background: cc.bg, color: cc.text, marginBottom: 12 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: cc.dot, display: "inline-block" }} /> {project.category}
                </span>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.3 }}>{project.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{project.clientAvatar}</div>
                  <span style={{ fontSize: 13, color: T.muted }}>{project.client}</span>
                  <span style={{ color: T.subtle }}>·</span>
                  <span style={{ fontSize: 12, color: T.subtle }}>{project.postedAgo}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: T.accent }}>₹{project.budget?.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: 11, color: T.muted }}>Fixed Price</div>
              </div>
            </div>

            <p style={{ fontSize: 14.5, lineHeight: 1.8, color: "#c8c8e0", marginBottom: 28 }}>{project.description}</p>

            <div style={{ display: "flex", gap: 32, borderTop: `1px solid ${T.border}`, paddingTop: 24, marginBottom: 24, flexWrap: "wrap" }}>
              {[["Deadline", project.deadline], ["Proposals", `${project.proposals} received`], ["Status", "Open"]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: k === "Status" ? "#4ade80" : T.text }}>{v}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Skills Required</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {project.skills.map(s => (
                  <span key={s} className="tag" style={{ background: T.accentSoft, color: T.accent, border: `1px solid ${T.accent}33` }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Proposal form */}
        <div className="card" style={{ padding: "28px", position: "sticky", top: 80 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Submit Proposal</h2>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>
            {alreadyProposed ? "You already submitted a proposal." : user ? "Make it specific — clients notice effort." : "Log in to submit a proposal."}
          </p>

          {alreadyProposed ? (
            <div style={{ background: "#4ade8011", border: "1px solid #4ade8033", borderRadius: 10, padding: "16px", textAlign: "center", color: "#4ade80", fontSize: 14, fontWeight: 600 }}>
              ✓ Proposal Submitted
            </div>
          ) : !user ? (
            <button className="btn-primary" onClick={() => nav("login")} style={{ width: "100%", padding: "13px" }}>Log In to Apply</button>
          ) : (
            <form onSubmit={handleSubmitProposal} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Bid (₹)</label>
                <input required type="number" className="input-field" placeholder="e.g. 9000" value={proposalForm.bid} onChange={e => setProposalForm(f => ({ ...f, bid: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cover Message</label>
                <textarea required rows={6} className="input-field" placeholder="Hi, I've worked on similar projects before. Here's how I'd approach this..." value={proposalForm.message} onChange={e => setProposalForm(f => ({ ...f, message: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: "13px", width: "100%", fontSize: 14 }}>Send Proposal →</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   POST PROJECT
   ═══════════════════════════════════════════════════════════════ */
function PostProjectPage({ user, postForm, setPostForm, handlePostProject, nav }) {
  if (!user) return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <p style={{ color: T.muted, marginBottom: 20 }}>You need to be logged in to post a project.</p>
      <button className="btn-primary" onClick={() => nav("login")}>Log In</button>
    </div>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Post a Project</h1>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 32 }}>Be specific — detailed briefs get better proposals.</p>

      <form onSubmit={handlePostProject} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <p className="section-label">Basic Details</p>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Project Title</label>
            <input required className="input-field" placeholder="e.g. Build a Portfolio Website with Dark Mode" value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Budget (₹)</label>
              <input required type="number" className="input-field" placeholder="e.g. 8000" value={postForm.budget} onChange={e => setPostForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Deadline</label>
              <input required type="date" className="input-field" value={postForm.deadline} onChange={e => setPostForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</label>
              <select className="input-field" value={postForm.category} onChange={e => setPostForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Skills (comma separated)</label>
              <input required className="input-field" placeholder="React, Node.js, CSS" value={postForm.skills} onChange={e => setPostForm(f => ({ ...f, skills: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "28px" }}>
          <p className="section-label">Description</p>
          <textarea required rows={7} className="input-field" placeholder="Describe exactly what needs to be built. Include:&#10;• What tech stack you prefer&#10;• Specific features or pages&#10;• Any existing code or designs&#10;• How deliverables should be shared" value={postForm.description} onChange={e => setPostForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
        </div>

        <button type="submit" className="btn-primary" style={{ padding: "15px", fontSize: 15, alignSelf: "flex-start", paddingRight: 40 }}>
          Post Project →
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH PAGE
   ═══════════════════════════════════════════════════════════════ */
function AuthPage({ page, authForm, setAuthForm, handleLogin, handleRegister, nav }) {
  const isLogin = page === "login";
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: T.bg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "30%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}14, transparent 70%)`, pointerEvents: "none" }} />

      <div className="fade-up" style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 auto 14px" }}>S</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p style={{ color: T.muted, fontSize: 14, marginTop: 4 }}>{isLogin ? "Log in to your SkillBridge account" : "Join 85+ freelancers on SkillBridge"}</p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Name</label>
                <input required className="input-field" placeholder="Sarath Kumar" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
              <input required type="email" className="input-field" placeholder="you@email.com" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
              <input required type="password" className="input-field" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            {!isLogin && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>I am a</label>
                <select className="input-field" value={authForm.role} onChange={e => setAuthForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="freelancer">Freelancer — looking for work</option>
                  <option value="client">Client — looking to hire</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ marginTop: 4, padding: "13px", fontSize: 14, width: "100%" }}>
              {isLogin ? "Log In →" : "Create Account →"}
            </button>
          </form>

          {isLogin && (
            <div style={{ marginTop: 16, background: T.accentSoft, border: `1px solid ${T.accent}33`, borderRadius: 8, padding: "12px 14px", fontSize: 12, color: T.muted }}>
              <span style={{ color: T.accent, fontWeight: 600 }}>Demo:</span> sarath@gmail.com / test123
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: T.muted, marginTop: 20 }}>
          {isLogin ? "New here? " : "Already have an account? "}
          <span onClick={() => nav(isLogin ? "register" : "login")} style={{ color: T.accent, cursor: "pointer", fontWeight: 600 }}>
            {isLogin ? "Create account" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MINI PROJECT CARD
   ═══════════════════════════════════════════════════════════════ */
function MiniProjectCard({ project, onClick }) {
  const cc = CAT_COLORS[project.category] || CAT_COLORS["Frontend"];
  return (
    <div className="project-card" onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span className="tag" style={{ background: cc.bg, color: cc.text }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: cc.dot, display: "inline-block" }} />
          {project.category}
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, color: T.accent }}>₹{project.budget?.toLocaleString("en-IN")}</span>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.4, color: T.text }}>{project.title}</h3>
      <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description}</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {project.skills.slice(0, 3).map(s => (
          <span key={s} className="tag" style={{ background: T.accentSoft, color: "#a78bfa", border: `1px solid ${T.accent}22` }}>{s}</span>
        ))}
        {project.skills.length > 3 && <span className="tag" style={{ background: T.surface, color: T.muted }}>+{project.skills.length - 3}</span>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{project.clientAvatar}</div>
          <span style={{ fontSize: 12, color: T.muted }}>{project.client}</span>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.subtle }}>
          <span>{project.proposals} proposals</span>
          <span>·</span>
          <span>{project.postedAgo}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({ icon, message, action, onAction }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "36px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.6 }}>{icon}</div>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>{message}</p>
      <button className="btn-ghost" onClick={onAction} style={{ fontSize: 12, padding: "8px 18px" }}>{action} →</button>
    </div>
  );
}
