"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface LinkRecord {
  code: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
}

interface TooltipState {
  code: string;
  type: "copy" | "url";
}

const HOST =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

const BAR_COLORS = [
  "#f7a800",
  "#3fb950",
  "#58a6ff",
  "#bc8cff",
  "#f85149",
  "#ffa657",
];

function StatCard({
  label,
  value,
  accent,
  delay,
}: {
  label: string;
  value: number | string;
  accent: string;
  delay: string;
}) {
  return (
    <div
      className="fade-in-up rounded-xl border border-border bg-panel p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{ animationDelay: delay }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at top left, ${accent}, transparent 60%)` }}
      />
      <span className="text-xs font-mono text-muted uppercase tracking-widest">{label}</span>
      <span
        className="font-display text-4xl font-bold"
        style={{ color: accent }}
      >
        {value}
      </span>
    </div>
  );
}

function CustomTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: LinkRecord; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3 shadow-xl">
      <p className="font-mono text-xs text-muted mb-1">{d.code}</p>
      <p className="font-mono text-sm text-accent font-bold">{payload[0].value} clicks</p>
    </div>
  );
}

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newLink, setNewLink] = useState<LinkRecord | null>(null);
  const [error, setError] = useState("");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [visitingCode, setVisitingCode] = useState<string | null>(null);
  const [activeBar, setActiveBar] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data.links);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleShorten = async () => {
    setError("");
    setNewLink(null);
    if (!inputUrl.trim()) {
      setError("Please enter a URL.");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to shorten URL.");
        return;
      }
      setNewLink(data.link);
      setInputUrl("");
      setLinks((prev) => [data.link, ...prev]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleVisit = async (code: string) => {
    setVisitingCode(code);
    window.open(`${HOST}/${code}`, "_blank", "noopener,noreferrer");
    await new Promise((res) => setTimeout(res, 800));
    const result = await fetch(`/api/links/${code}`);
    const data = await result.json();
    if (result.ok) {
      setLinks((prev) =>
        prev.map((l) => (l.code === code ? data.link : l))
      );
      if (newLink?.code === code) {
        setNewLink(data.link);
      }
    }
    setVisitingCode(null);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`${HOST}/${code}`);
    setTooltip({ code, type: "copy" });
    setTimeout(() => setTooltip(null), 2000);
  };

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  const chartData = [...links]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)
    .map((l) => ({ ...l, name: l.code }));

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-void grid-bg noise-overlay relative">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

        <header className="fade-in-up mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#080a0e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-text tracking-tight">snip</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-text leading-none">
            Link Shortener
          </h1>
          <p className="mt-2 text-muted text-base font-body">
            Shorten URLs and track performance in one place.
          </p>
        </header>

        <div className="fade-in-up mb-8 rounded-xl border border-border bg-panel p-6 sm:p-8" style={{ animationDelay: "0.1s" }}>
          <label className="block font-display text-sm font-semibold text-text mb-3 uppercase tracking-widest">
            Paste a long URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => { setInputUrl(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              placeholder="https://your-very-long-url.com/with/a/lot/of/path"
              className="flex-1 rounded-lg bg-void border border-border px-4 py-3 text-text text-sm font-mono placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <button
              onClick={handleShorten}
              disabled={isCreating}
              className="shrink-0 rounded-lg bg-accent hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-void font-display font-bold text-sm uppercase tracking-wider transition-all hover:shadow-glow active:scale-95"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Generating...
                </span>
              ) : "Shorten →"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-crimson text-sm font-mono flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </p>
          )}

          {newLink && (
            <div className="mt-5 rounded-lg border border-accent bg-accent-dim px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-pulse-once">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted font-mono mb-1 uppercase tracking-widest">Your shortened link</p>
                <p className="font-mono text-accent font-bold text-base truncate">
                  {HOST}/{newLink.code}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(newLink.code)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-panel hover:border-accent px-4 py-2 text-text text-xs font-mono transition-all relative"
                >
                  {tooltip?.code === newLink.code && tooltip.type === "copy" ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      <span className="text-emerald">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleVisit(newLink.code)}
                  disabled={visitingCode === newLink.code}
                  className="flex items-center gap-2 rounded-lg bg-emerald-dim border border-emerald hover:bg-emerald hover:text-void px-4 py-2 text-emerald text-xs font-mono transition-all disabled:opacity-50"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                  Visit
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Links" value={links.length} accent="#f7a800" delay="0.15s" />
          <StatCard label="Total Clicks" value={totalClicks} accent="#3fb950" delay="0.2s" />
          <StatCard label="Top Code" value={chartData[0]?.code ?? "—"} accent="#58a6ff" delay="0.25s" />
          <StatCard label="Best Clicks" value={chartData[0]?.clicks ?? 0} accent="#bc8cff" delay="0.3s" />
        </div>

        {links.length > 0 && (
          <div className="fade-in-up mb-8 rounded-xl border border-border bg-panel p-6" style={{ animationDelay: "0.35s" }}>
            <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-widest mb-6">
              Clicks Per Link (Top 10)
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: "JetBrains Mono", fontSize: 11, fill: "#8b949e" }}
                  axisLine={{ stroke: "#21262d" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontFamily: "JetBrains Mono", fontSize: 11, fill: "#8b949e" }}
                  axisLine={{ stroke: "#21262d" }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipContent />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar
                  dataKey="clicks"
                  radius={[6, 6, 0, 0]}
                  onMouseEnter={(_: unknown, i: number) => setActiveBar(chartData[i]?.code)}
                  onMouseLeave={() => setActiveBar(null)}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.code}
                      fill={BAR_COLORS[i % BAR_COLORS.length]}
                      opacity={activeBar && activeBar !== entry.code ? 0.4 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="fade-in-up rounded-xl border border-border bg-panel overflow-hidden" style={{ animationDelay: "0.4s" }}>
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-widest">
              All Links
            </h2>
            <span className="font-mono text-xs text-muted bg-void border border-border rounded-full px-3 py-1">
              {links.length} total
            </span>
          </div>

          {links.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <p className="font-mono text-sm">No links yet. Shorten something above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 font-mono text-xs text-muted uppercase tracking-widest">Code</th>
                    <th className="text-left px-6 py-3 font-mono text-xs text-muted uppercase tracking-widest">Original URL</th>
                    <th className="text-left px-6 py-3 font-mono text-xs text-muted uppercase tracking-widest">Created</th>
                    <th className="text-left px-6 py-3 font-mono text-xs text-muted uppercase tracking-widest">Clicks</th>
                    <th className="text-left px-6 py-3 font-mono text-xs text-muted uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link, i) => (
                    <tr
                      key={link.code}
                      className="border-b border-border/50 hover:bg-void/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-accent font-medium text-xs bg-accent-dim px-2 py-1 rounded">
                          {link.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="relative">
                          <p
                            className="font-mono text-xs text-muted truncate max-w-[200px] sm:max-w-xs cursor-help group/url"
                            title={link.originalUrl}
                          >
                            {link.originalUrl}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-muted whitespace-nowrap">
                          {formatDate(link.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}
                        >
                          {link.clicks}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(link.code)}
                            className="relative flex items-center gap-1.5 rounded-md border border-border hover:border-accent bg-void px-3 py-1.5 text-muted hover:text-accent text-xs font-mono transition-all"
                          >
                            {tooltip?.code === link.code && tooltip.type === "copy" ? (
                              <span className="text-emerald">Copied!</span>
                            ) : "Copy"}
                          </button>
                          <button
                            onClick={() => handleVisit(link.code)}
                            disabled={visitingCode === link.code}
                            className="flex items-center gap-1.5 rounded-md border border-emerald/30 hover:border-emerald bg-emerald-dim hover:bg-emerald hover:text-void px-3 py-1.5 text-emerald text-xs font-mono transition-all disabled:opacity-40"
                          >
                            {visitingCode === link.code ? "..." : "Visit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="mt-10 text-center">
          <p className="font-mono text-xs text-muted/50">
            Built with Next.js 15 · Recharts · Tailwind CSS · JSON persistence
          </p>
        </footer>
      </div>
    </div>
  );
}
