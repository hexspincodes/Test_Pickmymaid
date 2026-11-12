"use client"
import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronsRight } from 'lucide-react'

const team = [
  { id: 1, name: 'Soumya', role: 'HR Administration Manager | Dedicated Client Support', image: '/images/team/soumya.webp' },
  { id: 2, name: 'Yasmin', role: 'HR Specialist', image: '/images/team/Yasmine.webp' },
  { id: 3, name: 'Noor', role: 'HR Assistant', image: '/images/team/Noor.webp' },
    
]

function TeamCard({ name, role, image }: { name: string; role: string; image: string }) {
  return (
    <article className="rounded-3xl overflow-hidden bg-white  flex-shrink-0 w-[78vw] sm:w-[44vw] lg:w-auto snap-start p-3">
      <div className="relative aspect-[2/2] w-full bg-gray-100 rounded-2xl overflow-hidden">
        <Image
          src={image}
          alt={`${name}, ${role} at Pickmymaid`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 78vw, 25vw"
          loading="lazy"
        />
      </div>
      <div className="pt-4 px-3">
        <p className="font-regular text-dark text-lg lg:text-2xl">{name}</p>
        <p className="text-muted text-sm lg:text-lg mt-0.5">{role}</p>
      </div>
    </article>
  )
}

export function TeamSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  const advance = useCallback(() => {
    const track = trackRef.current
    if (!track || pausedRef.current) return
    const cards = Array.from(track.children) as HTMLElement[]
    // Find the currently snapped card by closest offsetLeft to scrollLeft
    const scrollLeft = track.scrollLeft
    let current = 0
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].offsetLeft <= scrollLeft + 2) current = i
    }
    const next = current + 1 < cards.length ? current + 1 : 0
    track.scrollTo({ left: cards[next].offsetLeft, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const id = setInterval(advance, 3500)

    // Pause auto-advance while the user is touching
    const pause = () => { pausedRef.current = true }
    const resume = () => {
      // Small delay so the snap animation completes before we take over again
      setTimeout(() => { pausedRef.current = false }, 600)
    }

    track.addEventListener('touchstart', pause, { passive: true })
    track.addEventListener('touchend', resume, { passive: true })

    return () => {
      clearInterval(id)
      track.removeEventListener('touchstart', pause)
      track.removeEventListener('touchend', resume)
    }
  }, [advance])

  return (
    <section className="py-12 lg:py-20 bg-[#fafafa]" aria-label="Our Team">
      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 lg:mb-14">
          <div className="flex justify-center lg:justify-normal items-center gap-1 text-muted text-xs font-medium mb-4 lg:mb-6">
            <ChevronsRight className="w-8 h-8  md:w-11 md:h-11 font-thin" />
            <span className='text-lg md:text-xl font-medium'>Our Team</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end lg:justify-between gap-3 lg:gap-20">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:7xl text-center lg:text-left font-medium text-dark leading-tight max-w-xl">
              Meet the people behind Pickmymaid!
            </h1>
            <p className="text-lg lg:text-xl text-muted text-center font-regular text-black lg:text-left leading-relaxed lg:max-w-lg">
              We are a real team based in Dubai. When you contact us, you speak to a person — not a bot, not an automated system.
            </p>
          </div>
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {team.map(m => (
            <TeamCard key={m.id} name={m.name} role={m.role} image={m.image} />
          ))}
        </div>

        {/* Mobile: CSS scroll-snap slider with auto-advance */}
        <div
          ref={trackRef}
          className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {team.map(m => (
            <TeamCard key={m.id} name={m.name} role={m.role} image={m.image} />
          ))}
        </div>
      </div>
    </section>
  )
}
