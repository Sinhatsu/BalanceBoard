type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  subcategories?: string[];
}

export const defaultCategories: Category[] = [
  // Income Categories
  {
    id: "salary",
    name: "Salary",
    type: "INCOME",
    color: "#10b981",
    icon: "BriefcaseOutline",
  },
  {
    id: "freelance",
    name: "Freelance",
    type: "INCOME",
    color: "#0ea5e9",
    icon: "DocumentText",
  },
  {
    id: "investments",
    name: "Investments",
    type: "INCOME",
    color: "#6366f1",
    icon: "LineChart",
  },
  {
    id: "business",
    name: "Business Income",
    type: "INCOME",
    color: "#d97706",
    icon: "RocketLaunch",
  },
  {
    id: "rental",
    name: "Rental Income",
    type: "INCOME",
    color: "#9333ea",
    icon: "HomeOutline",
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "INCOME",
    color: "#6b7280",
    icon: "DotsCircleHorizontal",
  },

  // Expense Categories
  {
    id: "housing",
    name: "Housing",
    type: "EXPENSE",
    color: "#ef4444",
    icon: "HomeModernOutline",
    subcategories: ["Rent", "EMI", "Maintenance", "Society Charges"],
  },
  {
    id: "transportation",
    name: "Transportation",
    type: "EXPENSE",
    color: "#f97316",
    icon: "CarOutline",
    subcategories: ["Petrol", "Auto/Cab", "Metro/Bus", "Vehicle Service"],
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "EXPENSE",
    color: "#84cc16",
    icon: "Basket",
    subcategories: ["Vegetables", "Fruits", "Daily Essentials", "Household"],
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "EXPENSE",
    color: "#0ea5e9",
    icon: "Hammer",
    subcategories: ["Electricity", "Water", "Gas", "Internet", "Mobile"],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "EXPENSE",
    color: "#8b5cf6",
    icon: "Ticket",
    subcategories: ["Movies", "OTT", "Concerts", "Sports"],
  },
  {
    id: "food",
    name: "Food & Dining",
    type: "EXPENSE",
    color: "#f43f5e",
    icon: "Restaurant",
    subcategories: ["Restaurants", "Swiggy/Zomato", "Cafe", "Street Food"],
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "EXPENSE",
    color: "#ec4899",
    icon: "BagOutline",
    subcategories: ["Clothes", "Electronics", "Amazon/Flipkart", "Household"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    type: "EXPENSE",
    color: "#14b8a6",
    icon: "MedicalBag",
    subcategories: ["Doctor", "Medicines", "Tests", "Hospital"],
  },
  {
    id: "education",
    name: "Education",
    type: "EXPENSE",
    color: "#4f46e5",
    icon: "BooksOutline",
    subcategories: ["Courses", "Books", "Tuition", "Coaching"],
  },
  {
    id: "personal",
    name: "Personal Care",
    type: "EXPENSE",
    color: "#db2777",
    icon: "SpaOutline",
    subcategories: ["Salon", "Gym", "Grooming", "Wellness"],
  },
  {
    id: "travel",
    name: "Travel",
    type: "EXPENSE",
    color: "#0284c7",
    icon: "BeachUmbrella",
    subcategories: ["Flights", "Hotels", "Train", "Vacation"],
  },
  {
    id: "insurance",
    name: "Insurance",
    type: "EXPENSE",
    color: "#475569",
    icon: "LockShield",
    subcategories: ["Health", "Life", "Vehicle", "Term"],
  },
  {
    id: "gifts",
    name: "Gifts & Donations",
    type: "EXPENSE",
    color: "#facc15",
    icon: "GiftOutline",
    subcategories: ["Festivals", "Birthdays", "Charity", "Family"],
  },
  {
    id: "bills",
    name: "Bills & EMIs",
    type: "EXPENSE",
    color: "#c026d3",
    icon: "CreditCard",
    subcategories: ["Credit Card", "Loan EMI", "Subscriptions", "Recharges"],
  },
  {
    id: "other-expense",
    name: "Other Expenses",
    type: "EXPENSE",
    color: "#94a3b8",
    icon: "ExclamationCircle",
  },
];

export const categoryColors: Record<string, string> = defaultCategories.reduce(
  (acc, category) => {
    acc[category.id] = category.color;
    return acc;
  },
  {} as Record<string, string>
);
