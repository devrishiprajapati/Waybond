import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { isDisposable } from '@isdisposable/js'
import nodemailer from 'nodemailer'
import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
import { prisma } from './prisma.js'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || true }))
app.use(express.json({ limit: '100mb' }))

const toTrip = (record) => ({ id: record.id, ...record.payload })
const toHeroSlide = (record) => ({ id: record.id, ...record.payload })

const toTrendingCard = (record) => ({ id: record.id, ...record.payload })
const toBooking = (record) => ({ id: record.id, bookingDbId: record.id, ...record.payload })
const PAYMENT_STATUS_OPTIONS = [
  'Online',
  'Cash',
  'Cancelled',
  'Pending Payment',
  'Paid',
  'Failed',
  'Refunded',
  'Partially Paid'
]
const PAYMENT_RECORD_STATUSES = {
  Online: 'PAID',
  Cash: 'CASH',
  Cancelled: 'CANCELLED',
  'Pending Payment': 'PENDING',
  Paid: 'PAID',
  Failed: 'FAILED',
  Refunded: 'REFUNDED',
  'Partially Paid': 'PARTIALLY_PAID'
}
const normalizePaymentStatus = (value) => {
  const status = String(value || '').trim()
  return PAYMENT_STATUS_OPTIONS.find((option) => option.toLowerCase() === status.toLowerCase()) || ''
}
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const disposableEmailMessage = 'Disposable or temporary email addresses are not allowed. Please use a permanent email address.'
const validateAccountEmail = (email) => {
  if (!email) return 'Email is required.'
  if (!isValidEmail(email)) return 'Enter a valid email address.'
  if (isDisposable(email)) return disposableEmailMessage
  return ''
}
const publicUser = ({ passwordHash, ...user }) => user
const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
const passwordMatches = (password, storedHash) => {
  const [salt, hash] = String(storedHash || '').split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'))
}
const mailTransport = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: Number(process.env.EMAIL_PORT || 465) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  })
  : null

const ADMIN_PERMISSIONS = [
  'manage_trips',
  'manage_hero',
  'manage_testimonials',
  'manage_team_members',
  'manage_users',
  'manage_gallery',
  'manage_travel_stories',
  'view_bookings'
]

const MASTER_ADMIN_PERMISSIONS = [
  ...ADMIN_PERMISSIONS,
  'manage_admins'
]

const normalizeText = (value) => String(value || '').trim()
const escapeHtml = (value) => normalizeText(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const getTripDate = (payload) => normalizeText(payload?.nextBatch || payload?.departureDates?.[0] || '')
const getDepartureDates = (payload) => Array.isArray(payload?.departureDates)
  ? payload.departureDates.map(normalizeText).filter(Boolean)
  : []
const parseDateOnly = (value) => {
  const text = normalizeText(value)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}
const datesMatch = (left, right) => {
  const leftText = normalizeText(left)
  const rightText = normalizeText(right)
  if (!leftText || !rightText) return false
  if (leftText === rightText) return true
  const leftDate = parseDateOnly(leftText)
  const rightDate = parseDateOnly(rightText)
  return Boolean(leftDate && rightDate && leftDate.getTime() === rightDate.getTime())
}
const formatTripDate = (value) => {
  const text = normalizeText(value)
  if (!text) return 'To be announced'
  const date = parseDateOnly(text)
  return !date
    ? text
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
const toMoneyNumber = (value) => Number(String(value || '').replace(/[^\d.]/g, '')) || 0
const escapePdfText = (value) => normalizeText(value)
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')
  .replace(/[^\x20-\x7E]/g, '')

const createPdfBuffer = (lines) => {
  const content = [
    'BT',
    '/F1 11 Tf',
    '50 790 Td',
    '14 TL',
    ...lines.flatMap((line, index) => [
      index === 0 ? '/F1 18 Tf' : index === 1 ? '/F1 11 Tf' : '',
      `(${escapePdfText(line)}) Tj`,
      'T*'
    ]).filter(Boolean),
    'ET'
  ].join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, 'utf8')
}

const createInvoicePdf = ({ booking, user, payloadOverride = {} }) => {
  const bookingData = { ...(booking.payload || {}), ...payloadOverride }
  const travelers = Number(bookingData.travelers || 1)
  const pricePerPerson = toMoneyNumber(bookingData.price)
  const subtotal = pricePerPerson * travelers
  const gst = Math.round(subtotal * 0.05)
  const total = subtotal + gst
  const invoiceNumber = `WB-${bookingData.bookingId || booking.id}`

  return createPdfBuffer([
    'WAYBOND INVOICE',
    `Invoice No: ${invoiceNumber}`,
    `Issued On: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    '',
    `Booking ID: ${bookingData.bookingId || booking.id}`,
    `Booking Status: ${bookingData.status || 'Confirmed'}`,
    `Payment Status: ${bookingData.paymentStatus || 'Paid'}`,
    '',
    `Customer: ${user?.name || 'Traveller'}`,
    `Email: ${user?.email || 'Not available'}`,
    '',
    `Trip: ${bookingData.title || 'WayBond Trip'}`,
    `Location: ${bookingData.location || 'Not available'}`,
    `Duration: ${bookingData.duration || 'Not available'}`,
    `Trip Date: ${formatTripDate(bookingData.nextBatch)}`,
    `Travellers: ${travelers}`,
    '',
    `Price Per Person: INR ${pricePerPerson.toLocaleString('en-IN')}`,
    `Subtotal: INR ${subtotal.toLocaleString('en-IN')}`,
    `GST (5%): INR ${gst.toLocaleString('en-IN')}`,
    `Total Amount: INR ${total.toLocaleString('en-IN')}`,
    '',
    'Thank you for booking with WayBond.',
    'Your booking remains confirmed with WayBond.'
  ])
}

const sendTripDateChangeEmail = async ({ booking, user, tripTitle, oldDate, newDate }) => {
  if (!mailTransport || !user?.email) return { sent: false, skipped: true }

  const safeName = escapeHtml(user.name || 'Traveller')
  const subjectTripTitle = normalizeText(tripTitle || booking.payload?.title || 'WayBond Trip')
  const safeTripTitle = escapeHtml(subjectTripTitle)
  const safeBookingId = escapeHtml(booking.payload?.bookingId || booking.id)
  const safeOldDate = escapeHtml(formatTripDate(oldDate))
  const safeNewDate = escapeHtml(formatTripDate(newDate))
  const invoicePdf = createInvoicePdf({ booking, user, payloadOverride: { nextBatch: newDate } })

  await mailTransport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: `WayBond Trip Date Updated - ${subjectTripTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #f8fafc; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 34px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 900;">WAYBOND</h1>
          <p style="color: rgba(255,255,255,0.82); margin: 8px 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.6px;">Trip Date Update</p>
        </div>
        <div style="padding: 30px 22px;">
          <div style="background: #ffffff; border-radius: 14px; padding: 28px; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15,23,42,0.08);">
            <p style="margin: 0 0 18px; font-size: 16px;">Dear ${safeName},</p>
            <p style="margin: 0 0 24px; line-height: 1.6; color: #475569;">
              Your confirmed booking for <strong>${safeTripTitle}</strong> has a revised trip date.
            </p>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">Booking ID</p>
              <p style="margin: 0 0 18px; color: #0f172a; font-size: 16px; font-weight: 800;">${safeBookingId}</p>
              <p style="margin: 0 0 8px; color: #64748b;"><strong>Previous date:</strong> ${safeOldDate}</p>
              <p style="margin: 0; color: #0f172a; font-size: 17px;"><strong>New date:</strong> ${safeNewDate}</p>
            </div>
            <p style="margin: 0; line-height: 1.6; color: #475569;">
              Your booking remains confirmed. An updated invoice with the revised trip date is attached to this email.
            </p>
          </div>
          <p style="text-align: center; color: #64748b; font-size: 12px; margin: 22px 0 0;">
            Need help? Contact the WayBond team.
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename: `WayBond-Invoice-${normalizeText(booking.payload?.bookingId || booking.id)}.pdf`,
      content: invoicePdf,
      contentType: 'application/pdf'
    }]
  })
  return { sent: true, skipped: false }
}

