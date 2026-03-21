import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' }
})

const timeline = [
  { year: '2019', title: 'The Beginning', desc: 'Started with a single hive in our backyard in Hyderabad, gifted honey to neighbours who fell in love with it.' },
  { year: '2021', title: 'First Apiary', desc: 'Partnered with beekeepers in the Nilgiri Hills. Our first 100 jars sold out in a week through word of mouth.' },
  { year: '2023', title: 'Going Online', desc: 'Launched ohoney.in to bring pure, raw honey to doorsteps across India. Zero compromises on quality.' },
  { year: '2026', title: 'Today', desc: 'Serving 500+ happy customers across India with 4 unique honey varieties from trusted apiaries.' },
]

const values = [
  { icon: '🐝', title: 'Bee First', desc: 'We never over-harvest. Our beekeepers always leave enough honey for the colony to thrive through seasons.' },
  { icon: '🌿', title: 'No Shortcuts', desc: 'Raw, unfiltered, never heated above 40°C. What the bees make is what you get — nothing added, nothing removed.' },
  { icon: '🤝', title: 'Fair to Farmers', desc: 'We pay our beekeeping partners above market rate. Their expertise and care is what makes ohoney possible.' },
  { icon: '🔬', title: 'Lab Tested', desc: 'Every batch is independently tested for purity, adulteration and quality before it reaches your door.' },
  { icon: '📦', title: 'Minimal Packaging', desc: 'Our glass jars are 100% recyclable. We use recycled paper for packaging. No plastic, ever.' },
  { icon: '❤️', title: 'Made with Love', desc: 'This is not a faceless corporation — it is a small family business that genuinely cares about what you eat.' },
]

