export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div aria-hidden="true" className={`skeleton ${className}`} />
)
