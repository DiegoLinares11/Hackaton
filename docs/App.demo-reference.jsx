import { useState, useCallback } from "react";

const CRITERIA = {
  snapshot: {
    label: "Snapshot",
    icon: "◈",
    fields: {
      product_description: { label: "Descripción del producto", q: "¿Qué hace y cómo funciona?" },
      target_sdgs: { label: "SDGs objetivo", q: "¿Qué ODS impacta?" },
      suggested_price: { label: "Precio sugerido", q: "¿Cuál es el precio al usuario?" },
      target_users: { label: "Usuarios objetivo", q: "¿Para quién es?" },
      competitive_landscape: { label: "Panorama competitivo", q: "¿Qué competidores existen?" },
      countries_regions: { label: "Países / regiones", q: "¿Dónde opera?" },
    },
  },
  manufacturing_delivery: {
    label: "Manufacturing & Delivery",
    icon: "⬡",
    fields: {
      manufacturing_method: { label: "Método de manufactura", q: "¿Cómo se produce?" },
      intellectual_property: { label: "Propiedad intelectual", q: "¿Qué tipo de IP tiene?" },
      user_provision_model: { label: "Modelo de provisión", q: "¿Cómo llega al usuario?" },
      distributions_to_date: { label: "Distribución a la fecha", q: "¿Cuántas unidades desplegadas?" },
    },
  },
  performance_use: {
    label: "Performance & Use",
    icon: "◉",
    fields: {
      design_specifications: { label: "Especificaciones de diseño", q: "¿Detalles técnicos?" },
      performance_parameters: { label: "Parámetros de rendimiento", q: "¿Métricas medibles?" },
      technical_support: { label: "Soporte técnico", q: "¿Mantenimiento y capacitación?" },
      replacement_components: { label: "Componentes de reemplazo", q: "¿Qué repuestos necesita?" },
      lifecycle: { label: "Ciclo de vida", q: "¿Cuánto dura?" },
      safety: { label: "Seguridad", q: "¿Riesgos conocidos?" },
    },
  },
  research_standards: {
    label: "Research & Standards",
    icon: "◇",
    fields: {
      academic_references: { label: "Referencias académicas", q: "¿Qué estudios lo respaldan?" },
      regulatory_compliance: { label: "Cumplimiento regulatorio", q: "¿Qué normas cumple?" },
      evaluation_methods: { label: "Métodos de evaluación", q: "¿Cómo se midió el rendimiento?" },
    },
  },
};

const SECTION_COLORS = {
  snapshot: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", accent: "#10b981" },
  manufacturing_delivery: { bg: "#f0edfe", border: "#c4b5fd", text: "#3b0764", accent: "#8b5cf6" },
  performance_use: { bg: "#fff3ed", border: "#fed7aa", text: "#7c2d12", accent: "#f97316" },
  research_standards: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a5f", accent: "#3b82f6" },
};

const STATUS = {
  complete: { color: "#10b981", bg: "#d1fae5", text: "#065f46", label: "Completo" },
  partial: { color: "#f59e0b", bg: "#fef3c7", text: "#92400e", label: "Parcial" },
  missing: { color: "#ef4444", bg: "#fee2e2", text: "#991b1b", label: "Faltante" },
};

const SYSTEM_PROMPT = `You are an E4C Solutions Library readiness assessment assistant.
Evaluate technology documentation against E4C's standardized taxonomy (19 fields).

RULES:
- ADVISORY ONLY. Never say "approved" or "rejected".
- Classify each field as: "complete", "partial", or "missing".
- Be specific about what evidence you found or didn't find.
- Give actionable feedback for partial/missing fields.
- Respond ONLY in valid JSON, no markdown, no preamble.`;

function buildPrompt(text) {
  const fields = [];
  for (const [, section] of Object.entries(CRITERIA)) {
    for (const [key, field] of Object.entries(section.fields)) {
      fields.push(`- ${key}: ${field.q}`);
    }
  }
  return `Analyze this technology documentation against E4C Solutions Library criteria.

For EACH field, return: "status" (complete|partial|missing), "evidence" (what you found), "feedback" (actionable suggestion).

Fields:
${fields.join("\n")}

DOCUMENT:
---
${text.slice(0, 6000)}
---

Return ONLY a JSON object like: {"product_description": {"status": "complete", "evidence": "...", "feedback": "..."}, ...}`;
}

async function assessWithClaude(text) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(text) }],
    }),
  });
  const data = await res.json();
  let raw = data.content?.[0]?.text || "{}";
  raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(raw);
}

