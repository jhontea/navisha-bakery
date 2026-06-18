export const MENU_CATEGORIES = [
  "Food",
  "Beverage",
  "Cake",
  "Pastry",
  "Bread",
] as const;

export const CONTACT_STATUS = {
  NEW: "new",
  READ: "read",
  REPLIED: "replied",
} as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
} as const;

export const ITEMS_PER_PAGE = 20;

export const DUPLICATE_SUBMISSION_WINDOW = 5; // minutes