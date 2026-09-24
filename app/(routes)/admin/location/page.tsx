"use client";

import { useEffect, useState } from "react";
import { QrCode, Plus, Search, Trash2, X, Download, Copy, ExternalLink, Loader2, Check, Printer } from "lucide-react";
import QRCode from "qrcode";

interface Location {
  id: string;
  name: string;
  slug: string;
  category: string;
  floor: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminLocationPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [selectedQrLocation, setSelectedQrLocation] = useState<Location | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  // New location form
  const [locName, setLocName] = useState("");
  const [locCategory, setLocCategory] = useState("Executive Suite");
  const [locFloor, setLocFloor] = useState("4th Floor");
  const [submitting, setSubmitting] = useState(false);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/locations");
      const data = await res.json();
      if (data.locations) {
        setLocations(data.locations);
      }
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locName,
          category: locCategory,
          floor: locFloor,
        }),
      });

      const data = await res.json();
      if (data.location) {
        setLocations((prev) => [data.location, ...prev]);
        setLocName("");
        setIsAddLocationOpen(false);
      } else {
        alert(data.error || "Failed to create location");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating location");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    setLocations((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`/api/admin/locations?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchLocations();
    }
  };

  const handleOpenQrModal = async (loc: Location) => {
    setSelectedQrLocation(loc);
    setCopiedLink(false);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const guestMenuUrl = `${baseUrl}/menu/${loc.slug}`;

    try {
      const url = await QRCode.toDataURL(guestMenuUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#1C1917",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("QR Code generation error:", err);
    }
  };

  const handleCopyLink = () => {
    if (!selectedQrLocation) return;
    const baseUrl = window.location.origin;
    const guestMenuUrl = `${baseUrl}/menu/${selectedQrLocation.slug}`;
    navigator.clipboard.writeText(guestMenuUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !selectedQrLocation) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR-${selectedQrLocation.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.floor && loc.floor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E2DC]">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-500">
            Hotel Locations & QR Points
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1 tracking-tight">
            Rooms & Ordering Points
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations..."
              className="pl-9 pr-4 py-2 bg-white border border-[#E2E2DC] rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 w-48 transition-all"
            />
          </div>

          <button
            onClick={() => setIsAddLocationOpen(true)}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Location</span>
          </button>
        </div>
      </div>

      {/* Grid State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
          <p className="text-xs font-medium">Loading live ordering points...</p>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E2DC] space-y-4">
          <p className="text-stone-500 text-sm">No ordering locations found.</p>
          <button
            onClick={() => setIsAddLocationOpen(true)}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
          >
            Add Your First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLocations.map((room) => (
            <div
              key={room.id}
              className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 hover:border-stone-400 transition-all group relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-400 font-medium">{room.floor || "General"}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenQrModal(room)}
                    title="View & Download QR Code"
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(room.id)}
                    title="Delete location"
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">{room.name}</h3>
                <p className="text-xs text-stone-500">{room.category}</p>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">/menu/{room.slug}</p>
              </div>

              <div className="pt-3 border-t border-[#E2E2DC] flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Active QR Code
                </span>

                <button
                  onClick={() => handleOpenQrModal(room)}
                  className="text-[11px] font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
                >
                  <span>QR Card</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Location Modal */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-[#E2E2DC] font-sans">
            <div className="flex items-center justify-between border-b border-[#E2E2DC] pb-4">
              <h3 className="text-lg font-bold text-stone-900">Add New Ordering Location</h3>
              <button
                onClick={() => setIsAddLocationOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Location Name / Number *
                </label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Suite 501, Poolside Table 4"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Category / Zone
                </label>
                <select
                  value={locCategory}
                  onChange={(e) => setLocCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  <option value="Executive Suite">Executive Suite</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                  <option value="Deluxe King">Deluxe King</option>
                  <option value="Standard Double">Standard Double</option>
                  <option value="Restaurant & Lounge">Restaurant & Lounge</option>
                  <option value="Poolside & Outdoor">Poolside & Outdoor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Floor / Location Details
                </label>
                <input
                  type="text"
                  value={locFloor}
                  onChange={(e) => setLocFloor(e.target.value)}
                  placeholder="e.g. 5th Floor, Main Deck"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E2DC] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="pt-4 border-t border-[#E2E2DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddLocationOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate QR Point</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Card Modal */}
      {selectedQrLocation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl border border-[#E2E2DC] font-sans text-center relative">
            <button
              onClick={() => setSelectedQrLocation(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Stand Preview Card */}
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E2E2DC] space-y-4 shadow-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-500">
                  SPLENDO HOTEL & SUITES
                </p>
                <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                  {selectedQrLocation.name}
                </h3>
                <p className="text-xs text-stone-500 font-medium">{selectedQrLocation.category} • {selectedQrLocation.floor}</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-xl border border-[#E2E2DC] inline-block shadow-sm">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-stone-900">Scan for In-Room Dining Menu</p>
                <p className="text-[10px] text-stone-400 font-mono truncate max-w-[240px] mx-auto">
                  {typeof window !== "undefined" ? window.location.origin : ""}/menu/{selectedQrLocation.slug}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl border border-[#E2E2DC] bg-stone-50 text-stone-800 text-xs font-semibold hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                <span>{copiedLink ? "Copied!" : "Copy URL"}</span>
              </button>

              <button
                onClick={handleDownloadQr}
                className="px-3.5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save QR Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
