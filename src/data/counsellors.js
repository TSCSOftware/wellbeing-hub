
export const sample_counsellors = [
  {
    id: 'c-101',
    name: 'Dr. Nadia Fernando',
    role: 'Clinical Psychologist',
    focus: ['Anxiety', 'Panic attacks', 'Sleep'],
    languages: ['English', 'Sinhala'],
    location: 'Wellbeing Centre, Block C - Room 2.14',
    bio: 'Nadia has supported university students for eleven years. She works mainly with anxiety, panic and sleep difficulties, using CBT-based tools you can practise between sessions.',
    avatarInitials: 'NF',
    accent: 'brand',
    slots: [
      { id: 's-101-1', day: 'Mon', date: '2026-10-05', time: '09:30', enabled: true },
      { id: 's-101-2', day: 'Mon', date: '2026-10-05', time: '11:00', enabled: true },
      { id: 's-101-3', day: 'Wed', date: '2026-10-07', time: '14:00', enabled: true },
      { id: 's-101-4', day: 'Thu', date: '2026-10-08', time: '16:30', enabled: true },
    ],
  },
  {
    id: 'c-102',
    name: 'Sanjay Perera',
    role: 'Student Counsellor',
    focus: ['Exam stress', 'Procrastination', 'Motivation'],
    languages: ['English', 'Tamil'],
    location: 'Student Services, Ground Floor - Desk 4',
    bio: 'Sanjay focuses on academic pressure: exam panic, deadline spirals and the "I know what to do but I cannot start" loop. Sessions are practical and goal-based.',
    avatarInitials: 'SP',
    accent: 'calm',
    slots: [
      { id: 's-102-1', day: 'Tue', date: '2026-10-06', time: '10:00', enabled: true },
      { id: 's-102-2', day: 'Tue', date: '2026-10-06', time: '13:30', enabled: true },
      { id: 's-102-3', day: 'Fri', date: '2026-10-09', time: '09:00', enabled: true },
    ],
  },
  {
    id: 'c-103',
    name: 'Dr. Amara Silva',
    role: 'Mental Health Practitioner',
    focus: ['Low mood', 'Grief', 'Self-esteem'],
    languages: ['English'],
    location: 'Online only - secure video room',
    bio: 'Amara offers longer-term supportive counselling for low mood, loss and confidence. All of her appointments are held online so you can join from anywhere.',
    avatarInitials: 'AS',
    accent: 'brand',
    slots: [
      { id: 's-103-1', day: 'Mon', date: '2026-10-12', time: '15:00', enabled: true },
      { id: 's-103-2', day: 'Wed', date: '2026-10-14', time: '10:30', enabled: true },
      { id: 's-103-3', day: 'Wed', date: '2026-10-14', time: '12:00', enabled: true },
      { id: 's-103-4', day: 'Fri', date: '2026-10-16', time: '15:30', enabled: true },
    ],
  },
  {
    id: 'c-104',
    name: 'Ishara Bandara',
    role: 'Peer Support Lead',
    focus: ['Homesickness', 'Belonging', 'First-year transition'],
    languages: ['English', 'Sinhala'],
    location: 'Peer Hub, Library Level 1',
    bio: 'Ishara is a trained peer supporter and a final-year student. Perfect for a low-pressure first conversation if you are not sure counselling is for you yet.',
    avatarInitials: 'IB',
    accent: 'calm',
    slots: [
      { id: 's-104-1', day: 'Tue', date: '2026-10-13', time: '16:00', enabled: true },
      { id: 's-104-2', day: 'Thu', date: '2026-10-15', time: '11:30', enabled: true },
    ],
  },
  {
    id: 'c-105',
    name: 'Dr. Kavindu Rajapaksa',
    role: 'Wellbeing Advisor',
    focus: ['Burnout', 'Work-life balance', 'Study skills'],
    languages: ['English', 'Sinhala', 'Tamil'],
    location: 'Wellbeing Centre, Block C - Room 1.06',
    bio: 'Kavindu helps students who are running on empty rebuild a sustainable week: sleep, workload, boundaries and rest that actually restores.',
    avatarInitials: 'KR',
    accent: 'brand',
    slots: [
      { id: 's-105-1', day: 'Mon', date: '2026-10-19', time: '13:00', enabled: true },
      { id: 's-105-2', day: 'Thu', date: '2026-10-22', time: '09:30', enabled: true },
      { id: 's-105-3', day: 'Fri', date: '2026-10-23', time: '11:00', enabled: true },
    ],
  },
  {
    id: 'c-106',
    name: 'Meera Wijeratne',
    role: 'Crisis Support Counsellor',
    focus: ['Crisis support', 'Safety planning', 'Urgent triage'],
    languages: ['English', 'Tamil'],
    location: 'Wellbeing Centre - Urgent Room',
    bio: 'Meera holds same-week urgent appointments. If you need to speak to somebody today, call the 24/7 line rather than waiting for a booking.',
    avatarInitials: 'MW',
    accent: 'calm',
    slots: [
      { id: 's-106-1', day: 'Mon', date: '2026-10-26', time: '08:30', enabled: true },
      { id: 's-106-2', day: 'Tue', date: '2026-10-27', time: '08:30', enabled: true },
      { id: 's-106-3', day: 'Wed', date: '2026-10-28', time: '08:30', enabled: true },
      { id: 's-106-4', day: 'Thu', date: '2026-10-29', time: '08:30', enabled: true },
      { id: 's-106-5', day: 'Fri', date: '2026-10-30', time: '08:30', enabled: true },
    ],
  },
]


export const counsellors = [
 
]

/** Small helper used by the /counsellors/:counsellorId route. */
export function findCounsellorById(id) {
  return counsellors.find((counsellor) => counsellor.id === id)
}

/** Every unique focus area, for the filter chips on the Counsellors page. */
export const focusAreas = [
  ...new Set(counsellors.flatMap((counsellor) => counsellor.focus)),
].sort()
