import api from './api'

const wait = (ms = 600) => new Promise((res) => setTimeout(res, ms))

function computeCharges({ serviceCharge = 0, travelCharge = 0, partsCost = 0, additional = 0 }) {
  const subtotal = serviceCharge + travelCharge + partsCost + additional
  return { serviceCharge, travelCharge, partsCost, additional, total: subtotal }
}

async function payMock({ requestId, method, amount }) {
  try {
    const paymentMethod = (method || 'CASH').toUpperCase()
    const res = await api.post('/payments/create/', {
      request_number: requestId,
      payment_method: paymentMethod,
    })
    const payment = res.data.data
    // Process the payment
    const procRes = await api.post(`/payments/${payment.id}/process/`, {})
    const processed = procRes.data.data
    return {
      success: true,
      transactionId: processed.transaction_id || `TXN-${payment.id}`,
      requestId,
      method: paymentMethod,
      amount: processed.total_amount ? parseFloat(processed.total_amount) : amount,
      status: processed.payment_status || 'PAID',
      paidAt: processed.paid_at || new Date().toISOString(),
    }
  } catch (err) {
    await wait()
    return {
      success: true,
      transactionId: `TXN-${Date.now().toString().slice(-8)}`,
      requestId,
      method,
      amount,
      status: 'PAID',
      paidAt: new Date().toISOString(),
    }
  }
}

export const paymentService = { computeCharges, payMock }
export default paymentService