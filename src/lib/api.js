export const API_BASE = import.meta.env.VITE_API_BASE;

export async function apiFetch(path, { method = "GET", token, body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { }

    if (!res.ok) {
        const err = new Error(data?.error || `HTTP ${res.status}`);
        err.meta = data?.meta;
        throw err;
    }

    return data;
}
