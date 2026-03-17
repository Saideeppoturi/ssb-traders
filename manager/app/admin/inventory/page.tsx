"use client";
import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface Product {
    id: string;
    name: string;
    category: 'Cement' | 'Steel' | 'Binding';
    price: number;
    unit: string;
    stock: number;
    description: string;
    image: string;
}

export default function AdminInventory() {
    const [inventory, setInventory] = useState<Product[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [newForm, setNewForm] = useState<Partial<Product>>({
        name: '',
        category: 'Cement',
        price: 0,
        unit: 'bag',
        stock: 0,
        description: '',
        image: '/bharathi-cement.jpg'
    });

    const fetchInventory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/products`);
            const data = await res.json();
            setInventory(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const saveToDB = async (updatedList: Product[]) => {
        try {
            await fetch(`${API_URL}/api/products/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedList)
            });
            fetchInventory();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setEditForm(product);
    };

    const handleSave = () => {
        if (!editingId) return;
        const newInv = inventory.map(item =>
            item.id === editingId ? { ...item, ...editForm } as Product : item
        );
        saveToDB(newInv);
        setEditingId(null);
    };

    const handleAddNew = () => {
        const id = `new-${Date.now()}`;
        const newItem = { ...newForm, id } as Product;
        saveToDB([...inventory, newItem]);
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            const newInv = inventory.filter(item => item.id !== id);
            saveToDB(newInv);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1>Inventory <span className="text-gradient">Management</span></h1>
                <button className="btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : '+ Add New Item'}
                </button>
            </div>

            {isAdding && (
                <div className="glass" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Add New Product</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Product Name</label>
                            <input
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', color: 'white' }}
                                value={newForm.name}
                                onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                            <select
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', color: 'white' }}
                                value={newForm.category}
                                onChange={e => setNewForm({ ...newForm, category: e.target.value as any })}
                            >
                                <option value="Cement">Cement</option>
                                <option value="Steel">Steel</option>
                                <option value="Binding">Binding</option>
                            </select>
                        </div>
                        <button onClick={handleAddNew} className="btn-primary" style={{ gridColumn: 'span 3' }}>Create</button>
                    </div>
                </div>
            )}

            <div className="glass" style={{ padding: '2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Product Name</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((product) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem' }}>
                                    {editingId === product.id ? (
                                        <input className="glass" style={{ color: 'white' }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                    ) : product.name}
                                </td>
                                <td>
                                    {editingId === product.id ? (
                                        <input type="number" className="glass" style={{ color: 'white' }} value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })} />
                                    ) : product.stock}
                                </td>
                                <td>
                                    {editingId === product.id ? (
                                        <input type="number" className="glass" style={{ color: 'white', width: '100px' }} value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                                    ) : `₹${product.price}`}
                                </td>
                                <td>
                                    {editingId === product.id ? (
                                        <button onClick={handleSave} style={{ color: '#44ff44' }}>Save</button>
                                    ) : (
                                        <button onClick={() => handleEdit(product)} style={{ color: 'var(--primary)' }}>Edit</button>
                                    )}
                                    <button onClick={() => handleDelete(product.id)} style={{ color: '#ff4444', marginLeft: '1rem' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
