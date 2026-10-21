import { hobbies, ui } from '../data/content'
import Reveal from './Reveal'
import Section from './Section'

export default function Hobbies() {
  return (
    <Section id="hobbies" title={ui.hobbiesTitle}>
      <Reveal delay={80}>
        <p className="max-w-xl text-muted">{hobbies.intro}</p>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {hobbies.items.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-line bg-surface px-4 py-5 text-center font-medium transition-colors hover:border-sky"
            >
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
