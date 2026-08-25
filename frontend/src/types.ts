export interface User {
  id: string;
  name: string;
  username: string;
  role: 'SUPER_ADMIN' | 'DISTRICT_AUTHORITY' | 'DISASTER_OFFICER' | 'FIELD_VOLUNTEER' | 'VILLAGE_USER';
  villageId?: string;
  districtId?: string;
}

export interface District {
  id: string;
  name: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Village {
  id: string;
  name: string;
  districtId: string;
  estimatedPopulation: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evacuationStatus: 'NOT_STARTED' | 'PREPARING' | 'IN_PROGRESS' | 'MOSTLY_EVACUATED' | 'COMPLETED';
  shelterId?: string;
  roadStatus: 'SAFE' | 'WARNING' | 'BLOCKED' | 'UNKNOWN';
  soilMoisture: number;
  rainfall: number;
  slope: number;
  elevation: number;
  latitude: number;
  longitude: number;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  status: 'OPEN' | 'NEAR_CAPACITY' | 'FULL' | 'UNAVAILABLE';
  latitude: number;
  longitude: number;
  facilities: string[];
}

export interface Road {
  id: string;
  name: string;
  status: 'SAFE' | 'WARNING' | 'BLOCKED' | 'UNKNOWN';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  blockageReason?: string;
  latStart: number;
  lngStart: number;
  latEnd: number;
  lngEnd: number;
  altRouteId?: string;
}

export interface Alert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'IN_RESPONSE' | 'RESOLVED';
  timestamp: string;
  villageId: string;
  riskScore: number;
  reason: string;
  location?: string;
}

export interface Household {
  id: string;
  villageId: string;
  familyHead: string;
  size: number;
  status: 'NOT_EVACUATED' | 'EVACUATED' | 'UNKNOWN';
  lastUpdated: string;
}

export interface FieldReport {
  id: string;
  villageId: string;
  reporterName: string;
  type: 'CRACK' | 'SLOPE_MOVEMENT' | 'LANDSLIDE' | 'ROAD_BLOCKAGE' | 'FLOODING' | 'OTHER';
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'REPORTED' | 'VERIFIED' | 'RESOLVED';
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'WEATHER' | 'SATELLITE' | 'TERRAIN' | 'ML' | 'SMS' | 'ROAD' | 'SENSOR';
  status: 'CONNECTED' | 'DISCONNECTED' | 'DEMO_MODE' | 'ERROR';
  lastUpdated: string;
  freshness: string;
  mode: 'DEMO' | 'LIVE';
  provider: string;
}
