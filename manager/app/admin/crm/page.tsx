"use client";
import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];

const STATUS_COLORS: Record<string, string> = {
    'Pending': '#F59E0B',
    'Confirmed': '#3B82F6',
    'Dispatched': '#8B5CF6',
    'Delivered': '#22C55E'
};

const STATUS_ICONS: Record<string, string> = {
    'Pending': '🕐',
    'Confirmed': '✅',
    'Dispatched': '🚛',
    'Delivered': '📦'
};

export default function AdminCRM() {
    const [orders, setOrders] = useState<any[]>([]);
    const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
    const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});
    const [otpSuccess, setOtpSuccess] = useState<Record<string, boolean>>({});
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
        const fetchOrders = () => {
            fetch(`${API_URL}/api/orders`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.error(err));
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const confirmPayment = async (orderId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/confirm-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentConfirmed: true } : o));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const verifyOTP = async (orderId: string) => {
        const otp = otpInputs[orderId];
        if (!otp || otp.length !== 4) {
            setOtpErrors(prev => ({ ...prev, [orderId]: 'Please enter a valid 4-digit OTP' }));
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp })
            });
            if (res.ok) {
                setOtpSuccess(prev => ({ ...prev, [orderId]: true }));
                setOtpErrors(prev => ({ ...prev, [orderId]: '' }));
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Delivered' } : o));
            } else {
                setOtpErrors(prev => ({ ...prev, [orderId]: 'Invalid OTP. Please try again.' }));
            }
        } catch (err) {
            console.error(err);
            setOtpErrors(prev => ({ ...prev, [orderId]: 'Server error' }));
        }
    };

    const getNextStatus = (currentStatus: string): string | null => {
        const idx = STATUS_STEPS.indexOf(currentStatus);
        if (idx < 0 || idx >= STATUS_STEPS.length - 1) return null;
        return STATUS_STEPS[idx + 1];
    };

    const getNextAction = (status: string): string | null => {
        switch (status) {
            case 'Pending': return 'Confirm Order';
            case 'Confirmed': return 'Mark Dispatched';
            default: return null;
        }
    };

    // --- Edit Order Functions ---
    const startEditing = (order: any) => {
        setEditingOrderId(order.id);
        setEditForm({
            customer: { ...order.customer },
            items: order.items?.map((item: any) => ({ ...item })) || [],
            subtotal: order.subtotal || 0,
            transportFee: order.transportFee || 0,
            total: order.total || 0,
        });
    };

    const cancelEditing = () => {
        setEditingOrderId(null);
        setEditForm(null);
    };

    const updateEditItem = (index: number, field: string, value: any) => {
        const newItems = [...editForm.items];
        newItems[index] = { ...newItems[index], [field]: field === 'quantity' || field === 'price' ? Number(value) : value };
        const newSubtotal = newItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const newTotal = newSubtotal + editForm.transportFee;
        setEditForm({ ...editForm, items: newItems, subtotal: newSubtotal, total: newTotal });
    };

    const updateEditTransportFee = (value: number) => {
        const newTotal = editForm.subtotal + value;
        setEditForm({ ...editForm, transportFee: value, total: newTotal });
    };

    const saveEdit = async () => {
        if (!editingOrderId || !editForm) return;
        try {
            const res = await fetch(`${API_URL}/api/orders/${editingOrderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(prev => prev.map(o => o.id === editingOrderId ? { ...o, ...data.order } : o));
                setEditingOrderId(null);
                setEditForm(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '3rem' }}>Customer <span className="text-gradient">Orders & CRM</span></h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {orders.map((order) => {
                    const statusColor = STATUS_COLORS[order.status] || 'var(--text-muted)';
                    const statusIcon = STATUS_ICONS[order.status] || '❓';
                    const nextStatus = getNextStatus(order.status);
                    const nextAction = getNextAction(order.status);
                    const isEditing = editingOrderId === order.id;

                    return (
                        <div key={order.id} className="glass" style={{ padding: '2rem', overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '0.25rem' }}>{order.id}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(order.date).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                    {/* Status Badge */}
                                    <span style={{
                                        padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold',
                                        fontSize: '0.8rem', background: statusColor,
                                        color: order.status === 'Pending' ? '#000' : '#fff'
                                    }}>
                                        {statusIcon} {order.status}
                                    </span>
                                    {/* Payment Badge */}
                                    <span style={{
                                        padding: '0.3rem 0.75rem', borderRadius: '12px',
                                        fontSize: '0.75rem', fontWeight: '600',
                                        background: order.paymentMethod === 'online'
                                            ? order.paymentConfirmed ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'
                                            : 'rgba(59,130,246,0.2)',
                                        color: order.paymentMethod === 'online'
                                            ? order.paymentConfirmed ? '#22c55e' : '#F59E0B'
                                            : '#3B82F6'
                                    }}>
                                        {order.paymentMethod === 'online'
                                            ? order.paymentConfirmed ? '✅ Payment Confirmed' : '⏳ Payment Pending'
                                            : '💵 Pay on Site'
                                        }
                                    </span>
                                    <h3>₹{order.total?.toLocaleString()}</h3>
                                </div>
                            </div>

                            {/* Mini Status Timeline */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                                marginBottom: '1.5rem', padding: '0.75rem 0'
                            }}>
                                {STATUS_STEPS.map((step, i) => {
                                    const stepIdx = STATUS_STEPS.indexOf(order.status);
                                    const isCompleted = i <= stepIdx;
                                    return (
                                        <React.Fragment key={step}>
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 'bold',
                                                background: isCompleted ? STATUS_COLORS[step] : 'var(--surface)',
                                                color: isCompleted ? '#fff' : 'var(--text-muted)',
                                                flexShrink: 0
                                            }}>
                                                {isCompleted ? STATUS_ICONS[step] : (i + 1)}
                                            </div>
                                            {i < STATUS_STEPS.length - 1 && (
                                                <div style={{
                                                    flex: 1, height: '2px',
                                                    background: i < stepIdx
                                                        ? `linear-gradient(90deg, ${STATUS_COLORS[STATUS_STEPS[i]]}, ${STATUS_COLORS[STATUS_STEPS[i + 1]]})`
                                                        : 'var(--border)'
                                                }} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Order Details OR Edit Form */}
                            {isEditing && editForm ? (
                                /* ===== EDIT MODE ===== */
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>✏️ Editing Order</h4>

                                    {/* Customer Details */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h5 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Customer Details</h5>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                                                <input
                                                    className="glass"
                                                    style={{ width: '100%', padding: '0.5rem', color: 'white', border: '1px solid var(--border)' }}
                                                    value={editForm.customer?.name || ''}
                                                    onChange={e => setEditForm({ ...editForm, customer: { ...editForm.customer, name: e.target.value } })}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Phone</label>
                                                <input
                                                    className="glass"
                                                    style={{ width: '100%', padding: '0.5rem', color: 'white', border: '1px solid var(--border)' }}
                                                    value={editForm.customer?.phone || ''}
                                                    onChange={e => setEditForm({ ...editForm, customer: { ...editForm.customer, phone: e.target.value } })}
                                                />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Address</label>
                                                <input
                                                    className="glass"
                                                    style={{ width: '100%', padding: '0.5rem', color: 'white', border: '1px solid var(--border)' }}
                                                    value={editForm.customer?.address || ''}
                                                    onChange={e => setEditForm({ ...editForm, customer: { ...editForm.customer, address: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h5 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Items</h5>
                                        {editForm.items?.map((item: any, idx: number) => (
                                            <div key={idx} style={{
                                                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                                                gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem'
                                            }}>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Name</label>
                                                    <input
                                                        className="glass"
                                                        style={{ width: '100%', padding: '0.4rem', color: 'white', border: '1px solid var(--border)' }}
                                                        value={item.name}
                                                        onChange={e => updateEditItem(idx, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Qty</label>
                                                    <input
                                                        type="number"
                                                        className="glass"
                                                        style={{ width: '100%', padding: '0.4rem', color: 'white', border: '1px solid var(--border)' }}
                                                        value={item.quantity}
                                                        onChange={e => updateEditItem(idx, 'quantity', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                                                    <input
                                                        type="number"
                                                        className="glass"
                                                        style={{ width: '100%', padding: '0.4rem', color: 'white', border: '1px solid var(--border)' }}
                                                        value={item.price}
                                                        onChange={e => updateEditItem(idx, 'price', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Transport Fee */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Transport Fee (₹)</label>
                                        <input
                                            type="number"
                                            className="glass"
                                            style={{ width: '150px', padding: '0.5rem', color: 'white', border: '1px solid var(--border)' }}
                                            value={editForm.transportFee}
                                            onChange={e => updateEditTransportFee(Number(e.target.value))}
                                        />
                                    </div>

                                    {/* Totals Preview */}
                                    <div style={{
                                        padding: '1rem', borderRadius: '8px',
                                        background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                            <span>₹{editForm.subtotal?.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Transport Fee</span>
                                            <span>₹{editForm.transportFee?.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                            <span>Total</span>
                                            <span style={{ color: 'var(--accent)' }}>₹{editForm.total?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Save / Cancel */}
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={saveEdit} style={{
                                            padding: '0.6rem 1.5rem', borderRadius: '8px',
                                            background: '#22c55e', color: 'white', fontWeight: '600'
                                        }}>
                                            💾 Save Changes
                                        </button>
                                        <button onClick={cancelEditing} className="glass" style={{
                                            padding: '0.6rem 1.5rem', fontWeight: '600', border: '1px solid var(--border)'
                                        }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ===== VIEW MODE ===== */
                                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Customer Details</h4>
                                        <p><strong>Name:</strong> {order.customer?.name}</p>
                                        <p><strong>Phone:</strong> <a href={`tel:${order.customer?.phone}`} style={{ color: 'var(--accent)' }}>{order.customer?.phone}</a></p>
                                        <p style={{ marginTop: '0.75rem' }}><strong>Address:</strong></p>
                                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>{order.customer?.address || order.customer?.location}</p>
                                        {order.customer?.location?.lat && (
                                            <a
                                                href={`https://www.google.com/maps?q=${order.customer.location.lat},${order.customer.location.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-block', marginTop: '0.5rem',
                                                    color: '#3B82F6', fontSize: '0.85rem', textDecoration: 'underline'
                                                }}
                                            >
                                                📍 Open in Google Maps
                                            </a>
                                        )}
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Items Ordered</h4>
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} style={{
                                                display: 'flex', justifyContent: 'space-between',
                                                fontSize: '0.9rem', marginBottom: '0.35rem'
                                            }}>
                                                <span>{item.name} × {item.quantity}</span>
                                                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div style={{
                                            borderTop: '1px solid var(--border)', marginTop: '0.75rem',
                                            paddingTop: '0.75rem', fontSize: '0.9rem'
                                        }}>
                                            {order.subtotal && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                                    <span>₹{order.subtotal?.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {order.transportFee !== undefined && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Transport Fee</span>
                                                    <span>₹{order.transportFee?.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{
                                borderTop: '1px solid var(--border)', paddingTop: '1.5rem',
                                display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'
                            }}>
                                {/* Edit Order button — available for all orders */}
                                {!isEditing && (
                                    <button
                                        onClick={() => startEditing(order)}
                                        className="glass"
                                        style={{
                                            padding: '0.6rem 1.5rem', fontWeight: '600',
                                            border: '1px solid var(--accent)', color: 'var(--accent)'
                                        }}
                                    >
                                        ✏️ Edit Order
                                    </button>
                                )}

                                {/* Status update button */}
                                {nextAction && nextStatus && order.status !== 'Dispatched' && (
                                    <button
                                        onClick={() => updateStatus(order.id, nextStatus)}
                                        className="btn-primary"
                                        style={{ padding: '0.6rem 1.5rem' }}
                                    >
                                        {nextAction}
                                    </button>
                                )}

                                {/* Dispatch button  */}
                                {order.status === 'Confirmed' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'Dispatched')}
                                        style={{
                                            padding: '0.6rem 1.5rem', borderRadius: '8px',
                                            background: '#8B5CF6', color: 'white', fontWeight: '600'
                                        }}
                                    >
                                        🚛 Mark Dispatched
                                    </button>
                                )}

                                {/* Confirm Payment for online orders */}
                                {order.paymentMethod === 'online' && !order.paymentConfirmed && (
                                    <button
                                        onClick={() => confirmPayment(order.id)}
                                        style={{
                                            padding: '0.6rem 1.5rem', borderRadius: '8px',
                                            background: '#22c55e', color: 'white', fontWeight: '600'
                                        }}
                                    >
                                        💳 Confirm Payment Received
                                    </button>
                                )}

                                {/* OTP Verification for delivery */}
                                {order.status === 'Dispatched' && (
                                    <div style={{
                                        display: 'flex', gap: '0.75rem', alignItems: 'center',
                                        flex: 1, justifyContent: 'flex-end'
                                    }}>
                                        {otpSuccess[order.id] ? (
                                            <span style={{ color: '#22c55e', fontWeight: '600' }}>
                                                ✅ OTP Verified — Delivered!
                                            </span>
                                        ) : (
                                            <>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            maxLength={4}
                                                            placeholder="OTP"
                                                            className="glass"
                                                            style={{
                                                                width: '100px', padding: '0.5rem 0.75rem',
                                                                color: 'white', textAlign: 'center',
                                                                fontSize: '1.1rem', letterSpacing: '4px',
                                                                border: otpErrors[order.id] ? '1px solid #ff4444' : '1px solid var(--border)'
                                                            }}
                                                            value={otpInputs[order.id] || ''}
                                                            onChange={e => {
                                                                setOtpInputs(prev => ({ ...prev, [order.id]: e.target.value }));
                                                                setOtpErrors(prev => ({ ...prev, [order.id]: '' }));
                                                            }}
                                                            onKeyDown={e => { if (e.key === 'Enter') verifyOTP(order.id); }}
                                                        />
                                                        <button
                                                            onClick={() => verifyOTP(order.id)}
                                                            className="btn-accent"
                                                            style={{ padding: '0.5rem 1rem' }}
                                                        >
                                                            Verify & Deliver
                                                        </button>
                                                    </div>
                                                    {otpErrors[order.id] && (
                                                        <span style={{ fontSize: '0.75rem', color: '#ff4444' }}>{otpErrors[order.id]}</span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Delivered State */}
                                {order.status === 'Delivered' && !isEditing && (
                                    <span style={{ color: '#22c55e', fontWeight: '600', marginLeft: 'auto' }}>
                                        ✅ Order Complete
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                {orders.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet.</p>}
            </div>
        </div>
    );
}
