import Reveal from './Reveal'

export default function Section({ id, title, children, className = '' }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`py-12 sm:py-16 ${className}`}>
      <div className="mx-auto max-w-5xl px-5">
        <Reveal as="h2" id={`${id}-titulo`} className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </Reveal>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
