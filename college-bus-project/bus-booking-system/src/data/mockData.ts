export type MockStatus = 'Live' | 'Idle' | 'Pending' | 'Alert';

export type MockRoutePoint = {
  lat: number;
  lng: number;
  locationName: string;
  speed: number;
  eta: string;
};

export type MockUser = {
  id: string;
  name: string;
  role: 'Driver' | 'Passenger';
  vehicleNumber: string;
  status: MockStatus;
  currentLocation: string;
  speed: number;
  eta: string;
  coords: [number, number];
  routeIndex: number;
  completedTrips: number;
  isBlocked: boolean;
};

export const mockRoute: MockRoutePoint[] = [
  { lat: 28.6315, lng: 77.2167, locationName: 'Connaught Place, Rajiv Chowk', speed: 18, eta: '36 min' },
  { lat: 28.6357, lng: 77.2104, locationName: 'Gole Market, Bhai Vir Singh Marg', speed: 24, eta: '34 min' },
  { lat: 28.6386, lng: 77.2037, locationName: 'Baba Kharak Singh Marg', speed: 31, eta: '32 min' },
  { lat: 28.6421, lng: 77.2042, locationName: 'Panchkuian Road', speed: 27, eta: '30 min' },
  { lat: 28.6443, lng: 77.2094, locationName: 'Ramakrishna Ashram Marg', speed: 22, eta: '28 min' },
  { lat: 28.6482, lng: 77.2132, locationName: 'Paharganj, Desh Bandhu Gupta Road', speed: 19, eta: '26 min' },
  { lat: 28.6523, lng: 77.2084, locationName: 'Rani Jhansi Road', speed: 33, eta: '23 min' },
  { lat: 28.6501, lng: 77.2004, locationName: 'Jhandewalan Metro Station', speed: 36, eta: '21 min' },
  { lat: 28.6537, lng: 77.1928, locationName: 'Karol Bagh, Ajmal Khan Road', speed: 29, eta: '18 min' },
  { lat: 28.6584, lng: 77.1876, locationName: 'Dev Nagar, Karol Bagh', speed: 25, eta: '15 min' },
  { lat: 28.6635, lng: 77.1899, locationName: 'Prasad Nagar', speed: 32, eta: '12 min' },
  { lat: 28.6663, lng: 77.1987, locationName: 'Bara Hindu Rao Hospital', speed: 21, eta: '10 min' },
  { lat: 28.6702, lng: 77.2072, locationName: 'Azad Market', speed: 28, eta: '7 min' },
  { lat: 28.6804, lng: 77.2094, locationName: 'Maurice Nagar, North Campus', speed: 17, eta: '4 min' },
  { lat: 28.6872, lng: 77.2078, locationName: 'Hindu College, University of Delhi', speed: 0, eta: 'Arrived' },
];

export const initialMockUsers: MockUser[] = [
  {
    id: 'USR-1001',
    name: 'Aarav Mehta',
    role: 'Passenger',
    vehicleNumber: 'DL-1PC-4821',
    status: 'Live',
    currentLocation: mockRoute[0].locationName,
    speed: mockRoute[0].speed,
    eta: mockRoute[0].eta,
    coords: [mockRoute[0].lat, mockRoute[0].lng],
    routeIndex: 0,
    completedTrips: 8,
    isBlocked: false,
  },
  {
    id: 'DRV-2048',
    name: 'Priya Sharma',
    role: 'Driver',
    vehicleNumber: 'DL-1PD-7632',
    status: 'Live',
    currentLocation: mockRoute[5].locationName,
    speed: mockRoute[5].speed,
    eta: mockRoute[5].eta,
    coords: [mockRoute[5].lat, mockRoute[5].lng],
    routeIndex: 5,
    completedTrips: 126,
    isBlocked: false,
  },
  {
    id: 'DRV-1982',
    name: 'Rohan Verma',
    role: 'Driver',
    vehicleNumber: 'DL-1PC-1194',
    status: 'Idle',
    currentLocation: mockRoute[8].locationName,
    speed: 0,
    eta: 'Off duty',
    coords: [mockRoute[8].lat, mockRoute[8].lng],
    routeIndex: 8,
    completedTrips: 94,
    isBlocked: false,
  },
  {
    id: 'DRV-2216',
    name: 'Simran Kaur',
    role: 'Driver',
    vehicleNumber: 'DL-1PD-5407',
    status: 'Pending',
    currentLocation: 'Connaught Place, Rajiv Chowk',
    speed: 0,
    eta: 'Awaiting approval',
    coords: [mockRoute[0].lat, mockRoute[0].lng],
    routeIndex: 0,
    completedTrips: 0,
    isBlocked: false,
  },
  {
    id: 'DRV-1875',
    name: 'Kabir Anand',
    role: 'Driver',
    vehicleNumber: 'DL-1PC-9083',
    status: 'Alert',
    currentLocation: mockRoute[10].locationName,
    speed: 12,
    eta: 'Delayed by 8 min',
    coords: [mockRoute[10].lat, mockRoute[10].lng],
    routeIndex: 10,
    completedTrips: 71,
    isBlocked: false,
  },
  {
    id: 'USR-1026',
    name: 'Nisha Gupta',
    role: 'Passenger',
    vehicleNumber: 'DL-1PD-3310',
    status: 'Idle',
    currentLocation: mockRoute[13].locationName,
    speed: 0,
    eta: 'Trip completed',
    coords: [mockRoute[13].lat, mockRoute[13].lng],
    routeIndex: 13,
    completedTrips: 3,
    isBlocked: false,
  },
];
