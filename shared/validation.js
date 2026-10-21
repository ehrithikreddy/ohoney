// Form rules shared by the storefront (instant feedback) and the API (enforcement).
// Each validator returns { values, errors }: `values` holds trimmed, normalised input
// and `errors` maps a field name to a message written for the customer.

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PINCODE = /^[1-9][0-9]{5}$/

const text = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '')
const multiline = (v) => (typeof v === 'string' ? v.trim().replace(/\r\n/g, '\n') : '')

/** Accepts "98765 43210", "+91 98765-43210", "098765 43210"; returns "9876543210" or null. */
export function normaliseIndianMobile(raw) {
  const digits = typeof raw === 'string' ? raw.replace(/[\s\-()]/g, '') : ''
  const m = digits.match(/^(?:\+?91|0)?([6-9][0-9]{9})$/)
  return m ? m[1] : null
}

function check(errors, field, ok, message) {
  if (!ok && !errors[field]) errors[field] = message
}

const lengthBetween = (s, min, max) => s.length >= min && s.length <= max

export function validateCheckout(input = {}) {
  const errors = {}
  const values = {
    name: text(input.name),
    email: text(input.email).toLowerCase(),
    phone: normaliseIndianMobile(input.phone) ?? text(input.phone),
    address1: text(input.address1),
    address2: text(input.address2),
    city: text(input.city),
    state: text(input.state),
    pincode: text(input.pincode).replace(/\s/g, ''),
    notes: multiline(input.notes),
  }

  check(errors, 'name', lengthBetween(values.name, 2, 80), 'Enter your full name.')
  check(errors, 'email', EMAIL.test(values.email) && values.email.length <= 254, 'Enter an email address, like name@example.com.')
  check(errors, 'phone', normaliseIndianMobile(values.phone) !== null, 'Enter a 10-digit Indian mobile number.')
  check(errors, 'address1', lengthBetween(values.address1, 5, 160), 'Enter your house number and street.')
  check(errors, 'address2', values.address2.length <= 160, 'Keep this line under 160 characters.')
  check(errors, 'city', lengthBetween(values.city, 2, 60), 'Enter your town or city.')
  check(errors, 'state', INDIAN_STATES.includes(values.state), 'Choose your state or union territory.')
  check(errors, 'pincode', PINCODE.test(values.pincode), 'Enter a 6-digit PIN code.')
  check(errors, 'notes', values.notes.length <= 300, 'Keep delivery notes under 300 characters.')

  return { values, errors }
}

export const ENQUIRY_TYPES = ['contact', 'wholesale']

export function validateEnquiry(input = {}) {
  const errors = {}
  const type = ENQUIRY_TYPES.includes(input.type) ? input.type : null
  const values = {
    type,
    name: text(input.name),
    email: text(input.email).toLowerCase(),
    phone: text(input.phone),
    message: multiline(input.message),
    business: text(input.business),
    city: text(input.city),
    volume: text(input.volume),
  }

  if (!type) errors.type = 'Unknown enquiry type.'
  check(errors, 'name', lengthBetween(values.name, 2, 80), 'Enter your name.')
  check(errors, 'email', EMAIL.test(values.email) && values.email.length <= 254, 'Enter an email address, like name@example.com.')

  if (type === 'wholesale') {
    check(errors, 'business', lengthBetween(values.business, 2, 120), 'Enter your business name.')
    check(errors, 'phone', normaliseIndianMobile(values.phone) !== null, 'Enter a 10-digit Indian mobile number.')
    check(errors, 'city', lengthBetween(values.city, 2, 80), 'Enter the city you are based in.')
    check(errors, 'volume', values.volume.length <= 80, 'Keep this under 80 characters.')
    check(errors, 'message', values.message.length <= 2000, 'Keep your message under 2,000 characters.')
  } else {
    check(errors, 'phone', values.phone === '' || normaliseIndianMobile(values.phone) !== null, 'Enter a 10-digit Indian mobile number, or leave this blank.')
    check(errors, 'message', lengthBetween(values.message, 10, 2000), 'Write a message of at least 10 characters.')
  }
  if (values.phone) values.phone = normaliseIndianMobile(values.phone) ?? values.phone

  return { values, errors }
}
