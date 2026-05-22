'use client';

import { useEffect, useState } from 'react';

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  beforePhoto?: string;
  afterPhoto?: string;
  photos: string[];
  createdAt: string;
}

interface PortfolioGalleryProps {
  fundiId: string;
  isOwner?: boolean;
}

export default function PortfolioGallery({ fundiId, isOwner = false }: PortfolioGalleryProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'general',
    beforePhoto: '', afterPhoto: '', photos: [] as string[],
  });

  useEffect(() => { fetchPortfolio(); }, [fundiId]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`/api/fundi/${fundiId}/portfolio`);
      if (res.ok) { const json = await res.json(); setItems(json.items || []); }
    } catch (err) { console.error('Error fetching portfolio:', err); }
    finally { setLoading(false); }
  };

  const handlePhotoUpload = (field: 'beforePhoto' | 'afterPhoto' | 'photos') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (field === 'photos') {
          setFormData(prev => ({ ...prev, photos: [...prev.photos, base64] }));
        } else {
          setFormData(prev => ({ ...prev, [field]: base64 }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/fundi/${fundiId}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ title: '', description: '', category: 'general', beforePhoto: '', afterPhoto: '', photos: [] });
        setShowAddForm(false);
        fetchPortfolio();
      }
    } catch (err) { console.error('Error adding portfolio item:', err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    try {
      const res = await fetch(`/api/fundi/${fundiId}/portfolio?itemId=${itemId}`, { method: 'DELETE' });
      if (res.ok) setItems(prev => prev.filter(i => i._id !== itemId));
    } catch (err) { console.error('Error deleting:', err); }
  };

  const categories = [
    { value: 'all', label: 'All Work' },
    { value: 'repair', label: 'Repairs' },
    { value: 'installation', label: 'Installations' },
    { value: 'renovation', label: 'Renovations' },
    { value: 'general', label: 'General' },
  ];

  const filteredItems = activeFilter === 'all' ? items : items.filter(i => i.category === activeFilter);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-100 rounded-lg w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="aspect-square bg-neutral-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-heading font-bold text-secondary-500 flex items-center gap-3">
          <span className="w-10 h-10 bg-accent-100 rounded-2xl flex items-center justify-center text-xl">🎨</span>
          Portfolio
        </h3>
        {isOwner && (
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-500 transition-colors flex items-center gap-2">
            <span className="text-lg">+</span> Add Work
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && isOwner && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Project Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required
                className="w-full px-4 py-3 bg-white border-2 border-neutral-100 rounded-xl focus:border-primary-500 outline-none transition-all" placeholder="e.g., Kitchen Renovation" />
            </div>
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-neutral-100 rounded-xl focus:border-primary-500 outline-none transition-all">
                <option value="general">General</option>
                <option value="repair">Repair</option>
                <option value="installation">Installation</option>
                <option value="renovation">Renovation</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required
              className="w-full px-4 py-3 bg-white border-2 border-neutral-100 rounded-xl focus:border-primary-500 outline-none transition-all min-h-[80px]" placeholder="Describe the work done..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Before Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload('beforePhoto')} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-neutral-100 file:text-neutral-700 file:font-bold file:text-xs hover:file:bg-neutral-200" />
              {formData.beforePhoto && <img src={formData.beforePhoto} alt="Before" className="mt-2 h-20 w-20 object-cover rounded-xl" />}
            </div>
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">After Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload('afterPhoto')} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-neutral-100 file:text-neutral-700 file:font-bold file:text-xs hover:file:bg-neutral-200" />
              {formData.afterPhoto && <img src={formData.afterPhoto} alt="After" className="mt-2 h-20 w-20 object-cover rounded-xl" />}
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Additional Photos</label>
            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload('photos')} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-neutral-100 file:text-neutral-700 file:font-bold file:text-xs hover:file:bg-neutral-200" />
            {formData.photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt={`Photo ${i+1}`} className="h-20 w-20 object-cover rounded-xl" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-neutral-500 rounded-xl text-sm font-bold hover:bg-neutral-100">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-500 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      )}

      {/* Category Filter */}
      {items.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button key={cat.value} onClick={() => setActiveFilter(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeFilter === cat.value ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Portfolio Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl opacity-30">📸</span>
          </div>
          <h4 className="text-lg font-heading font-bold text-neutral-400 mb-2">No portfolio items yet</h4>
          <p className="text-neutral-400 text-sm">
            {isOwner ? 'Showcase your best work to attract more clients.' : 'This artisan hasn\'t added portfolio items yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div key={item._id} onClick={() => setSelectedItem(item)}
              className="group relative overflow-hidden rounded-2xl border border-neutral-100 hover:border-primary-200 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary-600/5">
              {/* Image */}
              <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                {item.afterPhoto || item.photos[0] ? (
                  <img src={item.afterPhoto || item.photos[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
                {item.beforePhoto && item.afterPhoto && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-secondary-900 uppercase tracking-wider">
                    Before & After
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-heading font-bold text-secondary-900 text-sm truncate">{item.title}</h4>
                  {isOwner && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                      className="text-neutral-300 hover:text-red-500 transition-colors text-xs p-1">🗑️</button>
                  )}
                </div>
                <p className="text-neutral-500 text-xs line-clamp-2">{item.description}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[10px] font-bold uppercase">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold text-secondary-900">{selectedItem.title}</h3>
                <button onClick={() => setSelectedItem(null)} className="w-10 h-10 rounded-xl hover:bg-neutral-100 flex items-center justify-center text-neutral-400">✕</button>
              </div>
              {/* Before/After Comparison */}
              {selectedItem.beforePhoto && selectedItem.afterPhoto && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Before</p>
                    <img src={selectedItem.beforePhoto} alt="Before" className="w-full rounded-2xl object-cover aspect-square" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase mb-2">After</p>
                    <img src={selectedItem.afterPhoto} alt="After" className="w-full rounded-2xl object-cover aspect-square" />
                  </div>
                </div>
              )}
              {/* Additional Photos */}
              {selectedItem.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {selectedItem.photos.map((photo, i) => (
                    <img key={i} src={photo} alt={`Work ${i+1}`} className="w-full rounded-xl object-cover aspect-square" />
                  ))}
                </div>
              )}
              <p className="text-neutral-600 text-sm leading-relaxed">{selectedItem.description}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-neutral-100 text-neutral-500 rounded-lg text-xs font-bold uppercase">{selectedItem.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
