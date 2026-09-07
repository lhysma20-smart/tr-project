import { Link, useNavigate } from 'react-router-dom'

export function Shell({ children, title, back }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-6">
        <header className="mb-6 flex items-center gap-3">
          {back ? (
            <button
              type="button"
              onClick={() => navigate(back === true ? -1 : back)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-lg"
            >
              ←
            </button>
          ) : (
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm font-bold text-amberx">
              TI
            </Link>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="w-full rounded-2xl bg-amberx py-4 text-base font-bold text-ink disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', onClick }) {
  return (
    <div onClick={onClick} className={`rounded-3xl border border-line bg-card p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}
