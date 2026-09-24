"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Upload, Trash2, Edit2, Check, X, Loader2, Image as ImageIcon, Clock } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string | null;
  price: number;
  prepTime: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states for Item
  const [itemTitle, setItemTitle] = useState("");
  const [itemSubtitle, setItemSubtitle] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemPrepTime, setItemPrepTime] = useState("15-20 mins");
  const [itemCategory, setItemCategory] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingItem, setSubmittingItem] = useState(false);

  // Form states for Category
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [submittingCat, setSubmittingCat] = useState(false);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      if (data.categories && data.items) {
        setCategories(data.categories);
        setItems(data.items);
        if (data.categories.length > 0 && !itemCategory) {
          setItemCategory(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch menu data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setItemImageUrl(data.url);
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmittingCat(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          name: catName,
          description: catDesc,
        }),
      });

      const data = await res.json();
      if (data.category) {
        setCategories((prev) => [...prev, data.category]);
        setCatName("");
        setCatDesc("");
        setIsAddCategoryOpen(false);
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    } finally {
      setSubmittingCat(false);
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemTitle("");
    setItemSubtitle("");
    setItemPrice("");
    setItemPrepTime("15-20 mins");
    setItemCategory(categories[0]?.id || "");
    setItemImageUrl("");
    setItemAvailable(true);
    setIsAddItemOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemSubtitle(item.subtitle || "");
    setItemPrice(item.price.toString());
    setItemPrepTime(item.prepTime);
    setItemCategory(item.categoryId);
    setItemImageUrl(item.imageUrl || "");
    setItemAvailable(item.isAvailable);
    setIsAddItemOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemPrice || !itemCategory) {
      alert("Please fill in title, price, and select a category");
      return;
    }

    setSubmittingItem(true);
    try {
      const payload = {
        id: editingItem?.id,
        categoryId: itemCategory,
        title: itemTitle,
        subtitle: itemSubtitle,
        price: parseFloat(itemPrice),
        prepTime: itemPrepTime,
        imageUrl: itemImageUrl,
        isAvailable: itemAvailable,
      };

      const method = editingItem ? "PUT" : "POST";
      const res = await fetch("/api/admin/menu", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.item) {
        if (editingItem) {
          setItems((prev) => prev.map((i) => (i.id === data.item.id ? data.item : i)));
        } else {
          setItems((prev) => [data.item, ...prev]);
        }
        setIsAddItemOpen(false);
      } else {
        alert(data.error || "Failed to save item");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving menu item");
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isAvailable: newStatus } : i))
    );

    try {
      await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isAvailable: newStatus }),
      });
    } catch (err) {
      console.error("Toggle error:", err);
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: item.isAvailable } : i))
      );
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await fetch(`/api/admin/menu?id=${id}&type=item`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete error:", err);
      fetchMenuData();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E2DC]">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-500">
            Culinary Offerings
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1 tracking-tight">
            Menu Catalog
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="pl-9 pr-4 py-2 bg-white border border-[#E2E2DC] rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 w-48 md:w-60 transition-all"
            />
          </div>

          <button
            onClick={() => setIsAddCategoryOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors border border-[#E2E2DC]"
          >
            + Category
          </button>

          <button
            onClick={openAddItemModal}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dish</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
            activeCategory === "all"
              ? "bg-stone-900 text-white"
              : "bg-white text-stone-600 border border-[#E2E2DC] hover:bg-stone-50"
          }`}
        >
          All Items ({items.length})
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-[#E2E2DC] hover:bg-stone-50"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Content State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
          <p className="text-xs font-medium">Loading live menu catalog...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E2DC] space-y-4">
          <p className="text-stone-500 text-sm">No categories found in the database.</p>
          <button
            onClick={() => setIsAddCategoryOpen(true)}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
          >
            Add Your First Category
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {categories
            .filter((cat) => activeCategory === "all" || activeCategory === cat.id)
            .map((category) => {
              const catItems = filteredItems.filter((i) => i.categoryId === category.id);
              if (activeCategory === "all" && catItems.length === 0 && searchQuery) return null;

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl border border-[#E2E2DC] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  {/* Category Header */}
                  <div className="p-5 border-b border-[#E2E2DC] bg-[#FAF9F5] flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">{category.name}</h2>
                      {category.description && (
                        <p className="text-xs text-stone-500 mt-0.5">{category.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 font-medium px-2.5 py-1 rounded-full bg-white border border-[#E2E2DC]">
                      {catItems.length} {catItems.length === 1 ? "Item" : "Items"}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-[#E2E2DC]">
                    {catItems.length === 0 ? (
                      <div className="p-6 text-center text-xs text-stone-400">
                        No dishes in this category yet.
                      </div>
                    ) : (
                      catItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF9F5]/70 transition-colors"
                        >
                          <div className="flex items-start md:items-center gap-4 min-w-0">
                            {/* Image Thumbnail */}
                            <div className="w-16 h-16 rounded-xl bg-stone-100 border border-[#E2E2DC] overflow-hidden shrink-0 flex items-center justify-center relative group">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-stone-300" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-stone-900 truncate">
                                  {item.title}
                                </h3>
                                <span className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  {item.prepTime}
                                </span>
                              </div>
                              {item.subtitle && (
                                <p className="text-xs text-stone-500 line-clamp-1">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E2DC]/60">
                            <span className="font-mono text-sm font-bold text-stone-900">
                              {formatPrice(item.price)}
                            </span>

                            <div className="flex items-center gap-3">
                              {/* Availability Toggle */}
                              <button
                                onClick={() => handleToggleAvailability(item)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1.5 ${
                                  item.isAvailable
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-stone-100 text-stone-500 border-stone-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.isAvailable ? "bg-emerald-600" : "bg-stone-400"
                                  }`}
                                />
                                <span>{item.isAvailable ? "Available" : "Sold Out"}</span>
                              </button>

                              <button
                                onClick={() => openEditItemModal(item)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                                title="Edit item"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl border border-[#E2E2DC] max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-[#E2E2DC] pb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingItem ? "Edit Dish Item" : "Add New Dish to Menu"}
              </h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Image Upload Block */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Dish Image (Cloudinary Upload)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-stone-50 border-2 border-dashed border-[#E2E2DC] flex flex-col items-center justify-center text-stone-400 relative overflow-hidden shrink-0">
                    {itemImageUrl ? (
                      <img src={itemImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : uploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold cursor-pointer hover:bg-stone-800 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Upload high quality JPG, PNG, or WebP photo of the dish.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Dish Title *
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Wagyu Beef Burger"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={itemSubtitle}
                  onChange={(e) => setItemSubtitle(e.target.value)}
                  placeholder="e.g. Aged truffle cheddar, caramelized onion relish on brioche..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Category & Prep Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={itemPrepTime}
                    onChange={(e) => setItemPrepTime(e.target.value)}
                    placeholder="e.g. 15-20 mins"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Price & Availability */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="e.g. 32000"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                  />
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="availableToggle"
                    checked={itemAvailable}
                    onChange={(e) => setItemAvailable(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <label htmlFor="availableToggle" className="text-xs font-medium text-stone-700 cursor-pointer">
                    Available for ordering
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E2DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingItem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Update Dish" : "Save Dish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-[#E2E2DC] font-sans">
            <div className="flex items-center justify-between border-b border-[#E2E2DC] pb-4">
              <h3 className="text-lg font-bold text-stone-900">Add Menu Category</h3>
              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Desserts & Sweet Treats"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="e.g. Chef's signature desserts and fresh sorbets."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="pt-4 border-t border-[#E2E2DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingCat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
