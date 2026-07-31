const steps = [
  { num: 1, title: 'Select a Water Station', desc: 'Browse stations on the map or list below. Click "View on Map" to see the location.' },
  { num: 2, title: "Click 'Order Now'", desc: "Tap the 'Order Now' button on your chosen station card." },
  { num: 3, title: 'Choose Water Type and Quantity', desc: 'Select from the water types the station offers. Adjust quantities using + and - buttons.' },
  { num: 4, title: 'Select Pickup or Delivery', desc: 'Choose Delivery (with location) or Pickup. Delivery requires your current location.' },
  { num: 5, title: 'Confirm and Track Order', desc: "Review your order, confirm, and track it in the 'Orders' tab. Payment is Cash on Delivery." },
]

export default function HowToOrderDialog({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-midnight-blue rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-white text-xl font-bold text-center mb-5">How to Order Water</h2>
        {steps.map((step) => (
          <div key={step.num} className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-light-yellow flex items-center justify-center font-bold text-midnight-blue shrink-0">{step.num}</div>
            <div>
              <h3 className="text-[#ECEFF1] font-bold text-base">{step.title}</h3>
              <p className="text-white text-sm mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
        <button onClick={onClose} className="bg-[#ECEFF1] text-midnight-blue w-full py-3 rounded-lg font-bold mt-2">Got It!</button>
      </div>
    </div>
  )
}
