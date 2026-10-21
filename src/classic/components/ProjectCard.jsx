import { ui } from '../data/content'
import ExternalLink from './ExternalLink'
import { GithubIcon } from './Icons'
import { btnPrimary, btnSecondary, btnSky, chip } from './ui'

function Media({ project }) {
  if (project.image) {
    return (
      <img
        src={project.image}
        alt={project.imageAlt}
        loading="lazy"
        className="aspect-video h-full w-full object-cover"
      />
    )
  }
  // Hueco para la captura: se muestra hasta que haya una imagen.
  return (
    <div
      aria-hidden="true"
      className="flex aspect-video h-full w-full items-center justify-center bg-gradient-to-br from-leaf/25 via-surface to-sky/25"
    >
      <span className="font-serif text-6xl font-semibold text-ink/30">{project.title[0]}</span>
    </div>
  )
}

export default function ProjectCard({ project }) {
  const titleId = `${project.id}-titulo`
  const { cta } = project

  return (
    <article
      aria-labelledby={titleId}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,transform] hover:border-leaf/60 motion-safe:hover:-translate-y-0.5 ${
        project.featured ? 'lg:flex-row' : ''
      }`}
    >
      <div className={project.featured ? 'lg:w-1/2' : ''}>
        <Media project={project} />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 id={titleId} className="font-serif text-2xl font-semibold tracking-tight">
          {project.title}
        </h3>
        <p className="mt-3 leading-relaxed text-muted">{project.description}</p>

        <ul aria-label={ui.techLabel} className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className={chip}>
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          {cta &&
            (cta.url ? (
              <ExternalLink href={cta.url} className={btnSky}>
                {cta.label}
              </ExternalLink>
            ) : (
              <button type="button" disabled className={btnSky} title="Próximamente">
                {cta.label}
              </button>
            ))}
          {project.demo && (
            <ExternalLink href={project.demo} className={btnPrimary} srContext={`de ${project.title}`}>
              {ui.demo}
            </ExternalLink>
          )}
          {project.github && (
            <ExternalLink
              href={project.github}
              className={btnSecondary}
              icon={<GithubIcon />}
              srContext={`de ${project.title}`}
            >
              {ui.github}
            </ExternalLink>
          )}
        </div>
      </div>
    </article>
  )
}
