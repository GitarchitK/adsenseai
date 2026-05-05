import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#3aedc3ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Shield outline */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 2L3 5.5v5.25c0 4.375 3.2 8.458 8 9.458 4.8-1 8-5.083 8-9.458V5.5L11 2z"
            fill="rgba(255,255,255,0.15)"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 11l2.5 2.5 5-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
