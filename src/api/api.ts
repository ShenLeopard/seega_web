// src/api/api.ts

function get_env(env: string): boolean {
    // 判斷標題是否包含指定環境關鍵字
    return document.title.toLowerCase().includes(env);
}

function apiUrl(): string {
    if (get_env("local")) {
        return import.meta.env.VITE_API_LOCAL;
    } else if (get_env("dev")) {
        return import.meta.env.VITE_API_DEV;
    } else if (get_env("uat")) {
        return import.meta.env.VITE_API_UAT;
    } else if (get_env("prod")) {
        return import.meta.env.VITE_API_PROD;
    }
    // 預設回傳 local
    return import.meta.env.VITE_API_LOCAL || "";
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