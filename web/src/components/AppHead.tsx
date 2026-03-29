import { Helmet } from 'react-helmet-async'

interface AppHeadProps {
  title?: string
  description?: string
}

export function AppHead({ title, description }: AppHeadProps) {
  const fullTitle = title ? `${title} — PromptPlay` : 'PromptPlay — Learn AI Prompting'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
    </Helmet>
  )
}
