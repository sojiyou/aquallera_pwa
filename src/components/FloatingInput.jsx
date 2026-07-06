import { useState } from 'react'

export default function FloatingInput({ label, type = 'text', name, value, onChange, required, className = '' }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value

  return (
    <div className={`relative mb-3 ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-14 px-4 pt-5 rounded-lg bg-[#D9D9D9] border-0 text-base text-midnight-blue focus:outline-none focus:ring-2 focus:ring-midnight-blue/30"
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
    </div>
  )
}