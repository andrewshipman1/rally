// Major IATA airports (top ~200 by passenger traffic worldwide).
// Used for client-side autocomplete in the flight form.

export interface Airport {
  code: string; // IATA code, e.g. "JFK"
  name: string; // Official name
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  // North America — US
  { code: 'ATL', name: 'Hartsfield–Jackson Atlanta International', city: 'Atlanta', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
  { code: 'SEA', name: 'Seattle–Tacoma International', city: 'Seattle', country: 'USA' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA' },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA' },
  { code: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', country: 'USA' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'USA' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA' },
  { code: 'BOS', name: 'Logan International', city: 'Boston', country: 'USA' },
  { code: 'MSP', name: 'Minneapolis–Saint Paul International', city: 'Minneapolis', country: 'USA' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', country: 'USA' },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit', country: 'USA' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'USA' },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'USA' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore', country: 'USA' },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington', country: 'USA' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington', country: 'USA' },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'USA' },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa', country: 'USA' },
  { code: 'PDX', name: 'Portland International', city: 'Portland', country: 'USA' },
  { code: 'STL', name: 'St. Louis Lambert International', city: 'St. Louis', country: 'USA' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'USA' },
  { code: 'AUS', name: 'Austin–Bergstrom International', city: 'Austin', country: 'USA' },
  { code: 'BNA', name: 'Nashville International', city: 'Nashville', country: 'USA' },
  { code: 'MDW', name: 'Chicago Midway International', city: 'Chicago', country: 'USA' },
  { code: 'FLL', name: 'Fort Lauderdale–Hollywood International', city: 'Fort Lauderdale', country: 'USA' },
  { code: 'RDU', name: 'Raleigh–Durham International', city: 'Raleigh', country: 'USA' },
  { code: 'SJC', name: 'Norman Y. Mineta San José International', city: 'San Jose', country: 'USA' },
  { code: 'OAK', name: 'Oakland International', city: 'Oakland', country: 'USA' },
  { code: 'SMF', name: 'Sacramento International', city: 'Sacramento', country: 'USA' },
  { code: 'CLE', name: 'Cleveland Hopkins International', city: 'Cleveland', country: 'USA' },
  { code: 'PIT', name: 'Pittsburgh International', city: 'Pittsburgh', country: 'USA' },
  { code: 'IND', name: 'Indianapolis International', city: 'Indianapolis', country: 'USA' },
  { code: 'MCI', name: 'Kansas City International', city: 'Kansas City', country: 'USA' },
  { code: 'CMH', name: 'John Glenn Columbus International', city: 'Columbus', country: 'USA' },
  { code: 'MKE', name: 'Milwaukee Mitchell International', city: 'Milwaukee', country: 'USA' },
  { code: 'JAX', name: 'Jacksonville International', city: 'Jacksonville', country: 'USA' },
  { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank', country: 'USA' },
  { code: 'LGB', name: 'Long Beach', city: 'Long Beach', country: 'USA' },
  { code: 'SNA', name: 'John Wayne', city: 'Santa Ana', country: 'USA' },
  { code: 'ONT', name: 'Ontario International', city: 'Ontario', country: 'USA' },
  { code: 'PSP', name: 'Palm Springs International', city: 'Palm Springs', country: 'USA' },
  { code: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', country: 'USA' },
  { code: 'TUS', name: 'Tucson International', city: 'Tucson', country: 'USA' },
  { code: 'ELP', name: 'El Paso International', city: 'El Paso', country: 'USA' },
  { code: 'SAT', name: 'San Antonio International', city: 'San Antonio', country: 'USA' },
  { code: 'OMA', name: 'Eppley Airfield', city: 'Omaha', country: 'USA' },
  { code: 'BUF', name: 'Buffalo Niagara International', city: 'Buffalo', country: 'USA' },
  { code: 'ALB', name: 'Albany International', city: 'Albany', country: 'USA' },
  { code: 'PVD', name: 'T. F. Green International', city: 'Providence', country: 'USA' },
  { code: 'BDL', name: 'Bradley International', city: 'Hartford', country: 'USA' },
  { code: 'MHT', name: 'Manchester–Boston Regional', city: 'Manchester', country: 'USA' },
  { code: 'PWM', name: 'Portland International Jetport', city: 'Portland', country: 'USA' },
  { code: 'BTV', name: 'Burlington International', city: 'Burlington', country: 'USA' },
  { code: 'CHS', name: 'Charleston International', city: 'Charleston', country: 'USA' },
  { code: 'SAV', name: 'Savannah/Hilton Head International', city: 'Savannah', country: 'USA' },
  { code: 'MYR', name: 'Myrtle Beach International', city: 'Myrtle Beach', country: 'USA' },
  { code: 'RIC', name: 'Richmond International', city: 'Richmond', country: 'USA' },
  { code: 'ORF', name: 'Norfolk International', city: 'Norfolk', country: 'USA' },
  { code: 'GSP', name: 'Greenville–Spartanburg International', city: 'Greenville', country: 'USA' },
  { code: 'ASE', name: 'Aspen/Pitkin County', city: 'Aspen', country: 'USA' },
  { code: 'EGE', name: 'Eagle County Regional', city: 'Vail', country: 'USA' },
  { code: 'JAC', name: 'Jackson Hole', city: 'Jackson', country: 'USA' },
  { code: 'BZN', name: 'Bozeman Yellowstone International', city: 'Bozeman', country: 'USA' },
  { code: 'MSO', name: 'Missoula Montana', city: 'Missoula', country: 'USA' },
  { code: 'BIL', name: 'Billings Logan International', city: 'Billings', country: 'USA' },
  { code: 'BOI', name: 'Boise', city: 'Boise', country: 'USA' },
  { code: 'ANC', name: 'Ted Stevens Anchorage International', city: 'Anchorage', country: 'USA' },
  { code: 'OGG', name: 'Kahului', city: 'Maui', country: 'USA' },
  { code: 'KOA', name: 'Ellison Onizuka Kona International', city: 'Kona', country: 'USA' },
  { code: 'LIH', name: 'Lihue', city: 'Kauai', country: 'USA' },

  // Canada
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
  { code: 'YUL', name: 'Montréal–Trudeau International', city: 'Montreal', country: 'Canada' },
  { code: 'YYC', name: 'Calgary International', city: 'Calgary', country: 'Canada' },
  { code: 'YEG', name: 'Edmonton International', city: 'Edmonton', country: 'Canada' },
  { code: 'YOW', name: 'Ottawa Macdonald–Cartier International', city: 'Ottawa', country: 'Canada' },
  { code: 'YHZ', name: 'Halifax Stanfield International', city: 'Halifax', country: 'Canada' },

  // Mexico / Caribbean / Central America
  { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico' },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico' },
  { code: 'GDL', name: 'Guadalajara International', city: 'Guadalajara', country: 'Mexico' },
  { code: 'MTY', name: 'Monterrey International', city: 'Monterrey', country: 'Mexico' },
  { code: 'PVR', name: 'Puerto Vallarta International', city: 'Puerto Vallarta', country: 'Mexico' },
  { code: 'SJD', name: 'Los Cabos International', city: 'Los Cabos', country: 'Mexico' },
  { code: 'CZM', name: 'Cozumel International', city: 'Cozumel', country: 'Mexico' },
  { code: 'TLC', name: 'Toluca International', city: 'Toluca', country: 'Mexico' },
  { code: 'NAS', name: 'Lynden Pindling International', city: 'Nassau', country: 'Bahamas' },
  { code: 'MBJ', name: 'Sangster International', city: 'Montego Bay', country: 'Jamaica' },
  { code: 'PUJ', name: 'Punta Cana International', city: 'Punta Cana', country: 'Dominican Republic' },
  { code: 'SJU', name: 'Luis Muñoz Marín International', city: 'San Juan', country: 'Puerto Rico' },
  { code: 'AUA', name: 'Queen Beatrix International', city: 'Aruba', country: 'Aruba' },
  { code: 'GCM', name: 'Owen Roberts International', city: 'Grand Cayman', country: 'Cayman Islands' },
  { code: 'LIR', name: 'Daniel Oduber Quirós International', city: 'Liberia', country: 'Costa Rica' },
  { code: 'SJO', name: 'Juan Santamaría International', city: 'San José', country: 'Costa Rica' },
  { code: 'PTY', name: 'Tocumen International', city: 'Panama City', country: 'Panama' },

  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos International', city: 'São Paulo', country: 'Brazil' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International', city: 'Rio de Janeiro', country: 'Brazil' },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina' },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile' },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru' },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia' },
  { code: 'CTG', name: 'Rafael Núñez International', city: 'Cartagena', country: 'Colombia' },
  { code: 'UIO', name: 'Mariscal Sucre International', city: 'Quito', country: 'Ecuador' },
  { code: 'MVD', name: 'Carrasco International', city: 'Montevideo', country: 'Uruguay' },

  // Europe
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
  { code: 'LGW', name: 'Gatwick', city: 'London', country: 'UK' },
  { code: 'STN', name: 'Stansted', city: 'London', country: 'UK' },
  { code: 'LTN', name: 'Luton', city: 'London', country: 'UK' },
  { code: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'UK' },
  { code: 'MAN', name: 'Manchester', city: 'Manchester', country: 'UK' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'ORY', name: 'Orly', city: 'Paris', country: 'France' },
  { code: 'NCE', name: "Côte d'Azur", city: 'Nice', country: 'France' },
  { code: 'MRS', name: 'Marseille Provence', city: 'Marseille', country: 'France' },
  { code: 'LYS', name: 'Lyon–Saint-Exupéry', city: 'Lyon', country: 'France' },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
  { code: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany' },
  { code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany' },
  { code: 'DUS', name: 'Düsseldorf', city: 'Düsseldorf', country: 'Germany' },
  { code: 'HAM', name: 'Hamburg', city: 'Hamburg', country: 'Germany' },
  { code: 'CGN', name: 'Cologne Bonn', city: 'Cologne', country: 'Germany' },
  { code: 'ZRH', name: 'Zürich', city: 'Zurich', country: 'Switzerland' },
  { code: 'GVA', name: 'Geneva', city: 'Geneva', country: 'Switzerland' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria' },
  { code: 'PRG', name: 'Václav Havel Prague', city: 'Prague', country: 'Czech Republic' },
  { code: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland' },
  { code: 'BUD', name: 'Budapest Ferenc Liszt International', city: 'Budapest', country: 'Hungary' },
  { code: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway' },
  { code: 'HEL', name: 'Helsinki–Vantaa', city: 'Helsinki', country: 'Finland' },
  { code: 'KEF', name: 'Keflavík International', city: 'Reykjavík', country: 'Iceland' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain' },
  { code: 'BCN', name: 'Barcelona–El Prat', city: 'Barcelona', country: 'Spain' },
  { code: 'AGP', name: 'Málaga', city: 'Málaga', country: 'Spain' },
  { code: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'Spain' },
  { code: 'IBZ', name: 'Ibiza', city: 'Ibiza', country: 'Spain' },
  { code: 'LIS', name: 'Humberto Delgado', city: 'Lisbon', country: 'Portugal' },
  { code: 'OPO', name: 'Francisco Sá Carneiro', city: 'Porto', country: 'Portugal' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy' },
  { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy' },
  { code: 'LIN', name: 'Milan Linate', city: 'Milan', country: 'Italy' },
  { code: 'VCE', name: 'Venice Marco Polo', city: 'Venice', country: 'Italy' },
  { code: 'NAP', name: 'Naples', city: 'Naples', country: 'Italy' },
  { code: 'CTA', name: 'Catania–Fontanarossa', city: 'Catania', country: 'Italy' },
  { code: 'BLQ', name: 'Bologna Guglielmo Marconi', city: 'Bologna', country: 'Italy' },
  { code: 'FLR', name: 'Florence', city: 'Florence', country: 'Italy' },
  { code: 'PSA', name: 'Pisa International', city: 'Pisa', country: 'Italy' },
  { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'Greece' },
  { code: 'JTR', name: 'Santorini', city: 'Santorini', country: 'Greece' },
  { code: 'JMK', name: 'Mykonos', city: 'Mykonos', country: 'Greece' },
  { code: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },
  { code: 'SAW', name: 'Sabiha Gökçen International', city: 'Istanbul', country: 'Turkey' },
  { code: 'AYT', name: 'Antalya', city: 'Antalya', country: 'Turkey' },

  // Middle East
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { code: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel' },
  { code: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'Jordan' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
  { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },

  // Asia
  { code: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
  { code: 'KIX', name: 'Kansai International', city: 'Osaka', country: 'Japan' },
  { code: 'NGO', name: 'Chubu Centrair International', city: 'Nagoya', country: 'Japan' },
  { code: 'FUK', name: 'Fukuoka', city: 'Fukuoka', country: 'Japan' },
  { code: 'CTS', name: 'New Chitose', city: 'Sapporo', country: 'Japan' },
  { code: 'OKA', name: 'Naha', city: 'Okinawa', country: 'Japan' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
  { code: 'GMP', name: 'Gimpo International', city: 'Seoul', country: 'South Korea' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China' },
  { code: 'PKX', name: 'Beijing Daxing International', city: 'Beijing', country: 'China' },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China' },
  { code: 'SHA', name: 'Shanghai Hongqiao International', city: 'Shanghai', country: 'China' },
  { code: 'CAN', name: 'Guangzhou Baiyun International', city: 'Guangzhou', country: 'China' },
  { code: 'SZX', name: "Shenzhen Bao'an International", city: 'Shenzhen', country: 'China' },
  { code: 'CTU', name: 'Chengdu Shuangliu International', city: 'Chengdu', country: 'China' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong' },
  { code: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
  { code: 'DMK', name: 'Don Mueang International', city: 'Bangkok', country: 'Thailand' },
  { code: 'HKT', name: 'Phuket International', city: 'Phuket', country: 'Thailand' },
  { code: 'CNX', name: 'Chiang Mai International', city: 'Chiang Mai', country: 'Thailand' },
  { code: 'CGK', name: 'Soekarno–Hatta International', city: 'Jakarta', country: 'Indonesia' },
  { code: 'DPS', name: 'Ngurah Rai International', city: 'Bali', country: 'Indonesia' },
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },
  { code: 'CEB', name: 'Mactan–Cebu International', city: 'Cebu', country: 'Philippines' },
  { code: 'SGN', name: 'Tan Son Nhat International', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { code: 'HAN', name: 'Noi Bai International', city: 'Hanoi', country: 'Vietnam' },
  { code: 'DAD', name: 'Da Nang International', city: 'Da Nang', country: 'Vietnam' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India' },
  { code: 'BLR', name: 'Kempegowda International', city: 'Bengaluru', country: 'India' },
  { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', country: 'India' },
  { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India' },
  { code: 'GOI', name: 'Goa International', city: 'Goa', country: 'India' },
  { code: 'CMB', name: 'Bandaranaike International', city: 'Colombo', country: 'Sri Lanka' },
  { code: 'MLE', name: 'Velana International', city: 'Malé', country: 'Maldives' },

  // Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { code: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'Australia' },
  { code: 'BNE', name: 'Brisbane', city: 'Brisbane', country: 'Australia' },
  { code: 'PER', name: 'Perth', city: 'Perth', country: 'Australia' },
  { code: 'OOL', name: 'Gold Coast', city: 'Gold Coast', country: 'Australia' },
  { code: 'ADL', name: 'Adelaide', city: 'Adelaide', country: 'Australia' },
  { code: 'AKL', name: 'Auckland', city: 'Auckland', country: 'New Zealand' },
  { code: 'WLG', name: 'Wellington International', city: 'Wellington', country: 'New Zealand' },
  { code: 'CHC', name: 'Christchurch International', city: 'Christchurch', country: 'New Zealand' },
  { code: 'NAN', name: 'Nadi International', city: 'Nadi', country: 'Fiji' },
  { code: 'PPT', name: 'Faaa International', city: 'Papeete', country: 'French Polynesia' },

  // Africa
  { code: 'JNB', name: 'O. R. Tambo International', city: 'Johannesburg', country: 'South Africa' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya' },
  { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco' },
  { code: 'RAK', name: 'Marrakesh Menara', city: 'Marrakesh', country: 'Morocco' },
  { code: 'TUN', name: 'Tunis–Carthage International', city: 'Tunis', country: 'Tunisia' },
  { code: 'ADD', name: 'Addis Ababa Bole International', city: 'Addis Ababa', country: 'Ethiopia' },
  { code: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria' },
];

/**
 * Search airports by code, name, city, or country.
 * Prioritizes code matches first, then city, then name.
 */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const codeMatches: Airport[] = [];
  const cityMatches: Airport[] = [];
  const nameMatches: Airport[] = [];

  for (const airport of AIRPORTS) {
    if (airport.code.toLowerCase().startsWith(q)) {
      codeMatches.push(airport);
    } else if (airport.city.toLowerCase().startsWith(q)) {
      cityMatches.push(airport);
    } else if (
      airport.name.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.country.toLowerCase().includes(q)
    ) {
      nameMatches.push(airport);
    }
  }

  return [...codeMatches, ...cityMatches, ...nameMatches].slice(0, limit);
}
