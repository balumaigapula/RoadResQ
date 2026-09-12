import api from './api'

const wait = (ms = 400) => new Promise((res) => setTimeout(res, ms))

async function getInvoiceById(id) {
  try {
    const res = await api.get(`/invoices/${id}/`)
    return res.data.data || res.data
  } catch (err) {
    await wait()
    return {
      id,
      requestId: `RR-${id.slice(-8)}`,
      issuedAt: new Date().toISOString(),
      status: 'PAID',
    }
  }
}

async function downloadInvoice(id) {
  try {
    const res = await api.get(`/invoices/${id}/pdf/`, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `RoadResQ-Invoice-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    return { success: true, message: 'Invoice downloaded successfully.' }
  } catch (err) {
    return { success: false, message: 'PDF invoice download failed.' }
  }
}

export const invoiceService = { getInvoiceById, downloadInvoice }
export default invoiceService