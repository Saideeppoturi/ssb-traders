"use client";
import Link from 'next/link';

export default function LocationPage() {
    const lat = 17.590571231592783;
    const lng = 78.07680802859241;
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin`;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '3rem' }}>Locate <span className="text-gradient">Our Yard</span></h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
                <div className="glass" style={{ padding: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontWeight: '900' }}>Sri Sai Balaji Traders</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📍 Address</h4>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                Plot No: 14, Thirumala Enclave,<br />
                                Near Manjeera Hospital, Pothireddypally,<br />
                                Sangareddy, Telangana – 502295
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>🕗 Business Hours</h4>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                Monday – Saturday: 8:30 AM – 6:30 PM<br />
                                Sunday: 8:30 AM – 12:30 PM
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📞 Contact</h4>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                <a href="tel:+919063466777" style={{ color: 'var(--accent)' }}>+91 90634 66777</a><br />
                                <a href="tel:+919885655776" style={{ color: 'var(--accent)' }}>+91 98856 55776</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass" style={{
                        height: '400px',
                        borderRadius: '24px',
                        overflow: 'hidden'
                    }}>
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                    <Link
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ textAlign: 'center', width: '100%', display: 'block' }}
                    >
                        Open in Google Maps →
                    </Link>
                </div>
            </div>
        </div>
    );
}
