import { COMPANY_INFO } from '../types';

/**
 * Format Qatar mobile or international phone to digits only for WhatsApp
 */
export function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return '9743339335';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('00974')) {
    cleaned = cleaned.substring(2);
  } else if (!cleaned.startsWith('974') && cleaned.length <= 8) {
    cleaned = '974' + cleaned;
  }
  return cleaned;
}

/**
 * Generate a WhatsApp click-to-chat URL with encoded message
 */
export function createWhatsAppLink(phone: string, message: string): string {
  const cleaned = cleanPhoneForWhatsApp(phone);
  const encodedMsg = encodeURIComponent(message.trim());
  return `https://wa.me/${cleaned}?text=${encodedMsg}`;
}

/**
 * Generate a Mailto link with subject and body
 */
export function createMailtoLink(email: string, subject: string, body: string): string {
  const encSubject = encodeURIComponent(subject.trim());
  const encBody = encodeURIComponent(body.trim());
  return `mailto:${email}?subject=${encSubject}&body=${encBody}`;
}

/**
 * Pre-formatted templates for Admin -> Customer and Technician -> Customer / Admin
 */
export const WhatsAppTemplates = {
  serviceScheduled: (customerName: string, jobCardNo: string, date: string, time: string, machine: string) => `
السلام عليكم / Greetings ${customerName},
This is Bubble Up Trading & Maintenance (Doha, Qatar).

Your laundry equipment service call *#${jobCardNo}* for *${machine}* has been scheduled:
📅 Date: ${date}
⏰ Time: ${time}
📍 Location: ${COMPANY_INFO.address}

Our certified technician will arrive on time. For urgent queries, contact us at ${COMPANY_INFO.mobile}.
`.trim(),

  technicianDispatched: (customerName: string, jobCardNo: string, techName: string, techPhone: string) => `
Greetings ${customerName},
Bubble Up Trading service update for Job *#${jobCardNo}*:

Our field engineer *${techName}* (${techPhone}) is currently on the way to your facility. Please ensure equipment area access is available.
`.trim(),

  jobCompleted: (customerName: string, jobCardNo: string, machine: string, totalAmount: number, balance: number) => `
Greetings ${customerName},
Your commercial laundry equipment *${machine}* has been successfully serviced and tested under Job Card *#${jobCardNo}*.

💰 Total Invoiced: QAR ${totalAmount.toLocaleString()}
💳 Outstanding Balance: QAR ${balance.toLocaleString()}

Thank you for choosing Bubble Up Trading & Maintenance.
Email: ${COMPANY_INFO.email} | Mobile: ${COMPANY_INFO.mobile}
`.trim(),

  paymentReminder: (customerName: string, invoiceNo: string, balance: number) => `
Dear ${customerName},
Friendly reminder from Bubble Up Trading & Maintenance regarding Invoice *#${invoiceNo}*.

Outstanding Amount: *QAR ${balance.toLocaleString()}*
Bank Transfer & Cheque payments accepted.
CR No: ${COMPANY_INFO.crNumber} | Tel: ${COMPANY_INFO.mobile}
`.trim(),

  customInquiry: (customerName: string) => `
Greetings ${customerName},
This is the operations team from Bubble Up Trading & Maintenance (Commercial Laundry Equipment Services, Qatar).

How may we assist with your laundry equipment today?
`.trim(),
};
