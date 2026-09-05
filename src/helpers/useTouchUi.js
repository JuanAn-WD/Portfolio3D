import { useEffect, useState } from 'react'

function computeTouchUi() {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const noHover = window.matchMedia('(hover: none)').matches
  const narrow = window.matchMedia('(max-width: 900px)').matches
  return coarse || noHover || narrow
}

/** True on phones, tablets, and desktop device emulation (viewport), not only coarse pointers. */
export function useTouchUi() {
  const [touchUi, setTouchUi] = useState(computeTouchUi)

  useEffect(() => {
    const update = () => setTouchUi(computeTouchUi())
    const coarse = window.matchMedia('(pointer: coarse)')
    const hover = window.matchMedia('(hover: none)')
    const narrow = window.matchMedia('(max-width: 900px)')
    coarse.addEventListener('change', update)
    hover.addEventListener('change', update)
    narrow.addEventListener('change', update)
    window.addEventListener('resize', update)
    update()
    return () => {
      coarse.removeEventListener('change', update)
      hover.removeEventListener('change', update)
      narrow.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return touchUi
}