const getTripDateChangePlan = (oldPayload, newPayload, explicitDateChange) => {
  const explicitOldDate = normalizeText(explicitDateChange?.oldDate)
  const explicitNewDate = normalizeText(explicitDateChange?.newDate)
  if (explicitOldDate && explicitNewDate && !datesMatch(explicitOldDate, explicitNewDate)) {
    return {
      oldDate: explicitOldDate,
      newDate: explicitNewDate,
      changedDates: new Map([[explicitOldDate, explicitNewDate]]),
      appliesToAllActiveBookings: false
    }
  }

  const oldDate = getTripDate(oldPayload)
  const newDate = getTripDate(newPayload)
  if (oldDate !== newDate) return { oldDate, newDate, changedDates: new Map(), appliesToAllActiveBookings: true }

  const oldDates = getDepartureDates(oldPayload)
  const newDates = getDepartureDates(newPayload)
  const changedDates = new Map()
  const length = Math.max(oldDates.length, newDates.length)
  for (let index = 0; index < length; index += 1) {
    if (oldDates[index] && newDates[index] && oldDates[index] !== newDates[index]) {
      changedDates.set(oldDates[index], newDates[index])
    }
  }
  return { oldDate, newDate, changedDates, appliesToAllActiveBookings: false }
}

const getMappedDateChange = (date, changedDates) => {
  for (const [oldDate, newDate] of changedDates.entries()) {
    if (datesMatch(date, oldDate)) return { oldDate, newDate }
  }
  return null
}

