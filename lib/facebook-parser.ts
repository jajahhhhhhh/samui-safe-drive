import { Property, PropertyType, Zone, ZONE_LABELS } from './types';

export interface PropertyImportResult {
  success: boolean;
  property?: Partial<Property>;
  errors: string[];
  confidence: number;
}

/**
 * Parse a Facebook post to extract property details
 * Extracts: price, zone, property type, contact info, description, photo URLs
 */
export function parsePropertyFromFacebookPost(
  postText: string,
  photoUrls: string[] = []
): PropertyImportResult {
  const errors: string[] = [];
  let confidence = 100;

  // Normalize text for parsing
  const normalizedText = postText.toLowerCase();

  // Extract Price
  const priceMatch = normalizedText.match(
    /(?:ราคา|price|฿|thb|บาท)[\s:]*([0-9,]+)/i
  );
  let price: number | undefined;
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
  } else {
    errors.push('Price not found');
    confidence -= 20;
  }

  // Extract Zone
  let zone: Zone | undefined;
  const zoneNames = Object.entries(ZONE_LABELS);
  for (const [zoneKey, zoneLabel] of zoneNames) {
    if (
      normalizedText.includes(zoneKey.toLowerCase()) ||
      normalizedText.includes(zoneLabel.toLowerCase())
    ) {
      zone = zoneKey as Zone;
      break;
    }
  }
  if (!zone) {
    errors.push('Zone not clearly identified');
    confidence -= 20;
  }

  // Extract Property Type
  const typeKeywords: Record<PropertyType, string[]> = {
    villa: ['villa', 'วิลล่า', 'วิลา', 'บ้านพัก'],
    apartment: ['apartment', 'อพ', 'แอพ', 'อพาร์ตเมนต์', 'condominium'],
    house: ['house', 'บ้าน', 'บ้านเดี่ยว'],
    condo: ['condo', 'คอนโด', 'คอนโดมิเนียม'],
    hotel: ['hotel', 'hotelโรงแรม', 'resort', 'รีสอร์ท'],
    vacation_rental: ['rental', 'ให้เช่า', 'vacation', 'airbnb'],
  };

  let propertyType: PropertyType | undefined;
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(kw => normalizedText.includes(kw))) {
      propertyType = type as PropertyType;
      break;
    }
  }
  if (!propertyType) {
    errors.push('Property type not identified, defaulting to apartment');
    propertyType = 'apartment';
    confidence -= 15;
  }

  // Extract Contact Information
  const phoneRegex = /(?:\+66|0)[\d\s\-()]{8,}/g;
  const phoneMatches = postText.match(phoneRegex);
  const ownerPhone = phoneMatches ? phoneMatches[0].trim() : '';

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = postText.match(emailRegex);
  const ownerEmail = emailMatches ? emailMatches[0] : '';

  if (!ownerPhone && !ownerEmail) {
    errors.push('No contact information found');
    confidence -= 15;
  }

  // Extract Description (first 100-200 characters)
  const descriptionMatch = postText.match(/^(.{50,200}?)(?:\n|contact|phone|price|\.)/i);
  const description = descriptionMatch
    ? descriptionMatch[1].trim().replace(/^[✓✗\-\*•]+\s*/gm, '')
    : postText.slice(0, 150);

  // Extract Title (first line or first sentence)
  const titleMatch = postText.match(/^([^\n.]+)/);
  const title = titleMatch ? titleMatch[1].trim() : `${propertyType} in ${zone}`;

  // Check if we have minimum required data
  if (!price || !zone || !propertyType) {
    return {
      success: false,
      errors: [...new Set(errors)], // Remove duplicates
      confidence: Math.max(confidence, 10),
    };
  }

  const property: Partial<Property> = {
    title,
    description,
    propertyType,
    zone,
    price,
    currency: 'THB',
    address: `${zone}, Koh Samui`,
    photos: photoUrls.length > 0 ? photoUrls : ['https://via.placeholder.com/400x300'],
    amenities: extractAmenities(postText),
    rating: 4.0,
    ratingCount: 0,
    reviews: [],
    ownerPhone: ownerPhone || 'Contact available',
    ownerEmail: ownerEmail || 'Not provided',
    ownerName: 'Facebook User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'facebook',
    importedAt: new Date().toISOString(),
  };

  return {
    success: true,
    property,
    errors: [...new Set(errors)],
    confidence: Math.max(confidence, 30),
  };
}

/**
 * Extract amenities from text by looking for common keywords
 */
function extractAmenities(text: string): string[] {
  const amenityKeywords: Record<string, string[]> = {
    WiFi: ['wifi', 'wi-fi', 'internet', 'broadband'],
    AC: ['ac', 'air', 'conditioning', 'aircon', 'แอร์'],
    Pool: ['pool', 'swimming', 'สระว่ายน้ำ'],
    'Beach Access': ['beach', 'beachfront', 'seaside', 'ชายหาด', 'ทะเล'],
    Kitchen: ['kitchen', 'cook', 'กำแพง'],
    Parking: ['parking', 'garage', 'park', 'ที่จอดรถ'],
    Gym: ['gym', 'fitness', 'exercise'],
    Spa: ['spa', 'massage', 'สปา'],
    Restaurant: ['restaurant', 'dining', 'cafe', 'ร้านอาหาร'],
    'Room Service': ['room service', 'housekeeping'],
    Concierge: ['concierge', 'front desk'],
    Garden: ['garden', 'yard', 'outdoor', 'สวน'],
    Laundry: ['laundry', 'wash', 'ซักรีด'],
    Balcony: ['balcony', 'terrace', 'patio', 'เฉลียง'],
    Library: ['library', 'reading'],
    'Bicycle Rental': ['bicycle', 'bike', 'cycling'],
    'Private Chef': ['chef', 'cooking', 'catering'],
  };

  const normalizedText = text.toLowerCase();
  const foundAmenities: string[] = [];

  for (const [amenity, keywords] of Object.entries(amenityKeywords)) {
    if (keywords.some(kw => normalizedText.includes(kw))) {
      foundAmenities.push(amenity);
    }
  }

  // Return unique amenities or empty defaults
  return foundAmenities.length > 0
    ? [...new Set(foundAmenities)]
    : ['WiFi', 'AC'];
}

/**
 * Calculate similarity score between two strings (0-100)
 * Used for duplicate detection
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.includes(shorter)) return 90;

  const editDistance = getLevenshteinDistance(longer, shorter);
  const similarity = ((longer.length - editDistance) / longer.length) * 100;
  return Math.round(similarity);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function getLevenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
