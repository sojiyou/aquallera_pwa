export default function Spinner({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`w-8 h-8 border-[3px] border-midnight-blue border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}