const updateBookingsForTripDate = async ({ tripId, tripTitle, oldPayload, newPayload, explicitDateChange }) => {
  const dateChange = getTripDateChangePlan(oldPayload, newPayload, explicitDateChange)
  if (!dateChange.appliesToAllActiveBookings && dateChange.changedDates.size === 0) {
    return { updated: 0, emailsSent: 0, emailFailures: 0, oldDate: dateChange.oldDate, newDate: dateChange.newDate }
  }

  const bookings = await prisma.booking.findMany({ include: { user: true }, orderBy: { createdAt: 'asc' } })
  const activeBookings = bookings.filter((booking) => (
    String(booking.payload?.id) === String(tripId) &&
    booking.payload?.status !== 'Cancelled'
  ))

  if (!activeBookings.length) return { updated: 0, emailsSent: 0, emailFailures: 0 }

  const targetBookings = activeBookings.map((booking) => {
    const bookingOldDate = normalizeText(booking.payload?.nextBatch)
    if (dateChange.appliesToAllActiveBookings) {
      return dateChange.newDate ? { booking, oldDate: bookingOldDate || dateChange.oldDate, newDate: dateChange.newDate } : null
    }
    const mappedDateChange = getMappedDateChange(bookingOldDate, dateChange.changedDates)
    return mappedDateChange ? { booking, oldDate: bookingOldDate || mappedDateChange.oldDate, newDate: mappedDateChange.newDate } : null
  }).filter(Boolean)

  if (!targetBookings.length) {
    return { updated: 0, emailsSent: 0, emailFailures: 0, oldDate: dateChange.oldDate, newDate: dateChange.newDate }
  }

  await prisma.$transaction(targetBookings.map(({ booking, oldDate, newDate }) => prisma.booking.update({
    where: { id: booking.id },
    data: {
      payload: {
        ...booking.payload,
        nextBatch: newDate,
        departureDates: Array.isArray(booking.payload?.departureDates)
          ? booking.payload.departureDates.map((date) => datesMatch(date, oldDate) ? newDate : date)
          : booking.payload?.departureDates,
        previousBatch: booking.payload?.nextBatch,
        tripDateUpdatedAt: new Date().toISOString()
      }
    }
  })))

  const mailResults = await Promise.allSettled(targetBookings.map(({ booking, oldDate, newDate }) => sendTripDateChangeEmail({
    booking,
    user: booking.user,
    tripTitle,
    oldDate,
    newDate
  })))

  const emailsSent = mailResults.filter((result) => result.status === 'fulfilled' && result.value.sent).length
  const emailFailures = mailResults.filter((result) => result.status === 'rejected').length
  if (emailFailures) console.error(`Trip date update email failures for trip ${tripId}:`, emailFailures)

  return {
    updated: targetBookings.length,
    emailsSent,
    emailFailures,
    oldDate: dateChange.oldDate,
    newDate: dateChange.newDate
  }
}

app.get('/', (_req, res) => res.json({ service: 'WayBond API', status: 'running', health: '/api/health' }))
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/enquiry', async (req, res, next) => {
  try {
    const { name, phone, email, travelDate, travellers, message, tripTitle, tripLocation, tripDuration } = req.body
    if (!name?.trim() || !phone?.trim()) return res.status(400).json({ message: 'Name and phone are required.' })

    const adminEmail = 'prajapatirishi748@gmail.com'
    const formattedDate = travelDate ? formatTripDate(travelDate) : 'Not specified'

    if (mailTransport) {
      await mailTransport.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: adminEmail,
        subject: `New Enquiry: ${tripTitle || 'Trip'} — ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6495ED 0%, #3b82f6 100%); padding: 32px 28px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: white; letter-spacing: -0.5px;">WAYBOND</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">New Trip Enquiry</p>
            </div>
            <div style="padding: 28px;">
              ${tripTitle ? `
              <div style="background: rgba(100,149,237,0.12); border: 1px solid rgba(100,149,237,0.3); border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Trip of Interest</p>
                <p style="margin: 0; color: #6495ED; font-size: 18px; font-weight: 900;">${tripTitle}</p>
                ${tripLocation ? `<p style="margin: 4px 0 0; color: rgba(255,255,255,0.5); font-size: 12px;">${tripLocation}${tripDuration ? ` &nbsp;·&nbsp; ${tripDuration}` : ''}</p>` : ''}
              </div>` : ''}
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; width: 40%;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: #f8fafc; font-size: 14px; font-weight: 700;">${name}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: #f8fafc; font-size: 14px; font-weight: 700;">+91 ${phone}</td></tr>
                ${email ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: #6495ED; font-size: 14px; font-weight: 700;"><a href="mailto:${email}" style="color: #6495ED;">${email}</a></td></tr>` : ''}
                <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Travel Date</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: #f8fafc; font-size: 14px; font-weight: 700;">${formattedDate}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Travellers</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: #f8fafc; font-size: 14px; font-weight: 700;">${travellers}</td></tr>
                ${message ? `<tr><td style="padding: 10px 0; color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Message</td><td style="padding: 10px 0; color: #f8fafc; font-size: 14px;">${message}</td></tr>` : ''}
              </table>
              <div style="margin-top: 28px; padding: 14px 18px; background: rgba(255,255,255,0.05); border-radius: 10px; font-size: 11px; color: rgba(255,255,255,0.35);">Received ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
            </div>
          </div>
        `
      })
    } else {
      console.log('[Enquiry] Email not configured — logging enquiry:', { name, phone, email, travelDate, travellers, tripTitle })
    }

    res.json({ success: true })
  } catch (error) { next(error) }
})

// Send booking details email to host
app.post('/api/booking-details', async (req, res, next) => {
  try {
    const { tripTitle, tripLocation, tripDuration, tripPrice, departureDate, travellers, numTravellers } = req.body

    const travellersList = travellers.map((t, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
        <td colspan="4" style="padding: 16px; border-bottom: 2px solid #e5e7eb;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; font-size: 15px;">👤 Traveller ${idx + 1}</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 35%;">Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${t.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Age / Gender:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${t.age} years / ${t.gender}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Phone:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">+91 ${t.phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
              <td style="padding: 6px 0; color: #6495ed; font-weight: 600;"><a href="mailto:${t.email}" style="color: #6495ed; text-decoration: none;">${t.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Date of Birth:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${new Date(t.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Location:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${t.city}, ${t.state}</td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('')

    const formattedDeparture = departureDate ? formatTripDate(departureDate) : 'Not specified'

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">
            🎉 New Booking Received
          </h1>
          <p style="color: #cbd5e1; margin: 12px 0 0 0; font-size: 15px; font-weight: 600;">WayBond Travel</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f8fafc;">
          <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 20px 0; font-weight: 800; border-bottom: 3px solid #6495ed; padding-bottom: 12px; display: flex; align-items: center;">
              📍 Trip Details
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 14px 0; color: #64748b; font-weight: 700; width: 35%; font-size: 14px;">Package:</td>
                <td style="padding: 14px 0; color: #0f172a; font-weight: 800; font-size: 18px;">${tripTitle}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 14px 0; color: #64748b; font-weight: 700; font-size: 14px;">Location:</td>
                <td style="padding: 14px 0; color: #0f172a; font-weight: 700;">${tripLocation}</td>
              </tr>
              <tr>
                <td style="padding: 14px 0; color: #64748b; font-weight: 700; font-size: 14px;">Duration:</td>
                <td style="padding: 14px 0; color: #0f172a; font-weight: 700;">${tripDuration}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 14px 0; color: #64748b; font-weight: 700; font-size: 14px;">Price per Person:</td>
                <td style="padding: 14px 0; color: #10b981; font-weight: 900; font-size: 20px;">₹${tripPrice}</td>
              </tr>
              <tr>
                <td style="padding: 14px 0; color: #64748b; font-weight: 700; font-size: 14px;">Departure Date:</td>
                <td style="padding: 14px 0; color: #0f172a; font-weight: 700;">${formattedDeparture}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 14px 0; color: #64748b; font-weight: 700; font-size: 14px;">Number of Travellers:</td>
                <td style="padding: 14px 0; color: #0f172a; font-weight: 900; font-size: 18px;">${numTravellers}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 20px 0; font-weight: 800; border-bottom: 3px solid #6495ed; padding-bottom: 12px;">
              👥 Traveller Details
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${travellersList}
            </table>
          </div>

          <div style="background: linear-gradient(135deg, #6495ed 0%, #4169e1 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 4px 12px rgba(100,149,237,0.3);">
            <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
              ⏰ Booking received on ${new Date().toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short'
    })}
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 600;">
              © ${new Date().getFullYear()} WayBond Travel. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `

    if (mailTransport) {
      await mailTransport.sendMail({
        from: `"WayBond Travel" <${process.env.EMAIL_USER}>`,
        to: 'prajapatirishi748@gmail.com',
        subject: `🎉 New Booking: ${tripTitle} - ${numTravellers} Traveller(s)`,
        html: htmlContent
      })
    } else {
      console.log('[Booking] Email not configured — logging booking details')
    }

    res.json({ success: true, message: 'Booking details sent successfully' })
  } catch (error) {
    console.error('Booking details email error:', error)
    next(error)
  }
})

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const name = String(req.body.name || '').trim()
    const password = String(req.body.password || '')
    const profile = req.body.profile || undefined
    const emailError = validateAccountEmail(email)
    if (!name || password.length < 6) return res.status(400).json({ message: 'Name, email, and a 6-character password are required.' })
    if (emailError) return res.status(400).json({ message: emailError })
    if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ message: 'An account already exists for this email.' })
    const user = await prisma.user.create({ data: { name, email, passwordHash: hashPassword(password), profile } })
    res.status(201).json({ user: publicUser(user) })
  } catch (error) { next(error) }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    if (isDisposable(email)) return res.status(403).json({ message: disposableEmailMessage })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !passwordMatches(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid email or password.' })
    const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    res.json({ user: publicUser(updatedUser) })
  } catch (error) { next(error) }
})

