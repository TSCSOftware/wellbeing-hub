/**
 * Wellbeing resource library.
 * Rendered by mapping over this array and passing each item down as a
 * single object prop, with `key={resource.id}` (the Props deck reminds us
 * that `key` is NOT a real prop - React uses it internally).
 */
export const resources = [
  {
    id: 'r-201',
    title: 'The 5-4-3-2-1 grounding technique',
    category: 'Anxiety',
    type: 'Article',
    minutes: 4,
    summary:
      'A pocket-sized exercise that pulls you out of a spiral by walking your attention through your five senses.',
    body: [
      'When anxiety takes over, your attention narrows onto the thought that is frightening you. Grounding works by deliberately widening it again.',
      'Name 5 things you can see. Say them silently, slowly, and really look at each one - the grain of the desk, the colour of a jacket, the shape of a window frame.',
      'Name 4 things you can feel. The chair against your back, your feet in your shoes, the temperature of the air, fabric on your wrists.',
      'Name 3 things you can hear. A fan, distant traffic, your own breathing.',
      'Name 2 things you can smell, then 1 thing you can taste. If you cannot find a smell, name two smells you like.',
      'The point is not to feel instantly calm. The point is to give your nervous system thirty seconds of ordinary, non-threatening input. Repeat the cycle twice if you need to.',
    ],
    takeaways: [
      'Run one full 5-4-3-2-1 cycle before you open your laptop tomorrow.',
      'Save the sequence in your phone notes so you have it during a panic.',
      'Pair it with a slow exhale each time you name something.',
    ],
    tags: ['grounding', 'panic', 'quick'],
  },
  {
    id: 'r-202',
    title: 'Box breathing for exam panic',
    category: 'Anxiety',
    type: 'Exercise',
    minutes: 5,
    summary:
      'Four seconds in, four hold, four out, four hold. Use the breathing timer on your dashboard to follow along.',
    body: [
      'Box breathing is used by clinicians, athletes and emergency responders because it is simple enough to remember when you are frightened.',
      'Breathe in through your nose for a slow count of four. Hold for four. Breathe out through your mouth for four. Hold empty for four. That is one box.',
      'Six boxes takes about two minutes and is usually enough to bring a racing heart rate down.',
      'If holding your breath feels uncomfortable, drop the holds and simply make your out-breath longer than your in-breath. A longer exhale is the part that actually calms you.',
      'Open the Self-care page on your dashboard - the breathing timer there will pace the cycle for you.',
    ],
    takeaways: [
      'Do six boxes (about two minutes) using the timer on the Self-care page.',
      'If holding feels uncomfortable, drop the holds and lengthen the out-breath.',
      'Log it as "Breathing / meditation" so you can watch the pattern build.',
    ],
    tags: ['breathing', 'exams', 'quick'],
  },
  {
    id: 'r-203',
    title: 'Sleep hygiene that survives deadline week',
    category: 'Sleep',
    type: 'Guide',
    minutes: 8,
    summary:
      'Realistic sleep advice for students who genuinely cannot go to bed at 10pm every night.',
    body: [
      'Most sleep advice assumes a life you do not have. These are the three rules that still work during a bad week.',
      'Rule one: protect your wake-up time, not your bedtime. A consistent alarm anchors your body clock even when your bedtime moves around.',
      'Rule two: give yourself a thirty minute buffer with no screens and no coursework. Your brain cannot switch from problem-solving to sleeping instantly.',
      'Rule three: if you are awake for more than twenty minutes, get out of bed. Lying awake teaches your brain that bed is a place for worrying.',
      'Caffeine has a half-life of about five hours. A 4pm coffee still has a quarter of its dose active at midnight.',
      'One bad night will not ruin your exam. The fear of a bad night is usually more disruptive than the bad night itself.',
    ],
    takeaways: [
      'Pick one fixed wake-up time and keep it, even after a late night.',
      'Move your phone charger out of arm\u2019s reach tonight.',
      'Write tomorrow\u2019s three tasks down before bed to stop the mental rehearsal.',
    ],
    tags: ['sleep', 'routine', 'exams'],
  },
  {
    id: 'r-204',
    title: 'Beating the "I cannot start" loop',
    category: 'Study stress',
    type: 'Guide',
    minutes: 6,
    summary:
      'Procrastination is usually an emotion problem wearing a time-management costume. Here is what to do instead.',
    body: [
      'You are not lazy. Avoidance is what a brain does when a task is linked to a feeling it does not want - usually dread, boredom or the fear of doing it badly.',
      'Shrink the unit of work until it feels almost silly. Not "write the essay" - "open the document and type the title".',
      'Use a ten minute timer with permission to stop. Most of the time you will keep going, because starting was the expensive part.',
      'Separate drafting from judging. You cannot write and criticise at the same time, and trying to do both is what produces a blank page.',
      'Log the attempt on your self-care page even if the session was short. Evidence that you showed up is more motivating than a to-do list of things you did not do.',
    ],
    takeaways: [
      'Choose the smallest possible first step and set a 10-minute timer.',
      'Work somewhere you cannot lie down.',
      'Tell one person what you are about to start.',
    ],
    tags: ['procrastination', 'study', 'motivation'],
  },
  {
    id: 'r-205',
    title: 'What actually happens in a counselling session',
    category: 'Getting support',
    type: 'Article',
    minutes: 5,
    summary:
      'A plain description of the first appointment, so the unknown is one less reason to postpone booking.',
    body: [
      'The first session is mostly a conversation. Nobody will diagnose you, prescribe anything, or contact your family or your department.',
      'You will be asked what brought you here, how long it has been going on, and what you would like to be different. "I do not really know" is a completely acceptable answer.',
      'Sessions are typically fifty minutes. You can stop at any point, and you can ask for a different counsellor without giving a reason.',
      'Confidentiality is the default. The only exception is a serious and immediate risk to your safety or someone else\'s, and your counsellor will tell you if that line is ever approached.',
      'You do not need to be in crisis to qualify. "Things are basically fine but I feel flat" is a perfectly good reason to book.',
    ],
    takeaways: [
      'Write down the one sentence you want to say first.',
      'Book the earliest slot that fits your timetable, not the perfect one.',
      'Remember you can change counsellor at any point without explaining why.',
    ],
    tags: ['counselling', 'first-session', 'confidentiality'],
  },
  {
    id: 'r-206',
    title: 'Homesickness and finding your people',
    category: 'Belonging',
    type: 'Article',
    minutes: 5,
    summary:
      'Why the loneliest month is often month two, and small practical moves that actually shift it.',
    body: [
      'Week one is adrenaline. Week six is when the novelty wears off and everyone else appears to have already found their group. They have not.',
      'Familiarity beats charisma. Being reliably in the same place at the same time - one society, one seat in the library, one gym class - produces friendships far more efficiently than trying to be interesting at parties.',
      'Make plans small and repeatable. "Coffee after Tuesday lectures" survives; "we should do something sometime" does not.',
      'Keep one anchor from home, but timebox it. Constant contact with home can quietly prevent you from settling where you are.',
      'If it has not shifted after a couple of months, that is exactly what peer support is for. Book a low-pressure session with the peer support lead.',
    ],
    takeaways: [
      'Go to the same thing twice - familiarity is what turns strangers into friends.',
      'Send one low-stakes message today.',
      'Log it as "Connected with someone" when you do.',
    ],
    tags: ['loneliness', 'first-year', 'community'],
  },
  {
    id: 'r-207',
    title: 'Spotting burnout before it flattens you',
    category: 'Burnout',
    type: 'Checklist',
    minutes: 3,
    summary:
      'Six early warning signs, and the difference between resting and merely stopping.',
    body: [
      'Burnout rarely announces itself. Watch for: cynicism about work you used to care about, dread on Sunday evening, tasks taking twice as long, irritability with people you like, illness that keeps recurring, and rest that does not refresh you.',
      'Three or more of those for two weeks is worth a conversation with a wellbeing advisor.',
      'Scrolling is stopping, not resting. Genuine recovery usually involves one of: movement, other people, being outdoors, or doing something with your hands.',
      'Protect one full evening a week completely. A ring-fenced evening is more restorative than seven guilty half-hours.',
      'Burnout is a workload problem as often as it is a coping problem. Ask what can be dropped, deferred or shared before asking how to endure more.',
    ],
    takeaways: [
      'Score yourself honestly on the checklist, without judgement.',
      'Cancel or postpone one non-essential commitment this week.',
      'Schedule rest as an appointment, not as leftover time.',
    ],
    tags: ['burnout', 'rest', 'workload'],
  },
  {
    id: 'r-208',
    title: 'Supporting a friend who is struggling',
    category: 'Getting support',
    type: 'Guide',
    minutes: 6,
    summary:
      'What to say, what not to say, and how to help without becoming their only support.',
    body: [
      'You do not need the right words. Presence beats phrasing almost every time.',
      'Ask open questions and then be quiet. "How long have you felt like this?" opens more than "Are you okay?", which invites "fine".',
      'Do not rush to fix. Advice offered too early is often heard as "stop feeling this".',
      'Asking directly about suicidal thoughts does not plant the idea. It is one of the most protective things you can do, and it gives permission to be honest.',
      'Help them take the next concrete step - sitting with them while they book, or walking with them to the Wellbeing Centre.',
      'Look after yourself too. You are a friend, not a service. Tell them what you can and cannot offer, and use the hub yourself.',
    ],
    takeaways: [
      'Ask an open question, then stay quiet for longer than feels comfortable.',
      'Do not try to fix it - reflect back what you heard.',
      'Point them at this hub, then check in again in three days.',
    ],
    tags: ['friends', 'listening', 'support'],
  },
  {
    id: 'r-209',
    title: 'A five minute reset between lectures',
    category: 'Self-care',
    type: 'Exercise',
    minutes: 5,
    summary:
      'A short sequence for the gap between two demanding classes when going home is not an option.',
    body: [
      'Stand up and leave the room, even if only for two minutes. Changing your physical context resets your attention more effectively than sitting still.',
      'Get daylight on your face. Sixty seconds outside does more for alertness than another coffee.',
      'Drink water. Mild dehydration reliably shows up as fatigue and a headache you blame on studying.',
      'Roll your shoulders back ten times and unclench your jaw. Study posture quietly generates tension you stop noticing.',
      'Take three long exhales, then decide one - only one - thing for the next hour. Log it as a five minute self-care activity, because it counts.',
    ],
    takeaways: [
      'Try the full five-minute reset between two study blocks.',
      'Stand up, drink water and look out of a window first.',
      'Notice the difference in your focus afterwards and log it.',
    ],
    tags: ['reset', 'quick', 'energy'],
  },
]

export function findResourceById(id) {
  return resources.find((resource) => resource.id === id)
}

export const resourceCategories = [
  ...new Set(resources.map((resource) => resource.category)),
].sort()
