import { useEffect } from 'react'


export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · Wellbeing Hub` : 'Wellbeing Hub'

    // Cleanup function
    return () => {
      document.title = previous
    }
  }, [title])
}
