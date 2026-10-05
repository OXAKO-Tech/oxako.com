import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { PlatformLinkCard } from '@/components/platform-link-card'
import { platformLinks, type PlatformLink } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Links',
  description: 'Official OXAKO links for listening, following, and getting in touch.',
}

const groups: PlatformLink['group'][] = ['Listen', 'Watch and follow', 'Connect']

export default function LinksPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Find OXAKO"
        description="Listen, watch, and connect."
        aside="More places to explore."
      />
      {groups.map((group) => {
        const groupLinks = platformLinks.filter((link) => link.group === group)
        if (groupLinks.length === 0) return null
        const id = `group-${group.toLowerCase().replace(/\s+/g, '-')}`
        return (
          <section key={group} aria-labelledby={id} className="flex flex-col gap-4">
            <h2 id={id} className="text-sm font-medium text-primary">
              {group}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {groupLinks.map((link) => (
                <li key={link.label}>
                  <PlatformLinkCard link={link} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
