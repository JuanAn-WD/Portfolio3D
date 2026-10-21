import { VIEW_3D, handleViewLinkClick, viewHref } from '../../helpers/viewMode'
import { cvUrl, profile, ui } from '../data/content'
import { DownloadIcon } from './Icons'
import PlanetArt from './PlanetArt'
import { btnPrimary, btnSecondary, btnSky } from './ui'

export default function Hero() {
  return (
    <section id="inicio" aria-labelledby="inicio-titulo" className="flex flex-col pt-16">
      <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-14 sm:pb-12 sm:pt-20">
        <h1 id="inicio-titulo" className="font-serif text-6xl font-semibold tracking-tight sm:text-8xl">
          {profile.name}
          <span className="mt-3 block font-sans text-xl font-medium tracking-normal text-muted sm:text-2xl">
            {profile.fullName}
          </span>
        </h1>
        <p className="mt-5 text-lg font-medium text-leaf sm:text-xl">{profile.role}</p>
        <p className="mt-5 max-w-2xl font-serif text-2xl leading-snug sm:text-3xl">{profile.tagline}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#proyectos" className={btnPrimary}>
            {ui.viewProjects}
          </a>
          <a href={cvUrl} download className={btnSecondary}>
            <DownloadIcon />
            {ui.downloadCv}
          </a>
          <a href={viewHref(VIEW_3D)} onClick={(e) => handleViewLinkClick(e, VIEW_3D)} className={btnSky}>
            {ui.view3d}
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">{ui.view3dHint}</p>
      </div>
      <PlanetArt className="block h-[max(130px,21.6vw)] w-full" />
    </section>
  )
}
