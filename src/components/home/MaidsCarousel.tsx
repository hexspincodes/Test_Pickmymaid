'use client'

import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ProfileCard, type Profile } from '@/components/cards/ProfileCard'
import { OutlineButton } from '../ui/OutlineButton'

export type { Profile }

export function MaidsCarousel({ profiles }: { profiles: Profile[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const sync = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    emblaApi.on('select', sync)
    emblaApi.on('reInit', sync)
    sync()
    return () => {
      emblaApi.off('select', sync)
      emblaApi.off('reInit', sync)
    }
  }, [emblaApi])

  return (
    <>
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex">
          {profiles.map(p => (
            <div
              key={p.id}
              className="flex-[0_0_100%] min-[700px]:flex-[0_0_50%] lg:flex-[0_0_50%] xl:flex-[0_0_33.3333%] 2xl:flex-[0_0_25%] pr-4 xl:pr-5"
            >
              <ProfileCard profile={p} showPostedOn={false} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-8">
        <OutlineButton curve="right" onClick={prev} disabled={!canPrev} aria-label="Previous">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </OutlineButton>
        <OutlineButton curve="left" onClick={next} disabled={!canNext} aria-label="Next">
          <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
        </OutlineButton>
      </div>
    </>
  )
}
