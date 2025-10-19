import { useEffect, useState } from 'react'
import Table from '../components/Table'

async function fetchJson(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`)
  return res.json()
}

export default function Monitor() {
  const [repos, setRepos] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError(null)
        // ожидаем, что backend отдаёт REST:
        //  GET /api/repos -> [{repo_id, host, name, rtype, path, capacity_gb, free_gb, used_gb, is_online, is_out_of_date, created_at}, ...]
        //  GET /api/jobs  -> [{job_id, host, name, jtype, is_running, progress, last_run, next_run, created_at}, ...]
        const [reposData, jobsData] = await Promise.all([
          fetchJson('/api/repos'),
          fetchJson('/api/jobs'),
        ])
        setRepos(reposData ?? [])
        setJobs(jobsData ?? [])
      } catch (e) {
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const repoCols = [
    { key: 'repo_id', title: 'repo_id' },
    { key: 'host', title: 'host' },
    { key: 'name', title: 'name' },
    { key: 'rtype', title: 'rtype' },
    { key: 'path', title: 'path' },
    { key: 'capacity_gb', title: 'capacity_gb' },
    { key: 'free_gb', title: 'free_gb' },
    { key: 'used_gb', title: 'used_gb' },
    { key: 'is_online', title: 'is_online' },
    { key: 'is_out_of_date', title: 'is_out_of_date' },
    { key: 'created_at', title: 'created_at' },
  ]

  const jobCols = [
    { key: 'job_id', title: 'job_id' },
    { key: 'host', title: 'host' },
    { key: 'name', title: 'name' },
    { key: 'jtype', title: 'jtype' },
    { key: 'is_running', title: 'is_running' },
    { key: 'progress', title: 'progress' },
    { key: 'last_run', title: 'last_run' },
    { key: 'next_run', title: 'next_run' },
    { key: 'created_at', title: 'created_at' },
  ]

  return (
    <section>
      <h2 style={{marginTop:0}}>Мониторинг</h2>
      <p style={{color:'#666', marginTop:0}}>Вывод двух таблиц из backend</p>

      {loading && <p>Загрузка…</p>}
      {error && <div style={{background:'#fee', border:'1px solid #fcc', padding:12, borderRadius:8}}>Ошибка: {error}</div>}

      {!loading && !error && (
        <>
          <h3 style={{marginTop:20, marginBottom:8}}>Репозитории</h3>
          <Table columns={repoCols} rows={repos} keyField="repo_id" />

          <h3 style={{marginTop:24, marginBottom:8}}>Джобы</h3>
          <Table columns={jobCols} rows={jobs} keyField="job_id" />
        </>
      )}
    </section>
  )
}
