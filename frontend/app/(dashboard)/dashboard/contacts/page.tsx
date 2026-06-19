"use client";

import { useState } from "react";

const inquiries = [
  {
    id: 1,
    date: "Oct 24, 2023",
    customer: "Eleanor Shellstrop",
    email: "e.shellstrop@heaven.com",
    initials: "ES",
    avatarColor: "bg-tertiary-container text-on-tertiary-container",
    subject: "Custom Wedding Cake Inquiry",
    message: "I am looking for a three-tier vegan lemon cake for a wedding on June 15th. Do you offer delivery to the suburbs?",
    status: { label: "New", className: "bg-error-container text-on-error-container" },
  },
  {
    id: 2,
    date: "Oct 22, 2023",
    customer: "Tahani Al-Jamil",
    email: "tahani.aj@posh.com",
    initials: "TA",
    avatarColor: "bg-secondary-container text-on-secondary-container",
    subject: "Corporate Event Catering",
    message: "I need a selection of artisanal pastries for a high-profile gallery opening next Friday. Estimated guest count: 120.",
    status: { label: "Read", className: "bg-surface-container-highest text-on-surface-variant" },
  },
  {
    id: 3,
    date: "Oct 20, 2023",
    customer: "Chidi Anagonye",
    email: "chidi.ethics@uni.edu",
    initials: "CA",
    avatarColor: "bg-primary-container text-on-primary-container",
    subject: "Nut Allergy Question",
    message: "Hi, I wanted to confirm if your sourdough loaves are processed in a facility that also handles peanuts and tree nuts?",
    status: { label: "Replied", className: "bg-primary-container text-on-primary-container" },
  },
];

const stats = [
  { icon: "mail", iconColor: "text-primary", label: "Total Inquiries", value: "48", accentColor: "#6f4627" },
  { icon: "mark_email_unread", iconColor: "text-error", label: "New Messages", value: "12", accentColor: "#ba1a1a" },
  { icon: "mark_email_read", iconColor: "text-on-surface-variant", label: "Read", value: "28", accentColor: "#51443c" },
  { icon: "reply", iconColor: "text-secondary", label: "Replied", value: "8", accentColor: "#884d5c" },
];

function getIconBgColor(iconColor: string) {
  if (iconColor.includes("primary")) return "bg-primary-fixed";
  if (iconColor.includes("error")) return "bg-error-container";
  if (iconColor.includes("secondary")) return "bg-secondary-container";
  return "bg-surface-container-high";
}

export default function ContactsPage() {
  const [selectedInquiry, setSelectedInquiry] = useState<typeof inquiries[0] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (inquiry: typeof inquiries[0]) => {
    setSelectedInquiry(inquiry);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedInquiry(null), 300);
  };

  const drawerOverlayOpacity = isDrawerOpen ? 1 : 0;
  const drawerTranslateX = isDrawerOpen ? "translate-x-0" : "translate-x-full";
  const drawerVisibility = isDrawerOpen ? "visible" : "invisible";

  return (
    <>
      <div className="max-w-[1280px] mx-auto space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-surface-card p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all"
              style={{ borderLeftColor: stat.accentColor }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={"w-12 h-12 rounded-full flex items-center justify-center " + getIconBgColor(stat.iconColor)}>
                  <span className={"material-symbols-outlined " + stat.iconColor} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "24px" }}>{stat.icon}</span>
                </div>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="font-headline-lg text-headline-lg text-primary">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="bg-surface-card rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="p-4 md:p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="font-headline-md text-headline-md text-on-surface">Inquiry List</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all font-label-md text-label-md">
                <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>filter_list</span>
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Date</th>
                  <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Customer</th>
                  <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Subject</th>
                  <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Status</th>
                  <th className="px-4 md:px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-surface-container-lowest transition-colors cursor-pointer group" onClick={() => openDrawer(inquiry)}>
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-label-md text-on-surface-variant">{inquiry.date}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={"w-10 h-10 rounded-full flex items-center justify-center font-label-sm font-bold " + inquiry.avatarColor}>
                          {inquiry.initials}
                        </div>
                        <div>
                          <p className="font-bold font-body-md text-on-surface">{inquiry.customer}</p>
                          <p className="font-label-sm text-on-surface-variant opacity-70">{inquiry.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-body-md text-on-surface">{inquiry.subject}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={"px-3 py-1 rounded-full font-label-sm font-bold " + inquiry.status.className}>{inquiry.status.label}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-full transition-all">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>visibility</span>
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
            <p className="font-label-md text-on-surface-variant text-sm">Showing 1 to 10 of 48 inquiries</p>
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

      <div className={"fixed inset-0 z-[60] transition-opacity duration-300 " + drawerVisibility} onClick={closeDrawer}>
        <div className="absolute inset-0 bg-brown-900/40 transition-opacity duration-300" style={{ opacity: drawerOverlayOpacity }} />
        <div className={"absolute right-0 top-0 h-full w-full max-w-lg bg-surface-card shadow-2xl transition-transform duration-300 flex flex-col " + drawerTranslateX} onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface">Message Details</h3>
            <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors" onClick={closeDrawer}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedInquiry && (
              <>
                <div className="flex items-start gap-4">
                  <div className={"w-14 h-14 rounded-xl flex items-center justify-center font-label-md font-bold " + selectedInquiry.avatarColor}>
                    {selectedInquiry.initials}
                  </div>
                  <div>
                    <h4 className="font-headline-md text-on-surface">{selectedInquiry.customer}</h4>
                    <p className="font-label-md text-on-surface-variant">{selectedInquiry.email}</p>
                    <p className="font-label-sm text-on-surface-variant mt-1">Received {selectedInquiry.date}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Subject</span>
                    <p className="font-body-md font-bold text-primary mt-1">{selectedInquiry.subject}</p>
                  </div>
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Message</span>
                    <div className="mt-2 p-4 bg-surface-container-low rounded-lg text-on-surface font-body-md leading-relaxed border-l-4 border-primary">
                      {selectedInquiry.message}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="p-6 border-t border-outline-variant bg-surface-container-low flex gap-3">
            <button className="flex-1 py-3 px-6 bg-primary text-on-primary rounded-lg font-label-md font-bold hover:opacity-90 transition-all active:scale-98 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>reply</span>
              Reply
            </button>
            <button className="p-3 border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>archive</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}