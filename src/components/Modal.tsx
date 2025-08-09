import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children?: React.ReactNode
  footer?: React.ReactNode
  centered?: boolean
  compact?: boolean
}

export function Modal({ open, title, onClose, children, footer, centered, compact }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [render, setRender] = useState(open)
  const [isClosing, setIsClosing] = useState(false)

  // Sync render state with open prop to allow exit animation
  useEffect(() => {
    if (open) {
      setRender(true)
      setIsClosing(false)
    } else if (render) { // start exit animation
      setIsClosing(true)
      const t = setTimeout(() => {
        setRender(false)
        setIsClosing(false)
      }, 200) // match CSS timing
      return () => clearTimeout(t)
    }
  }, [open, render])

  const requestClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    const t = setTimeout(() => {
      onClose()
    }, 10) // trigger parent state change quickly; effect handles unmount timing
    return () => clearTimeout(t)
  }, [onClose, isClosing])

  // Close on escape
  useEffect(() => {
    if (!render) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [render, requestClose])

  // Simple focus management
  useEffect(() => {
    if (open && panelRef.current) {
      const el = panelRef.current.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      el?.focus()
    }
  }, [open])

  if (!render) return null

  const content = (
    <div className={`modal-overlay${centered ? ' centered' : ''}${isClosing ? ' modal-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modalTitle" onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose() }}>
      <div className={`modal-panel${compact ? ' compact' : ''}${isClosing ? ' modal-closing' : ''}`} ref={panelRef}>
        <button className="modal-close-btn" aria-label="Close" onClick={requestClose}>✕</button>
        <h2 id="modalTitle" className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
        {children && <div className="mb-6">{children}</div>}
        {footer !== undefined && footer === null ? null : (
          <div className="flex gap-3 justify-end">
            {footer !== undefined ? footer : (
              <>
                <Button variant="secondary" onClick={requestClose}>Cancel</Button>
                <Button disabled>Save</Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
