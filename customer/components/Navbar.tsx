"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';

export default function Navbar() {
    const { cart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
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
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Image src="/ssb-traders-logo.webp" alt="SSB Traders Logo" width={40} height={40} style={{ borderRadius: '8px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFD700', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '900', lineHeight: 1 }}>
                        <span style={{ color: '#C62828' }}>Sri</span>{' '}
                        <span style={{ color: '#1A237E' }}>Sai</span>{' '}
                        <span style={{ color: '#2E7D32' }}>Balaji</span>
                    </span>
                    <span style={{ fontSize: '0.5rem', fontWeight: '700', color: '#1a1a1a', letterSpacing: '0.1em' }}>TRADERS</span>
                </div>
            </Link>

            {/* Desktop Menu */}
            <div className="mobile-hide" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Link href="/products" style={{ fontWeight: '500' }}>Products</Link>
                <Link href="/about" style={{ fontWeight: '500' }}>About</Link>
                <Link href="/location" style={{ fontWeight: '500' }}>Location</Link>
                <Link href="/track-order" style={{ fontWeight: '500' }}>Track Order</Link>
                <Link href="/cart" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Cart ({itemCount})
                </Link>
                <Link href="https://ssb-traders.vercel.app/admin" target="_blank" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager</Link>
            </div>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'none', fontSize: '1.5rem' }}
                className="show-mobile"
            >
                {isOpen ? '✕' : '☰'}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="glass" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    textAlign: 'center',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                    <Link href="/products" onClick={() => setIsOpen(false)}>Products</Link>
                    <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
                    <Link href="/location" onClick={() => setIsOpen(false)}>Location</Link>
                    <Link href="/track-order" onClick={() => setIsOpen(false)}>Track Order</Link>
                    <Link href="/cart" onClick={() => setIsOpen(false)} className="btn-primary">
                        Cart ({itemCount})
                    </Link>
                    <Link href="https://ssb-traders.vercel.app/admin" target="_blank" onClick={() => setIsOpen(false)} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager Login</Link>
                </div>
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .mobile-hide { display: none !important; }
                    .show-mobile { display: block !important; }
                }
            `}</style>
        </nav>
    );
}
