'use client'

import { useState } from 'react'
import { CONTACT_EMAIL } from '@/lib/site-data'
import { pixelButtonClass } from '@/components/pixel-button'

const subjects = ['Collaboration', 'Production', 'Licensing', 'Creative project', 'Other']

const fieldClass =
  'w-full border-2 border-border bg-background/70 px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

export function ContactForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const topic = String(data.get('topic') ?? '')
    const message = String(data.get('message') ?? '').trim()
    const subject = `${topic} inquiry${name ? ` from ${name}` : ''}`
    const body = `${message}\n\n— ${name}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <div className="facet bg-border p-px">
      <form
        onSubmit={handleSubmit}
        className="facet-inner flex flex-col gap-5 bg-card p-5 sm:p-8"
      >
        <h2 className="font-pixel text-sm text-foreground">Write a message</h2>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Your name
          </label>
          <input id="name" name="name" required autoComplete="name" className={fieldClass} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="topic" className="text-sm font-medium text-foreground">
            Topic
          </label>
          <select id="topic" name="topic" defaultValue={subjects[0]} className={fieldClass}>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-medium text-foreground">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Tell me about your project, timeline, and budget."
            className={`${fieldClass} resize-y leading-relaxed`}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" className={pixelButtonClass('primary', 'self-start')}>
            Send Message
          </button>
          <p className="text-sm text-muted-foreground" role="status">
            {sent
              ? 'Your email app should now be open with the message ready.'
              : 'Opens your email app with the message filled in.'}
          </p>
        </div>
      </form>
    </div>
  )
}
