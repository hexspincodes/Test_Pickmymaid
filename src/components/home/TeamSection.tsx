"use client"
import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronsRight } from 'lucide-react'

const team = [
  { id: 1, name: 'Soumya', role: 'HR Administration Manager | Dedicated Client Support', image: '/images/team/soumya.webp' },
  { id: 2, name: 'Saaritha', role: 'HR Executive', image: '/images/team/saaritha.webp' },
  { id: 3, name: 'Yasmin', role: 'HR Specialist', image: '/images/team/Yasmine.webp' },
  { id: 4, name: 'Noor', role: 'HR Assistant', image: '/images/team/Noor.webp' },
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
    if (cards.length < 2) return
    // Card positions measured inside the track; offsetLeft is relative to an
    // ancestor and includes the page padding, which left the slider stuck.
    const scrollLeft = track.scrollLeft
    const trackLeft = track.getBoundingClientRect().left
    const positions = cards.map(c => c.getBoundingClientRect().left - trackLeft + scrollLeft)
    let current = 0
    for (let i = 1; i < positions.length; i++) {
      if (Math.abs(positions[i] - scrollLeft) < Math.abs(positions[current] - scrollLeft)) current = i
    }
    const atEnd = scrollLeft >= track.scrollWidth - track.clientWidth - 2
    const next = atEnd || current + 1 >= cards.length ? 0 : current + 1
    track.scrollTo({ left: positions[next], behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Only auto-advance while the slider is on screen, so visitors see it
    // start from the first card when they scroll down to the section.
    let id: ReturnType<typeof setInterval> | undefined
    const stop = () => {
      if (id !== undefined) clearInterval(id)
      id = undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (id === undefined) id = setInterval(advance, 3500)
        } else {
          stop()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(track)

    // Pause auto-advance while the user is touching
    const pause = () => { pausedRef.current = true }
    const resume = () => {
      // Small delay so the snap animation completes before we take over again
      setTimeout(() => { pausedRef.current = false }, 600)
    }

    track.addEventListener('touchstart', pause, { passive: true })
    track.addEventListener('touchend', resume, { passive: true })

    return () => {
      stop()
      observer.disconnect()
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
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
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
