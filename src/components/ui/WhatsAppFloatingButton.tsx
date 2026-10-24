"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/Whatsapp";

const PHONE_NUMBER = "971566369736";
const WA_LINK = `https://wa.me/${PHONE_NUMBER}?text=Hi%2C%20I%27m%20interested%20in%20hiring%20a%20maid%2Fnanny.`;
const CALL_LINK = `tel:+${PHONE_NUMBER}`;

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isVisible = useRef(true);

  // Hide on scroll-down, show on scroll-up — rAF-throttled, passive listener
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const next = currentY < 80 || currentY < lastScrollY.current;

        if (next !== isVisible.current) {
          isVisible.current = next;
          setVisible(next);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Show bubble once per session — 3s after mount, auto-hide after 5s
  useEffect(() => {
    if (pathname !== "/" || sessionStorage.getItem("wa_bubble_seen")) return;

    let hideTimer: ReturnType<typeof setTimeout>;

    const showTimer = setTimeout(() => {
      setBubbleVisible(true);
      sessionStorage.setItem("wa_bubble_seen", "1");
      hideTimer = setTimeout(() => setBubbleVisible(false), 5000);
    }, 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  // Mounted in the root layout, but only wanted on the home page.
  if (pathname !== "/") return null;

  return (
    <div
      className={`fixed bottom-6 right-5 z-40 flex flex-col items-end gap-9 pointer-events-none transition-[opacity,transform] duration-300 ease-in-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* "Any help needed?" bubble — once per session */}
      <div
        className={`pointer-events-none flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.10)] whitespace-nowrap transition-[opacity,transform] duration-500 ease-in-out ${
          bubbleVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        <span
          className="w-2 h-2 rounded-full bg-[#25D366] shrink-0"
          style={{ animation: "wa-pulse 2.2s ease-out infinite" }}
        />
        <span className="text-sm font-semibold text-dark tracking-[0.25px]">
          Any help needed? 👋
        </span>
      </div>

      {/* Call button */}
      <div
        id="call-button"
        aria-label="call-button"
        className="relative pointer-events-auto"
      >
        {/* Pulse rings */}
        <span
          className="absolute inset-0 rounded-full bg-primary"
          style={{
            willChange: "transform, opacity",
            animation: "wa-pulse 2.2s ease-out infinite",
          }}
        />
        <span
          className="absolute inset-0 rounded-full bg-primary"
          style={{
            willChange: "transform, opacity",
            animation: "wa-pulse 2.2s ease-out 0.8s infinite",
          }}
        />

        <a
          href={CALL_LINK}
          aria-label="Call us"
          className="relative flex w-11 h-11 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-primary shadow-[0_8px_32px_rgba(255,116,66,0.45)] lg:hover:scale-110 lg:transition-transform lg:duration-200"
          style={{
            animation:
              "wa-enter 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
          }}
        >
          <Phone
            className="w-5 h-5 lg:w-6 lg:h-6 text-white"
            strokeWidth={1.5}
            fill="currentColor"
          />
        </a>
      </div>

      {/* WhatsApp button */}
      <div
        id="wa-button"
        aria-label="wa-button"
        className="relative pointer-events-auto"
      >
        {/* Pulse rings */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366]"
          style={{
            willChange: "transform, opacity",
            animation: "wa-pulse 2.2s ease-out infinite",
          }}
        />
        <span
          className="absolute inset-0 rounded-full bg-[#25D366]"
          style={{
            willChange: "transform, opacity",
            animation: "wa-pulse 2.2s ease-out 0.8s infinite",
          }}
        />

        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="relative flex w-11 h-11 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_32px_rgba(37,211,102,0.45)] lg:hover:scale-110 lg:transition-transform lg:duration-200"
          style={{
            animation:
              "wa-enter 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
          }}
        >
          <WhatsAppIcon className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
        </a>
      </div>
    </div>
  );
}
