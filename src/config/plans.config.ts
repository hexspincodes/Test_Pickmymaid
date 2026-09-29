export interface PlanBenefit {
  text: string;
  included: boolean;
}

export interface Plan {
  id: "starter" | "basic" | "standard" | "premium";
  name: string;
  price: number;
  duration: string;
  description: string;
  isBestChoice: boolean;
  type: 0 | 1 | 2 | 3;
  benefits: PlanBenefit[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter Set",
    price: 0.38,
    duration: "14 Days",
    description: "One-time Payment",
    isBestChoice: false,
    type: 3,
    benefits: [
      { text: "Direct phone & WhatsApp access to all candidates", included: true },
      { text: "Fresh verified maid & nanny profiles added daily", included: true },
      { text: "Hire anyone within your 14-day access window", included: true },
      { text: "Unlimited maid trials & replacements until you find the right one", included: false },
      { text: "Dedicated support from a consultant ", included: false },
    ],
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: 350,
    duration: "1 Month",
    description: "One-time Payment",
    isBestChoice: false,
    type: 0,
    benefits: [
      { text: "Direct phone & WhatsApp access to all candidates", included: true },
      { text: "Fresh verified maid & nanny profiles added daily", included: true },
      { text: "Hire anyone within your 30-day unlimited access", included: true },
      { text: "Unlimited maid trials & replacements until you find the right one", included: true },
      { text: "Dedicated support from a consultant ", included: false },
    ],
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: 495,
    duration: "2 Months",
    description: "One-time Payment",
    isBestChoice: true,
    type: 1,
    benefits: [
      { text: "Direct phone & WhatsApp access to all candidates", included: true },
      { text: "Our HR team personally picks 3 best matches for you", included: true },
      { text: "Get 1 free week extra if needed within 60 days", included: true },
      { text: "Unlimited maid trials & replacements until you find the right one", included: true },
      { text: "Most chosen package by UAE families", included: true },
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 899,
    duration: "1 Month + Consultant",
    description: "One-time Payment",
    isBestChoice: false,
    type: 2,
    benefits: [
      { text: "Dedicated support from a consultant ", included: true },
      { text: "Save time & effort - we'll find your perfect maid", included: true },
      { text: "We shortlist, interview & arrange trials for you", included: true },
      { text: "Direct phone & WhatsApp access to all candidates", included: true },
      { text: "Unlimited maid trials & replacements until you find the right one", included: true },
    ],
  },
];
