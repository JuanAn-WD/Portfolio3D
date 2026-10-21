import { contactEmail, cvUrl, linkedinUrl, profile, ui } from '../data/content'
import ExternalLink from './ExternalLink'
import { DownloadIcon, GithubIcon, LinkedinIcon, MailIcon } from './Icons'
import Reveal from './Reveal'
import { btnPrimary, btnSecondary } from './ui'

export default function Contact() {
  return (
    <footer id="contacto" aria-labelledby="contacto-titulo" className="border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <h2 id="contacto-titulo" className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {ui.contactTitle}
          </h2>
          <p className="mt-4 max-w-xl text-muted">{ui.contactText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className={btnPrimary}>
                <MailIcon />
                <span>
                  {ui.email}
                  <span className="sr-only"> ({contactEmail})</span>
                </span>
              </a>
            )}
            {linkedinUrl && (
              <ExternalLink href={linkedinUrl} className={btnSecondary} icon={<LinkedinIcon />}>
                {ui.linkedin}
              </ExternalLink>
            )}
            <a href={cvUrl} download className={btnSecondary}>
              <DownloadIcon />
              {ui.downloadCv}
            </a>
            <ExternalLink href={profile.github} className={btnSecondary} icon={<GithubIcon />}>
              {ui.github}
            </ExternalLink>
          </div>
        </Reveal>
        <p className="mt-12 text-sm text-muted">
          © {new Date().getFullYear()} {profile.fullName}
        </p>
      </div>
    </footer>
  )
}
