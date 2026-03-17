"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { API_URL } from '@/lib/api';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];

const STATUS_CONFIG: Record<string, { color: string; icon: string; description: string }> = {
    'Pending': { color: '#F59E0B', icon: '🕐', description: 'Order placed, awaiting confirmation' },
    'Confirmed': { color: '#3B82F6', icon: '✅', description: 'Order confirmed by manager' },
    'Dispatched': { color: '#8B5CF6', icon: '🚛', description: 'Order is on its way' },
    'Delivered': { color: '#22C55E', icon: '📦', description: 'Order delivered successfully' }
};

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('id') || '');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchOrder = async (id: string) => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/orders/${id}`);
            if (!res.ok) {
                setError('Order not found. Please check your Order ID.');
                setOrder(null);
            } else {
                const data = await res.json();
                setOrder(data);
            }
        } catch {
            setError('Could not connect to server.');
        }
        setLoading(false);
    };

    // Auto-fetch if ID in URL
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setOrderId(id);
            fetchOrder(id);
        }
    }, [searchParams]);

    // Poll for updates every 5 seconds when order is loaded & not delivered
    useEffect(() => {
        if (!order || order.status === 'Delivered') return;
        const interval = setInterval(() => fetchOrder(order.id), 5000);
        return () => clearInterval(interval);
    }, [order]);

    const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Track <span className="text-gradient">Your Order</span></h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Enter your order ID to see real-time status updates</p>

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <input
                    type="text"
                    placeholder="Enter Order ID (e.g. SSB-1234567890)"
                    className="glass"
                    style={{
                        flex: 1, padding: '1rem 1.5rem', border: '1px solid var(--border)',
                        color: 'white', fontSize: '1rem'
                    }}
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') fetchOrder(orderId); }}
                />
                <button
                    onClick={() => fetchOrder(orderId)}
                    className="btn-primary"
                    style={{ padding: '1rem 2rem', fontSize: '1rem' }}
                    disabled={loading}
                >
                    {loading ? '...' : 'Track'}
                </button>
            </div>

            {error && (
                <div className="glass" style={{
                    padding: '2rem', textAlign: 'center',
                    border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.05)'
                }}>
                    <p style={{ color: '#ff4444' }}>{error}</p>
                </div>
            )}

            {order && (
                <div>
                    {/* Status Timeline */}
                    <div className="glass" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>{order.id}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {new Date(order.date).toLocaleString()}
                                </p>
                            </div>
                            <span style={{
                                padding: '0.5rem 1.25rem', borderRadius: '20px', fontWeight: 'bold',
                                fontSize: '0.85rem',
                                background: STATUS_CONFIG[order.status]?.color,
                                color: order.status === 'Pending' ? '#000' : '#fff'
                            }}>
                                {STATUS_CONFIG[order.status]?.icon} {order.status}
                            </span>
                        </div>

                        {/* Timeline Stepper */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', position: 'relative' }}>
                            {STATUS_STEPS.map((step, i) => {
                                const isCompleted = i <= currentStepIndex;
                                const isCurrent = i === currentStepIndex;
                                const config = STATUS_CONFIG[step];
                                return (
                                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                        {/* Connector line */}
                                        {i > 0 && (
                                            <div style={{
                                                position: 'absolute', top: '18px', right: '50%', width: '100%',
                                                height: '3px', zIndex: 0,
                                                background: i <= currentStepIndex
                                                    ? `linear-gradient(90deg, ${STATUS_CONFIG[STATUS_STEPS[i - 1]].color}, ${config.color})`
                                                    : 'var(--border)'
                                            }} />
                                        )}
                                        {/* Circle */}
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.1rem', zIndex: 1,
                                            background: isCompleted ? config.color : 'var(--surface)',
                                            border: isCurrent ? `3px solid ${config.color}` : 'none',
                                            boxShadow: isCurrent ? `0 0 16px ${config.color}50` : 'none',
                                            transition: 'all 0.5s ease'
                                        }}>
                                            {isCompleted ? config.icon : (i + 1)}
                                        </div>
                                        <p style={{
                                            fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: isCurrent ? '700' : '400',
                                            color: isCompleted ? 'var(--foreground)' : 'var(--text-muted)',
                                            textAlign: 'center'
                                        }}>{step}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current Status Description */}
                        <div style={{
                            marginTop: '2rem', padding: '1rem 1.5rem', borderRadius: '12px',
                            background: `${STATUS_CONFIG[order.status]?.color}15`,
                            border: `1px solid ${STATUS_CONFIG[order.status]?.color}30`,
                            textAlign: 'center'
                        }}>
                            <p style={{ color: STATUS_CONFIG[order.status]?.color, fontWeight: '500' }}>
                                {STATUS_CONFIG[order.status]?.description}
                            </p>
                        </div>
                    </div>

                    {/* OTP Card */}
                    {order.status !== 'Delivered' && (
                        <div className="glass" style={{
                            padding: '2rem', marginBottom: '2rem', textAlign: 'center',
                            border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.03)'
                        }}>
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>🔐 Your Delivery OTP</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Share this OTP with the delivery person to confirm delivery
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                                {order.otp?.split('').map((digit: string, i: number) => (
                                    <span key={i} style={{
                                        width: '50px', height: '60px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.75rem', fontWeight: 'bold',
                                        background: 'rgba(245,158,11,0.15)',
                                        border: '2px solid var(--accent)',
                                        borderRadius: '12px', color: 'var(--accent)'
                                    }}>{digit}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order delivered celebration */}
                    {order.status === 'Delivered' && (
                        <div className="glass" style={{
                            padding: '2rem', marginBottom: '2rem', textAlign: 'center',
                            border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                            <h3 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Order Delivered!</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Thank you for choosing SSB Traders. We hope to serve you again!
                            </p>
                        </div>
                    )}

                    {/* Order Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Items */}
                        <div className="glass" style={{ padding: '2rem' }}>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Items Ordered</h4>
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
                                    fontSize: '0.9rem'
                                }}>
                                    <span>{item.name} × {item.quantity}</span>
                                    <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '0.75rem 0 0', fontWeight: 'bold', marginTop: '0.5rem'
                            }}>
                                <span>Subtotal</span>
                                <span>₹{order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Transport Fee</span>
                                <span>₹{order.transportFee?.toLocaleString()}</span>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                borderTop: '1px solid var(--border)', padding: '0.75rem 0 0',
                                fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent)'
                            }}>
                                <span>Total</span>
                                <span>₹{order.total?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Customer & Payment Info */}
                        <div className="glass" style={{ padding: '2rem' }}>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Delivery Details</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</p>
                                    <p style={{ fontWeight: '500' }}>{order.customer?.name}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</p>
                                    <p style={{ fontWeight: '500' }}>{order.customer?.phone}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</p>
                                    <p style={{ fontWeight: '500' }}>{order.customer?.address}</p>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment</p>
                                    <p style={{ fontWeight: '500' }}>
                                        {order.paymentMethod === 'onsite' ? '💵 Pay on Site' : '📱 Pay Online'}
                                        {order.paymentConfirmed
                                            ? <span style={{ color: '#22c55e', marginLeft: '0.75rem' }}>✓ Confirmed</span>
                                            : order.paymentMethod === 'online'
                                                ? <span style={{ color: '#F59E0B', marginLeft: '0.75rem' }}>⏳ Pending Verification</span>
                                                : ''
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link href="/" className="glass" style={{ padding: '0.75rem 2rem', fontWeight: '600', display: 'inline-block' }}>
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '4rem' }}><p>Loading tracker...</p></div>}>
            <TrackOrderContent />
        </Suspense>
    );
}
