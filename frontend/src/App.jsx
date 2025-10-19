import { Link, Outlet, useLocation } from 'react-router-dom'

export default function App() {
  const { pathname } = useLocation()
  const linkStyle = (active) => ({
    padding: '8px 12px',
    borderRadius: 10,
    textDecoration: 'none',
    color: active ? '#111' : '#222',
    background: active ? '#e7f1ff' : 'transparent',
    border: active ? '1px solid #c9defc' : '1px solid transparent',
  })

  return (
    <div style={{maxWidth: 980, margin: '30px auto', fontFamily: 'ui-sans-serif, system-ui'}}>
      <header style={{display:'flex', alignItems: 'center', gap: 12, marginBottom: 24}}>
        <h1 style={{margin: 0, fontSize: 22}}>Project Monitor</h1>
        <nav style={{display:'flex', gap: 8, marginLeft: 16}}>
          <Link to="/" style={linkStyle(pathname === '/')}>Self Check</Link>
          <Link to="/monitor" style={linkStyle(pathname.startsWith('/monitor'))}>DEMO</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
