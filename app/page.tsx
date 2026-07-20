"use client";

import { useEffect, useMemo, useState } from "react";

type Adjustment = {
  id: number;
  pieceId: string;
  location: string;
  quantity: number;
  memo: string;
  createdAt: string;
};

type AdjustmentGroup = {
  pieceId: string;
  netQuantity: number;
  locations: string[];
  records: Adjustment[];
};

const emptyForm = { pieceId: "", location: "", quantity: "", memo: "" };

export default function Home() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("adjustlog-theme");
    setDark(savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    fetch("/api/adjustments")
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load adjustments.");
        setAdjustments(data.adjustments ?? []);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Unable to load adjustments."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("adjustlog-theme", dark ? "dark" : "light");
  }, [dark]);

  const groups = useMemo<AdjustmentGroup[]>(() => {
    const grouped = new Map<string, AdjustmentGroup>();
    for (const adjustment of adjustments) {
      const key = adjustment.pieceId.trim().toUpperCase();
      const current = grouped.get(key);
      if (current) {
        current.records.push(adjustment);
        current.netQuantity += adjustment.quantity;
        if (!current.locations.includes(adjustment.location)) current.locations.push(adjustment.location);
      } else {
        grouped.set(key, {
          pieceId: adjustment.pieceId,
          netQuantity: adjustment.quantity,
          locations: [adjustment.location],
          records: [adjustment],
        });
      }
    }
    const term = query.trim().toLowerCase();
    return [...grouped.values()].filter(group =>
      `${group.pieceId} ${group.locations.join(" ")}`.toLowerCase().includes(term)
    );
  }, [adjustments, query]);

  const totalIn = adjustments.filter(item => item.quantity > 0).reduce((sum, item) => sum + item.quantity, 0);
  const totalOut = Math.abs(adjustments.filter(item => item.quantity < 0).reduce((sum, item) => sum + item.quantity, 0));

  async function submitAdjustment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const quantity = Number(form.quantity);
    if (!form.pieceId.trim() || !form.location.trim() || !form.memo.trim() || !Number.isInteger(quantity) || quantity === 0) {
      setError("Complete every field. Quantity must be a non-zero whole number.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pieceId: form.pieceId.toUpperCase(), quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save adjustment.");
      setAdjustments(current => [data.adjustment, ...current]);
      setForm(emptyForm);
      setNotice("Adjustment saved and grouped automatically.");
      window.setTimeout(() => setNotice(""), 2800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save adjustment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark">A</span><div><strong>AdjustLog</strong><small>Parts adjustment register</small></div></div>
        <div className="header-actions"><span className="status"><i /> Database connected</span><button className="theme-toggle" onClick={() => setDark(value => !value)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}><span>{dark ? "☀" : "☾"}</span>{dark ? "Light" : "Dark"}</button></div>
      </header>

      <section className="intro">
        <div><p className="eyebrow">INVENTORY CONTROL</p><h1>Parts adjustments</h1><p>Record every correction and keep movements for the same part neatly stacked together.</p></div>
      </section>

      <section className="metrics" aria-label="Adjustment overview">
        <article><span>Total records</span><strong>{adjustments.length}</strong></article>
        <article><span>Unique parts</span><strong>{new Set(adjustments.map(item => item.pieceId.toUpperCase())).size}</strong></article>
        <article><span>Pieces added</span><strong className="positive">+{totalIn}</strong></article>
        <article><span>Pieces removed</span><strong className="negative">-{totalOut}</strong></article>
      </section>

      <div className="workspace">
        <section className="panel form-panel">
          <div className="panel-heading"><span>01</span><div><h2>New adjustment</h2><p>Positive adds stock. Negative removes stock.</p></div></div>
          <form onSubmit={submitAdjustment}>
            <label><span>Part number</span><input value={form.pieceId} onChange={event => setForm(current => ({ ...current, pieceId: event.target.value }))} placeholder="e.g. PT-2048" autoComplete="off" /></label>
            <div className="field-row">
              <label><span>Location</span><input value={form.location} onChange={event => setForm(current => ({ ...current, location: event.target.value }))} placeholder="e.g. A-12-04" autoComplete="off" /></label>
              <label><span>Quantity</span><input type="number" step="1" value={form.quantity} onChange={event => setForm(current => ({ ...current, quantity: event.target.value }))} placeholder="e.g. -4 or 12" /></label>
            </div>
            <label><span>Adjustment memo</span><textarea rows={4} value={form.memo} onChange={event => setForm(current => ({ ...current, memo: event.target.value }))} placeholder="Explain why this adjustment was made..." /></label>
            {error && <p className="error-message" role="alert">{error}</p>}
            <button className="primary" disabled={saving}>{saving ? "Saving..." : "Save adjustment"}<b>→</b></button>
          </form>
        </section>

        <section className="panel history-panel">
          <div className="panel-heading history-heading"><span>02</span><div><h2>Adjustment history</h2><p>Automatically grouped by part number.</p></div></div>
          <label className="search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search part or location..." /></label>

          <div className="accordion-list">
            {loading ? <div className="empty-state">Loading adjustments...</div> : groups.length === 0 ? <div className="empty-state"><strong>No adjustments found</strong><span>{query ? "Try a different search." : "Your first adjustment will appear here."}</span></div> : groups.map((group, index) => (
              <details className="part-group" key={group.pieceId} open={index === 0}>
                <summary>
                  <span className="part-avatar">{group.pieceId.slice(0, 2)}</span>
                  <span className="part-title"><strong>{group.pieceId}</strong><small>{group.locations.join(", ")}</small></span>
                  <span className="record-count">{group.records.length} {group.records.length === 1 ? "record" : "records"}</span>
                  <span className={`net-total ${group.netQuantity >= 0 ? "positive" : "negative"}`}>{group.netQuantity > 0 ? "+" : ""}{group.netQuantity}</span>
                  <span className="chevron">⌄</span>
                </summary>
                <div className="records">
                  {group.records.map(record => (
                    <article className="record" key={record.id}>
                      <span className={`quantity-badge ${record.quantity > 0 ? "positive" : "negative"}`}>{record.quantity > 0 ? "+" : ""}{record.quantity}</span>
                      <div className="record-copy"><strong>{record.memo}</strong><span>{record.location} · {new Date(record.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                    </article>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
      {notice && <div className="toast" role="status">✓ {notice}</div>}
    </main>
  );
}