const team = [
  { name: 'Ravi Kumar', role: 'Founder & Head Beekeeper', emoji: '👨‍🌾', desc: 'Third-generation beekeeper from the Nilgiri Hills. Ravi taught us everything we know about ethical honey harvesting.' },
  { name: 'Priya Reddy', role: 'Co-founder & Operations', emoji: '👩‍💼', desc: 'Manages sourcing, quality control and ensures every jar that leaves our facility meets the ohoney standard.' },
  { name: 'Arjun Nair', role: 'Apiary Partner, Kerala', emoji: '🧑‍🌾', desc: 'Our Western Ghats partner with 12 years of experience. Responsible for our award-winning Forest Honey.' },
]

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <>
      <div style={{ paddingTop: 80, background: 'var(--cream)' }}>

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--honey-pale) 0%, var(--cream) 100%)',
          padding: '80px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', width: 350, height: 350, borderRadius: '50%',
            background: 'rgba(245,166,35,0.1)', top: -80, right: -80
          }} />
          <div className="container">
            <motion.div {...fadeUp(0.1)} style={{
              display: 'inline-block', background: 'rgba(245,166,35,0.15)',
              color: 'var(--honey-dark)', borderRadius: 50,
              padding: '6px 20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: 20
            }}>
              🌿 Our Story
            </motion.div>
            <motion.h1 {...fadeUp(0.2)} style={{
              fontFamily: 'Playfair Display,serif',
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              color: 'var(--forest)', marginBottom: 20, lineHeight: 1.2
            }}>
              From the hive to your home —<br />
              <span style={{ color: 'var(--honey)' }}>with love and honesty.</span>
            </motion.h1>
            <motion.p {...fadeUp(0.35)} style={{
              fontSize: '1.1rem', color: 'var(--muted)',
              maxWidth: 580, margin: '0 auto', lineHeight: 1.8
            }}>
              ohoney started because we couldn't find honey that was truly raw, truly pure,
              and came from people we could trust. So we went and found those people ourselves.
            </motion.p>
          </div>
        </section>

        {/* Mission Statement */}
        <section style={{ padding: '72px 0', background: 'var(--white)' }}>
          <div className="container about-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <motion.div {...fadeUp(0.1)}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '2rem', color: 'var(--forest)', marginBottom: 20 }}>
                Why we started ohoney
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.9, marginBottom: 16 }}>
                Walk into any supermarket and you'll find dozens of honey jars — most of them heated, filtered, blended and stripped of every natural benefit that makes honey special. We were tired of it.
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: 1.9, marginBottom: 16 }}>
                In 2019, we started visiting apiaries across South India — the Nilgiri Hills, Western Ghats, Mysore — meeting the beekeepers who had been doing this right for generations. People who understood that good honey takes patience, care, and respect for the bees.
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: 1.9 }}>
                ohoney is our promise: that every jar you receive is exactly what it says — raw, pure, and harvested with care. Nothing more, nothing less.
              </p>
            </motion.div>
            <motion.div
              {...fadeUp(0.2)}
              style={{
                background: 'linear-gradient(135deg, #ffd166, #f5a623)',
                borderRadius: 24, padding: 48, textAlign: 'center',
                boxShadow: '0 20px 60px rgba(245,166,35,0.25)'
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🍯</div>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
                "Pure honey. Honest people. That's it."
              </div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                — Our founding principle
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ padding: '72px 0', background: 'var(--cream)' }}>
          <div className="container">
            <motion.h2 {...fadeUp(0)} style={{
              fontFamily: 'Playfair Display,serif', fontSize: '2rem',
              color: 'var(--forest)', textAlign: 'center', marginBottom: 56
            }}>
              Our Journey
            </motion.h2>
            <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: 60, top: 0, bottom: 0,
                width: 2, background: 'rgba(245,166,35,0.3)'
              }} />
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  {...fadeUp(i * 0.1)}
                  style={{ display: 'flex', gap: 32, marginBottom: 40, alignItems: 'flex-start' }}
                >
                  <div style={{
                    minWidth: 80, height: 80, borderRadius: '50%',
                    background: 'var(--honey)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(245,166,35,0.4)', zIndex: 1
                  }}>
                    {item.year}
                  </div>
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--forest)', marginBottom: 6 }}>{item.title}</div>
                    <div style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: '72px 0', background: 'var(--white)' }}>
          <div className="container">
            <motion.h2 {...fadeUp(0)} style={{
              fontFamily: 'Playfair Display,serif', fontSize: '2rem',
              color: 'var(--forest)', textAlign: 'center', marginBottom: 12
            }}>
              What we stand for
            </motion.h2>
            <motion.p {...fadeUp(0.1)} style={{
              textAlign: 'center', color: 'var(--muted)', marginBottom: 48
            }}>
              These aren't just words on a wall — they're decisions we make every single day.
            </motion.p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24
            }} className="values-grid">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  {...fadeUp(i * 0.08)}
                  whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                  style={{
                    background: 'var(--cream)', borderRadius: 20,
                    padding: 28, transition: 'box-shadow 0.2s'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{v.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--forest)', marginBottom: 8 }}>{v.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>{v.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ padding: '72px 0', background: 'var(--cream)' }}>
          <div className="container">
            <motion.h2 {...fadeUp(0)} style={{
              fontFamily: 'Playfair Display,serif', fontSize: '2rem',
              color: 'var(--forest)', textAlign: 'center', marginBottom: 12
            }}>
              The people behind ohoney
            </motion.h2>
            <motion.p {...fadeUp(0.1)} style={{
              textAlign: 'center', color: 'var(--muted)', marginBottom: 48
            }}>
              A small, passionate team that genuinely cares about what you eat.
            </motion.p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28
            }} className="team-grid">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  {...fadeUp(i * 0.1)}
                  whileHover={{ y: -6 }}
                  style={{
                    background: 'var(--white)', borderRadius: 20,
                    padding: 32, textAlign: 'center',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffd166, #f5a623)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem', margin: '0 auto 16px'
                  }}>{member.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 4 }}>{member.name}</div>
                  <div style={{ color: 'var(--honey-dark)', fontSize: '0.82rem', fontWeight: 600, marginBottom: 12 }}>{member.role}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>{member.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: '72px 0', textAlign: 'center',
          background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-light) 100%)'
        }}>
          <div className="container">
            <motion.div {...fadeUp(0.1)} style={{ fontSize: '3rem', marginBottom: 16 }}>🍯</motion.div>
            <motion.h2 {...fadeUp(0.2)} style={{
              fontFamily: 'Playfair Display,serif', fontSize: '2.2rem',
              color: 'white', marginBottom: 16
            }}>
              Ready to taste the difference?
            </motion.h2>
            <motion.p {...fadeUp(0.3)} style={{
              color: 'rgba(255,255,255,0.75)', fontSize: '1rem',
              marginBottom: 32, maxWidth: 480, margin: '0 auto 32px'
            }}>
              Every jar is a product of real care — from the bees, to the beekeepers, to you.
            </motion.p>
            <motion.button
              {...fadeUp(0.4)}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(245,166,35,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/#products')}
              style={{
                background: 'var(--honey)', color: 'white',
                border: 'none', borderRadius: 50,
                padding: '16px 40px', fontWeight: 700,
                fontSize: '1.05rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245,166,35,0.35)'
              }}
            >
              Shop Our Honey →
            </motion.button>
          </div>
        </section>

      </div>
      <Footer />
    </>
  )
}
