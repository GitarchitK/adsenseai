'use client'

import { useEffect, useRef } from 'react'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

/**
 * Loads the Razorpay checkout.js script once and returns a function
 * that opens the payment modal.
 */
export function useRazorpay() {
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      loaded.current = true
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT
    script.async = true
    script.onload = () => { loaded.current = true }
    document.head.appendChild(script)   // head, not body
  }, [])

  function openCheckout(options: Record<string, unknown>) {
    return new Promise<void>((resolve, reject) => {
      const tryOpen = () => {
        // @ts-expect-error Razorpay is a global loaded by the script
        if (typeof window.Razorpay !== 'undefined') {
          // @ts-expect-error Razorpay global
          const rzp = new window.Razorpay({
            ...options,
            handler: async (response: unknown) => {
              if (typeof options.handler === 'function') {
                await (options.handler as (r: unknown) => Promise<void>)(response)
              }
              resolve()
            },
            modal: {
              ondismiss: () => reject(new Error('dismissed')),
            },
          })
          rzp.open()
        } else {
          setTimeout(tryOpen, 100)
        }
      }
      tryOpen()
    })
  }

  return { openCheckout }
}
