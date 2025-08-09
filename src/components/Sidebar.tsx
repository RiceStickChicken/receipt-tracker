
export interface NavItem {
  label: string
  key: string
}

interface SidebarProps {
  items: NavItem[]
  active: string
  onSelect: (key: string) => void
}

export function Sidebar({ items, active, onSelect }: SidebarProps) {
  return (
    <aside
      className="sidebar fixed top-0 left-0 flex flex-col"
      style={{ margin: '1.5rem', height: 'calc(100vh - 3rem)' }}
    >
      <div className="text-sm font-semibold tracking-wide opacity-90 mb-2">Receipt Tracker</div>
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(item => (
          <button
            key={item.key}
            aria-current={active === item.key ? 'page' : undefined}
            onClick={() => onSelect(item.key)}
            className="nav-item text-left bg-transparent border-0 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