app.post('/api/auth/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const genericMessage = 'If an account exists for this email, an OTP has been sent.'
    if (!email) return res.status(400).json({ message: 'Email is required.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.json({ message: genericMessage })
    if (!mailTransport) return res.status(503).json({ message: 'Email delivery is not configured.' })

    const latestOtp = await prisma.passwordResetOtp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    if (latestOtp && Date.now() - latestOtp.createdAt.getTime() < 60_000) {
      return res.status(429).json({ message: 'Please wait a minute before requesting another OTP.' })
    }

    const otp = String(randomInt(100000, 1000000))
    await prisma.passwordResetOtp.deleteMany({ where: { email } })
    await prisma.passwordResetOtp.create({ data: { email, codeHash: hashPassword(otp), expiresAt: new Date(Date.now() + 10 * 60_000) } })
    try {
      await mailTransport.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'WayBond password reset OTP',
        text: `Your WayBond password reset OTP is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`
      })
    } catch (mailError) {
      await prisma.passwordResetOtp.deleteMany({ where: { email } })
      throw mailError
    }
    res.json({ message: genericMessage })
  } catch (error) { next(error) }
})

app.post('/api/auth/reset-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const otp = String(req.body.otp || '').trim()
    const password = String(req.body.password || '')
    if (!email || !/^\d{6}$/.test(otp) || password.length < 6) return res.status(400).json({ message: 'Enter a valid OTP and a password with at least 6 characters.' })

    const resetOtp = await prisma.passwordResetOtp.findFirst({ where: { email, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } })
    if (!resetOtp) return res.status(400).json({ message: 'This OTP is invalid or has expired.' })
    if (resetOtp.attempts >= 5) {
      await prisma.passwordResetOtp.delete({ where: { id: resetOtp.id } })
      return res.status(400).json({ message: 'Too many attempts. Request a new OTP.' })
    }
    if (!passwordMatches(otp, resetOtp.codeHash)) {
      await prisma.passwordResetOtp.update({ where: { id: resetOtp.id }, data: { attempts: { increment: 1 } } })
      return res.status(400).json({ message: 'Incorrect OTP.' })
    }

    await prisma.user.update({ where: { email }, data: { passwordHash: hashPassword(password) } })
    await prisma.passwordResetOtp.deleteMany({ where: { email } })
    res.json({ message: 'Password updated. You can now sign in.' })
  } catch (error) { next(error) }
})

