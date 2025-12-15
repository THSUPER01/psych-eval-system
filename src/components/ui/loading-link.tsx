import { Link, useNavigate } from 'react-router-dom'
import type { MouseEvent, ReactNode } from 'react'

interface LoadingLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
}

export function LoadingLink({ href, children, className }: LoadingLinkProps) {
  const navigate = useNavigate()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Dispatch custom event for loading spinner
    window.dispatchEvent(new Event('navigationStart'))
    
    // Navigate
    navigate(href)
  }

  return (
    <Link 
      to={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
