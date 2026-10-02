import { useEffect, useState } from 'react'

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      setInstallPrompt(event)
    }

    function handleAppInstalled() {
      setInstallPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return

    installPrompt.preventDefault()
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

//   if (isInstalled || !installPrompt) return null

  return (
    <button
      type="button"
      onClick={handleInstall}
      title="Install Wellbeing Hub"
      aria-label="Install Wellbeing Hub"
      className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm
        font-semibold text-brand-800 transition-colors hover:bg-brand-100
        dark:border-brand-700 dark:bg-slate-800 dark:text-brand-100
        dark:hover:border-brand-500 dark:hover:bg-slate-700 dark:hover:text-white"
    >
      Install PWA Web App
    </button>
  )
}
