import React from 'react'

export default function Footer() {
  return (
    <footer style={{
      background:'var(--forest)', color:'white',
      padding:'48px 0 24px'
    }}>
      <div className="container foot-grid">
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:40}}>
          <div>
            <div style={{fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'1.5rem', marginBottom:12}}>🍯 ohoney</div>
            <p style={{color:'rgba(255,255,255,0.7)', lineHeight:1.7, fontSize:'0.9rem', maxWidth:260}}>
              Small-batch, raw and unfiltered honey from trusted apiaries across India.
            </p>
          </div>
          {[
            { heading:'Shop', links:['Wildflower Honey','Forest Honey','Eucalyptus Honey','Gift Packs'] },
            { heading:'Company', links:['Our Story','Sourcing','Blog','Press'] },
            { heading:'Support', links:['FAQ','Shipping','Returns','Contact'] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{fontWeight:700, marginBottom:16, fontSize:'0.95rem'}}>{col.heading}</div>
              {col.links.map(l => (
                <div key={l} style={{marginBottom:8}}>
                  <a href="#" style={{color:'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:'0.88rem', transition:'color 0.2s'}}
                    onMouseEnter={e => e.target.style.color='var(--honey)'}
                    onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}
                  >{l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:20, display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,0.5)', fontSize:'0.85rem'}}>
          <span>© {new Date().getFullYear()} ohoney. All rights reserved.</span>
          <span>Made with 🍯 in India</span>
        </div>
      </div>
    </footer>
  )
}
