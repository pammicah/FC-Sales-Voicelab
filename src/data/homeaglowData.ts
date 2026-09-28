export interface ScriptSection {
  id: string;
  title: string;
  badge: string;
  items: { label: string; text: string; tip?: string }[];
}

export const HOMEAGLOW_SCRIPT_DATA: ScriptSection[] = [
  {
    id: 'opening',
    title: 'Phase 1 & 2: Opening Greetings',
    badge: 'Opening Hook',
    items: [
      {
        label: 'Inbound Promo Inquiry',
        text: '"Thank you for calling Homeaglow, my name is [Your Name]! How can I make your home sparkle today?"',
        tip: 'Project high energy, warm hospitality, and clear brand identity right away.',
      },
      {
        label: 'Outbound Lead Follow-Up',
        text: '"Hi [Customer Name], this is [Your Name] with Homeaglow! I saw you were checking out our cleaning voucher promo online and wanted to ensure your discount was locked in before the voucher reservations close today."',
        tip: 'Create urgency and remind them of their online inquiry.',
      },
    ],
  },
  {
    id: 'discovery',
    title: 'Discovery & Home Scoping (5 Core Pillars)',
    badge: 'Discovery',
    items: [
      {
        label: '1. Bed & Bath Count',
        text: '"To match you with the best cleaner and allocate the right amount of time, how many bedrooms and bathrooms are we looking to get freshened up?"',
        tip: 'Essential for estimating clean duration accurately.',
      },
      {
        label: '2. Approximate Square Footage',
        text: '"Roughly how many square feet is your home? Is it under 1,000 sq ft, around 1,500 to 2,000, or larger?"',
        tip: 'Helps prevent under-booking and cleaner burnout.',
      },
      {
        label: '3. Clean Type & Focus Areas',
        text: '"Are we looking for a standard upkeep clean, or more of a deep reset? Any specific priority rooms like the kitchen, oven interior, fridge, or bathrooms?"',
        tip: 'Identify add-ons and priority zones.',
      },
      {
        label: '4. Pet Policy',
        text: '"Do you have any dogs, cats, or other pets at home? We want to ensure we pair you with an animal-friendly cleaner!"',
        tip: 'Critical for cleaner allergies and safety.',
      },
      {
        label: '5. Supplies & Equipment',
        text: '"Do you prefer the cleaner to use your personal vacuum and supplies, or would you like them to arrive with their own professional kit?"',
        tip: 'Confirm supply expectations before arrival.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Voucher Rules & ForeverClean Membership',
    badge: 'Membership Transparency',
    items: [
      {
        label: 'Voucher Promo Application',
        text: '"Your initial clean promo voucher is applied today—covering your first clean for just $19 [or $49] for up to 3 hours."',
        tip: 'Clear price lock for the first appointment.',
      },
      {
        label: 'ForeverClean VIP Rate',
        text: '"This voucher grants you access to Homeaglow’s ForeverClean membership, which knocks 50% to 60% off standard industry rates down to just $18-$22/hr (vs. $45-$60/hr everywhere else)."',
        tip: 'Frame recurring rate as a massive insider perk.',
      },
      {
        label: 'Transparent Plan Terms',
        text: '"Your membership continues at $49/month with total flexibility: you can schedule whenever you want, select your favorite cleaner, or pause directly in your online account anytime."',
        tip: 'Full transparency prevents churn and billing disputes.',
      },
    ],
  },
  {
    id: 'objections',
    title: 'Objection Battlecards & Approved Rebuttals',
    badge: 'Rebuttals',
    items: [
      {
        label: '"I only wanted a cheap one-time clean, why membership?"',
        text: '"I totally get it! Most independent services charge $150 to $200 for a single visit with zero guarantees. With Homeaglow, your initial clean is only $19-$49, and the ForeverClean membership locks in our preferred VIP rate of $18-$22/hr for whenever you need another clean, plus free cleaner rematching. You can pause or manage it anytime in your dashboard."',
      },
      {
        label: '"Can I trust your cleaners? Are they background checked?"',
        text: '"Peace of mind is our top priority! Every single cleaner on Homeaglow undergoes rigorous identity and criminal background screening, carries platform liability insurance, and maintains verified ratings. You can even read real client reviews and choose your preferred pro."',
      },
      {
        label: '"What if they do a bad job or miss spots?"',
        text: '"We back every clean with our Homeaglow Happiness Guarantee! If anything isn’t up to your standard, let us know within 24 hours and we will send another top-rated cleaner to reclean it completely free, or credit your account."',
      },
      {
        label: '"I need to check with my spouse first."',
        text: '"I completely understand! Since promotional calendar slots fill up very quickly and this voucher rate is currently held on my system, let’s tentatively reserve a slot for Thursday or Saturday. You can reschedule for free up to 24 hours in advance, but this guarantees you keep today’s rate locked in."',
      },
    ],
  },
  {
    id: 'closing',
    title: 'Assumptive Closing & Booking Requirements',
    badge: 'Close The Deal',
    items: [
      {
        label: '1. Preferred Slot Selection',
        text: '"Would Thursday morning around 9 AM or Saturday afternoon around 1 PM work better for your schedule?"',
        tip: 'Use alternative choice close instead of yes/no.',
      },
      {
        label: '2. Address & Arrival Window Confirmation',
        text: '"Great! What is the full service address and ZIP code? We have a 2-hour arrival window to give your cleaner flexibility with traffic."',
        tip: 'Lock in logistics.',
      },
      {
        label: '3. Warm Wrap-Up & Happiness Guarantee',
        text: '"You’re all booked, [Customer Name]! You’ll receive an SMS confirmation with your cleaner’s photo and profile in just a minute. Thank you for choosing Homeaglow—have a sparkling day!"',
        tip: 'Leave a memorable, upbeat impression.',
      },
    ],
  },
];

export interface TraineeProfile {
  name: string;
  trainer: string;
  wave: string;
  callType: 'Inbound Promo Inquiry' | 'Outbound Lead Follow-Up';
  difficulty: 'Beginner' | 'Intermediate' | 'Difficult';
  voiceName: string;
}

export const DEFAULT_TRAINEE_PROFILES: TraineeProfile[] = [
  {
    name: 'Alex Rivera',
    trainer: 'Sarah Jenkins',
    wave: 'Wave 24-B',
    callType: 'Inbound Promo Inquiry',
    difficulty: 'Intermediate',
    voiceName: 'Kore',
  },
  {
    name: 'Jordan Lee',
    trainer: 'Marcus Vance',
    wave: 'Wave 25-A',
    callType: 'Outbound Lead Follow-Up',
    difficulty: 'Difficult',
    voiceName: 'Fenrir',
  },
  {
    name: 'Taylor Brooks',
    trainer: 'Sarah Jenkins',
    wave: 'Wave 24-B',
    callType: 'Inbound Promo Inquiry',
    difficulty: 'Beginner',
    voiceName: 'Puck',
  },
];

export const VOICE_OPTIONS = [
  { id: 'Kore', name: 'Kore (Warm, Conversational Female)', tag: 'Recommended' },
  { id: 'Puck', name: 'Puck (Engaged, Expressive Male)', tag: 'Energetic' },
  { id: 'Fenrir', name: 'Fenrir (Deep, Direct, Skeptical Male)', tag: 'Challenging' },
  { id: 'Aoede', name: 'Aoede (Articulate, Professional Female)', tag: 'Polite' },
  { id: 'Zephyr', name: 'Zephyr (Casual, Easygoing Male)', tag: 'Relaxed' },
];
