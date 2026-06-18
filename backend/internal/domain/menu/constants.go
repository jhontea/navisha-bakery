package menu

// MenuCategory represents a menu item category
type MenuCategory string

const (
	CategoryFood     MenuCategory = "Food"
	CategoryBeverage MenuCategory = "Beverage"
	CategoryCake     MenuCategory = "Cake"
	CategoryPastry   MenuCategory = "Pastry"
	CategoryBread    MenuCategory = "Bread"
)

// AllCategories returns all valid menu categories
func AllCategories() []string {
	return []string{
		string(CategoryFood),
		string(CategoryBeverage),
		string(CategoryCake),
		string(CategoryPastry),
		string(CategoryBread),
	}
}

// IsValidCategory checks if the given category is valid
func IsValidCategory(category string) bool {
	for _, c := range AllCategories() {
		if c == category {
			return true
		}
	}
	return false
}
