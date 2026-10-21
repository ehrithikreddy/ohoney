import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { buildApp } from './helpers.js'

const contact = { type: 'contact', name: 'Ravi', email: 'ravi@example.com', message: 'Do you deliver to Pune?' }
const wholesale = { type: 'wholesale', business: 'Green Grocer', name: 'Ravi', email: 'ravi@example.com', phone: '9876543210', city: 'Pune', volume: '20 kg', message: '' }

test('stores a contact message and emails the business with reply-to set', async () => {
  const { app, store, mailer } = buildApp()
  const res = await request(app).post('/api/enquiries').send(contact)
  assert.equal(res.status, 201)
  assert.equal(await store.enquiries.count(), 1)
  assert.equal(mailer.sent.length, 1)
  assert.equal(mailer.sent[0].to, 'orders@ohoney.test')
  assert.equal(mailer.sent[0].replyTo, 'ravi@example.com')
})

test('accepts a wholesale enquiry and rejects an incomplete one', async () => {
  const { app } = buildApp()
  assert.equal((await request(app).post('/api/enquiries').send(wholesale)).status, 201)
  const res = await request(app).post('/api/enquiries').send({ ...wholesale, business: '', phone: '12' })
  assert.equal(res.status, 400)
  assert.deepEqual(Object.keys(res.body.error.fields).sort(), ['business', 'phone'])
})

test('a filled honeypot is stored but not emailed', async () => {
  const { app, store, mailer } = buildApp()
  const res = await request(app).post('/api/enquiries').send({ ...contact, website: 'spam' })
  assert.equal(res.status, 201)
  assert.equal(await store.enquiries.count(), 1)
  assert.equal(mailer.sent.length, 0)
})

test('rate-limits enquiries per IP', async () => {
  const { app } = buildApp()
  const statuses = []
  for (let i = 0; i < 6; i++) statuses.push((await request(app).post('/api/enquiries').send(contact)).status)
  assert.equal(statuses[5], 429)
})
