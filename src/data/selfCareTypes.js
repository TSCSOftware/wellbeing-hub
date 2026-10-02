
export const selfCareTypes = [
  { id: 'sleep', label: 'Slept 7+ hours', icon: '🌙', points: 3, blurb: 'A full night, not a nap-and-hope.' },
  { id: 'movement', label: 'Movement / exercise', icon: '🏃', points: 3, blurb: 'Walk, gym, dance, stairs - it all counts.' },
  { id: 'breathing', label: 'Breathing / meditation', icon: '🫁', points: 2, blurb: 'Even two minutes of box breathing.' },
  { id: 'outdoors', label: 'Time outdoors', icon: '🌳', points: 2, blurb: 'Daylight on your face.' },
  { id: 'social', label: 'Connected with someone', icon: '💬', points: 3, blurb: 'A real conversation, not a scroll.' },
  { id: 'meal', label: 'Proper meal', icon: '🍲', points: 2, blurb: 'Sat down and actually ate it.' },
  { id: 'hobby', label: 'Hobby / creative time', icon: '🎨', points: 2, blurb: 'Something with no deadline attached.' },
  { id: 'break', label: 'Took a real break', icon: '☕', points: 1, blurb: 'Away from the desk and the screen.' },
  { id: 'journal', label: 'Journalled', icon: '📓', points: 2, blurb: 'Got it out of your head and onto paper.' },
  { id: 'screenfree', label: 'Screen-free hour', icon: '📵', points: 2, blurb: 'Phone in another room.' },
  { id: 'reading', label: 'Read a wellbeing resource', icon: '📚', points: 1, blurb: 'Learning a technique counts too.' },
]

export function findSelfCareType(id) {
  return selfCareTypes.find((type) => type.id === id)
}

/** Mood scale used by the mood tracker  */
export const moodScale = [
  { value: 1, emoji: '😞', label: 'Really low' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]
