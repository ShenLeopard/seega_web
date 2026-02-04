function apiUrl(): string {
    // Vite 自動判斷是否為正式環境 (npm run build)
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_PROD || "";
    }
    // 開發環境 (npm run dev)
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
};
