"use client";

const stats = [
  {
    label: "Total Menu Items",
    value: "42",
    icon: "restaurant_menu",
    bgColor: "bg-primary-fixed",
    iconColor: "text-primary",
    trend: { value: "+3 this month", color: "text-green-600", icon: "trending_up" },
  },
  {
    label: "Active Inquiries",
    value: "18",
    icon: "mark_chat_unread",
    bgColor: "bg-secondary-fixed",
    iconColor: "text-secondary",
    trend: { value: "5 Urgent", color: "text-terracotta-500", icon: "notification_important" },
  },
  {
    label: "Registered Admins",
    value: "06",
    icon: "shield_person",
    bgColor: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    trend: { value: "Full access control", color: "text-on-surface-variant opacity-60", icon: null },
  },
];

const activities = [
  {
    icon: "edit_note",
    iconBg: "bg-primary-container/10",
    iconColor: "text-primary",
    text: (
      <>
        <span className="font-bold">Marie Laurent</span> updated the <span className="italic">Sourdough Loaf</span> pricing.
      </>
    ),
    time: "2 hours ago • Menu Management",
    badge: { text: "Updated", className: "bg-cream-100 text-brown-700" },
  },
  {
    icon: "mail",
    iconBg: "bg-secondary-container/10",
    iconColor: "text-secondary",
    text: (
      <>
        New inquiry from <span className="font-bold">John Doe</span> regarding bulk croissant order.
      </>
    ),
    time: "4 hours ago • Contact Inquiries",
    badge: { text: "New Message", className: "bg-pastel-pink-500/10 text-pastel-pink-500" },
  },
  {
    icon: "add_circle",
    iconBg: "bg-tertiary-container/10",
    iconColor: "text-tertiary",
    text: (
      <>
        Added new item: <span className="font-bold">Honey Glazed Pecan Tart</span>.
      </>
    ),
    time: "Yesterday • Menu Management",
    badge: { text: "Creation", className: "bg-primary-fixed text-on-primary-fixed" },
  },
  {
    icon: "security",
    iconBg: "bg-primary-container/10",
    iconColor: "text-primary",
    text: (
      <>
        New admin user <span className="font-bold">Sarah Chen</span> registered.
      </>
    ),
    time: "Yesterday • Admin Users",
    badge: { text: "System", className: "bg-outline-variant text-on-surface-variant" },
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-headline-xl text-headline-xl text-primary mb-2">Overview Dashboard</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Welcome back to the Navisha Bakery workshop.</p>
      </div>

      {/* Stats Cards - Same border-l-4 style as Menu/Admins/Contacts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-surface-card p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all"
            style={{ borderLeftColor: stat.iconColor.includes("primary") ? "#6f4627" : stat.iconColor.includes("secondary") ? "#884d5c" : "#654c00" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                <span
                  className={`material-symbols-outlined ${stat.iconColor}`}
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "24px" }}
                >
                  {stat.icon}
                </span>
              </div>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="font-headline-lg text-headline-lg text-primary mb-1">{stat.value}</p>
            <p className={`text-sm flex items-center gap-1 font-medium ${stat.trend.color}`}>
              {stat.trend.icon && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {stat.trend.icon}
                </span>
              )}
              {stat.trend.value}
            </p>
          </div>
        ))}
      </section>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Activity - Left Column */}
        <section className="col-span-12 lg:col-span-8 bg-surface-card rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
              <span className="px-3 py-1 bg-cream-500/10 text-primary rounded-full font-label-md font-bold">Live</span>
            </div>
            <button className="font-label-md text-primary hover:underline">View All Activity</button>
          </div>
          <div className="divide-y divide-outline-variant">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 px-6 py-5 hover:bg-surface-container-lowest transition-colors"
              >
                <div className={`p-2 rounded-lg ${activity.iconBg} ${activity.iconColor} flex-shrink-0`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-on-surface">{activity.text}</p>
                  <span className="font-label-sm text-on-surface-variant opacity-70">{activity.time}</span>
                </div>
                <span className={`font-label-md px-3 py-1 rounded-full text-[12px] ${activity.badge.className} flex-shrink-0`}>
                  {activity.badge.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column - Trending Item + Weekly Reach */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          {/* Trending Item Card */}
          <div className="bg-surface-card rounded-xl shadow-sm border border-outline-variant p-6 overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-headline-md text-headline-md text-primary mb-1">Trending Item</h4>
              <p className="font-label-md text-label-md text-on-surface-variant mb-4">Highest viewed this week</p>
              <div className="flex flex-col items-center">
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                  <img
                    alt="Artisanal Bread"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuApzZadpIyjyNnpxzgcA2Xd9bxDLTKTqbvh9yfNzZ3wsoW_iwGcJt-UWE6Qr4FNEpTzoPI-Koy-EgX-pbOytuQfZCqRgjBoAEXSwGaViGKxpFVQexza9uxVADqo9TT6CyVc7mH26ZQXLoAB0ojP3qQdTzdYguhCJCUqZhW0brPitkSn9JkuKrfHjiL22lPW8ES__NGmrRZp1y5ankIHPCn_a14j78phsRdJcG3lQaGmhbA-sqpDqPD4GWqU8YuGczYWBRai2m-2rtLr"
                  />
                </div>
                <div className="w-full text-center">
                  <span className="font-headline-md text-headline-md text-brown-900 block">Classic Baguette</span>
                  <span className="font-bold text-terracotta-500 block mb-4">$4.50</span>
                  <button className="w-full py-2 border border-primary text-primary rounded-lg font-label-md hover:bg-primary hover:text-on-primary transition-all">
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }} />
          </div>

          {/* Weekly Reach Card */}
          <div className="bg-primary text-on-primary rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label-md text-label-md opacity-80">Weekly Reach</p>
                <h4 className="font-headline-lg text-headline-lg">+1,240</h4>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                analytics
              </span>
            </div>
            <div className="flex items-end gap-1 h-12">
              <div className="flex-1 bg-white/20 rounded-t-sm h-[40%]" />
              <div className="flex-1 bg-white/20 rounded-t-sm h-[60%]" />
              <div className="flex-1 bg-white/40 rounded-t-sm h-[80%]" />
              <div className="flex-1 bg-white/20 rounded-t-sm h-[50%]" />
              <div className="flex-1 bg-white/60 rounded-t-sm h-[100%]" />
              <div className="flex-1 bg-white/80 rounded-t-sm h-[70%]" />
              <div className="flex-1 bg-white/30 rounded-t-sm h-[100%]" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}