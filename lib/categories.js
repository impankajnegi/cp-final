// Categories and Subcategories for Chaarpaisa

export const CATEGORIES = {
  RIDING_ACCESSORIES: 'Riding Accessories',
  WEDDING: 'Wedding'
};

export const SUBCATEGORIES = {
  'Riding Accessories': [
    'Helmets',
    'Riding Gear',
    'Bike Accessories',
    'Safety Equipment',
    'Luggage & Bags',
    'Maintenance Tools'
  ],
  'Wedding': [
    'Bridal Wear',
    'Groom Wear',
    'Jewelry',
    'Decorations',
    'Furniture',
    'Lights & Sound',
    'Photography Props'
  ]
};

export const MAIN_CATEGORIES = [
  CATEGORIES.RIDING_ACCESSORIES,
  CATEGORIES.WEDDING
];

export const getSubcategories = (category) => {
  return SUBCATEGORIES[category] || [];
};

export const CONDITIONS = [
  'new',
  'like-new',
  'good',
  'fair'
];

export const ITEM_STATUS = {
  LISTED: 'listed',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  UNAVAILABLE: 'unavailable'
};
