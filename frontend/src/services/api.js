const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

function imageUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return `${API_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function mapProduct(item) {
  const image = item.images?.[0]?.content || item.image || '';
  const categories = item.category_names || [];
  const price = Number(item.price_with_discount ?? item.price ?? 0);
  return {
    id: Number(item.id),
    name: item.name || 'Produto',
    category: categories[0] || item.category || 'Geral',
    brand: item.brand || '',
    price,
    oldPrice: Number(item.price || 0) > price ? Number(item.price) : null,
    rating: Number(item.rating || 5),
    reviews: Number(item.reviews || 0),
    tag: item.tag || '',
    color: item.color || '',
    description: item.description || '',
    image: imageUrl(image),
    stock: Number(item.stock || 0),
    options: item.options || [],
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Erro HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function getProducts() {
  const result = await request('/v1/product/search?limit=-1&page=1');
  return (result.data || []).map(mapProduct);
}