app.post('/api/auth/admin/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    // Try to find admin in database
    const admin = await prisma.admin.findUnique({ where: { email } })
    
    if (admin && passwordMatches(password, admin.passwordHash)) {
      if (!admin.isActive) {
        return res.status(403).json({ message: 'Your admin account has been deactivated.' })
      }
      
      // Update last login
      const updatedAdmin = await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      })
      
      // Return admin data with permissions
      return res.json({
        admin: {
          id: updatedAdmin.id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          role: updatedAdmin.role,
          permissions: updatedAdmin.permissions
        }
      })
    }
    
    const masterEmail = process.env.MASTER_ADMIN_EMAIL || 'master@waybond.com'
    const masterPassword = process.env.MASTER_ADMIN_PASSWORD || 'master123'

    if (email === masterEmail && password === masterPassword) {
      return res.json({
        admin: {
          id: 'waybond-master-admin',
          name: 'Master Admin',
          email: masterEmail,
          role: 'MASTER_ADMIN',
          permissions: MASTER_ADMIN_PERMISSIONS
        }
      })
    }

    // Fallback to environment variable for backward compatibility
    const envEmail = process.env.ADMIN_EMAIL || 'admin@waybond.local'
    const envPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (email === envEmail && password === envPassword) {
      return res.json({
        admin: {
          id: 'waybond-admin-legacy',
          name: 'WayBond Admin',
          email: envEmail,
          role: 'ADMIN',
          permissions: ADMIN_PERMISSIONS
        }
      })
    }
    
    return res.status(401).json({ message: 'Invalid admin credentials.' })
  } catch (error) {
    next(error)
  }
})

app.get('/api/trips', async (_req, res, next) => {
  try { res.json((await prisma.trip.findMany({ orderBy: { id: 'asc' } })).map(toTrip)) } catch (error) { next(error) }
})

app.get('/api/trips/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(req.params.id) } })
    if (!trip) return res.status(404).json({ message: 'Not found' })
    res.json(toTrip(trip))
  } catch (error) { next(error) }
})

app.post('/api/trips', async (req, res, next) => {
  try { res.status(201).json(toTrip(await prisma.trip.create({ data: { payload: req.body } }))) } catch (error) { next(error) }
})

app.put('/api/trips/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const current = await prisma.trip.findUnique({ where: { id } })
    if (!current) return res.status(404).json({ message: 'Not found' })
    const { _confirmedDateChange, ...requestPayload } = req.body
    const nextPayload = { ...current.payload, ...requestPayload }
    const updatedTrip = await prisma.trip.update({ where: { id }, data: { payload: nextPayload } })
    const notificationResult = await updateBookingsForTripDate({
      tripId: id,
      tripTitle: nextPayload.title,
      oldPayload: current.payload,
      newPayload: nextPayload,
      explicitDateChange: _confirmedDateChange
    })
    if (notificationResult.updated > 0) {
      console.log('[Trip Date Update]', {
        tripId: id,
        oldDate: notificationResult.oldDate,
        newDate: notificationResult.newDate,
        bookingsUpdated: notificationResult.updated,
        emailsSent: notificationResult.emailsSent,
        emailFailures: notificationResult.emailFailures
      })
    }
    res.json(toTrip(updatedTrip))
  } catch (error) { next(error) }
})

app.delete('/api/trips/:id', async (req, res, next) => {
  try { await prisma.trip.delete({ where: { id: Number(req.params.id) } }); res.json({ success: true }) } catch (error) { next(error) }
})

app.get('/api/heroSlides', async (_req, res, next) => {
  try { res.json((await prisma.heroSlide.findMany({ orderBy: { position: 'asc' } })).map(toHeroSlide)) } catch (error) { next(error) }
})

app.post('/api/heroSlides', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Hero slides must be an array' })
    await prisma.$transaction([
      prisma.heroSlide.deleteMany(),
      ...req.body.map((slide, position) => prisma.heroSlide.create({ data: { position, payload: slide } }))
    ])
    res.json({ success: true })
  } catch (error) { next(error) }
})

app.get('/api/trending-cards', async (_req, res, next) => {
  try { res.json((await prisma.trendingCard.findMany({ orderBy: { position: 'asc' } })).map(toTrendingCard)) } catch (error) { next(error) }
})

app.post('/api/trending-cards', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Trending cards must be an array' })
    if (req.body.length > 6) return res.status(400).json({ message: 'A maximum of 6 Trending Adventure cards is allowed.' })
    await prisma.$transaction([
      prisma.trendingCard.deleteMany(),
      ...req.body.map((card, position) => prisma.trendingCard.create({ data: { position, payload: card } }))
    ])
    res.json({ success: true })
  } catch (error) { next(error) }
})

app.get('/api/testimonials', async (_req, res, next) => {
  try { res.json(await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })) } catch (error) { next(error) }
})

app.post('/api/testimonials', async (req, res, next) => {
  try {
    const { name, trip, review, rating, email, media, mediaType, userId } = req.body
    res.status(201).json(await prisma.testimonial.create({ data: { name, trip, review, rating: Number(rating), email, media, mediaType, userId } }))
  } catch (error) { next(error) }
})