function buildReport(assessment) {
  const sections = {};
  let totalScore = 0, maxScore = 0, complete = 0, partial = 0, missing = 0;

  for (const [sKey, section] of Object.entries(CRITERIA)) {
    const sFields = [];
    for (const [fKey, fInfo] of Object.entries(section.fields)) {
      const r = assessment[fKey] || { status: "missing", evidence: "No evaluado", feedback: "" };
      const w = 1;
      const s = r.status === "complete" ? 1 : r.status === "partial" ? 0.5 : 0;
      totalScore += s * w;
      maxScore += w;
      if (r.status === "complete") complete++;
      else if (r.status === "partial") partial++;
      else missing++;
      sFields.push({ key: fKey, ...fInfo, ...r });
    }
    sections[sKey] = { ...section, fieldResults: sFields,
      complete: sFields.filter(f => f.status === "complete").length,
      partial: sFields.filter(f => f.status === "partial").length,
      missing: sFields.filter(f => f.status === "missing").length,
    };
  }

  return {
    score: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    complete, partial, missing, total: complete + partial + missing,
    sections,
  };
}

function ScoreRing({ score }) {
  const r = 52, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{score}%</span>
        <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>readiness</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.missing;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
      borderRadius: 99, fontSize: 12, fontWeight: 600, background: s.bg, color: s.text }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

