import { useEffect, useState } from 'react'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        // благодаря proxy можно писать короткий путь:
        const res = await fetch('/api/db/ping')
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        setInfo(data)
      } catch (e) {
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{maxWidth: 720, margin: '40px auto', fontFamily: 'ui-sans-serif, system-ui'}}>
      <h1 style={{marginBottom: 8}}>MainPage Title</h1>
      <p style={{color: '#666', marginTop: 0}}>Check backend connection→ <code>/api/db/ping</code></p>

      {loading && <p>Loading…</p>}
      {error && (
        <div style={{background:'#fee', border:'1px solid #fcc', padding:12, borderRadius:8}}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {info && (
        <div style={{background:'#f7f7f7', border:'1px solid #eee', padding:16, borderRadius:12}}>
          <div style={{marginBottom:12}}>
            <strong>SQLite:</strong> {info.sqlite_version ?? '—'}
          </div>
          <div>
            <strong>Tables:</strong>
            <ul style={{marginTop:8}}>
              {(info.tables ?? []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
