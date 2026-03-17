"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import { API_URL } from '@/lib/api';

export default function ProductsPage() {
    const { addToCart } = useCart();
    const [displayProducts, setDisplayProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => {
                setDisplayProducts(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch products:", err));
    }, []);

    const [quantities, setQuantities] = useState<Record<string, number | string>>({});

    const handleQuantityChange = (productId: string, value: string) => {
        setQuantities(prev => {
            if (value === "") {
                return { ...prev, [productId]: "" };
            }

            const parsed = parseInt(value);
            return {
                ...prev,
                [productId]: isNaN(parsed) ? 0 : Math.max(0, parsed)
            };
        });
    };

    const handleAddToCart = (product: any) => {
        const qty = quantities[product.id];
        const quantity = typeof qty === 'number' ? qty : 0;

        if (quantity > 0) {
            addToCart(product, quantity);
            setQuantities(prev => ({ ...prev, [product.id]: 0 }));
        }
    };

    if (loading) return <div className="container">Loading Products...</div>;

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Our <span className="text-gradient">Inventory</span></h1>
                <p style={{ color: 'var(--text-muted)' }}>Quality building materials for every construction need.</p>
            </header>

            <div className="grid-mobile-1" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {displayProducts.map((product) => (
                    <div key={product.id} className="glass" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', height: '200px' }}>
                            <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'var(--primary)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {product.category}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                                {product.description}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{product.price.toLocaleString()}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {product.unit}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={quantities[product.id] !== undefined ? quantities[product.id] : ''}
                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                        className="glass"
                                        style={{ width: '60px', padding: '0.4rem', color: 'white', textAlign: 'center' }}
                                    />
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="btn-primary"
                                        style={{ padding: '0.5rem 1rem' }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
