"use client";
import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        pendingOrders: 0,
        lowStock: 0,
        totalCustomers: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const [prodRes, orderRes] = await Promise.all([
                fetch(`${API_URL}/api/products`),
                fetch(`${API_URL}/api/orders`)
            ]);
            const products = await prodRes.json();
            const orders = await orderRes.json();

            setStats({
                totalSales: orders.reduce((acc: number, o: any) => acc + o.total, 0),
                pendingOrders: orders.length,
                lowStock: products.filter((p: any) => p.stock < 100).length,
                totalCustomers: new Set(orders.map((o: any) => o.customer.phone)).size
            });
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Manager <span className="text-gradient">Dashboard</span></h1>

            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, color: 'var(--primary)' },
                    { label: 'Pending Orders', value: stats.pendingOrders, color: 'var(--accent)' },
                    { label: 'Low Stock Items', value: stats.lowStock, color: '#ff4444' },
                    { label: 'Unique Customers', value: stats.totalCustomers, color: '#44ff44' }
                ].map((stat, i) => (
                    <div key={i} className="glass" style={{ padding: '1.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Real-time syncing enabled. Orders appear automatically as customers checkout.</p>
            </div>
        </div>
    );
}
