import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            padding: '4rem 2rem',
            background: 'var(--surface)',
            marginTop: '4rem',
            borderTop: '1px solid var(--border)'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem'
            }}>
                <div>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: '900' }}>Sri Sai Balaji Traders</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                        Your trusted partner for premium cement, steel, and binding materials. We provide an extensive range of high-quality construction materials for residential, commercial, and industrial projects.
                    </p>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Partnered with industry-leading brands to guarantee durability and strength in every bag. Contact us for bulk orders and reliable site delivery.
                    </p>
                </div>
                <div>
                    <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', color: 'var(--text-muted)' }}>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <Link href="/products" className="footer-link">Products</Link>
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <Link href="/about" className="footer-link">About Us</Link>
                        </li>
                        <li style={{ marginBottom: '0.5rem' }}>
                            <Link href="/location" className="footer-link">Locate Us</Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: '1rem' }}>Contact</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Phone: +91 90634 66777</p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Phone: +91 98856 55776</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: '1.5' }}>
                        Plot No: 14, Thirumala Enclave,<br />
                        Near Manjeera Hospital, Pothireddypally,<br />
                        Sangareddy, Telangana – 502295
                    </p>
                </div>
            </div>
            <div className="container" style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
            }}>
                © 2026 <strong>Sri Sai Balaji Traders</strong>. All rights reserved.
            </div>
        </footer>
    );
}
