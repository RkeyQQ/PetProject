export default function Table({ columns, rows, keyField }) {
  return (
    <div style={{overflowX:'auto', border:'1px solid #eee', borderRadius:12}}>
      <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}
                  style={{textAlign:'left', padding:'10px 12px', background:'#fafafa', borderBottom:'1px solid #eee'}}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row[keyField]}>
              {columns.map(col => (
                <td key={col.key}
                    style={{padding:'10px 12px', borderBottom:'1px solid #f1f1f1', fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={columns.length} style={{padding:16, color:'#777'}}>Нет данных</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
