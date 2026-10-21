// Business details shown across the site. Edit here, not in components.
// `null` values render as a visible "to be provided" marker. Each one blocks a
// production launch (see docs/CLIENT_HANDOFF.md).

export const site = {
  name: 'ohoney',
  url: (import.meta.env.VITE_SITE_URL || 'https://ohoney.in').replace(/\/$/, ''),
  tagline: 'Raw honey from three corners of South India',
  description:
    'Raw honey from the Nilgiris, Mysore and the Western Ghats, packed in small batches and delivered across India. Pay on delivery.',

  email: 'ejpreddy@gmail.com',
  phoneDisplay: '+91 93462 36425',
  phoneHref: 'tel:+919346236425',
  whatsappNumber: '919346236425',
  basedIn: 'Hyderabad, Telangana',
  hours: [
    ['Monday to Saturday', '9 am to 6 pm'],
    ['Sunday', '10 am to 2 pm'],
  ],
  deliveryTime: '3 to 5 working days',

  legal: {
    entityName: null, // e.g. "ohoney Foods Private Limited" or the proprietor's name
    registeredAddress: null,
    fssaiLicence: null,
    gstin: null, // leave null if not GST-registered, and remove the line from Terms
    grievanceOfficer: null, // name and email of the person who handles complaints
    damageReportDays: null, // days after delivery to report a damaged or wrong item
    governingCity: null, // courts with jurisdiction, e.g. "Hyderabad"
  },
}

export const whatsappLink = (text = 'Hi, I have a question about ohoney honey.') =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`
