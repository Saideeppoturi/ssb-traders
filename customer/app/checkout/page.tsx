"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/api';

// Yard coordinates (SSB Traders, Sangareddy)
const YARD_LAT = 17.590571231592783;
const YARD_LNG = 78.07680802859241;

// Calculate distance in km using Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate transport fee
function calculateTransportFee(distanceKm: number): number {
    return Math.round(50 + distanceKm * 15);
}

interface BankDetails {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
    upiId: string;
}

export default function CheckoutPage() {
    const { cart, total, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [orderResult, setOrderResult] = useState<any>(null);

    // Step 1: Customer details
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    // Geolocation
    const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied' | 'idle'>('idle');
    const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [deliveryChoice, setDeliveryChoice] = useState<'current' | 'other' | null>(null);
    const [distanceKm, setDistanceKm] = useState<number>(0);
    const [transportFee, setTransportFee] = useState<number>(0);

    // Step 2: Payment
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'onsite'>('onsite');
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

    // Fetch bank details
    useEffect(() => {
        fetch(`${API_URL}/api/bank-details`)
            .then(res => res.json())
            .then(data => setBankDetails(data))
            .catch(err => console.error(err));
    }, []);

    // Request geolocation when address is entered
    const requestLocation = () => {
        setLocationPermission('pending');
        if (!navigator.geolocation) {
            setLocationPermission('denied');
            setDeliveryChoice('other');
            setTransportFee(500);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCustomerCoords(coords);
                setLocationPermission('granted');
                const dist = haversineDistance(YARD_LAT, YARD_LNG, coords.lat, coords.lng);
                setDistanceKm(Math.round(dist * 10) / 10);
            },
            () => {
                setLocationPermission('denied');
                setDeliveryChoice('other');
                setTransportFee(500);
            }
        );
    };

    // Update transport fee when delivery choice changes
    useEffect(() => {
        if (deliveryChoice === 'current' && customerCoords) {
            const dist = haversineDistance(YARD_LAT, YARD_LNG, customerCoords.lat, customerCoords.lng);
            setDistanceKm(Math.round(dist * 10) / 10);
            if (dist > 30) {
                setTransportFee(0); // will show contact message
            } else {
                setTransportFee(calculateTransportFee(dist));
            }
        } else if (deliveryChoice === 'other') {
            setTransportFee(500);
            setDistanceKm(0);
        }
    }, [deliveryChoice, customerCoords]);

    const grandTotal = total + transportFee;

    const handlePlaceOrder = async () => {
        const orderData = {
            customer: {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                location: deliveryChoice === 'current' && customerCoords
                    ? { lat: customerCoords.lat, lng: customerCoords.lng, type: 'current' }
                    : { type: 'other' }
            },
            items: cart,
            subtotal: total,
            transportFee: transportFee,
            total: grandTotal,
            paymentMethod: paymentMethod,
            deliveryType: deliveryChoice
        };

        try {
            const res = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                setOrderResult(data.order);
                clearCart();
                setStep(4); // confirmation
            }
        } catch (err) {
            console.error("Order failed:", err);
            alert("Failed to place order. Is the server running?");
        }
    };

    // ---- STEP 4: Order Confirmation ----
    if (step === 4 && orderResult) {
        return (
            <div className="container" style={{ maxWidth: '700px', padding: '4rem 2rem' }}>
                <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', fontSize: '2.5rem'
                    }}>✓</div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        Order <span style={{ color: '#22c55e' }}>Confirmed!</span>
                    </h1>

                    <div className="glass" style={{
                        padding: '1.5rem', margin: '2rem 0',
                        border: '1px solid rgba(34,197,94,0.3)',
                        background: 'rgba(34,197,94,0.05)'
                    }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Order ID</p>
                        <h2 style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{orderResult.id}</h2>

                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Delivery OTP</p>
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem'
                        }}>
                            {orderResult.otp.split('').map((digit: string, i: number) => (
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
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Share this OTP with the delivery person to confirm delivery
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1.5rem 0', padding: '1rem 0', borderTop: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Grand Total</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>₹{orderResult.total?.toLocaleString()}</span>
                    </div>

                    {paymentMethod === 'online' && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            💳 Your online payment will be verified by the manager.
                        </p>
                    )}
                    {paymentMethod === 'onsite' && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            💵 Please pay at the counter upon pickup/delivery.
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href={`/track-order?id=${orderResult.id}`} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                            Track My Order
                        </Link>
                        <Link href="/" className="glass" style={{ padding: '0.75rem 2rem', fontWeight: '600' }}>
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- Empty Cart Guard ----
    if (cart.length === 0 && step !== 4) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '10vh 0' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Your <span className="text-gradient">Cart</span> is Empty</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Add some products before checking out.</p>
                <Link href="/products" className="btn-primary">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '900px', paddingBottom: '2rem' }}>
            <h1 className="page-title mobile-title-small" style={{ marginBottom: '1rem' }}>Complete <span className="text-gradient">Purchase</span></h1>

            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', alignItems: 'center' }}>
                {[
                    { num: 1, label: 'Details & Location' },
                    { num: 2, label: 'Payment' },
                    { num: 3, label: 'Review & Confirm' }
                ].map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: step > s.num ? 'pointer' : 'default',
                            opacity: step >= s.num ? 1 : 0.4
                        }}
                            onClick={() => { if (step > s.num) setStep(s.num); }}
                        >
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', fontWeight: 'bold',
                                background: step >= s.num ? 'var(--primary)' : 'var(--surface)',
                                color: step >= s.num ? 'white' : 'var(--text-muted)'
                            }}>{step > s.num ? '✓' : s.num}</div>
                            <span className="checkout-step-label" style={{ fontSize: '0.9rem', fontWeight: step === s.num ? '600' : '400' }}>{s.label}</span>
                        </div>
                        {i < 2 && <div style={{ flex: 1, height: '2px', background: step > s.num ? 'var(--primary)' : 'var(--border)' }} />}
                    </React.Fragment>
                ))}
            </div>

            {/* ========== STEP 1: Customer Details & Location ========== */}
            {step === 1 && (
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 className="mobile-title-small" style={{ marginBottom: '0.5rem' }}>📋 Delivery & Contact Details</h3>
                    <p className="mobile-text-xs" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Enter your info, then we&apos;ll ask for location to calculate delivery charges.
                    </p>

                    <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name *</label>
                            <input
                                type="text"
                                required
                                className="glass"
                                style={{ padding: '0.75rem', border: '1px solid var(--border)', color: 'white', width: '100%' }}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone Number *</label>
                            <input
                                type="tel"
                                required
                                className="glass"
                                style={{ padding: '0.75rem', border: '1px solid var(--border)', color: 'white', width: '100%' }}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="address-full-width" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Delivery Address *</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter your full delivery address"
                                className="glass"
                                style={{ padding: '0.75rem', border: '1px solid var(--border)', color: 'white', width: '100%' }}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Location Section - shows after address */}
                    {formData.address.length > 5 && locationPermission === 'idle' && (
                        <div className="glass" style={{
                            padding: '2rem', marginBottom: '2rem', textAlign: 'center',
                            border: '1px solid var(--primary)', background: 'rgba(59,130,246,0.05)'
                        }}>
                            <h4 style={{ marginBottom: '0.75rem' }}>📍 Enable Location for Accurate Delivery Fee</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Allow location access to calculate the precise delivery charge based on distance from our yard.
                            </p>
                            <button onClick={requestLocation} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                                Allow Location Access
                            </button>
                            <button
                                onClick={() => { setLocationPermission('denied'); setDeliveryChoice('other'); setTransportFee(500); }}
                                style={{ display: 'block', margin: '1rem auto 0', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'underline' }}
                            >
                                Skip — use standard delivery fee
                            </button>
                        </div>
                    )}

                    {locationPermission === 'pending' && (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                            <p style={{ color: 'var(--accent)' }}>⏳ Requesting location permission...</p>
                        </div>
                    )}

                    {locationPermission === 'granted' && !deliveryChoice && (
                        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(34,197,94,0.3)' }}>
                            <h4 style={{ color: '#22c55e', marginBottom: '1rem' }}>✅ Location Detected</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Distance from our yard: ~{distanceKm} km. Where should we deliver?
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setDeliveryChoice('current')}
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '1rem' }}
                                >
                                    🏠 Deliver to My Current Location
                                </button>
                                <button
                                    onClick={() => setDeliveryChoice('other')}
                                    className="glass"
                                    style={{ flex: 1, padding: '1rem', fontWeight: '600', border: '1px solid var(--border)' }}
                                >
                                    📍 Deliver Somewhere Else
                                </button>
                            </div>
                        </div>
                    )}

                    {deliveryChoice && (
                        <div className="glass" style={{
                            padding: '1.5rem', marginBottom: '2rem',
                            background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.3)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>🚛 Transport Fee</h4>
                                    {deliveryChoice === 'current' && distanceKm > 30 ? (
                                        <p style={{ color: '#ff4444', fontSize: '0.9rem' }}>
                                            Distance exceeds 30km. Please contact us at +91 90634 66777 for a custom quote.
                                        </p>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {deliveryChoice === 'current'
                                                ? `Based on ~${distanceKm} km distance (₹50 base + ₹15/km)`
                                                : 'Standard delivery fee for alternate location'
                                            }
                                        </p>
                                    )}
                                </div>
                                {!(deliveryChoice === 'current' && distanceKm > 30) && (
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                        ₹{transportFee.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setStep(2)}
                        disabled={!formData.name || !formData.phone || !formData.address || !deliveryChoice || (deliveryChoice === 'current' && distanceKm > 30)}
                        className="btn-accent mobile-text-small"
                        style={{
                            width: '100%', padding: '1rem', fontSize: '1.1rem',
                            opacity: (!formData.name || !formData.phone || !formData.address || !deliveryChoice) ? 0.5 : 1
                        }}
                    >
                        Continue to Payment →
                    </button>
                </div>
            )}

            {/* ========== STEP 2: Payment Method ========== */}
            {step === 2 && (
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 className="mobile-title-small" style={{ marginBottom: '0.5rem' }}>💳 Select Payment Method</h3>
                    <p className="mobile-text-xs" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Choose how you'd like to pay for your order.
                    </p>

                    <div className="mobile-flex-stack" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                        <label style={{
                            flex: 1, padding: '2rem', borderRadius: '16px', cursor: 'pointer',
                            border: `2px solid ${paymentMethod === 'onsite' ? 'var(--primary)' : 'var(--border)'}`,
                            background: paymentMethod === 'onsite' ? 'rgba(59,130,246,0.1)' : 'transparent',
                            transition: 'var(--transition)'
                        }}>
                            <input
                                type="radio" name="payment" value="onsite"
                                checked={paymentMethod === 'onsite'}
                                onChange={() => setPaymentMethod('onsite')}
                                style={{ display: 'none' }}
                            />
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💵</div>
                            <span style={{ fontWeight: 'bold', display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Pay on Site</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pay cash at our counter or upon delivery.</span>
                        </label>

                        <label style={{
                            flex: 1, padding: '2rem', borderRadius: '16px', cursor: 'pointer',
                            border: `2px solid ${paymentMethod === 'online' ? '#22c55e' : 'var(--border)'}`,
                            background: paymentMethod === 'online' ? 'rgba(34,197,94,0.1)' : 'transparent',
                            transition: 'var(--transition)'
                        }}>
                            <input
                                type="radio" name="payment" value="online"
                                checked={paymentMethod === 'online'}
                                onChange={() => setPaymentMethod('online')}
                                style={{ display: 'none' }}
                            />
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📱</div>
                            <span style={{ fontWeight: 'bold', display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Pay Online</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transfer via UPI, NEFT, or scan QR code.</span>
                        </label>
                    </div>

                    {/* Bank Details - shown when online is selected */}
                    {paymentMethod === 'online' && bankDetails && (
                        <div className="glass" style={{
                            padding: '2rem', marginBottom: '2rem',
                            border: '1px solid rgba(34,197,94,0.3)',
                            background: 'rgba(34,197,94,0.03)'
                        }}>
                            <h4 style={{ color: '#22c55e', marginBottom: '1.5rem' }}>🏦 Bank Transfer Details</h4>
                            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {[
                                            { label: 'Account Name', value: bankDetails.accountName },
                                            { label: 'Account Number', value: bankDetails.accountNumber },
                                            { label: 'IFSC Code', value: bankDetails.ifscCode },
                                            { label: 'Bank', value: bankDetails.bankName },
                                            { label: 'Branch', value: bankDetails.branch },
                                            { label: 'UPI ID', value: bankDetails.upiId }
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{item.label}</p>
                                                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Scan QR Code to Pay</p>
                                    <div style={{
                                        background: 'white', borderRadius: '16px', padding: '1rem',
                                        display: 'inline-block'
                                    }}>
                                        <Image src="/payment-qr.png" alt="Payment QR Code" width={180} height={180} style={{ borderRadius: '8px' }} />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '1rem' }}>
                                        Amount: ₹{grandTotal.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                marginTop: '1.5rem', padding: '1rem', borderRadius: '8px',
                                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)'
                            }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                                    ⚠️ After transferring, place your order below. The manager will verify your payment and confirm the order.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mobile-flex-stack" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setStep(1)} className="glass mobile-text-small" style={{ padding: '1rem 2rem', fontWeight: '600' }}>
                            ← Back
                        </button>
                        <button onClick={() => setStep(3)} className="btn-accent mobile-text-small" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}>
                            Review Order →
                        </button>
                    </div>
                </div>
            )}

            {/* ========== STEP 3: Order Review & Confirm ========== */}
            {step === 3 && (
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 className="mobile-title-small" style={{ marginBottom: '2rem' }}>📦 Order Review</h3>

                    {/* Items */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Items</h4>
                        {cart.map((item) => (
                            <div key={item.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem 0', borderBottom: '1px solid var(--border)'
                            }}>
                                <div>
                                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                                        x{item.quantity} {item.unit}(s)
                                    </span>
                                </div>
                                <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Info */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Delivery Details</h4>
                        <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name</p>
                                <p style={{ fontWeight: '500' }}>{formData.name}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</p>
                                <p style={{ fontWeight: '500' }}>{formData.phone}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Address</p>
                                <p style={{ fontWeight: '500' }}>{formData.address}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery Type</p>
                                <p style={{ fontWeight: '500' }}>
                                    {deliveryChoice === 'current' ? '📍 Current Location (GPS-based)' : '📍 Alternate Location'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Payment</h4>
                        <p style={{ fontWeight: '500' }}>
                            {paymentMethod === 'onsite' ? '💵 Pay on Site' : '📱 Pay Online (Bank Transfer / UPI)'}
                        </p>
                    </div>

                    {/* Totals */}
                    <div style={{
                        borderTop: '2px solid var(--border)', paddingTop: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Transport Fee</span>
                            <span>₹{transportFee.toLocaleString()}</span>
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '1.3rem', fontWeight: 'bold',
                            borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.75rem'
                        }}>
                            <span>Grand Total</span>
                            <span style={{ color: 'var(--accent)' }}>₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mobile-flex-stack" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button onClick={() => setStep(2)} className="glass mobile-text-small" style={{ padding: '1rem 2rem', fontWeight: '600' }}>
                            ← Back
                        </button>
                        <button
                            onClick={handlePlaceOrder}
                            className="btn-accent mobile-text-small"
                            style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
                        >
                            🛒 Place Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
