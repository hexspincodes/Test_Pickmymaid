"use client";

import dynamic from "next/dynamic";
import type { Profile } from "@/components/cards/ProfileCard";

const AvailableMaidsSection = dynamic(() =>
  import("./AvailableMaidsSection").then((m) => m.AvailableMaidsSection),
);
const ExploreMaidsSection = dynamic(() =>
  import("./ExploreMaidsSection").then((m) => m.ExploreMaidsSection),
);
const TeamSection = dynamic(() =>
  import("./TeamSection").then((m) => m.TeamSection),
);
const TestimonialsSection = dynamic(() =>
  import("./TestimonialsSection").then((m) => m.TestimonialsSection),
);
const FaqSection = dynamic(() =>
  import("./FaqSection").then((m) => m.FaqSection),
);
const WhyChooseUsSection = dynamic(() =>
  import("@/components/home/WhyChooseUsSection").then(
    (m) => m.WhyChooseUsSection,
  ),
);
const HowItWorksSection = dynamic(() =>
  import("@/components/home/HowItWorksSection").then(
    (m) => m.HowItWorksSection,
  ),
);
const DomesticServicesSection = dynamic(() =>
  import("./DomesticServicesSection").then((m) => m.DomesticServicesSection),
);
const SubscriptionPlansSection = dynamic(() =>
  import("./SubscriptionPlansSection").then((m) => m.SubscriptionPlansSection),
);

export function BelowFoldClient({ videoProfiles }: { videoProfiles: Profile[] }) {
  return (
    <>
      <AvailableMaidsSection profiles={videoProfiles} />
      <ExploreMaidsSection />
      <SubscriptionPlansSection />
      <WhyChooseUsSection />
      <HowItWorksSection />
      <TeamSection />
      <TestimonialsSection />
      <DomesticServicesSection />
      <FaqSection />
    </>
  );
}
