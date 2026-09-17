// Maps category slugs to relevant stock images
const categoryImageMap: Record<string, string> = {
  'farmers': '/stock_images/indian_farmer_agricu_646481f5.jpg',
  'students': '/stock_images/indian_students_educ_257606db.jpg',
  'women': '/stock_images/indian_women_empower_56381e5e.jpg',
  'children': '/stock_images/indian_children_nutr_9d323d9f.jpg',
  'senior-citizens': '/stock_images/indian_senior_citize_364abb21.jpg',
  'youth': '/stock_images/unemployed_youth_ski_8212dad0.jpg',
  'differently-abled': '/stock_images/differently_abled_pe_a7444fb8.jpg',
  'entrepreneurs': '/stock_images/indian_farmer_agricu_9218b78c.jpg',
  'agricultural-workers': '/stock_images/indian_farmer_agricu_646481f5.jpg',
  'sc-st-obc': '/stock_images/indian_students_educ_7a4cbbf9.jpg',
  'housing': '/stock_images/indian_farmer_agricu_9218b78c.jpg',
  'health': '/stock_images/indian_senior_citize_364abb21.jpg',
  'rural-development': '/stock_images/indian_farmer_agricu_646481f5.jpg',
  'urban-poor': '/stock_images/unemployed_youth_ski_8212dad0.jpg',
  'environment': '/stock_images/indian_farmer_agricu_9218b78c.jpg',
  'widows': '/stock_images/indian_women_empower_693c7d22.jpg',
  'transport': '/stock_images/unemployed_youth_ski_8212dad0.jpg',
};

export function getSchemeImage(categorySlug: string): string {
  return categoryImageMap[categorySlug] || '/stock_images/indian_farmer_agricu_646481f5.jpg';
}