app.put('/api/testimonials/:id', async (req, res, next) => {
  try {
    const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ message: 'Testimonial not found' })

    const name = String(req.body.name ?? existing.name).trim()
    const trip = String(req.body.trip ?? existing.trip).trim()
    const review = String(req.body.review ?? existing.review).trim()
    const rating = Math.min(5, Math.max(1, Number(req.body.rating ?? existing.rating)))
    if (!name || !trip || !review || !Number.isFinite(rating)) {
      return res.status(400).json({ message: 'Name, trip, review, and a rating from 1 to 5 are required.' })
    }

    res.json(await prisma.testimonial.update({
      where: { id: existing.id },
      data: { name, trip, review, rating }
    }))
  } catch (error) { next(error) }
})

app.delete('/api/testimonials/:id', async (req, res, next) => {
  try { await prisma.testimonial.delete({ where: { id: req.params.id } }); res.json({ success: true }) } catch (error) { next(error) }
})

app.get('/api/users', async (_req, res, next) => {
  try { res.json((await prisma.user.findMany({ orderBy: { lastLoginAt: 'desc' } })).map(publicUser)) } catch (error) { next(error) }
})

app.get('/api/admin/dashboard', async (_req, res, next) => {
  try {
    const [tripRecords, userCount, bookingCount, testimonialCount] = await prisma.$transaction([
      prisma.trip.findMany({ orderBy: { id: 'asc' } }),
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.booking.count(),
      prisma.testimonial.count()
    ])

    res.json({
      trips: tripRecords.map(toTrip),
      stats: {
        totalPackages: tripRecords.length,
        users: userCount,
        bookings: bookingCount,
        testimonials: testimonialCount
      },
      updatedAt: new Date().toISOString()
    })
  } catch (error) { next(error) }
})

app.get('/api/admin/payment-updates', async (_req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })

    const tripMap = new Map()
    bookings.forEach((booking) => {
      const payload = booking.payload || {}
      const tripKey = String(payload.id || payload.tripId || payload.title || 'unknown-trip')
      const tripTitle = String(payload.title || payload.tripTitle || 'WayBond Trip')
      const tripLocation = String(payload.location || payload.destination || 'Location pending')
      const tripDate = String(payload.nextBatch || payload.departure || payload.departureDate || '')

      if (!tripMap.has(tripKey)) {
        tripMap.set(tripKey, {
          tripId: tripKey,
          title: tripTitle,
          location: tripLocation,
          nextBatch: tripDate,
          bookings: []
        })
      }

      tripMap.get(tripKey).bookings.push({
        ...toBooking(booking),
        user: publicUser(booking.user)
      })
    })

    res.json({
      paymentStatuses: PAYMENT_STATUS_OPTIONS,
      trips: Array.from(tripMap.values()).sort((a, b) => a.title.localeCompare(b.title))
    })
  } catch (error) { next(error) }
})

app.post('/api/users', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const emailError = validateAccountEmail(email)
    if (emailError) return res.status(400).json({ message: emailError })
    const name = String(req.body.name || email.split('@')[0]).trim()
    res.json(publicUser(await prisma.user.upsert({ where: { email }, create: { email, name, passwordHash: hashPassword(randomBytes(20).toString('hex')) }, update: { name } })))
  } catch (error) { next(error) }
})

app.get('/api/users/:id/dashboard', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { bookings: { orderBy: { createdAt: 'desc' } }, testimonials: { orderBy: { createdAt: 'desc' } } } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: publicUser(user), bookings: user.bookings.map(toBooking), testimonials: user.testimonials })
  } catch (error) { next(error) }
})

app.post('/api/users/:id/bookings', async (req, res, next) => {
  try {
    if (req.params.id === 'waybond-admin') {
      return res.status(403).json({ message: 'Admin accounts cannot make bookings.' })
    }
    const booking = await prisma.booking.create({ data: { userId: req.params.id, payload: req.body } })
    res.status(201).json(toBooking(booking))
  } catch (error) { next(error) }
})

app.put('/api/bookings/:bookingId/cancel', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const updatedPayload = { ...booking.payload, status: 'Cancelled', cancelledOn: new Date().toLocaleDateString('en-IN') }
    const updated = await prisma.booking.update({
      where: { id: req.params.bookingId },
      data: { payload: updatedPayload }
    })
    res.json(toBooking(updated))
  } catch (error) { next(error) }
})

app.put('/api/bookings/:bookingId/payment-status', async (req, res, next) => {
  try {
    const paymentStatus = normalizePaymentStatus(req.body.paymentStatus)
    if (!paymentStatus) {
      return res.status(400).json({
        message: `Payment status must be one of: ${PAYMENT_STATUS_OPTIONS.join(', ')}.`
      })
    }

    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const updatedPayload = {
      ...booking.payload,
      paymentStatus,
      paymentStatusUpdatedAt: new Date().toISOString()
    }

    const latestPayment = await prisma.payment.findFirst({
      where: { bookingId: booking.id },
      orderBy: { createdAt: 'desc' }
    })

    const updates = [
      prisma.booking.update({
        where: { id: booking.id },
        data: { payload: updatedPayload }
      })
    ]

    if (latestPayment) {
      updates.push(prisma.payment.update({
        where: { id: latestPayment.id },
        data: { status: PAYMENT_RECORD_STATUSES[paymentStatus] }
      }))
    }

    const [updated] = await prisma.$transaction(updates)
    res.json(toBooking(updated))
  } catch (error) { next(error) }
})

