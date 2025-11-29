import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Velora Essence Royal',
    description: 'An opulent fragrance that embodies luxury and sophistication. This exquisite blend features top notes of bergamot and black currant, heart notes of jasmine and rose, and a rich base of amber and sandalwood.',
    price: 2499,
    originalPrice: 3299,
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Luxury',
    inStock: true,
    rating: 4.8,
    reviews: 127,
    features: ['Long-lasting 8-12 hours', 'Premium glass bottle', 'Gift box included', '50ml'],
    ingredients: ['Bergamot', 'Black Currant', 'Jasmine', 'Rose', 'Amber', 'Sandalwood']
  },
  {
    id: '2',
    name: 'Velora Fresh Breeze',
    description: 'A refreshing and invigorating scent perfect for daily wear. This contemporary fragrance combines citrus top notes with green apple and marine accords, finished with white musk and cedar.',
    price: 1899,
    originalPrice: 2499,
    image: 'https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Fresh',
    inStock: true,
    rating: 4.6,
    reviews: 89,
    features: ['All-day freshness', 'Unisex fragrance', 'Travel-friendly size', '30ml'],
    ingredients: ['Lemon', 'Green Apple', 'Marine Accord', 'White Musk', 'Cedar']
  },
  {
    id: '3',
    name: 'Velora Mystic Nights',
    description: 'An enchanting evening fragrance that captivates the senses. Rich oriental notes blend with exotic spices, creating a mysterious and alluring scent perfect for special occasions.',
    price: 2799,
    originalPrice: 3499,
    image: 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Oriental',
    inStock: true,
    rating: 4.9,
    reviews: 156,
    features: ['Evening wear', 'Exotic blend', 'Luxury packaging', '75ml'],
    ingredients: ['Cardamom', 'Cinnamon', 'Vanilla', 'Patchouli', 'Oud', 'Amber']
  },
  {
    id: '4',
    name: 'Velora Garden Bloom',
    description: 'A delicate floral bouquet that celebrates femininity and grace. This elegant composition features peony, lily of the valley, and white tea, creating a soft and romantic fragrance.',
    price: 2199,
    originalPrice: 2899,
    image: 'https://images.pexels.com/photos/1029896/pexels-photo-1029896.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Floral',
    inStock: true,
    rating: 4.7,
    reviews: 203,
    features: ['Romantic scent', 'Floral bouquet', 'Elegant bottle', '40ml'],
    ingredients: ['Peony', 'Lily of the Valley', 'White Tea', 'Peach', 'White Musk']
  }
];

export const categories = ['All', 'Luxury', 'Fresh', 'Oriental', 'Floral'];