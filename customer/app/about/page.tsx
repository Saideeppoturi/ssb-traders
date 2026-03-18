import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
            <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                About <span className="text-gradient">SSB Traders</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Sri Sai Balaji Traders — Your trusted partner in construction materials since day one.
            </p>

            {/* Vision */}
            <div className="glass" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🏗️</span>
                    <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>Our Vision</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                    To be Sangareddy&apos;s most trusted cement and building material retailer — known for quality products,
                    fair pricing, and reliable delivery that helps every builder turn their blueprint into reality.
                </p>
            </div>

            {/* Mission */}
            <div className="glass" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🎯</span>
                    <h2 style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>Our Mission</h2>
                </div>
                <ul style={{ color: 'var(--text-muted)', lineHeight: '2', paddingLeft: '1.5rem', fontSize: '1.05rem' }}>
                    <li>Supply only genuine, top-brand cement and binding materials</li>
                    <li>Offer competitive retail prices with transparent billing</li>
                    <li>Provide fast and dependable delivery across the district</li>
                    <li>Build lasting relationships with contractors, builders, and homeowners</li>
                </ul>
            </div>

            {/* Goal */}
            <div className="glass" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🚀</span>
                    <h2 style={{ color: '#22c55e', fontSize: '1.5rem' }}>Our Goal</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                    To serve 1,000+ happy customers and become the go-to retail destination for premium cement
                    and construction essentials in the Sangareddy region — one satisfied project at a time.
                </p>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    Ready to build something great?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/products" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                        Browse Products
                    </Link>
                    <Link href="/location" className="glass" style={{ padding: '0.75rem 2rem', fontWeight: '600' }}>
                        Visit Our Yard
                    </Link>
                </div>
            </div>
        </div>
    );
}
