export interface ScriptSection {
  id: string;
  title: string;
  badge: string;
  items: { label: string; text: string; tip?: string }[];
}

export const HOMEAGLOW_SCRIPT_DATA: ScriptSection[] = [
  {
    id: 'opening',
    title: 'Phase 1: Opening Spiel (FCF V3 Model)',
    badge: 'Opening Hook',
    items: [
      {
        label: 'FOR APEX LEADS',
        text: '"Hi (Customer), this is (Your Name) from Homeaglow calling on a recorded line. I noticed you visited one of our websites or have seen one of our ads. I wanted to call to see how we can help schedule a cleaning for you."',
        tip: 'From FCF V3 Guide Page 2: Clear, compliant, establishes recorded line and reason for call.',
      },
      {
        label: 'FOR REVISIT LEADS',
        text: '"Hi (Customer), this is (Your Name) from Homeaglow calling on a recorded line. You checked us out a while back, and I can see you recently came back to our site looking into our cleaning services — so I wanted to reach out while it’s fresh. I’d love to hear what brought you back and see how we can help."',
        tip: 'From FCF V3 Guide Page 2: Acknowledges return visit and invites open dialog.',
      },
    ],
  },
  {
    id: 'discovery',
    title: 'Phase 2: Sales Discovery (5 Levels & Lead Routing)',
    badge: 'Discovery Scoping',
    items: [
      {
        label: 'APEX S1 - Match Check',
        text: '"(Customer Name), it’s important that I make sure we cover all the things that are important for you. I’d like to ask a few questions to make sure that we are the right match for you."',
        tip: 'From FCF V3 Guide Page 3.',
      },
      {
        label: 'APEX S2 - Value Check',
        text: '"(Customer Name), I want to make sure that we get the best bang for your buck. I’d like to ask a few questions to make sure we check all the boxes for you."',
        tip: 'From FCF V3 Guide Page 3.',
      },
      {
        label: 'APEX S3 - Good Fit Check',
        text: '"(Customer Name), My goal is to make sure we’re a good fit for you. Would you mind answering a few quick questions so I can get a better sense of what you’re looking for?"',
        tip: 'From FCF V3 Guide Page 3.',
      },
      {
        label: 'REVISIT Q1 - Trigger',
        text: '"So, what’s going on that brought you back to look at cleaning services? Anything specific come up?"',
        tip: 'From FCF V3 Guide Page 4.',
      },
      {
        label: 'REVISIT Q2 - Past Experience',
        text: '"When you first checked us out, do you remember what held you back from booking? I just want to make sure we address that this time around."',
        tip: 'From FCF V3 Guide Page 4.',
      },
      {
        label: 'REVISIT Q3 - Current Situation',
        text: '"Got it. And right now, are you looking for a one-time clean or more of a recurring setup? I want to make sure I point you in the right direction."',
        tip: 'From FCF V3 Guide Page 4.',
      },
      {
        label: 'REVISIT Q4 - Logistics',
        text: '"Perfect. What area of (City/State) are you in, and how many bedrooms, bathrooms are we looking to get cleaned?"',
        tip: 'From FCF V3 Guide Page 4.',
      },
      {
        label: 'Redirect if "Just Looking"',
        text: '"Totally understand — no pressure at all. A lot of people come back just to compare options, and honestly, that’s smart. Can I at least walk you through how we work so you have everything you need to make a decision on your own time?"',
        tip: 'From FCF V3 Guide Page 4.',
      },
      {
        label: 'Discovery Level 1 - Basic Need',
        text: '"What prompted you to look for a cleaning service? / What made you decide to look for a cleaning service? / How long have you been considering getting a cleaner for your home?"',
        tip: 'From FCF V3 Guide Page 61.',
      },
      {
        label: 'Discovery Level 2 - Daily Impact',
        text: '"You mentioned you haven’t had your home cleaned in a while, how is this affecting your day-to-day? / You mentioned you are unable to clean your home because of (cite pain point), how long has it been a problem for you?"',
        tip: 'From FCF V3 Guide Page 62.',
      },
      {
        label: 'Discovery Level 3 - Expectations',
        text: '"What are your expectations when looking for a cleaning service? / What part of a cleaning service do you think you’ll be most happy with?"',
        tip: 'From FCF V3 Guide Page 63.',
      },
      {
        label: 'Discovery Level 4 - Key Decision Factors',
        text: '"What’s the biggest factor for you in deciding whether our cleaning service is a good fit for you? / What factors are most important to you when considering a regular cleaning service like ours?"',
        tip: 'From FCF V3 Guide Page 64.',
      },
      {
        label: 'Discovery Level 5 - Checking Readiness',
        text: '"Would you be happy to proceed if we can meet all your requirements for a cleaning service? / Assuming we check all the boxes for you, would you be happy to move forward?"',
        tip: 'From FCF V3 Guide Page 65.',
      },
    ],
  },
  {
    id: 'elevator',
    title: 'Phase 3: Elevator Pitch (Homeaglow Intro)',
    badge: 'Credibility',
    items: [
      {
        label: 'Official Homeaglow Introduction',
        text: '"A little about us, Homeaglow is the largest home cleaning company in the U.S., with over 10 years of experience and 2.6 million cleanings completed for nearly 900,000 customers. We connect you with 20,000+ trusted, background-checked cleaners including over 100 in your area. Best of all, we offer deeply discounted rates to make quality cleaning more affordable than ever."',
        tip: 'From FCF V3 Guide Page 5.',
      },
    ],
  },
  {
    id: 'data',
    title: 'Phase 4: Data Gathering & Staging',
    badge: 'Home Scoping',
    items: [
      {
        label: 'Core Scoping Questions',
        text: '"• How many rooms are we looking to clean?\n• How many bedrooms and bathrooms?\n• How often are you looking to get your home cleaned?"',
        tip: 'From FCF V3 Guide Page 6.',
      },
      {
        label: 'Staging S1 - Routine Vision',
        text: '"Thank you so much for choosing Homeaglow! Just to make sure I understand this better, how do you envision the regular cleaning as part of your routine?"',
        tip: 'From FCF V3 Guide Page 7.',
      },
      {
        label: 'Staging S2 - Empathy with Busy Schedule',
        text: '"I can understand how tight schedules can get especially if you’re working and have kids. Many of our customers choose Homeaglow for the exact same reason."',
        tip: 'From FCF V3 Guide Page 7.',
      },
      {
        label: 'Staging S3 - Relatability',
        text: '"Thanks for sharing that with me. My (grandma/aunt) also struggles with cleaning their own home and it really helped her a lot when she started getting a cleaning professional."',
        tip: 'From FCF V3 Guide Page 7.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Phase 5: Sales Pitch (FCF $59MF $35/hr ETF Plans)',
    badge: 'Membership Plans',
    items: [
      {
        label: 'FCF 2 Hours ($19 Today)',
        text: '"Thanks for sharing all that with me. For a home your size, we usually recommend about 2 hours for the first cleaning. Normally that would cost around $150 - that’s the national average. Instead of $150, with ForeverClean, every 2-hour cleaning is just around $46 every time. Here’s what I can do for you - your first 2 hours are completely free, and all you pay today is $19. How does that sound for you?"',
        tip: 'From FCF V3 Guide Page 9. Follow with Page 10 explanation: $19 covers 1st month, thereafter $59/mo ($23/hr rate), ETF is $70 ($35 x 2hrs) if cancelled before 6 paid months.',
      },
      {
        label: 'FCF 3 Hours ($19 Today)',
        text: '"Thanks for sharing all that with me. For a home your size, we usually recommend about 3 hours for the first cleaning. Normally that would cost around $225 - that’s the national average. Instead of $225, with ForeverClean, every 3-hour cleaning is just around $69 every time. Here’s what I can do for you - your first 3 hours are completely free, and all you pay today is $19. How does that sound for you?"',
        tip: 'From FCF V3 Guide Page 11. Follow with Page 12 explanation: $19 covers 1st month, thereafter $59/mo ($23/hr rate), ETF is $105 ($35 x 3hrs).',
      },
      {
        label: 'FCF 4 Hours ($38 Today)',
        text: '"Thanks for sharing all that with me. For a home your size, we usually recommend about 4 hours for the first cleaning. Normally that would cost around $300 - that’s the national average. Instead of $300, with ForeverClean, every 4-hour cleaning is just around $92 every time. Here’s what I can do for you - your first 4 hours of cleaning for only $38. How does that sound for you?"',
        tip: 'From FCF V3 Guide Page 13 & 14: $19 covers 1st month + $19 for 4th hour. ETF is $140 ($35 x 4hrs).',
      },
      {
        label: 'FCF 6 Hours ($78 Today)',
        text: '"Thanks for sharing all that with me. For a home your size, we usually recommend about 6 hours for the first cleaning. Normally that would cost around $450 - that’s the national average. Instead of $450, with ForeverClean, every 6-hour cleaning is just around $138 every time. Here’s what I can do for you - your first 6 hours of cleaning for only $78. How does that sound for you?"',
        tip: 'From FCF V3 Guide Page 15 & 16: $19 covers 1st month + $59 for extra 3 hours. ETF is $210 ($35 x 6hrs).',
      },
      {
        label: 'Sales Pitch - Negotiation (Step 2 & Step 3)',
        text: '"Is the membership not a good fit because of the cost, there is a commitment, or because you just don’t feel you need regular cleanings right now?" (If cost trigger: reduce MF to $54, then to $49 if needed. If commitment: offer Trial Cleaning or One-Time Cleaning).',
        tip: 'From FCF V3 Guide Page 25 & 26.',
      },
    ],
  },
  {
    id: 'booking',
    title: 'Phase 6 & 7: Booking & Mandatory Verbatim (Word-for-Word)',
    badge: 'Mandatory Verbatim',
    items: [
      {
        label: 'Booking Transition & Card Request',
        text: '"So, if that checks out with you, let’s get you one of the vouchers and set-up the cleaning. I just need your card details. Are we going to use a credit or debit card? May I ask for your ZIP code? What date would you like us to come and clean? We can book the appointment as early as 2 days from today, will that work for you?"',
        tip: 'From FCF V3 Guide Page 30. Mention 2-day window for top cleaner claim rate.',
      },
      {
        label: 'Mandatory Verbatim - FCF 2 Hours (MUST READ EXACTLY)',
        text: '"Just to make sure we got everything right, I\'ll go over what we discussed. Please say yes if you agree. To start — your email is ______, phone number is ________, and your address is _____. Are these correct? Your cleaning request for (date) for (duration) has been booked. S1: The alternate cleaning date is ______. Correct? We\'ll let you know when a cleaner claims your request, and their details will show on your dashboard. Your first 2 hours of this cleaning are completely free, covered by your ForeverClean membership, and your priority areas are (_______). Any cleaning time beyond your first 2 free hours will be billed at around $23 per hour. Is this clear? By signing up for ForeverClean today, a $19 charge has been processed. That\'s your first month of membership. Your ForeverClean membership will automatically renew each month, on the same date, until you choose to cancel. Starting from your second month, the regular $59 monthly fee will apply. With ForeverClean, your future cleanings are heavily discounted at around $23 per hour, including a 15% transaction fee. Is this clear? You can cancel ForeverClean anytime. If you cancel before 6 paid months, there\'s an early cancellation fee of $70— that\'s $35 times the hours of your first cleaning. Are these terms clear?"',
        tip: 'RED TEXT VERBATIM from FCF V3 Guide Page 34. Non-compliance results in QA audit penalty!',
      },
      {
        label: 'Mandatory Verbatim - FCF 3 Hours',
        text: '"...By signing up for ForeverClean today, a $19 charge has been processed. That\'s your first month of membership. Your ForeverClean membership will automatically renew each month, on the same date, until you choose to cancel. Starting from your second month, the regular $59 monthly fee will apply... If you cancel before 6 paid months, there\'s an early cancellation fee of $105— that\'s $35 times the hours of your first cleaning. Are these terms clear?"',
        tip: 'From FCF V3 Guide Page 35.',
      },
    ],
  },
  {
    id: 'objections',
    title: 'Common Objections (Official E.C.O.C. Framework)',
    badge: 'ECOC Rebuttals',
    items: [
      {
        label: '1. "Already Found a Cleaner"',
        text: 'Empathize: "Hey it’s great to hear that you have someone working to clean your home."\nClarify: "I just want to make sure you have all the information you need. Correct me if I’m wrong, it looks like it’s really important that you have your home regularly cleaned. Is this correct?"\nOvercome: "Thanks for sharing those with me. What sets Homeaglow apart is our vetted pros and competitive pricing vs. local market rates."\nConfirm: "Did my explanation help? Let’s review our terms and lock in your first cleaning!"\nSimplified: "Totally understand. Are you completely locked in with them or more just trying them out for now? We’ve completed over 2.6M cleanings with 91.4% rated 4.5+ stars, so if you ever need a reliable backup, we’d love to be that option."',
        tip: 'From FCF V3 Guide Page 48.',
      },
      {
        label: '2. "Doesn’t Want To Give Card Info"',
        text: 'Empathize: "Hey with how much fraud went up last year, I completely understand your hesitation to provide your card details over the phone."\nClarify: "If I’m hearing this right, you see how our service can help you and are just concerned about the security of your payment information. Is this correct?"\nOvercome: "We use double secure socket layer (SSL) encryption to protect your information."\nConfirm: "If it would make you feel more comfortable, I can assist you on how to process payment online yourself so you don’t need to give out card information over the phone. How does that sound?"',
        tip: 'From FCF V3 Guide Page 49.',
      },
      {
        label: '3. "Doesn’t Want A Membership"',
        text: 'Empathize: "I hear you. I know that saying yes to a membership is a big decision..."\nClarify: "My goal is to make sure our service is the right match. Just to make sure I’m getting a clear picture, (Agreed Value)... does this sound correct?"\nOvercome: "What members love about ForeverClean is you can book whenever you want, manage appointments anytime, and it locks in $23/hr rates."\nSimplified: "Totally fair! No one likes being stuck in something long-term. Are you concerned about being locked in, or just prefer to book as needed? With us, you can book whenever you want and manage your appointments anytime."',
        tip: 'From FCF V3 Guide Page 50.',
      },
      {
        label: '4. "Need to Consult Spouse"',
        text: 'Empathize: "It’s great that you’re making a joint decision. It’s important to make sure that everyone is on board..."\nClarify: "I wanted to confirm that I’m fully understanding you so please keep me honest, (Agreed Value)... did I get this correctly?"\nOvercome: "The vouchers we have are limited. Our members love that you enjoy your first clean at a discount and lock in $23/hr for the future."\nConfirm: "If it might be of interest, I’ll hold on to one of the vouchers and stay on the line while you talk with your spouse. Does this work for you?"',
        tip: 'From FCF V3 Guide Page 51.',
      },
      {
        label: '5. "Negative Review Seen Online"',
        text: 'Empathize: "I completely understand your concerns about the reviews you’ve seen..."\nClarify: "Just so I am getting this correctly, it’s important for you to have your home cleaned, you’re only concerned about the quality of the cleaning you’d get. Is this correct?"\nOvercome: "91.4% of our jobs are done by top-rated cleaners with 4.5 stars or higher, and we collect reviews after every single clean so only the best keep getting booked."\nConfirm: "Was I able to ease your concern about the quality of cleaning we provide?"',
        tip: 'From FCF V3 Guide Page 52.',
      },
      {
        label: '6. "Thinks This Is A Scam"',
        text: '"Totally fair. It’s smart to be cautious with things online. What part feels off to you, if you don’t mind me asking? We’ve actually been in business for over 10 years, and every cleaner goes through background checks. On top of that, our work is backed by the Homeaglow Happiness Guarantee, and we’ve helped nearly 900,000 customers. Hopefully that gives you a little peace of mind. Would you feel better if I walked you through how it works?"',
        tip: 'From FCF V3 Guide Page 56.',
      },
      {
        label: '7. "Wants To Pay In Cash"',
        text: '"I totally understand, some people prefer the simplicity of cash. Is that more about budgeting, or just personal preference? Our system is fully digital for security and ease, and it helps keep things organized for both you and your cleaner. Plus, you’ve got 24/7 support if anything ever comes up."',
        tip: 'From FCF V3 Guide Page 57.',
      },
      {
        label: '8. "Will Not Use The Service Often"',
        text: '"I hear you! Some folks just need the occasional clean here and there. Are you looking for something super flexible, or just don’t think you’d need it often enough? What’s nice is our system is totally on your schedule - you can book as needed, and we make rescheduling super easy. Plus, if a cleaner ever cancels, we’ve got backup coverage ready to go."',
        tip: 'From FCF V3 Guide Page 58.',
      },
      {
        label: '9. "Not At This Time / Not Ready To Book"',
        text: '"That makes perfect sense. It might just not be the right time. Is it that you’re still deciding on timing or just not ready to commit? The great part is you’re in control with our online dashboard - you can book, change, or cancel anytime, and we’re available 24/7 to help. Would you like me to walk you through how easy it is to use?"',
        tip: 'From FCF V3 Guide Page 59.',
      },
    ],
  },
  {
    id: 'faqs',
    title: 'Official FAQs & Standards (FC 101 & V3 Guide)',
    badge: 'Knowledge Bank',
    items: [
      {
        label: 'Standard vs Excluded Cleaning Tasks',
        text: 'Included: Wiping & sanitizing surfaces, vacuuming & mopping floors, cleaning sinks, bathtubs, showers, toilets, making beds, taking out trash.\nAdd-Ons (+1 Hour Each): Inside oven, inside fridge, interior windows, inside cabinets, baseboards, wash+fold laundry.\nStrict Exclusions: Pet feces/urine/vomit/litter boxes, lifting heavy furniture, carpet shampooing/steaming, mold/pest remediation, exterior windows, outdoor patios/garages.',
        tip: 'From FC 101 & V3 Guide Pages 8, 9, 31-46.',
      },
      {
        label: 'Are Cleaners Bonded & Insured?',
        text: '"Every cleaning professional on Homeaglow has passed through extensive certification and strict criminal background checks. While they are independent contractors and we do not provide insurance directly, many carry their own bonding and insurance, and we back all cleans with our Homeaglow Happiness Guarantee."',
        tip: 'From FCF V3 Guide Page 68.',
      },
      {
        label: 'Can I Book For Tomorrow / Same Day?',
        text: '"Normally we recommend a 2-day window to allow cleaners to claim the appointment. Over 90% of requests get picked up, and over half within 50 minutes. We can check for tomorrow, but having an alternate date ready ensures we can accommodate you."',
        tip: 'From FCF V3 Guide Page 31 & 69.',
      },
      {
        label: 'Early Termination Fee (ETF) Structure',
        text: '2 Hours: $70 ($35 x 2hrs)\n3 Hours: $105 ($35 x 3hrs)\n4 Hours: $140 ($35 x 4hrs)\n6 Hours: $210 ($35 x 6hrs)\nApplicable if cancelled prior to 6 paid monthly cycles ($59/mo).',
        tip: 'From FC 101 Page 21 and FCF V3 Guide Page 8-16.',
      },
      {
        label: 'States with Applicable Taxes',
        text: 'AR, CT, DC, HI, KY, MN, NE, NJ, NM, NY, OH, PA, SD, TX, UT, WV require state sales tax on cleaning services.',
        tip: 'From FCF V3 Guide Page 67.',
      },
    ],
  },
];

export interface TraineeProfile {
  name: string;
  trainer: string;
  wave: string;
  callType: 'Inbound Promo Inquiry' | 'Outbound Lead Follow-Up' | 'Apex Lead' | 'Revisit Lead';
  difficulty: 'Beginner' | 'Intermediate' | 'Difficult';
  voiceName: string;
}

export const DEFAULT_TRAINEE_PROFILES: TraineeProfile[] = [
  {
    name: 'Alex Rivera',
    trainer: 'Sarah Jenkins',
    wave: 'Wave 24-B',
    callType: 'Apex Lead',
    difficulty: 'Intermediate',
    voiceName: 'Kore',
  },
  {
    name: 'Jordan Lee',
    trainer: 'Marcus Vance',
    wave: 'Wave 25-A',
    callType: 'Revisit Lead',
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
