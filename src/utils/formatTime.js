export function to12Hour(timeStr) {
  if (!timeStr) return timeStr
  return timeStr.replace(/\b(\d{1,2}):(\d{2})\b(?!\s*(?:AM|PM))/gi, (_, h, m) => {
    const hour = parseInt(h, 10)
    const minute = parseInt(m, 10)
    if (hour > 23 || minute > 59) return _
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  })
}
