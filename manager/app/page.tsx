"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRoot() {
    const router = useRouter();
    useEffect(() => {
        router.push('/admin');
    }, [router]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            color: 'var(--text)'
        }}>
            <div className="glass" style={{ padding: '2rem' }}>
                <h2>Redirecting to Manager Dashboard...</h2>
            </div>
        </div>
    );
}
