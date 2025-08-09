import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { PageShell } from './components/PageShell'
import { Modal } from './components/Modal'
import { StatCard } from './components/StatCard'
import { AnalyticsPage } from './components/AnalyticsPage'
import { AddReceiptForm } from './components/AddReceiptForm'
import { useReceipts } from './context/ReceiptsContext.tsx'

const navItems = [
  { label: 'Home', key: 'home' },
  { label: 'Receipts', key: 'receipts' },
  { label: 'Analytics', key: 'analytics' },
]

const actionBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--color-surface-border)',
  padding: '.25rem .5rem',
  fontSize: 'var(--fs-xs)',
  lineHeight: 1.2,
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  transition: 'background .15s ease, color .15s ease'
}

function HomePage() {
  const { receipts } = useReceipts()
  const now = new Date()
  const monthKey = now.toISOString().slice(0, 7) // YYYY-MM

  const totalReceipts = receipts.length
  const totalCentsAll = receipts.reduce((s, r) => s + r.totalCents, 0)
  const monthlyReceipts = receipts.filter(r => r.date.startsWith(monthKey))
  const monthlySpendCents = monthlyReceipts.reduce((s, r) => s + r.totalCents, 0)
  const averageReceiptCents = totalReceipts ? Math.round(totalCentsAll / totalReceipts) : 0

  const formatCents = (c: number) => `$${(c / 100).toFixed(2)}`

  // Recent receipts (latest 5 by date then createdAt)
  const recent = [...receipts]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))' }}>
        <StatCard label="Total Receipts" value={totalReceipts} />
        <StatCard label="Monthly Spend" value={formatCents(monthlySpendCents)} />
        <StatCard label="Average Receipt" value={formatCents(averageReceiptCents)} />
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Receipts</h2>
        {recent.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No receipts yet. Start by adding your first one.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 'var(--fs-sm)' }}>
            {recent.map(r => (
              <li key={r.id} style={{ display: 'flex', gap: '1rem', padding: '.4rem 0', borderTop: '1px solid var(--color-surface-border)' }}>
                <span style={{ minWidth: 82, fontVariantNumeric: 'tabular-nums' }}>{r.date}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.merchant}</span>
                <span style={{ minWidth: 90, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCents(r.totalCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ReceiptsPage({ onView, onRequestBulkDelete }: { onView: (id: string)=>void; onRequestBulkDelete: (ids: string[])=>void }) {
  const { receipts } = useReceipts()
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const sorted = [...receipts].sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set())
    else setSelected(new Set(sorted.map(r=>r.id)))
  }
  const toggleOne = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const clearSelection = () => { setSelected(new Set()); setSelectMode(false) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Receipts</h2>
        {sorted.length > 0 && (
          <button style={actionBtnStyle} onClick={() => { if (selectMode) { clearSelection() } else setSelectMode(true) }}>
            {selectMode ? 'Exit Select' : 'Select'}
          </button>
        )}
      </div>
      <div className="card" style={{ paddingTop: '1rem' }}>
        {sorted.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No receipts stored. Use the Add Receipt button to create one.</div>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: '50vh', position: 'relative' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 'var(--fs-xs)', color: 'var(--color-text-secondary)' }}>
                  {selectMode && (
                    <th style={{ padding: '0 0 .5rem', width: 32 }}>
                      <input type="checkbox" aria-label="Select all" checked={selected.size === sorted.length} onChange={toggleAll} />
                    </th>
                  )}
                  <th style={{ padding: '0 .5rem .5rem' }}>Date</th>
                  <th style={{ padding: '0 .5rem .5rem' }}>Merchant</th>
                  <th style={{ padding: '0 .5rem .5rem' }}>Category</th>
                  <th style={{ padding: '0 .5rem .5rem' }}>Total</th>
                  <th className="actions-col" style={{ padding: '0 .5rem .5rem' }} aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody className="receipts-table">
                {sorted.map(r => (
                  <ReceiptRow
                    key={r.id}
                    receipt={r}
                    onView={onView}
                    selectMode={selectMode}
                    selected={selected.has(r.id)}
                    onToggleSelect={() => toggleOne(r.id)}
                  />
                ))}
              </tbody>
            </table>
            {selectMode && selected.size > 0 && (
              <div className="bulk-toolbar" role="toolbar" aria-label="Bulk actions">
                <span className="count">{selected.size} selected</span>
                <button style={actionBtnStyle} onClick={() => { /* placeholder export */ alert('Export not implemented') }}>Export</button>
                <button style={{ ...actionBtnStyle, color: 'var(--color-error)' }} onClick={() => { onRequestBulkDelete(Array.from(selected)); }}>Delete</button>
                <button style={actionBtnStyle} onClick={clearSelection}>Clear</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ReceiptRow({ receipt, onView, selectMode, selected, onToggleSelect }: {
  receipt: ReturnType<typeof useReceipts>['receipts'][number];
  onView: (id:string)=>void;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <tr
      className={selectMode ? '' : 'clickable-row'}
      style={{ fontSize: 'var(--fs-sm)', borderTop: '1px solid var(--color-surface-border)' }}
      onClick={() => { if (!selectMode) onView(receipt.id); }}
    >
      {selectMode && (
  <td style={{ padding: '.5rem .5rem' }}>
          <input type="checkbox" checked={!!selected} onChange={onToggleSelect} aria-label={`Select receipt ${receipt.merchant}`} />
        </td>
      )}
  <td style={{ padding: '.5rem .5rem', fontVariantNumeric: 'tabular-nums' }}>{receipt.date}</td>
  <td style={{ padding: '.5rem .5rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receipt.merchant}</td>
  <td style={{ padding: '.5rem .5rem' }}>{receipt.category}</td>
  <td style={{ padding: '.5rem .5rem', fontVariantNumeric: 'tabular-nums' }}>${(receipt.totalCents / 100).toFixed(2)}</td>
  <td className="actions-col" style={{ padding: '.5rem .5rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button title="Edit" style={actionBtnStyle} onClick={(e) => { e.stopPropagation(); onView(receipt.id) }}>Edit</button>
        </div>
      </td>
    </tr>
  )
}

function App() {
  const { receipts, deleteReceipt } = useReceipts()
  const [active, setActive] = useState('home')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [deleteIds, setDeleteIds] = useState<string[]>([])

  const openAdd = () => { setShowAddModal(true); }
  const closeAdd = () => setShowAddModal(false)

  const openView = (id: string) => { setViewId(id); setEditing(false) }
  const closeView = () => { setViewId(null); setEditing(false) }

  const requestBulkDelete = (ids: string[]) => { if (ids.length) setDeleteIds(ids) }
  const closeDelete = () => setDeleteIds([])

  const currentReceipt = viewId ? receipts.find(r => r.id === viewId) : null
  const deleteTargets = deleteIds.map(id => receipts.find(r => r.id === id)).filter(Boolean)

  const handleConfirmDelete = () => {
    deleteIds.forEach(id => deleteReceipt(id))
    const deletedSet = new Set(deleteIds)
    if (viewId && deletedSet.has(viewId)) closeView()
    closeDelete()
  }

  return (
    <div className="h-full">
      <Sidebar active={active} onSelect={setActive} items={navItems} />
      <main
        className="min-h-screen"
        style={{
          marginLeft: 'calc(var(--layout-sidebar-width) + 3rem)',
          padding: '2rem',
          paddingTop: '3rem'
        }}
      >
        {active === 'home' && (
          <PageShell title="Home" subtitle="Overview of your recent receipts and spending." onAdd={openAdd}>
            <HomePage />
          </PageShell>
        )}
        {active === 'receipts' && (
          <PageShell title="Receipts" subtitle="Browse and manage every receipt you've added." onAdd={openAdd}>
            <ReceiptsPage onView={openView} onRequestBulkDelete={requestBulkDelete} />
          </PageShell>
        )}
        {active === 'analytics' && (
          <PageShell title="Analytics" subtitle="Visualize trends and spending patterns." onAdd={openAdd} addLabel="Add Receipt">
            <AnalyticsPage />
          </PageShell>
        )}
      </main>
      {/* Add Modal */}
      <Modal open={showAddModal} title="Add Receipt" onClose={closeAdd} footer={null}>
        <AddReceiptForm onSuccess={closeAdd} />
      </Modal>
      {/* View / Edit Modal */}
  <Modal open={!!currentReceipt} title={editing ? 'Edit Receipt' : 'Receipt Details'} onClose={closeView} footer={null}>
        {currentReceipt && !editing && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3" style={{ gridTemplateColumns: '120px 1fr' }}>
              <Field label="Date" value={currentReceipt.date} />
              <Field label="Merchant" value={currentReceipt.merchant} />
              <Field label="Category" value={currentReceipt.category} />
              <Field label="Total" value={`$${(currentReceipt.totalCents/100).toFixed(2)}`} />
              <Field label="Notes" value={currentReceipt.notes || '—'} multiline />
            </div>
            <div className="flex justify-end gap-3 pt-2">
      <button style={actionBtnStyle} onClick={() => setEditing(true)}>Edit</button>
            </div>
          </div>
        )}
        {currentReceipt && editing && (
          <AddReceiptForm
            mode="edit"
            initial={{ ...currentReceipt }}
            onSuccess={() => { closeView() }}
          />
        )}
      </Modal>
      {/* Delete confirmation Modal */}
      <Modal open={deleteIds.length > 0} title={deleteIds.length === 1 ? 'Delete Receipt' : `Delete ${deleteIds.length} Receipts`} onClose={closeDelete} footer={null} centered compact>
        {deleteIds.length > 0 && (
          <div className="space-y-4 text-sm">
            {deleteIds.length === 1 ? (
              <p>Are you sure you want to permanently delete this receipt? This action cannot be undone.</p>
            ) : (
              <p>Are you sure you want to permanently delete these {deleteIds.length} receipts? This action cannot be undone.</p>
            )}
            {deleteTargets.length > 0 && deleteIds.length <= 5 && (
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: 'var(--fs-xs)' }}>
                {deleteTargets.map(r => r && (<li key={r.id}>{r.date} – {r.merchant}</li>))}
              </ul>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button style={actionBtnStyle} onClick={closeDelete}>Cancel</button>
              <button style={{ ...actionBtnStyle, background: 'var(--color-error)', color: '#fff', border: 'none' }} onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div style={{ display: 'contents' }}>
      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 'var(--fs-xs)', letterSpacing: '.5px' }}>{label}</div>
      <div style={{ whiteSpace: multiline ? 'pre-wrap' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  )
}

export default App
