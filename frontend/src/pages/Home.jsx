import { useEffect, useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/db/ping')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setInfo(data)
      } catch (e) {
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <section>
      <h2 style={{marginTop:0}}>Self Check</h2>
      <p style={{color:'#666'}}>Backend check → <code>/api/db/ping</code></p>

      {loading && <p>Loading…</p>}
      {error && <div style={{background:'#fee', border:'1px solid #fcc', padding:12, borderRadius:8}}>Error: {error}</div>}

      {info && (
        <div style={{background:'#f7f7f7', border:'1px solid #eee', padding:16, borderRadius:12}}>
          <div><strong>SQLite:</strong> {info.sqlite_version ?? '—'}</div>
          <div style={{marginTop:8}}>
            <strong>Tables:</strong>
            <ul>{(info.tables ?? []).map(t => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  )
}
