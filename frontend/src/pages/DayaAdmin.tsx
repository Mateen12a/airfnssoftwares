import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "@/lib/api";

interface Registrant {
  name: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function exportCSV(registrants: Registrant[]) {
  const header = "Name,RSVP Date\n";
  const rows = registrants.map((r) => `"${r.name}","${formatDate(r.createdAt)}"`).join("\n");
  download(header + rows, "daya-motive-guests.csv", "text/csv");
}

function exportTXT(registrants: Registrant[]) {
  const lines = [
    "Daya Motive — Guest List",
    `Exported: ${new Date().toLocaleString("en-GB")}`,
    `Total: ${registrants.length}`,
    "",
    ...registrants.map((r, i) => `${String(i + 1).padStart(3, " ")}. ${r.name}  |  ${formatDate(r.createdAt)}`),
  ];
  download(lines.join("\n"), "daya-motive-guests.txt", "text/plain");
}

function exportWord(registrants: Registrant[]) {
  const rows = registrants
    .map((r, i) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;font-size:13px">${i + 1}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:500">${r.name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:13px">${formatDate(r.createdAt)}</td></tr>`)
    .join("");

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Daya Motive Guest List</title></head><body style="font-family:Arial,sans-serif;padding:32px"><h1 style="font-size:24px;margin-bottom:4px">Daya Motive</h1><p style="color:#888;margin-bottom:24px">Guest List &mdash; Exported ${new Date().toLocaleString("en-GB")} &mdash; ${registrants.length} guests</p><table style="border-collapse:collapse;width:100%"><thead><tr style="background:#f5f5f5"><th style="padding:10px 12px;text-align:left;font-size:12px;color:#555;border-bottom:2px solid #ddd">#</th><th style="padding:10px 12px;text-align:left;font-size:12px;color:#555;border-bottom:2px solid #ddd">Name</th><th style="padding:10px 12px;text-align:left;font-size:12px;color:#555;border-bottom:2px solid #ddd">RSVP'd</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  download(html, "daya-motive-guests.doc", "application/msword");
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function DayaAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [activePass, setActivePass] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("daya_admin");
    if (saved) { setAuthed(true); setActivePass(saved); }
  }, []);

  const fetchData = useCallback(async (pass: string) => {
    setDataLoading(true);
    try {
      const res = await fetch(apiUrl("/api/daya/registrants"), {
        headers: { Authorization: `Bearer ${pass}` },
      });
      if (res.status === 401) { sessionStorage.removeItem("daya_admin"); setAuthed(false); return; }
      const data = await res.json();
      setRegistrants(data.registrants ?? []);
      setTotal(data.total ?? 0);
    } catch { /* silent */ } finally { setDataLoading(false); }
  }, []);

  useEffect(() => {
    if (authed && activePass) fetchData(activePass);
  }, [authed, activePass, fetchData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(apiUrl("/api/daya/admin/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("daya_admin", password);
        setActivePass(password);
        setAuthed(true);
      } else {
        setLoginError("Incorrect password. Try again.");
      }
    } catch {
      setLoginError("Could not connect. Try again in a moment.");
    } finally { setLoginLoading(false); }
  }

  const filtered = registrants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="da-root">
      <div className="da-bg-glow" />

      <AnimatePresence mode="wait">
        {!authed ? (
          <motion.div key="login" className="da-login-card"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

            <img src="/assets/airfns-logo.png" alt="AirFns Softwares" className="da-login-logo" style={{ filter: "invert(1) hue-rotate(180deg)" }} />
            <h1 className="da-login-title">Daya Motive</h1>
            <p className="da-login-sub">Guest list admin</p>

            <form onSubmit={handleLogin} className="da-login-form" noValidate>
              <input type="password" className="da-input" placeholder="Admin password"
                value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                autoFocus autoComplete="current-password" />
              {loginError && (
                <motion.p className="da-login-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                  {loginError}
                </motion.p>
              )}
              <button type="submit" className="da-login-btn" disabled={!password || loginLoading}>
                {loginLoading ? <span className="da-spinner" /> : "Sign In →"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="dash" className="da-dash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

            <div className="da-header">
              <div className="da-header-left">
                <img src="/assets/airfns-logo.png" alt="AirFns" className="da-dash-logo" style={{ filter: "invert(1) hue-rotate(180deg)" }} />
                <div>
                  <h1 className="da-dash-title">Daya Motive</h1>
                  <p className="da-dash-sub">Guest list</p>
                </div>
              </div>
              <div className="da-header-right">
                <div className="da-count-box">
                  <span className="da-count-num">{total}</span>
                  <span className="da-count-label">RSVPs</span>
                </div>
                <button className="da-icon-btn" onClick={() => fetchData(activePass)} disabled={dataLoading} title="Refresh">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                </button>
                <div className="da-export-wrap">
                  <button className="da-export-btn" onClick={() => setExportOpen((v) => !v)} disabled={registrants.length === 0}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Export
                  </button>
                  <AnimatePresence>
                    {exportOpen && (
                      <motion.div className="da-export-menu"
                        initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.15 }}>
                        <button onClick={() => { exportCSV(registrants); setExportOpen(false); }} className="da-export-item">
                          <span className="da-export-item-icon">📊</span> CSV (.csv)
                        </button>
                        <button onClick={() => { exportTXT(registrants); setExportOpen(false); }} className="da-export-item">
                          <span className="da-export-item-icon">📄</span> Plain Text (.txt)
                        </button>
                        <button onClick={() => { exportWord(registrants); setExportOpen(false); }} className="da-export-item">
                          <span className="da-export-item-icon">📝</span> Word (.doc)
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button className="da-logout-btn" onClick={() => { sessionStorage.removeItem("daya_admin"); setAuthed(false); setPassword(""); setActivePass(""); }}>
                  Sign out
                </button>
              </div>
            </div>

            <div className="da-search-wrap">
              <svg className="da-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" className="da-search" placeholder="Search guests by name..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && (
                <button className="da-search-clear" onClick={() => setSearch("")} aria-label="Clear search">×</button>
              )}
            </div>

            {dataLoading ? (
              <div className="da-state-center">
                <span className="da-spinner da-spinner--lg" />
                <span>Loading guest list...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="da-state-center">
                {search ? `No guests matching "${search}"` : "No RSVPs yet."}
              </div>
            ) : (
              <div className="da-table-card">
                <table className="da-table">
                  <thead>
                    <tr>
                      <th style={{ width: 52 }}>#</th>
                      <th>Name</th>
                      <th>RSVP'd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.name}>
                        <td className="da-td-num">{i + 1}</td>
                        <td className="da-td-name">{r.name}</td>
                        <td className="da-td-date">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {search && (
                  <p className="da-filter-note">
                    Showing {filtered.length} of {total} guest{total !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .da-root {
          min-height: 100dvh;
          background: #07070E;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(20px, 4vw, 40px) clamp(16px, 4vw, 32px);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #F9FAFB;
          position: relative;
        }
        .da-bg-glow {
          position: fixed; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 70% 45% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%);
        }

        .da-login-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: clamp(32px, 6vw, 48px) clamp(24px, 6vw, 44px);
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column; align-items: center;
          gap: 0; position: relative; z-index: 1;
          backdrop-filter: blur(12px);
        }
        .da-login-logo { height: 32px; width: auto; margin-bottom: 24px; opacity: 0.85; }
        .da-login-title { font-size: clamp(22px, 6vw, 28px); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; color: #F59E0B; }
        .da-login-sub { font-size: 13px; color: #6B7280; margin-bottom: 32px; }
        .da-login-form { width: 100%; display: flex; flex-direction: column; gap: 12px; }
        .da-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 15px 18px;
          font-size: 15px; color: #fff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .da-input::placeholder { color: #374151; }
        .da-input:focus { border-color: rgba(245,158,11,0.5); box-shadow: 0 0 0 3px rgba(245,158,11,0.07); }
        .da-login-err { font-size: 13px; color: #F87171; padding: 0 2px; }
        .da-login-btn {
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          border: none; border-radius: 12px;
          padding: 15px; font-size: 14px; font-weight: 700;
          color: #fff; letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer; transition: opacity 0.2s;
          min-height: 50px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(245,158,11,0.25);
        }
        .da-login-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .da-dash { width: 100%; max-width: 900px; position: relative; z-index: 1; }

        .da-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: clamp(16px, 3vw, 24px); flex-wrap: wrap;
        }
        .da-header-left { display: flex; align-items: center; gap: 14px; }
        .da-dash-logo { height: 28px; width: auto; opacity: 0.8; flex-shrink: 0; }
        .da-dash-title { font-size: clamp(18px, 4vw, 24px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; color: #F59E0B; }
        .da-dash-sub { font-size: 12px; color: #6B7280; }
        .da-header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .da-count-box {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.22);
          border-radius: 10px; padding: 8px 14px; min-width: 56px;
        }
        .da-count-num { font-size: 20px; font-weight: 900; color: #F59E0B; line-height: 1; }
        .da-count-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; }
        .da-icon-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px; color: #9CA3AF; cursor: pointer; padding: 9px;
          display: flex; align-items: center; transition: color 0.15s, background 0.15s;
        }
        .da-icon-btn:hover { color: #F9FAFB; background: rgba(255,255,255,0.09); }
        .da-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .da-export-wrap { position: relative; }
        .da-export-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #D1D5DB; font-size: 13px; font-weight: 600;
          cursor: pointer; padding: 8px 14px;
          display: flex; align-items: center; gap: 6px; transition: background 0.15s;
        }
        .da-export-btn:hover { background: rgba(255,255,255,0.1); }
        .da-export-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .da-export-menu {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: #141420; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 6px; min-width: 180px;
          z-index: 50; box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        }
        .da-export-item {
          width: 100%; background: none; border: none;
          color: #D1D5DB; font-size: 13px; font-weight: 500;
          padding: 10px 12px; border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; gap: 10px; text-align: left;
          transition: background 0.15s;
        }
        .da-export-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .da-export-item-icon { font-size: 15px; }

        .da-logout-btn {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18);
          border-radius: 8px; color: #F87171; font-size: 12px; font-weight: 600;
          cursor: pointer; padding: 8px 14px; transition: background 0.15s;
        }
        .da-logout-btn:hover { background: rgba(239,68,68,0.15); }

        .da-search-wrap { position: relative; margin-bottom: 14px; }
        .da-search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #4B5563; pointer-events: none;
        }
        .da-search {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
          padding: 12px 40px 12px 40px; font-size: 14px; color: #F9FAFB;
          outline: none; transition: border-color 0.2s;
        }
        .da-search::placeholder { color: #374151; }
        .da-search:focus { border-color: rgba(245,158,11,0.35); }
        .da-search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #6B7280; font-size: 18px;
          cursor: pointer; padding: 4px; line-height: 1; transition: color 0.15s;
        }
        .da-search-clear:hover { color: #9CA3AF; }

        .da-state-center {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; padding: 60px 20px; color: #6B7280; font-size: 14px;
        }

        .da-table-card {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
        }
        .da-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .da-table thead tr { background: rgba(255,255,255,0.035); }
        .da-table th {
          padding: 13px 18px; text-align: left;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #6B7280;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .da-table tbody tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,0.045); }
        .da-table tbody tr:hover td { background: rgba(255,255,255,0.025); }
        .da-table td { padding: 14px 18px; }
        .da-td-num { color: #4B5563; font-size: 12px; font-weight: 600; }
        .da-td-name { color: #F9FAFB; font-weight: 500; }
        .da-td-date { color: #6B7280; font-size: 12px; white-space: nowrap; }
        .da-filter-note {
          font-size: 12px; color: #4B5563; text-align: center;
          padding: 12px; border-top: 1px solid rgba(255,255,255,0.05);
        }

        .da-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff; border-radius: 50%;
          animation: da-spin 0.7s linear infinite; display: inline-block;
        }
        .da-spinner--lg { width: 26px; height: 26px; }
        @keyframes da-spin { to { transform: rotate(360deg); } }

        @media (max-width: 500px) {
          .da-td-date { display: none; }
          .da-login-card { padding: 28px 20px; }
          .da-header { gap: 12px; }
          .da-header-right { gap: 6px; }
          .da-logout-btn { font-size: 11px; padding: 7px 10px; }
        }
        @media (max-width: 380px) {
          .da-dash-title { font-size: 16px; }
          .da-export-menu { right: auto; left: 0; }
        }
      `}</style>
    </div>
  );
}
