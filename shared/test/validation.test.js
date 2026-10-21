import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normaliseIndianMobile, validateCheckout, validateEnquiry } from '../validation.js'

const goodAddress = {
  name: 'Asha Rao',
  email: 'Asha@Example.com ',
  phone: '+91 98765-43210',
  address1: '12 MG Road',
  address2: '',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500 001',
  notes: '',
}

test('normalises Indian mobile numbers', () => {
  for (const ok of ['9876543210', '+919876543210', '+91 98765 43210', '098765 43210', '91-98765-43210']) {
    assert.equal(normaliseIndianMobile(ok), '9876543210', ok)
  }
  for (const bad of ['abcdefghij', '1234567890', '98765', '98765432101', '', null]) {
    assert.equal(normaliseIndianMobile(bad), null, String(bad))
  }
})

test('accepts a valid checkout and normalises values', () => {
  const { values, errors } = validateCheckout(goodAddress)
  assert.deepEqual(errors, {})
  assert.equal(values.email, 'asha@example.com')
  assert.equal(values.phone, '9876543210')
  assert.equal(values.pincode, '500001')
})

test('rejects the inputs the old checkout accepted', () => {
  const { errors } = validateCheckout({ ...goodAddress, phone: 'abcdefghij', pincode: 'abcdef' })
  assert.ok(errors.phone)
  assert.ok(errors.pincode)
})

test('requires every mandatory checkout field', () => {
  const { errors } = validateCheckout({})
  assert.deepEqual(Object.keys(errors).sort(), ['address1', 'city', 'email', 'name', 'phone', 'pincode', 'state'])
})

test('rejects unknown states, PIN codes starting with 0 and oversized notes', () => {
  assert.ok(validateCheckout({ ...goodAddress, state: 'Atlantis' }).errors.state)
  assert.ok(validateCheckout({ ...goodAddress, pincode: '012345' }).errors.pincode)
  assert.ok(validateCheckout({ ...goodAddress, notes: 'x'.repeat(301) }).errors.notes)
})

test('ignores non-string input without throwing', () => {
  const { errors } = validateCheckout({ name: { $gt: '' }, email: ['a@b.co'], phone: 9876543210 })
  assert.ok(errors.name && errors.email && errors.phone)
})

test('contact enquiries need a message; phone is optional but must be valid if given', () => {
  const base = { type: 'contact', name: 'Asha', email: 'a@example.com', message: 'Do you ship to Pune?' }
  assert.deepEqual(validateEnquiry(base).errors, {})
  assert.ok(validateEnquiry({ ...base, message: 'hi' }).errors.message)
  assert.ok(validateEnquiry({ ...base, phone: '123' }).errors.phone)
  assert.equal(validateEnquiry({ ...base, phone: '+91 98765 43210' }).values.phone, '9876543210')
})

test('wholesale enquiries need business, phone and city', () => {
  const { errors } = validateEnquiry({ type: 'wholesale', name: 'Asha', email: 'a@example.com' })
  assert.deepEqual(Object.keys(errors).sort(), ['business', 'city', 'phone'])
})

test('rejects unknown enquiry types', () => {
  assert.ok(validateEnquiry({ type: 'admin', name: 'A', email: 'a@example.com', message: 'x'.repeat(20) }).errors.type)
})

test('email addresses cannot smuggle display names or extra recipients', () => {
  const ok = (email) => !validateEnquiry({ type: 'contact', name: 'Ab', email, message: 'hello there friend' }).errors.email
  for (const good of ['a@b.co', 'first.last@sub.example.in', 'x@xn--p1ai.xn--p1ai']) assert.ok(ok(good), good)
  for (const bad of ['x<victim@a.com>', 'a,b@c.com', '"a"@b.co', 'a@b', 'a@.com', 'a@b..com', 'a@' + '.'.repeat(19000) + '@']) assert.ok(!ok(bad), bad.slice(0, 30))
})

test('contact enquiries drop wholesale-only fields', () => {
  const { values } = validateEnquiry({ type: 'contact', name: 'Ab', email: 'a@b.co', message: 'hello there friend', business: 'x'.repeat(20000), city: 'y', volume: 'z' })
  assert.deepEqual([values.business, values.city, values.volume], ['', '', ''])
})