function SectionPanel({ sKey, section, open, toggle }) {
  const c = SECTION_COLORS[sKey];
  return (
    <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={toggle} style={{ width: "100%", padding: "14px 18px", background: c.bg,
        display: "flex", alignItems: "center", justifyContent: "space-between", border: "none",
        cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, color: c.accent }}>{section.icon}</span>
          <div>
            <div style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>{section.label}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {section.complete > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>{section.complete}</span>}
          {section.partial > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#fef3c7", color: "#92400e" }}>{section.partial}</span>}
          {section.missing > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: "#991b1b" }}>{section.missing}</span>}
          <span style={{ fontSize: 18, color: "#9ca3af", transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </button>
      {open && (
        <div>
          {section.fieldResults.map((f, i) => (
            <div key={f.key} style={{ padding: "14px 18px", borderTop: i === 0 ? `1px solid ${c.border}` : "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#1f2937" }}>{f.label}</span>
                <StatusBadge status={f.status} />
              </div>
              {f.evidence && <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0" }}><b>Evidencia:</b> {f.evidence}</p>}
              {f.status !== "complete" && f.feedback && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}><b>Sugerencia:</b> {f.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SAMPLE_TEXT = `Product: AquaPure Solar Water Filter

AquaPure is a solar-powered water purification system designed for rural communities in Sub-Saharan Africa. The system uses UV-C LED technology combined with ceramic filtration to remove 99.9% of bacteria and 99% of viruses from contaminated water sources.

Target SDGs: SDG 6 (Clean Water and Sanitation), SDG 3 (Good Health and Well-Being).

Price: $45 USD per unit (approximately 25,000 KES in Kenya).

Target Users: Rural households and small community centers with limited access to clean drinking water.

The system has been deployed in Kenya, Tanzania, and Uganda, with 2,500 units distributed as of March 2024.

Design: The filter consists of a 5-liter transparent PET container with an integrated UV-C LED module powered by a 2W solar panel. Flow rate is approximately 1.5 liters per hour. Dimensions: 30cm x 20cm x 15cm.

The ceramic filter element needs replacement every 12 months. The UV-C LED module has a rated lifetime of 10,000 hours. Overall product lifecycle is estimated at 5 years.

Safety: No known safety hazards. The UV-C LEDs are enclosed and do not expose users to radiation.

Manufacturing: Units are assembled in Nairobi, Kenya using locally sourced ceramic elements and imported UV-C LED modules.

IP: Patent pending (application #KE2023/001234).`;

export default function App() {
  const [screen, setScreen] = useState("upload");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const handleAssess = useCallback(async (input) => {
    const t = input || text;
    if (t.trim().length < 50) return;
    setLoading(true);
    setError(null);
    try {
      const assessment = await assessWithClaude(t);
      setReport(buildReport(assessment));
      setScreen("results");
    } catch (e) {
      setError("Error al analizar: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleFile = useCallback(async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setText(content);
      handleAssess(content);
    };
    reader.readAsText(file);
  }, [handleAssess]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const toggleAll = () => {
    const allKeys = Object.keys(CRITERIA);
    const allOpen = allKeys.every(k => expanded[k]);
    const next = {};
    allKeys.forEach(k => { next[k] = !allOpen; });
    setExpanded(next);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #d1fae5", borderTopColor: "#10b981",
            borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 600, color: "#374151", fontSize: 15 }}>Analizando documentación...</p>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>Evaluando 19 criterios del framework E4C</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "10px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 800, color: "#059669", fontSize: 17 }}>E4C</span>
          <span style={{ color: "#9ca3af", fontSize: 13 }}>Readiness Review</span>
        </div>
        <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "#ecfdf5", color: "#065f46", fontWeight: 600 }}>
          Track 2: Check My Tech
        </span>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "#991b1b", margin: 0 }}>{error}</p>
          </div>
        )}

        {screen === "upload" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Check My Tech</h1>
              <p style={{ color: "#6b7280", fontSize: 14 }}>Evalúa tu documentación contra el framework del E4C Solutions Library</p>
            </div>

            {/* File drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fup").click()}
              style={{ border: `2px dashed ${dragOver ? "#10b981" : "#d1d5db"}`, borderRadius: 14,
                padding: "40px 20px", textAlign: "center", cursor: "pointer", marginBottom: 20,
                background: dragOver ? "#ecfdf5" : "#fff", transition: "all .2s" }}
            >
              <input id="fup" type="file" accept=".txt,.md" style={{ display: "none" }}
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4, fontSize: 14 }}>Arrastra tu documento o haz click</p>
              <p style={{ color: "#9ca3af", fontSize: 12 }}>Archivo TXT o MD</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>o pega tu texto</span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>

            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Pega aquí la documentación de tu tecnología..."
                rows={8} style={{ width: "100%", padding: "14px 16px", border: "none", resize: "vertical",
                  fontSize: 13, lineHeight: 1.6, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ padding: "10px 16px", background: "#f9fafb", borderTop: "1px solid #f3f4f6",
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{text.length} caracteres</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setText(SAMPLE_TEXT); }}
                    style={{ padding: "7px 14px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 8,
                      background: "#fff", cursor: "pointer", color: "#6b7280" }}>
                    Cargar ejemplo
                  </button>
                  <button onClick={() => handleAssess()}
                    disabled={text.trim().length < 50}
                    style={{ padding: "7px 18px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 8,
                      background: text.trim().length >= 50 ? "#059669" : "#d1d5db",
                      color: "#fff", cursor: text.trim().length >= 50 ? "pointer" : "not-allowed" }}>
                    Evaluar
                  </button>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>
              Solo advisory — no determina aceptación o rechazo en el Solutions Library.
            </p>
          </>
        )}

        {screen === "results" && report && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Readiness Snapshot</h1>
              <button onClick={() => { setScreen("upload"); setReport(null); setText(""); }}
                style={{ padding: "7px 16px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 8,
                  background: "#fff", cursor: "pointer", color: "#374151" }}>
                Nueva evaluación
              </button>
            </div>

            {/* Score card */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20,
              display: "flex", alignItems: "center", gap: 32 }}>
              <ScoreRing score={report.score} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Completitud de documentación</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#ecfdf5", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#059669" }}>{report.complete}</div>
                    <div style={{ fontSize: 11, color: "#065f46" }}>Completos</div>
                  </div>
                  <div style={{ background: "#fffbeb", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#d97706" }}>{report.partial}</div>
                    <div style={{ fontSize: 11, color: "#92400e" }}>Parciales</div>
                  </div>
                  <div style={{ background: "#fef2f2", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>{report.missing}</div>
                    <div style={{ fontSize: 11, color: "#991b1b" }}>Faltantes</div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>{report.total} campos evaluados</p>
              </div>
            </div>

            {/* Sections */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>Detalle por sección</h2>
              <button onClick={toggleAll} style={{ fontSize: 12, color: "#059669", background: "none",
                border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Expandir todas
              </button>
            </div>

            {Object.entries(report.sections).map(([sKey, section]) => (
              <SectionPanel key={sKey} sKey={sKey} section={section}
                open={!!expanded[sKey]}
                toggle={() => setExpanded(prev => ({ ...prev, [sKey]: !prev[sKey] }))} />
            ))}

            {/* Priority actions */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, marginTop: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 14 }}>Próximos pasos prioritarios</h2>
              {Object.values(report.sections)
                .flatMap(s => s.fieldResults)
                .filter(f => f.status === "missing")
                .slice(0, 4)
                .map((f, i) => (
                  <div key={f.key} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "#fee2e2",
                      color: "#991b1b", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center",
                      justifyContent: "center" }}>{i + 1}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", margin: "0 0 2px" }}>{f.label}</p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{f.feedback}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", marginTop: 16 }}>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                <b>Aviso:</b> Esta evaluación es solo advisory. No determina aceptación o rechazo para el E4C Solutions Library.
                Los puntajes reflejan completitud de documentación, no validez técnica. La revisión final la realizan los
                revisores expertos de E4C.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
