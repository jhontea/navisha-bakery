"use client";

const adminUsers = [
  {
    name: "Sarah Jenkins",
    email: "sarah.j@navishabakery.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrGLAzm9COJoTdx0bqRGNm2gnlN7YDczBFz7qJ5X6rcKLsFyJR1RDJH6IrgyOFUFclsOGWGGuHhl2LKgqoQTOtrJPNTHBUIrjXOyDgAWKGOUKfT0vL1EJanO3W3GhD2Tt369kVpHsc_IkFG-BQ81i62V_2CQLxnDanuW_THnFAb58gtwEly-t2ej9Blq_Y_xrh_1vBoRSBo1kbMuNS5KoLj3_zdybR62hIbymMKdlKkMqWchMtfBl51IhxNsyD2QWinS6Sj6MKa3Hb",
    role: { label: "Super Admin", className: "bg-primary-container/20 text-primary-container" },
    status: { color: "text-green-600", dotColor: "bg-green-500", label: "Active" },
    joined: "Joined 12 Oct 2023",
  },
  {
    name: "Marcus Thorne",
    email: "m.thorne@navishabakery.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCO8rVExcOdgonLosvOKPJB5ZXguiO0eKuWn7icEEgnNF1w0zR-cIweW-s19H9wrsiL6WIh31i4PS-ELaJihUsZYaCg7msGwJFiGWYt6y7f08Fax-DQiY_GWIVuAFBSaXZVNyRhtr01wiXWiTQSwqR5ScXjpPYm7NNGcrlv8LVRQW9p4I-fOe4PbjYZVij365uF1iXbeqCl-RFKNP_xzZ1w3DCms830Lzm669x2ZDiCodYVjKM51fmsHS6BTMJKwi288Cjp02P6Ohao",
    role: { label: "Staff", className: "bg-secondary-container/20 text-secondary" },
    status: { color: "text-green-600", dotColor: "bg-green-500", label: "Active" },
    joined: "Joined 05 Nov 2023",
  },
  {
    name: "Elena Dubois",
    email: "elena.d@navishabakery.com",
    avatar: null,
    initials: "ED",
    role: { label: "Staff", className: "bg-secondary-container/20 text-secondary" },
    status: { color: "text-gold-500", dotColor: "bg-gold-500 animate-pulse", label: "Pending" },
    joined: "Invited 2 days ago",
    isPending: true,
  },
  {
    name: "Chloe Smith",
    email: "chloe.s@navishabakery.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUC3JJx0FZa0nqk2ZgRkhWK10cXye2Ux8jH9-z2MWcaiLhhPU8z_hZGm9ocpyHP01ADXHugZK9BNyWZxyEwwU-XKPdF_0-RRXqSXgFIVtuaiPkwAckSoxVWf9SJ71IU-_EqupwOESITAMX7jpibTtqVUbuoVSug2WHQS-TjWMNwnil3abffsOKKb_4jUSOSWPjOvcmS9S-8qXalzKrrW--51zPOlT46AELAmJSqHUO56WmArM0BH9QjJ65JJmrhW5MgOPpfgh6yAww",
    role: { label: "Staff", className: "bg-secondary-container/20 text-secondary" },
    status: { color: "text-green-600", dotColor: "bg-green-500", label: "Active" },
    joined: "Joined 15 Jan 2024",
  },
];

const statCards = [
  { icon: "group", iconColor: "text-primary", label: "Total Staff", value: "24", accentColor: "#6f4627" },
  { icon: "verified_user", iconColor: "text-tertiary", label: "Super Admins", value: "4", accentColor: "#654c00" },
  { icon: "pending_actions", iconColor: "text-gold-500", label: "Pending Invites", value: "3", accentColor: "#FFC726" },
  { icon: "person_off", iconColor: "text-secondary", label: "Inactive", value: "2", accentColor: "#884d5c" },
];

export default function AdminsPage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-8">
      {/* Stats Cards - Same style as Dashboard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-surface-card p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all"
            style={{ borderLeftColor: stat.accentColor }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stat.iconColor.includes("primary") ? "bg-primary-fixed" :
                stat.iconColor.includes("tertiary") ? "bg-tertiary-fixed" :
                stat.iconColor.includes("gold") ? "bg-cream-100" :
                stat.iconColor.includes("secondary") ? "bg-secondary-container" : "bg-surface-container-high"
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
        {/* Table Header with Filters */}
        <div className="p-4 md:p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">Admin List</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-3 md:px-4 py-2 rounded-lg font-label-md text-label-md shadow-md active:scale-95 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}>person_add</span>
              <span className="hidden sm:inline">Add Admin</span>
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
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Name</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Email</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Role</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Status</th>
                <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {adminUsers.map((user, index) => (
                <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img alt="User Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm" src={user.avatar} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary font-bold font-label-sm">
                          {user.initials}
                        </div>
                      )}
                      <div>
                        <p className="font-bold font-body-md text-on-surface">{user.name}</p>
                        <p className="font-label-sm text-on-surface-variant opacity-70">{user.joined}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="font-body-md text-on-surface-variant">{user.email}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`px-3 py-1 rounded-full font-label-sm font-bold ${user.role.className}`}>{user.role.label}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status.dotColor}`} />
                      <span className={`font-label-md font-medium ${user.status.color}`}>{user.status.label}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                      {user.isPending ? (
                        <button className="font-label-md text-primary hover:underline mr-2 text-sm">Resend</button>
                      ) : (
                        <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-full transition-all">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>edit</span>
                        </button>
                      )}
                      <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-all">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{user.isPending ? "close" : "delete"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 md:p-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-label-md text-on-surface-variant text-sm">Showing 1 to 4 of 24 results</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30" disabled>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_left</span>
            </button>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary text-on-primary font-bold font-label-md text-sm">1</button>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-sm">2</button>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-sm">3</button>
            <button className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="bg-primary-container/10 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start gap-4 md:gap-6 border border-primary-container/20">
        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-primary-container rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1", fontSize: "28px" }}>security</span>
        </div>
        <div className="space-y-2">
          <h4 className="font-headline-md text-headline-md text-primary">Admin Security Protocols</h4>
          <p className="font-body-md text-on-surface-variant text-sm md:text-base">
            Adding a new admin will grant them access to sensitive financial and operational data. Please ensure all administrative staff follow our 2FA policies.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4 pt-2">
            <a className="font-label-md font-bold text-primary hover:underline flex items-center gap-1 text-sm" href="#">
              Review Security Logs
              <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_right_alt</span>
            </a>
            <a className="font-label-md font-bold text-primary hover:underline flex items-center gap-1 text-sm" href="#">
              Access Control Policy
              <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_right_alt</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}