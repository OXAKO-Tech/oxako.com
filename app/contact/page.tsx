import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'
import { PageHeader } from '@/components/page-header'
import { CONTACT_EMAIL } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact OXAKO for collaborations, production, licensing, and creative projects.',
}

const topics = [
  { title: 'Collaborations', text: 'Artists, bands, and creators looking to work together.' },
  { title: 'Production', text: 'Beats, full production, mixing, and sound design.' },
  { title: 'Licensing', text: 'Music for film, games, ads, and other media.' },
  { title: 'Creative projects', text: 'Installations, visuals, and anything experimental.' },
]

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Contact"
        description="For collaborations, production, licensing, and creative projects."
        aside="Send a message."
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-primary">Email</h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-pixel text-sm leading-relaxed text-foreground underline-offset-4 hover:text-primary hover:underline sm:text-base"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-primary">What I can help with</h2>
            <ul className="flex flex-col">
              {topics.map((topic) => (
                <li key={topic.title} className="flex flex-col gap-1 border-b border-border py-3">
                  <span className="font-medium text-foreground">{topic.title}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {topic.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  )
}
