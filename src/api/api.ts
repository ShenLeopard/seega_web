// src/api/api.ts

function get_env(env: string): boolean {
    // 判斷標題是否包含指定環境關鍵字
    return document.title.toLowerCase().includes(env);
}

function apiUrl(): string {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_PROD || "";
    }
    // 如果是開發環境 (npm run dev)
    return import.meta.env.VITE_API_LOCAL;
}

// 簡單的 Fetch 封裝
export default {
    async post<T>(url: string, data: any): Promise<T> {
        const base = apiUrl();
        const response = await fetch(`${base}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
};