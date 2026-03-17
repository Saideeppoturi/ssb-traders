import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid var(--border)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                background: 'var(--surface)'
            }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                  <span style={{ background: '#FFD700', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                    <span style={{ color: '#C62828' }}>Sri</span>{' '}
                    <span style={{ color: '#1A237E' }}>Sai</span>{' '}
                    <span style={{ color: '#2E7D32' }}>Balaji</span>{' '}
                    <span style={{ color: '#1a1a1a' }}>Traders</span>
                  </span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link href="/admin" style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>Dashboard</Link>
                    <Link href="/admin/inventory" style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}>Inventory</Link>
                    <Link href="/admin/crm" style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}>Customers & Orders</Link>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <Link href="/" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>← Back to Site</Link>
                </div>
            </aside>

            {/* Main Admin Content */}
            <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
