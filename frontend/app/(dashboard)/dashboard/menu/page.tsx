"use client";

const menuItems = [
  {
    id: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHWgRd5bsyIYnm98GlRUrccWTfN_K1jIg3vm3d5HWqwME1r0UvRCfNZMMtqmzwIv9WjQwaQpzzJHZdgdoDUTa6h7kC5j9MdJaJapZmbCLZMUw8har1IVUNwbAu1RfFEC8f5kbCiwkff1-7HkrXNzAcJeYjOcwABPFfaPU_m9yi-FRuMQcA6uEj8f-1-tmBBXWG5J9_vkIzfY6_fg94VaEePh2Zhxmqfxg1vLfG9G81IDO2epLsnJRuc5DrgmV0DQDGDGmoQrgdpsB_",
    name: "Classic Sourdough Loaf",
    sku: "BAK-SDR-001",
    category: { label: "Breads", className: "bg-cream-500/10 text-primary" },
    price: "$8.50",
    availability: { status: "In Stock", color: "bg-emerald-500", text: "text-on-surface" },
  },
  {
    id: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNlcMudzOF0TAtWSousrzXL-cXgMF4lapEqQFBz3mb9OTrNtNUaCpTdRd-ywNwIDb1mzghI3eNm-RVKyG19OJYIWZkidyht4PSqjWbG0eXswbiuC3AdknZrPHC72cRE6CkK2vMqJrGqeMedCdvl-HCw_3JuFuQDg_tG-PpE_A0MMXfg58meghBjazCpM-D2L7_8Kglm-_PQg5-d7BA3Ifl2CFkEFAVI2DZUOH1Im_w8IOCioLqa4ThJG_OfOn6ntcNhlcCDKAqmIj9",
    name: "Butter Croissant",
    sku: "BAK-PST-012",
    category: { label: "Pastries", className: "bg-secondary-container/20 text-secondary" },
    price: "$4.25",
    availability: { status: "In Stock", color: "bg-emerald-500", text: "text-on-surface" },
  },
  {
    id: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPjYtK1uQ7NTRQo2tc9Y5QV6ps9GWHgtCJN-8R1w5o-bTavA6kfS5OrnJGb4xhmXrFAQhYvSGXnGW6RomHPugXi1714lTIGKRM8Rfi3roKRqm-_kMIZLBclN8qe2dWnKp5JpS6JIKzK_NZ6wUtjzV5YhkVbOjMHcxXuHPBx_85FBh0HQukvUR7xe4gRMVNxIbVOlJNX4PmGdhRCDba1iZe38SZfkoV148ga0gBzMVjanWw5pPnyWRHtpOwsxfjgxw5yIquKRFxbFpc",
    name: "Midnight Cocoa Tart",
    sku: "BAK-SPC-005",
    category: { label: "Specialty", className: "bg-tertiary-fixed/30 text-tertiary" },
    price: { original: "$15.00", sale: "$12.00" },
    availability: { status: "Low Stock (5)", color: "bg-gold-500", text: "text-on-surface" },
  },
  {
    id: 4,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmqXa8jYq1Ruj0cGnRuzoYjz-NZ7pYeK7v6RsyzFxdEMULKPtm3p6ELm9rHnzhovmHUCny-xHbL40Cqls31EVBBoIDtVmThQwmsXjP66AWxSNhp6NJ-Zywzgy3FlbZabLLFFBpOTQX0On4E4nOAk9L8VnsgrCibhHZ5A4YMm6vqvs8CE3I3m-I8g2PGuNjyu_lx6bVp66MdzsnYdVZnog7YwUIdAup5P28dnar1QExVYMP2luPezCeKJhBprME0PtQ9rexVwpjhNVG",
    name: "French Baguette",
    sku: "BAK-BREAD-04",
    category: { label: "Breads", className: "bg-cream-500/10 text-primary" },
    price: "$3.50",
    availability: { status: "Out of Stock", color: "bg-error", text: "text-on-surface" },
  },
];

const stats = [
  { icon: "restaurant_menu", iconColor: "text-primary", label: "Total Items", value: "42", accentColor: "#6f4627" },
  { icon: "category", iconColor: "text-tertiary", label: "Categories", value: "8", accentColor: "#654c00" },
  { icon: "warning", iconColor: "text-terracotta-500", label: "Low Stock", value: "3", accentColor: "#D4421E" },
  { icon: "star", iconColor: "text-gold-500", label: "Featured", value: "5", accentColor: "#FFC726" },
];

export default function MenuPage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-8">
      {/* Stats Cards - Same style as Dashboard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-surface-card p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all"
            style={{ borderLeftColor: stat.accentColor }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stat.iconColor.includes("primary") ? "bg-primary-fixed" :
                stat.iconColor.includes("tertiary") ? "bg-tertiary-fixed" :
                stat.iconColor.includes("terracotta") ? "bg-error-container" :
                stat.iconColor.includes("gold") ? "bg-cream-100" : "bg-surface-container-high"
              }`}>
                <span className={`material-symbols-outlined ${stat.iconColor}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "24px" }}>{stat.icon}</span>
              </div>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="font-headline-lg text-headline-lg text-primary">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Data Table Section */}
      <section className="bg-surface-card rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="p-4 md:p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">Product Inventory</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-3 md:px-4 py-2 rounded-lg font-label-md text-label-md shadow-md active:scale-95 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}>add</span>
              <span className="hidden sm:inline">Add Item</span>
            </button>
            <button className="flex items-center gap-2 px-3 md:px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all font-label-md text-label-md">
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>filter_list</span>
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button className="flex items-center gap-2 px-3 md:px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all font-label-md text-label-md">
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Product Image</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Product Name</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Category</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-right">Price</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Availability</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-4 md:px-6 py-4">
                    <img className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform duration-300" src={item.image} alt={item.name} />
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="font-bold font-body-md text-on-surface">{item.name}</p>
                    <p className="font-label-sm text-on-surface-variant opacity-70">SKU: {item.sku}</p>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`px-3 py-1 rounded-full font-label-sm font-bold ${item.category.className}`}>{item.category.label}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    {typeof item.price === "string" ? (
                      <p className="font-bold font-body-md text-primary">{item.price}</p>
                    ) : (
                      <div className="flex flex-col items-end">
                        <p className="font-label-sm text-on-surface-variant line-through">{item.price.original}</p>
                        <p className="font-bold font-body-md text-terracotta-500">{item.price.sale}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.availability.color}`} />
                      <span className={`font-label-md font-medium ${item.availability.text}`}>{item.availability.status}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-full transition-all">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>edit</span>
                      </button>
                      <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-all">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 md:p-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-label-md text-on-surface-variant text-sm">Showing 1 to 10 of 42 items</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30" disabled>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_left</span>
            </button>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary text-on-primary font-bold font-label-md text-sm">1</button>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-sm">2</button>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-sm">3</button>
            <span className="px-1 text-on-surface-variant text-sm">...</span>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-sm">5</button>
            <button className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}