export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_CLIENT_ID,
  CLIENT_SECRET: import.meta.env.VITE_CLIENT_SECRET,
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI,
  SCOPES: import.meta.env.VITE_SCOPE,
}

// 生成随机字符串作为 state 参数
export function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}
