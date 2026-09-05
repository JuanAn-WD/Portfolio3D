import { GlobePet } from './GlobePet'
import { fauna } from '../config/content'

export function Fauna({ frozen, reducedMotion }) {
  return (
    <>
      {fauna.map((pet, i) => (
        <GlobePet key={`${pet.modelPath}-${i}`} frozen={frozen || reducedMotion} {...pet} />
      ))}
    </>
  )
}
