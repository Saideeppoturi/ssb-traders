import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: '4rem',
        padding: '4rem 0',
        minHeight: '70vh'
      }}>
        <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <span style={{
            color: 'var(--accent)',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>
            Premium Industrial Supplies
          </span>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '800', margin: '1rem 0', lineHeight: '1.1' }}>
            Build Your <span className="text-gradient">Vision</span> With Cement & Steel
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
            SSB Traders delivers high-grade cement, structural steel, and binding materials for projects that stand the test of time.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/products" className="btn-primary" style={{ fontSize: '1.1rem' }}>Explore Products</Link>
            <Link href="/location" className="glass" style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}>Locate Yard</Link>
          </div>
        </div>

        <div style={{ position: 'relative', height: '600px', borderRadius: '24px', overflow: 'hidden' }}>
          <Image
            src="/shop.png"
            alt="SSB Traders Shop"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            right: '2rem',
            padding: '1.5rem',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <p style={{ fontWeight: '600' }}>"Quality materials at unbeatable retail prices. Fast delivery guaranteed."</p>
            <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>— Verified Contractor Review</span>
          </div>
        </div>
      </section>

      {/* Categories / Fast Links */}
      <section style={{ padding: '6rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>Our Core <span style={{ color: 'var(--primary)' }}>Materials</span></h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2.5rem'
        }}>
          {[
            { title: 'Cement', img: '/Bharathi-Ultrafast-Cement.png', desc: 'OPC & PPC grades from Top Brands.' },
            { title: 'Structural Steel', img: '/kamedhenu_steel.webp', desc: 'High-tensile TMT bars and beams.' },
            { title: 'Binding Materials', img: '/binding_wire.jpg', desc: 'Binding wires and essential fixatives.' }
          ].map((item, idx) => (
            <Link href="/products" key={idx} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass" style={{
                padding: '2rem',
                transition: 'var(--transition)',
                cursor: 'pointer',
                textAlign: 'center',
                height: '100%'
              }}>
                <div style={{
                  height: '200px',
                  position: 'relative',
                  marginBottom: '1.5rem',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <Image src={item.img} alt={item.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
