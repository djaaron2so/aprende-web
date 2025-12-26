import { useState } from "react";
import { apiFetch, API_BASE } from "./lib/api";

export default function App() {
    const [token, setToken] = useState("demo-user-1");
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(false);

    const [beat, setBeat] = useState(null); // { id, fileUrl, usage }
    const [error, setError] = useState(null);

    async function checkHealth() {
        setError(null);
        setLoading(true);
        try {
            const data = await apiFetch("/health");
            setHealth(data);
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setLoading(false);
        }
    }

    async function generateBeat() {
        setError(null);
        setLoading(true);
        setBeat(null);

        try {
            const data = await apiFetch("/api/generate-beat", {
                method: "POST",
                token,
                body: {},
            });
            setBeat(data);
        } catch (e) {
            const meta = e?.meta || e?.data?.meta || null;
            const rToday = meta?.remaining_beats_today;
            const rMonth = meta?.remaining_beats_this_month;

            const extra =
                (rToday != null || rMonth != null)
                    ? ` (Remaining today: ${rToday ?? "∞"}, month: ${rMonth ?? "∞"})`
                    : "";

            setError(`${e.message}${extra}`);
        } finally {
            setLoading(false);
        }
    }

    const beatId = beat?.id || null;
    const wavUrl = beatId ? `${API_BASE}${beat.fileUrl}` : null;
    const mp3Url = beatId ? `${API_BASE}/api/beats/${beatId}.mp3` : null;

    return (
        <div style={{ maxWidth: 920, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
            <h1 style={{ margin: 0 }}>Aprende</h1>
            <p style={{ marginTop: 6, opacity: 0.75 }}>
                API: <code>{API_BASE}</code>
            </p>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Bearer token"
                    style={{ padding: 10, width: 260, borderRadius: 10, border: "1px solid #ddd" }}
                />

                <button onClick={checkHealth} disabled={loading} style={btn}>
                    {loading ? "..." : "Check health"}
                </button>

                <button onClick={generateBeat} disabled={loading} style={btn}>
                    {loading ? "Generando..." : "Generar beat"}
                </button>
            </div>

            {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}

            {health && (
                <pre style={box}>{JSON.stringify(health, null, 2)}</pre>
            )}

            {beat && (
                <div style={box}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontWeight: 800 }}>Beat listo</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                                ID: <code>{beatId}</code>
                            </div>
                        </div>

                        {beat?.usage && (
                            <div style={{ fontSize: 12, opacity: 0.8 }}>
                                <div>Hoy: {beat.usage.beats_generated_today} / {beat.usage.max_beats_daily ?? "∞"} (resta {beat.usage.remaining_beats_today ?? "∞"})</div>
                                <div>Mes: {beat.usage.beats_generated_this_month} / {beat.usage.max_beats_monthly ?? "∞"} (resta {beat.usage.remaining_beats_this_month ?? "∞"})</div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                        <a href={wavUrl} target="_blank" rel="noreferrer" style={linkBtn}>Abrir WAV</a>
                        <a href={wavUrl} download style={linkBtn}>Descargar WAV</a>
                        <a href={mp3Url} target="_blank" rel="noreferrer" style={linkBtn}>MP3 (PRO)</a>
                    </div>

                    <audio controls style={{ width: "100%", marginTop: 12 }}>
                        <source src={wavUrl} type="audio/wav" />
                    </audio>
                </div>
            )}
        </div>
    );
}

const btn = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    fontWeight: 800,
    background: "white",
};

const box = {
    marginTop: 14,
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 12,
};

const linkBtn = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    textDecoration: "none",
    fontWeight: 800,
    color: "black",
};
