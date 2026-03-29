import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

const tabs = [
  { to: '/', labelKey: 'tabs.home', icon: '🏠', end: true },
  { to: '/tree', labelKey: 'tabs.skillTree', icon: '🌳', end: false },
  { to: '/profile', labelKey: 'tabs.profile', icon: '👤', end: false },
] as const

export function TabBar() {
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 inset-x-0 h-14 bg-white flex items-stretch justify-around z-40 lg:hidden" style={{ boxShadow: '0 -4px 8px rgba(79, 70, 229, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.8)', borderTop: '2px solid rgba(0, 0, 0, 0.05)' }}>
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            [
              'flex flex-col items-center pt-2 pb-1 flex-1',
              'border-t-2',
              isActive
                ? 'border-[var(--clay-primary)]'
                : 'border-transparent opacity-50',
            ].join(' ')
          }
        >
          <span className="text-2xl">{tab.icon}</span>
          <span className="text-[10px] font-normal">{t(tab.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
