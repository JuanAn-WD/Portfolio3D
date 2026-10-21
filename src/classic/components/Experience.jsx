import { experience, ui } from '../data/content'
import Reveal from './Reveal'
import Section from './Section'

export default function Experience() {
  return (
    <Section id="experiencia" title={ui.experienceTitle}>
      <ol className="relative max-w-3xl border-l border-line">
        {experience.map((item, i) => (
          <li key={item.id} className="relative pb-8 pl-7 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 border-leaf bg-bg"
            />
            <Reveal delay={i * 80}>
              <h3 className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">{item.title}</h3>
              {item.date && <p className="mt-1 text-sm font-medium text-leaf">{item.date}</p>}
              {item.description && <p className="mt-2 leading-relaxed text-muted">{item.description}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
