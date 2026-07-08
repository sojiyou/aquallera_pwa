import { useState } from 'react'

export default function FloatingInput({ label, type = 'text', name, value, onChange, required, className = '' }) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const active = focused || value
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`relative mb-3 ${className}`}>
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full h-14 px-4 pt-5 rounded-lg bg-[#D9D9D9] border-0 text-base text-midnight-blue focus:outline-none focus:ring-2 focus:ring-midnight-blue/30 ${isPassword ? 'pr-11' : ''}`}
      />
      <label
        className={`absolute left-4 transition-all duration-150 pointer-events-none ${
          active
            ? 'top-1.5 text-xs text-gray-500'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
        }`}
      >
        {label}{required && ' *'}
      </label>
      {isPassword && value && (
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-midnight-blue"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      )}
    </div>
  )
}