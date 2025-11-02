// Utility functions for CSV export

export function generateCSV(data: any[], headers: string[]): string {
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(','))

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma or quote
      const escaped = String(value || '').replace(/"/g, '""')
      return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('hidden', '')
  a.setAttribute('href', url)
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
