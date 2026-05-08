'use client';
import { useSearchParams, useRouter } from 'next/navigation';

const categories = ['All', 'School Buildings', 'Dormitories', 'Cafeterias', 'Libraries'];

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('category') || 'All';
  
  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    router.push(`/admin?${params.toString()}`);
  };
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            activeCat === cat 
              ? 'bg-forest-green text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}