app.post('/api/payments/create-order', async (req, res, next) => {
  try {
    const { bookingId, userId, amount } = req.body
    const amountInPaise = Math.round(Number(amount))
    if (!bookingId || !userId || !Number.isInteger(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ message: 'A valid booking and payment amount are required.' })
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Razorpay is not configured. Add Razorpay keys to backend/.env.' })
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.userId !== userId) return res.status(404).json({ message: 'Booking not found.' })

    const authorization = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${authorization}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `wb_${bookingId}`.slice(0, 40),
        payment_capture: 1
      })
    })
    const order = await razorpayResponse.json()
    if (!razorpayResponse.ok) {
      if (razorpayResponse.status === 401 || razorpayResponse.status === 403) {
        return res.status(503).json({
          message: 'Razorpay authentication failed. Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET with a matching active key pair, then restart the backend.'
        })
      }
      return res.status(502).json({ message: order.error?.description || 'Unable to create Razorpay order.' })
    }

    await prisma.payment.create({
      data: { bookingId, userId, amount: amountInPaise, currency: 'INR', razorpayOrderId: order.id }
    })
    res.status(201).json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (error) { next(error) }
})

app.post('/api/payments/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body
    if (!orderId || !paymentId || !signature || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Invalid payment verification request.' })
    }

    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    const isValid = signature.length === expectedSignature.length
      && timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    if (!isValid) return res.status(400).json({ message: 'Payment verification failed.' })

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } })
    if (!payment) return res.status(404).json({ message: 'Payment order not found.' })
    if (payment.status === 'PAID') return res.json({ success: true })

    const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId }, include: { user: true } })
    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    const payload = {
      ...booking.payload,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentId,
      razorpayOrderId: orderId
    }
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { razorpayPaymentId: paymentId, status: 'PAID' } }),
      prisma.booking.update({ where: { id: booking.id }, data: { payload } })
    ])

    // Send invoice email
    if (mailTransport && booking.user?.email) {
      try {
        const bookingData = toBooking({ ...booking, payload })
        const invoicePdf = createInvoicePdf({ booking: { ...booking, payload }, user: booking.user })
        await mailTransport.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: booking.user.email,
          subject: `WayBond Booking Confirmation - ${bookingData.bookingId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">WAYBOND</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Your Journey, Our Passion</p>
              </div>
              
              <div style="background: #f8fafc; padding: 40px 20px;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">✓ Booking Confirmed!</h2>
                  
                  <p style="color: #475569; margin: 0 0 20px 0; font-size: 16px;">
                    Dear ${booking.user.name},
                  </p>
                  
                  <p style="color: #475569; margin: 0 0 30px 0; line-height: 1.6;">
                    Your booking for <strong>${bookingData.title}</strong> has been confirmed! 
                    Get ready for an unforgettable adventure with WayBond.
                  </p>
                  
                  <div style="background: #f1f5f9; border-left: 4px solid #0ea5e9; padding: 20px; margin: 0 0 30px 0;">
                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Trip:</strong> ${bookingData.title}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Departure:</strong> ${formatTripDate(bookingData.nextBatch)}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Travelers:</strong> ${bookingData.travelers}</p>
                    <p style="margin: 0; color: #1e293b;"><strong>Amount Paid:</strong> ₹${Number(bookingData.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <p style="color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                    You can view your complete booking details and download your invoice anytime from your dashboard.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/dashboard/${booking.userId}" 
                       style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                      VIEW MY DASHBOARD
                    </a>
                  </div>
                </div>
              </div>
              
              <div style="background: #1e293b; padding: 30px 20px; text-align: center;">
                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">
                  Need help? Contact us at <a href="mailto:support@waybond.com" style="color: #0ea5e9;">support@waybond.com</a>
                </p>
                <p style="color: #64748b; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} WayBond. All rights reserved.
                </p>
              </div>
            </div>
          `,
          attachments: [{
            filename: `WayBond-Invoice-${normalizeText(bookingData.bookingId || booking.id)}.pdf`,
            content: invoicePdf,
            contentType: 'application/pdf'
          }]
        })
        console.log(`Invoice email sent to ${booking.user.email}`)
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError)
        // Don't fail the payment verification if email fails
      }
    }

    res.json({ success: true, booking: toBooking({ ...booking, payload }) })
  } catch (error) { next(error) }
})

app.get('/api/community-galleries', async (_req, res, next) => {
  try {
    const galleries = await prisma.communityGallery.findMany({ orderBy: { destination: 'asc' } })
    if (!galleries.length) return res.status(404).json({ message: 'No gallery data yet' })
    res.json(galleries.map(({ slug, destination, label, images }) => ({ slug, destination, label, images })))
  } catch (error) { next(error) }
})

app.put('/api/community-galleries', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Gallery data must be an array' })
    await prisma.$transaction(req.body.map((gallery) => prisma.communityGallery.upsert({
      where: { slug: gallery.slug },
      create: { slug: gallery.slug, destination: gallery.destination, label: gallery.label, images: gallery.images },
      update: { destination: gallery.destination, label: gallery.label, images: gallery.images }
    })))
    res.json({ success: true })
  } catch (error) { next(error) }
})

app.get('/api/team-members', async (_req, res, next) => {
  try { res.json(await prisma.teamMember.findMany({ orderBy: { position: 'asc' } })) } catch (error) { next(error) }
})

