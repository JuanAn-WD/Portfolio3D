import { profile, ui } from '../data/content'
import Section from './Section'
import Reveal from './Reveal'
import { chip } from './ui'

export default function About() {
  return (
    <Section id="sobre-mi" title={ui.aboutTitle}>
      <Reveal delay={80}>
        <p className="max-w-2xl font-serif text-xl leading-relaxed sm:text-2xl">{profile.about}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <li key={tag} className={chip}>
              {tag}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
