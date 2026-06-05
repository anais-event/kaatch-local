// Google Analytics gtag global type declaration
interface Window {
  gtag: (
    command: 'event' | 'config' | 'set' | 'js',
    action: string,
    params?: Record<string, unknown>
  ) => void
}