app.post('/api/team-members', async (req, res, next) => {
  try {
    const { name, designation, shortBio, fullBio, image, email, phone, linkedin, twitter, position, isActive } = req.body
    if (!name?.trim() || !designation?.trim() || !image) return res.status(400).json({ message: 'Name, designation, and image are required.' })
    res.status(201).json(await prisma.teamMember.create({ data: { name, designation, shortBio: shortBio || '', fullBio: fullBio || '', image, email: email || null, phone: phone || null, linkedin: linkedin || null, twitter: twitter || null, position: Number(position ?? 0), isActive: Boolean(isActive ?? true) } }))
  } catch (error) { next(error) }
})

app.put('/api/team-members/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!await prisma.teamMember.findUnique({ where: { id } })) return res.status(404).json({ message: 'Team member not found' })
    const { name, designation, shortBio, fullBio, image, email, phone, linkedin, twitter, position, isActive } = req.body
    res.json(await prisma.teamMember.update({ where: { id }, data: { name, designation, shortBio, fullBio, image, email: email || null, phone: phone || null, linkedin: linkedin || null, twitter: twitter || null, position: Number(position ?? 0), isActive: Boolean(isActive ?? true) } }))
  } catch (error) { next(error) }
})

app.delete('/api/team-members/:id', async (req, res, next) => {
  try { await prisma.teamMember.delete({ where: { id: Number(req.params.id) } }); res.json({ success: true }) } catch (error) { next(error) }
})

// ============= ADMIN MANAGEMENT ENDPOINTS =============

// Get all admins (Master Admin only)
app.get('/api/admins', async (req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        createdBy: true
      }
    })
    res.json(admins)
  } catch (error) {
    next(error)
  }
})

// Get single admin by ID
app.get('/api/admins/:id', async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        createdBy: true
      }
    })
    if (!admin) return res.status(404).json({ message: 'Admin not found' })
    res.json(admin)
  } catch (error) {
    next(error)
  }
})

// Create new admin (Master Admin only)
app.post('/api/admins', async (req, res, next) => {
  try {
    const { name, email, password, role, permissions, createdBy } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const emailError = validateAccountEmail(normalizedEmail)
    
    if (!name?.trim() || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, email, and a password with at least 6 characters are required.' })
    }

    if (emailError) return res.status(400).json({ message: emailError })
    
    if (role !== 'ADMIN' && role !== 'MASTER_ADMIN') {
      return res.status(400).json({ message: 'Role must be either ADMIN or MASTER_ADMIN' })
    }
    
    // Check if email already exists
    const existing = await prisma.admin.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return res.status(409).json({ message: 'An admin with this email already exists.' })
    }
    
    const admin = await prisma.admin.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role,
        permissions: Array.isArray(permissions) ? permissions : [],
        createdBy: createdBy || null,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        createdBy: true
      }
    })
    
    res.status(201).json(admin)
  } catch (error) {
    next(error)
  }
})

// Update admin (Master Admin only)
app.put('/api/admins/:id', async (req, res, next) => {
  try {
    const { name, email, password, role, permissions, isActive } = req.body
    const id = req.params.id
    const normalizedEmail = email ? String(email).trim().toLowerCase() : ''
    
    const existing = await prisma.admin.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Admin not found' })
    }
    
    // Check if email is being changed and if it's already taken
    if (normalizedEmail && normalizedEmail !== existing.email) {
      const emailError = validateAccountEmail(normalizedEmail)
      if (emailError) return res.status(400).json({ message: emailError })

      const emailTaken = await prisma.admin.findUnique({ where: { email: normalizedEmail } })
      if (emailTaken) {
        return res.status(409).json({ message: 'This email is already in use by another admin.' })
      }
    }
    
    const updateData = {}
    if (name) updateData.name = name.trim()
    if (normalizedEmail) updateData.email = normalizedEmail
    if (password && password.length >= 6) updateData.passwordHash = hashPassword(password)
    if (role) updateData.role = role
    if (permissions !== undefined) updateData.permissions = Array.isArray(permissions) ? permissions : []
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    
    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        createdBy: true
      }
    })
    
    res.json(admin)
  } catch (error) {
    next(error)
  }
})

// Delete admin (Master Admin only)
app.delete('/api/admins/:id', async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } })
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }
    
    // Prevent deleting Master Admin
    if (admin.role === 'MASTER_ADMIN') {
      return res.status(403).json({ message: 'Cannot delete Master Admin account' })
    }
    
    await prisma.admin.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Get available permissions list
app.get('/api/admins/permissions/list', async (_req, res, next) => {
  try {
    const permissions = [
      { key: 'manage_trips', label: 'Manage Trips', description: 'Create, edit, and delete trip packages' },
      { key: 'manage_hero', label: 'Manage Hero Section', description: 'Edit trending adventure cards and hero slides' },
      { key: 'manage_testimonials', label: 'Manage Testimonials', description: 'View, edit, and delete testimonials' },
      { key: 'manage_team_members', label: 'Manage Team Members', description: 'Add, edit, and remove team members' },
      { key: 'manage_users', label: 'Manage Users', description: 'View and manage registered users' },
      { key: 'manage_gallery', label: 'Manage Gallery', description: 'Upload and manage gallery images' },
      { key: 'manage_travel_stories', label: 'Manage Travel Stories', description: 'Create and edit travel stories' },
      { key: 'view_bookings', label: 'View Bookings', description: 'View all booking details and statistics' },
      { key: 'manage_admins', label: 'Manage Admins', description: 'Create and manage admin users (Master Admin only)' }
    ]
    res.json(permissions)
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: process.env.NODE_ENV === 'development' ? error.message : 'Unexpected server error' })
})

app.listen(port, () => console.log(`WayBond API running on http://localhost:${port}`))
