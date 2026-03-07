'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface DragPosition {
  x: number
  y: number
}

export default function TawkToWidget() {
  const pathname = usePathname()
  const dragContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<DragPosition>({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [screenBounds, setScreenBounds] = useState({ width: 0, height: 0 })
  const [isHydrated, setIsHydrated] = useState(false)

  // Load saved position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('tawk_chat_position')
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition)
        setPosition(parsed)
      } catch (e) {
        // Invalid data, use defaults
      }
    }
    
    // Set initial screen bounds
    setScreenBounds({
      width: window.innerWidth,
      height: window.innerHeight
    })
    
    // Mark as hydrated to enable rendering
    setIsHydrated(true)
  }, [])

  // Handle window resize to update bounds
  useEffect(() => {
    const handleResize = () => {
      setScreenBounds({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragContainerRef.current) return
    
    // Only drag from the bubble itself, not from content inside
    if ((e.target as HTMLElement).closest('.tawk-min-container')) {
      const rect = dragContainerRef.current.getBoundingClientRect()
      setIsDragging(true)
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !dragContainerRef.current || screenBounds.width === 0) return

    e.preventDefault()

    const bubbleWidth = 60 // Approximate bubble size
    const bubbleHeight = 60
    const navbarHeight = 90 // py-4 (16px) + icon/content height (~74px)
    const padding = 12 // Safe margin from edges

    // Calculate new position
    let newX = e.clientX - offset.x
    let newY = e.clientY - offset.y

    // Boundary detection - keep within screen
    newX = Math.max(padding, Math.min(newX, screenBounds.width - bubbleWidth - padding))
    newY = Math.max(padding, Math.min(newY, screenBounds.height - bubbleHeight - navbarHeight - padding))

    setPosition({ x: newX, y: newY })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    
    // Save position to localStorage
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('tawk_chat_position', JSON.stringify(position))
    }
  }

  // Attach global pointer listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
      
      return () => {
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [isDragging, offset, screenBounds])

  useEffect(() => {
    // Don't load Tawk.to on support page
    if (pathname === '/my-account/support') {
      return
    }
    
    // Check if we're in the browser
    if (typeof window === 'undefined') return
    
    // Check if Tawk.to script is already loaded
    const existingScript = document.getElementById('tawk-to-global-script')
    if (existingScript) return

    // Add custom CSS with draggable styling
    const style = document.createElement('style')
    style.id = 'tawk-global-css'
    style.textContent = `
      .tawk-draggable-container {
        position: fixed;
        touch-action: none;
        z-index: 10000;
        transition: ${isDragging ? 'none' : 'opacity 0.3s ease-out'};
      }
      
      .tawk-draggable-container.dragging {
        cursor: grabbing;
        opacity: 0.9;
      }

      .tawk-draggable-container:not(.dragging) {
        cursor: grab;
      }

      .tawk-min-container.tawk-min-bottom-right {
        bottom: auto !important;
        right: auto !important;
        position: relative;
      }
      
      .tawk-min-container.tawk-min-bottom-left {
        bottom: auto !important;
        left: auto !important;
        position: relative;
      }
      
      .tawk-min-container {
        z-index: auto !important;
      }
      
      .tawk-max-container {
        z-index: 10001 !important;
      }

      nav.fixed.bottom-0 {
        z-index: 9990 !important;
      }

      /* Ensure chat is accessible on touch devices */
      @media (max-width: 768px) {
        .tawk-draggable-container {
          pointer-events: auto;
        }
      }
    `
    document.head.appendChild(style)

    // Create and load Tawk.to script
    const s1 = document.createElement('script')
    const s0 = document.getElementsByTagName('script')[0]
    s1.id = 'tawk-to-global-script'
    s1.async = true
    s1.src = 'https://embed.tawk.to/6988bf432fb5be1c3a2b1c69/1jgv2m84j'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')
    s0.parentNode.insertBefore(s1, s0)

    // Set Tawk_API configuration - disable default positioning
    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: 'br',
          xOffset: 0,
          yOffset: 0
        },
        mobile: {
          position: 'br',
          xOffset: 0,
          yOffset: 0
        }
      }
    }

    // Cleanup
    return () => {
      if (s1.parentNode) {
        s1.parentNode.removeChild(s1)
      }
      const styleEl = document.getElementById('tawk-global-css')
      if (styleEl) {
        styleEl.remove()
      }
      // Reset Tawk_API
      window.Tawk_API = undefined
    }
  }, [pathname, isDragging])

  // Position: default to bottom-right if not dragged yet
  // Only calculate after hydration to avoid mismatch
  const defaultX = isHydrated ? window.innerWidth - 90 : 0
  const defaultY = isHydrated ? window.innerHeight - 180 : 0
  const finalX = position.x || defaultX
  const finalY = position.y || defaultY

  // Only render the positioned div after client-side hydration
  if (!isHydrated) {
    return null
  }

  return (
    <div
      ref={dragContainerRef}
      className={`tawk-draggable-container ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${finalX}px`,
        top: `${finalY}px`,
        width: '60px',
        height: '60px'
      }}
      onPointerDown={handlePointerDown}
    />
  )
}
