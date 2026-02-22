export type TripStatus = 'searching' | 'driver_assigned' | 'driver_arriving' | 'arrived' | 'pickup_confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type Zone = 'chaweng' | 'lamai' | 'bophut' | 'maenam' | 'nathon' | 'lipa_noi' | 'taling_ngam' | 'choeng_mon';

export const ZONE_LABELS: Record<Zone, string> = {
  chaweng: 'Chaweng',
  lamai: 'Lamai',
  bophut: 'Bophut / Fisherman Village',
  maenam: 'Mae Nam',
  nathon: 'Nathon',
  lipa_noi: 'Lipa Noi',
  taling_ngam: 'Taling Ngam',
  choeng_mon: 'Choeng Mon',
};

export interface Driver {
  id: string;
  fullName: string;
  languages: string[];
  licenseNo: string;
  ratingAvg: number;
  ratingCount: number;
  homeZone: Zone;
  canDriveManual: boolean;
  vehicleType: string;
  vehiclePlate: string;
  photoUrl?: string;
}

export interface Trip {
  id: string;
  customerId: string;
  driverId?: string;
  driver?: Driver;
  zone: Zone;
  status: TripStatus;
  pickupAddress: string;
  pickupNote?: string;
  dropoffAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  distanceKm?: number;
  estimatedFare?: number;
  totalFare?: number;
  otpCode?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface PricingRule {
  zone: Zone;
  baseFare: number;
  perKmRate: number;
  minFare: number;
  surgeMultiplier: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  preferredLanguage: string;
  defaultPickupNote?: string;
}

export type DriverRegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface DriverRegistration {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  languages: string[];
  licenseNo: string;
  homeZone: Zone;
  canDriveManual: boolean;
  vehicleType: string;
  vehiclePlate: string;
  policyAccepted: boolean;
  policyAcceptedAt: string;
  status: DriverRegistrationStatus;
  createdAt: string;
}

export const PRICING_RULES: PricingRule[] = [
  { zone: 'chaweng', baseFare: 80, perKmRate: 15, minFare: 100, surgeMultiplier: 1.0 },
  { zone: 'lamai', baseFare: 80, perKmRate: 15, minFare: 100, surgeMultiplier: 1.0 },
  { zone: 'bophut', baseFare: 90, perKmRate: 16, minFare: 120, surgeMultiplier: 1.0 },
  { zone: 'maenam', baseFare: 90, perKmRate: 16, minFare: 120, surgeMultiplier: 1.0 },
  { zone: 'nathon', baseFare: 70, perKmRate: 14, minFare: 90, surgeMultiplier: 1.0 },
  { zone: 'lipa_noi', baseFare: 100, perKmRate: 18, minFare: 150, surgeMultiplier: 1.0 },
  { zone: 'taling_ngam', baseFare: 100, perKmRate: 18, minFare: 150, surgeMultiplier: 1.0 },
  { zone: 'choeng_mon', baseFare: 85, perKmRate: 15, minFare: 110, surgeMultiplier: 1.0 },
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    fullName: 'Somchai Prasert',
    languages: ['Thai', 'English'],
    licenseNo: 'DL-84001',
    ratingAvg: 4.8,
    ratingCount: 342,
    homeZone: 'chaweng',
    canDriveManual: true,
    vehicleType: 'Toyota Vios',
    vehiclePlate: '7 กว 8401',
  },
  {
    id: 'd2',
    fullName: 'Niran Kittisak',
    languages: ['Thai', 'English', 'Chinese'],
    ratingAvg: 4.9,
    ratingCount: 518,
    licenseNo: 'DL-84002',
    homeZone: 'lamai',
    canDriveManual: true,
    vehicleType: 'Honda City',
    vehiclePlate: '3 กร 2201',
  },
  {
    id: 'd3',
    fullName: 'Patchara Wongsiri',
    languages: ['Thai', 'English'],
    ratingAvg: 4.7,
    ratingCount: 189,
    licenseNo: 'DL-84003',
    homeZone: 'bophut',
    canDriveManual: false,
    vehicleType: 'Nissan Almera',
    vehiclePlate: '1 กก 5543',
  },
];

export function calculateFare(zone: Zone, distanceKm: number): number {
  const rule = PRICING_RULES.find(r => r.zone === zone) || PRICING_RULES[0];
  const fare = rule.baseFare + (distanceKm * rule.perKmRate);
  return Math.max(Math.round(fare * rule.surgeMultiplier), rule.minFare);
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
