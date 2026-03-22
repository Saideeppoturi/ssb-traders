"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, total } = useCart();

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '10vh 0' }}>
                <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Your <span className="text-gradient">Cart</span> is Empty</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Looks like you haven't added any materials yet.</p>
                <Link href="/products" className="btn-primary">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="page-title" style={{ marginBottom: '3rem' }}>Shopping <span className="text-gradient">Cart</span></h1>

            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cart.map((item) => (
                        <div key={item.id} className="glass cart-item-row" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div className="cart-item-image" style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: '0.25rem' }}>{item.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.category}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold' }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.quantity} {item.unit}(s)</p>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', textDecoration: 'underline' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card */}
                <div className="glass summary-card-mobile" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '8rem' }}>
                    <h2 className="mobile-title-small" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Order Summary</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span className="mobile-text-small" style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                        <span className="mobile-text-small">₹{total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span className="mobile-text-small" style={{ color: 'var(--text-muted)' }}>Delivery</span>
                        <span className="mobile-text-small" style={{ color: '#44ff44' }}>Calculated at next step</span>
                    </div>
                    <div style={{
                        borderTop: '1px solid var(--border)',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                    }}>
                        <span className="mobile-text-small">Total</span>
                        <span className="mobile-text-small" style={{ color: 'var(--accent)' }}>₹{total.toLocaleString()}</span>
                    </div>
                    <Link href="/checkout" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '2rem', width: '100%' }}>
                        Proceed to Checkout
                    </Link>
                </div>
            </div>

            {/* Floating Mobile Checkout Bar */}
            <div className="mobile-checkout-sticky">
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>₹{total.toLocaleString()}</div>
                </div>
                <Link href="/checkout" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                    Checkout →
                </Link>
            </div>
        </div>
    );
}
