export interface RealBus {
  id: string;
  operator: string;
  type: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seatsLeft: number;
  rating: number;
  reviews: number;
  isAC: boolean;
  isSleeper: boolean;
  isPrimo: boolean;
  gpsRoute: { lat: number; lng: number; stopName: string }[];
}

export const REAL_WORLD_BUSES: RealBus[] = [
  // --- PATIALA <-> CHANDIGARH ROUTES (RedBus Snapshot) ---
  {
    id: 'PB-PRTC-101',
    operator: 'PRTC (Pepsu Road Transport)',
    type: 'HVAC Seater (2+2)',
    from: 'Patiala',
    to: 'Chandigarh',
    departure: '06:00',
    arrival: '07:30',
    duration: '1h 30m',
    price: 140,
    seatsLeft: 22,
    rating: 4.1,
    reviews: 840,
    isAC: true,
    isSleeper: false,
    isPrimo: false,
    gpsRoute: [
      { lat: 30.3398, lng: 76.3869, stopName: 'Patiala Bus Stand' },
      { lat: 30.6425, lng: 76.8173, stopName: 'Zirakpur' },
      { lat: 30.7333, lng: 76.7794, stopName: 'ISBT Sec 43 Chandigarh' }
    ]
  },
  {
    id: 'PB-LIBRA-882',
    operator: 'Libra Bus Service',
    type: 'A/C Seater (2+2)',
    from: 'Patiala',
    to: 'Chandigarh',
    departure: '08:15',
    arrival: '09:45',
    duration: '1h 30m',
    price: 150,
    seatsLeft: 12,
    rating: 4.5,
    reviews: 312,
    isAC: true,
    isSleeper: false,
    isPrimo: true,
    gpsRoute: [
      { lat: 30.3398, lng: 76.3869, stopName: 'Patiala Bus Stand' },
      { lat: 30.7333, lng: 76.7794, stopName: 'ISBT Sec 43 Chandigarh' }
    ]
  },
  {
    id: 'PB-INDO-091',
    operator: 'Indo Canadian Transport',
    type: 'Volvo Multi-Axle A/C Semi Sleeper',
    from: 'Patiala',
    to: 'Chandigarh',
    departure: '10:30',
    arrival: '11:55',
    duration: '1h 25m',
    price: 350,
    seatsLeft: 8,
    rating: 4.8,
    reviews: 1240,
    isAC: true,
    isSleeper: false,
    isPrimo: true,
    gpsRoute: [
      { lat: 30.3398, lng: 76.3869, stopName: 'Patiala Bus Stand' },
      { lat: 30.7333, lng: 76.7794, stopName: 'ISBT Sec 43 Chandigarh' }
    ]
  },
  {
    id: 'PB-ZIMIN-445',
    operator: 'Zimindara Travels',
    type: 'Non A/C Seater (2+3)',
    from: 'Patiala',
    to: 'Chandigarh',
    departure: '13:00',
    arrival: '14:45',
    duration: '1h 45m',
    price: 100,
    seatsLeft: 34,
    rating: 3.9,
    reviews: 156,
    isAC: false,
    isSleeper: false,
    isPrimo: false,
    gpsRoute: [
      { lat: 30.3398, lng: 76.3869, stopName: 'Patiala Bus Stand' },
      { lat: 30.4853, lng: 76.5913, stopName: 'Rajpura Bypass' },
      { lat: 30.6425, lng: 76.8173, stopName: 'Zirakpur' },
      { lat: 30.7333, lng: 76.7794, stopName: 'ISBT Sec 43 Chandigarh' }
    ]
  },
  {
    id: 'PB-ORBIT-777',
    operator: 'Orbit Aviation',
    type: 'Scania AC Seater (2+2)',
    from: 'Patiala',
    to: 'Chandigarh',
    departure: '17:45',
    arrival: '19:10',
    duration: '1h 25m',
    price: 250,
    seatsLeft: 19,
    rating: 4.6,
    reviews: 892,
    isAC: true,
    isSleeper: false,
    isPrimo: true,
    gpsRoute: [
      { lat: 30.3398, lng: 76.3869, stopName: 'Patiala Bus Stand' },
      { lat: 30.7333, lng: 76.7794, stopName: 'ISBT Sec 43 Chandigarh' }
    ]
  },

  // --- SION <-> KOLHAPUR ROUTES ---
  {
    id: 'MH-12-MSRTC-901',
    operator: 'MSRTC Shivneri',
    type: 'Volvo AC Semi-Sleeper',
    from: 'Sion',
    to: 'Kolhapur',
    departure: '22:00',
    arrival: '06:30',
    duration: '8h 30m',
    price: 820,
    seatsLeft: 16,
    rating: 4.6,
    reviews: 950,
    isAC: true,
    isSleeper: false,
    isPrimo: true,
    gpsRoute: [
      { lat: 19.0390, lng: 72.8619, stopName: 'Sion Circle' },
      { lat: 18.5204, lng: 73.8567, stopName: 'Pune Swargate' },
      { lat: 16.7050, lng: 74.2433, stopName: 'Kolhapur Central' }
    ]
  }
];