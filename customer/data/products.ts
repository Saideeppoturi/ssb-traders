export interface Product {
    id: string;
    name: string;
    category: 'Cement' | 'Steel' | 'Binding';
    price: number;
    unit: string;
    stock: number;
    description: string;
    image: string;
}

export const products: Product[] = [
    {
        id: 'c1',
        name: 'Bharathi Ultrafast Cement',
        category: 'Cement',
        price: 460,
        unit: 'bag',
        stock: 800,
        description: 'Ultra-strong cement for robust foundations and structural elements.',
        image: '/Bharathi-Ultrafast-Cement.png'
    },
    {
        id: 'c2',
        name: 'Nagarjuna Visista Cement',
        category: 'Cement',
        price: 440,
        unit: 'bag',
        stock: 1500,
        description: 'High-performance cement known for durability and crack resistance.',
        image: '/nagarjuna_visista.jpeg'
    },
    {
        id: 'c3',
        name: 'Priya Cement',
        category: 'Cement',
        price: 430,
        unit: 'bag',
        stock: 1000,
        description: 'Premium quality cement suitable for all types of construction.',
        image: '/priya_cement.png'
    },
    {
        id: 's1',
        name: 'Kamdhenu Nxt 550 TMT',
        category: 'Steel',
        price: 74000,
        unit: 'ton',
        stock: 60,
        description: 'Next-generation steel bars with superior strength and double rib pattern.',
        image: '/kamedhenu_steel.webp'
    },
    {
        id: 's2',
        name: 'AF Star 550D',
        category: 'Steel',
        price: 72500,
        unit: 'ton',
        stock: 90,
        description: 'Ductile high-strength steel bars for earthquake-resistant projects.',
        image: '/afstar_550d.png'
    }
];
