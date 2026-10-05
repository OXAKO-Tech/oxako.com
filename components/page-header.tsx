export function PageHeader({
  title,
  description,
  aside,
}: {
  title: string
  description: string
  aside?: string
}) {
  return (
    <header className="flex flex-col gap-4 border-b-2 border-border pb-8">
      {aside && (
        <p className="text-sm text-primary">
          <span aria-hidden="true">{'> '}</span>
          {aside}
        </p>
      )}
      <h1 className="font-pixel text-2xl leading-snug text-foreground text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
        {description}
      </p>
    </header>
  )
}
