"use client"

import NextLink from "next/link"
import { useRouter } from "next/navigation"
import { MouseEvent, ReactNode } from "react"

interface LoadingLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
}

export function LoadingLink({ href, children, className, prefetch }: LoadingLinkProps) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Dispatch custom event for loading spinner
    window.dispatchEvent(new Event("navigationStart"))
    
    // Navigate
    router.push(href)
  }

  return (
    <NextLink 
      href={href} 
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
    >
      {children}
    </NextLink>
  )
}
