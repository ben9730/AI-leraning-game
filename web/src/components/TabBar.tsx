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
    <nav className="fixed bottom-0 inset-x-0 h-14 bg-white border-t border-gray-200 flex items-stretch justify-around z-40 lg:hidden">
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
                ? 'border-indigo-600'
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
