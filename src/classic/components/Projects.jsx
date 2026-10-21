import { projects, ui } from '../data/content'
import ProjectCard from './ProjectCard'
import Reveal from './Reveal'
import Section from './Section'

export default function Projects() {
  return (
    <Section id="proyectos" title={ui.projectsTitle}>
      <ul className="grid gap-6 lg:grid-cols-2">
        {projects.map((project, i) => (
          <li key={project.id} className={project.featured ? 'lg:col-span-2' : ''}>
            <Reveal delay={i * 80} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
