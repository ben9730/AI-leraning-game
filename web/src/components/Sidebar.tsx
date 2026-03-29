import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { chapters } from '@/content'
import { useProgressStore } from '@/store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'

const navItems = [
  { to: '/', labelKey: 'tabs.home', icon: '🏠', end: true },
  { to: '/tree', labelKey: 'tabs.skillTree', icon: '🌳', end: false },
  { to: '/profile', labelKey: 'tabs.profile', icon: '👤', end: false },
] as const

export function Sidebar() {
  const { t } = useTranslation()
  const { currentLanguage } = useLanguage()
  const completedLessons = useProgressStore(s => s.completedLessons)

  return (
    <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col bg-[var(--clay-bg)] border-e-2 border-gray-200/50 z-40">
      {/* Brand */}
      <div className="p-4 border-b-2 border-gray-200/50">
        <span className="text-xl font-bold text-[var(--clay-primary)]">PromptPlay</span>
      </div>

      {/* Main navigation */}
      <nav aria-label="Main navigation" className="flex-1 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-4 py-3 text-sm',
                'border-s-2',
                isActive
                  ? 'border-[var(--clay-primary)] text-[var(--clay-primary)] font-bold bg-white/60'
                  : 'border-transparent opacity-60 hover:opacity-80',
              ].join(' ')
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* Skill tree mini-map */}
      <div className="border-t-2 border-gray-200/50 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
          {t('tabs.skillTree')}
        </p>
        <ul className="space-y-1.5">
          {chapters.map(chapter => {
            const allCompleted =
              chapter.lessonIds.length > 0 &&
              chapter.lessonIds.every(id => completedLessons.includes(id))
            return (
              <li key={chapter.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span
                  className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
                    allCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className="truncate">{chapter.title[currentLanguage]}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
