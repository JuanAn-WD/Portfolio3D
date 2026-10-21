import { stack, ui } from '../data/content'
import Reveal from './Reveal'
import Section from './Section'
import { chip } from './ui'

export default function Stack() {
  return (
    <Section id="stack" title={ui.stackTitle}>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((group, i) => (
          <Reveal as="div" key={group.title} delay={i * 80}>
            <h3 className="font-serif text-xl font-semibold">{group.title}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item} className={chip}>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
