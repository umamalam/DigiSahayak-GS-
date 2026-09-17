export interface Scheme {
  id: string;
  title: string;
  image: string;
}

const createSchemes = (titles: string[], images: string[]): Scheme[] => {
  return titles.map((title, i) => ({
    id: `${title.replace(/\s+/g, '-').toLowerCase()}-${i}`,
    title,
    image: images[i % images.length],
  }));
};

export const farmersSchemes = createSchemes(
  ["PM-KISAN", "Kisan Credit Card", "Fasal Bima", "Soil Health", "Kisan Maandhan", "Paramparagat Krishi"],
  ["/stock_images/indian_farmer_agricu_646481f5.jpg", "/stock_images/indian_farmer_agricu_9218b78c.jpg"]
);

export const studentsSchemes = createSchemes(
  ["National Scholarship", "PM Scholarship", "Post-Matric", "AICTE Pragati", "PMSSS", "Ishan Uday"],
  ["/stock_images/indian_students_educ_257606db.jpg", "/stock_images/indian_students_educ_7a4cbbf9.jpg"]
);

export const childrenSchemes = createSchemes(
  ["Childline 1098", "Mid-Day Meal", "Anganwadi", "PM Poshan", "Mission Vatsalya", "Poshan Abhiyaan"],
  ["/stock_images/indian_children_nutr_9d323d9f.jpg", "/stock_images/indian_children_nutr_dd9a2924.jpg"]
);

export const womenSchemes = createSchemes(
  ["Beti Bachao", "Ujjwala Yojana", "Mahila Samridhi", "Matru Vandana", "Nari Shakti", "Sukanya Samriddhi"],
  ["/stock_images/indian_women_empower_693c7d22.jpg", "/stock_images/indian_women_empower_56381e5e.jpg"]
);

export const seniorSchemes = createSchemes(
  ["Old Age Pension", "Reverse Mortgage", "Varishta Pension", "IGNOAPS", "Rashtriya Vayoshri", "Elder Line"],
  ["/stock_images/indian_senior_citize_364abb21.jpg"]
);

export const youthSchemes = createSchemes(
  ["PMRY", "PMKVY", "DDU-GKY", "NCS Job Assistance", "PM Svanidhi", "Employment Exchange"],
  ["/stock_images/unemployed_youth_ski_8212dad0.jpg"]
);

export const disabledSchemes = createSchemes(
  ["ADIP Scheme", "Divyang Scholarship", "Accessible India", "Disability Pension", "Niramaya", "Deendayal Rehab"],
  ["/stock_images/differently_abled_pe_a7444fb8.jpg"]
);
