"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';

export default function Navbar() {
    const { cart } = useCart();
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2rem)',
            maxWidth: '1200px',
            zIndex: 1000,
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Image src="/ssb-traders-logo.webp" alt="SSB Traders Logo" width={48} height={48} style={{ borderRadius: '8px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFD700', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: '900' }}>
                        <span style={{ color: '#C62828' }}>Sri</span>{' '}
                        <span style={{ color: '#1A237E' }}>Sai</span>{' '}
                        <span style={{ color: '#2E7D32' }}>Balaji</span>{' '}
                        <span style={{ color: '#1a1a1a' }}>Traders</span>
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        Cement &amp; Steel
                    </span>
                </div>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link href="/products" style={{ fontWeight: '500', transition: 'var(--transition)' }}>Products</Link>
                <Link href="/location" style={{ fontWeight: '500' }}>Location</Link>
                <Link href="/cart" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Cart ({itemCount})
                </Link>
                <Link href="/admin" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager</Link>
            </div>
        </nav>
    );
}
