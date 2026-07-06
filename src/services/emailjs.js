import { to12Hour } from '../utils/formatTime'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export async function sendOrderConfirmationEmail(orderData) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_email: orderData.email,
          customer_name: orderData.customerName,
          station_name: orderData.stationName,
          order_type: orderData.orderType,
          order_date: orderData.date,
          order_time: to12Hour(orderData.time),
          reference_number: orderData.referenceNumber,
          total: orderData.grandTotal,
          status: orderData.status,
        },
      }),
    })
    return response.ok
  } catch {
    return false
  }
}
