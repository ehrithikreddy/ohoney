// The product catalogue: the single source of truth for what is sold and at what price.
// The storefront renders from it and the API re-prices every order against it,
// so a price edited here changes everywhere at once.
//
// Prices are integer paise (₹1 = 100 paise) to keep arithmetic exact.
// `available: false` hides the Add to cart button and makes the API reject the item.
// `colour` drives the illustrated honey swatches until real photography is supplied;
// the values are illustrative and should be checked against the actual honey.
// `images` takes paths under frontend/public, e.g. ['/images/wildflower-500g.jpg'].
//
// Everything marked CONFIRM in docs/CLIENT_HANDOFF.md must be checked by the client.

export const CURRENCY = 'INR'

export const SHIPPING = {
  flatFee: 6000, // ₹60
  freeFrom: 49900, // free when the subtotal is ₹499 or more
}

export const MAX_QTY_PER_ITEM = 10

export const products = [
  {
    sku: 'OH-WF-500',
    slug: 'wildflower-honey',
    legacyId: 'p1',
    name: 'Wildflower Honey',
    size: '500 g',
    price: 39900,
    available: true,
    origin: 'Nilgiri Hills, Tamil Nadu',
    place: 'the Nilgiris',
    region: 'Nilgiris',
    character: 'Light and floral',
    summary: 'A light, golden honey for every day.',
    description:
      'Bees forage across mixed wildflower meadows in the Nilgiri Hills. The honey is light and golden, with delicate floral notes and a smooth finish.',
    uses: ['Spread on toast', 'Stirred into tea', 'Drizzled over yoghurt'],
    colour: { light: '#FADB8E', base: '#F0B444', deep: '#C98A1F' },
    images: [],
  },
  {
    sku: 'OH-EU-300',
    slug: 'eucalyptus-honey',
    legacyId: 'p3',
    name: 'Eucalyptus Honey',
    size: '300 g',
    price: 34900,
    available: true,
    origin: 'Mysore, Karnataka',
    place: 'Mysore',
    region: 'Mysore',
    character: 'Herbal and rounded',
    summary: 'Amber honey with a distinctive herbal aroma.',
    description:
      'Collected from apiaries near eucalyptus plantations around Mysore. A deeper amber honey with a distinctive, slightly herbal aroma.',
    uses: ['In hot drinks', 'Whisked into dressings', 'With cheese'],
    colour: { light: '#F2B65A', base: '#D07F22', deep: '#94500E' },
    images: [],
  },
  {
    sku: 'OH-FO-250',
    slug: 'forest-honey',
    legacyId: 'p2',
    name: 'Forest Honey',
    size: '250 g',
    price: 29900,
    available: true,
    origin: 'Western Ghats, Kerala',
    place: 'the Western Ghats',
    region: 'Western Ghats',
    character: 'Dark and bold',
    summary: 'Dark amber honey with a bold, earthy flavour.',
    description:
      'From the forests of the Western Ghats, where bees gather nectar from wild forest trees. That gives this honey its dark amber colour and a bold, earthy taste.',
    uses: ['In marinades and glazes', 'Baked into breads', 'Wherever honey should stand out'],
    colour: { light: '#B86D22', base: '#743A12', deep: '#3D1C07' },
    images: [],
  },
  {
    sku: 'OH-SM-300',
    slug: 'honey-sampler',
    legacyId: 'p4',
    name: 'Honey Sampler',
    size: '3 × 100 g',
    price: 49900,
    available: true,
    origin: 'Nilgiris, Mysore and the Western Ghats',
    place: 'all three regions',
    region: 'Three regions',
    character: 'One of each',
    summary: 'Wildflower, Eucalyptus and Forest in one gift box.',
    description:
      'Three 100 g jars of Wildflower, Eucalyptus and Forest honey, packed in a gift box. Taste them side by side to find a favourite, or give them to someone who likes honey.',
    uses: ['A tasting flight', 'A gift', 'Travel-sized jars'],
    colour: null, // rendered as the three honeys together
    images: [],
  },
]

/** Facts shared by every honey in the range. */
export const productFacts = {
  ingredients: 'Honey',
  storage:
    'Keep at room temperature with the lid closed, away from moisture. Raw honey can crystallise over time. That is natural: stand the closed jar in warm water to soften it.',
}

export const findBySku = (sku) => products.find((p) => p.sku === sku)
export const findBySlug = (slug) => products.find((p) => p.slug === slug)
export const findByLegacyId = (id) => products.find((p) => p.legacyId === id)
