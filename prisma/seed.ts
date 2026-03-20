import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LISTINGS = [
  {
    source: "seed", sourceId: "s001", status: "active",
    address: "2847 Sunset Blvd", city: "Los Angeles", state: "CA", zip: "90026", neighborhood: "Silver Lake",
    latitude: 34.0782, longitude: -118.2606,
    price: 1_295_000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2, sqft: 1820, lotSqft: 5400, yearBuilt: 1952, parking: "1-car garage",
    description: "A sun-drenched Silver Lake bungalow with original hardwood floors, a remodeled kitchen, and a backyard fig tree that produces every summer.",
    photos: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900",
    ],
    agentName: "Maria Gonzalez", agentPhone: "(323) 555-0182", agentEmail: "maria@brightdoorla.com",
    agentPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
    agentBrokerage: "Bright Door Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s002", status: "active",
    address: "415 Maple Ave #3B", city: "Brooklyn", state: "NY", zip: "11238", neighborhood: "Prospect Heights",
    price: 4_200, listingType: "rent", propertyType: "apartment",
    bedrooms: 2, bathrooms: 1, sqft: 950, yearBuilt: 1927, parking: "Street",
    description: "Pre-war 2BR with exposed brick, high ceilings, and a kitchen window that frames the skyline. One block from Grand Army Plaza farmers market.",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900",
    ],
    agentName: "James Park", agentPhone: "(718) 555-0244", agentEmail: "jpark@urbanroostny.com",
    agentPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    agentBrokerage: "Urban Roost NYC",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s003", status: "active",
    address: "1102 Dragonfly Ct", city: "Austin", state: "TX", zip: "78704", neighborhood: "Travis Heights",
    price: 875_000, listingType: "sale", propertyType: "house",
    bedrooms: 4, bathrooms: 3, sqft: 2350, lotSqft: 7200, yearBuilt: 2019, parking: "2-car garage",
    description: "Modern farmhouse steps from South Congress. Open floor plan, chef's kitchen, pergola-covered deck, and room for a pool.",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900",
    ],
    agentName: "Caitlin Burke", agentPhone: "(512) 555-0317", agentEmail: "caitlin@lonestarlistings.com",
    agentPhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
    agentBrokerage: "Lone Star Listings",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s004", status: "active",
    address: "88 Harbor View Dr #1202", city: "Miami", state: "FL", zip: "33132", neighborhood: "Brickell",
    price: 2_100_000, listingType: "sale", propertyType: "condo",
    bedrooms: 3, bathrooms: 3.5, sqft: 2100, yearBuilt: 2018, parking: "2 assigned spots",
    description: "Floor-to-ceiling glass, sweeping Biscayne Bay views, marble baths, and resort-style amenities. Live where others vacation.",
    photos: [
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=900",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900",
    ],
    agentName: "Sofia Ramos", agentPhone: "(305) 555-0481", agentEmail: "sofia@miamipremier.com",
    agentPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200",
    agentBrokerage: "Miami Premier Group",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s005", status: "active",
    address: "342 Birchwood Ln", city: "Portland", state: "OR", zip: "97209", neighborhood: "Pearl District",
    price: 3_500, listingType: "rent", propertyType: "condo",
    bedrooms: 1, bathrooms: 1, sqft: 780, yearBuilt: 2016, parking: "1 spot included",
    description: "Sleek, sunlit 1BR in the Pearl with a Juliet balcony, in-unit W/D, and a rooftop deck shared with only 8 neighbors.",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=900",
    ],
    agentName: "Eli Nakamura", agentPhone: "(503) 555-0590", agentEmail: "eli@portlandprops.com",
    agentPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    agentBrokerage: "Portland Properties",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s006", status: "active",
    address: "2210 Peach Tree Rd NE", city: "Atlanta", state: "GA", zip: "30309", neighborhood: "Buckhead",
    price: 1_650_000, listingType: "sale", propertyType: "house",
    bedrooms: 5, bathrooms: 4.5, sqft: 4200, lotSqft: 12000, yearBuilt: 1998, parking: "3-car garage",
    description: "Grand Buckhead estate with columned porch, wine cellar, screened porch overlooking the pool, and a chef's kitchen big enough for the whole team.",
    photos: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=900",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900",
    ],
    agentName: "Derek Thomas", agentPhone: "(404) 555-0629", agentEmail: "derek@atluxhomes.com",
    agentPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    agentBrokerage: "ATL Luxury Homes",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s007", status: "active",
    address: "780 N Clark St #507", city: "Chicago", state: "IL", zip: "60610", neighborhood: "River North",
    price: 2_750, listingType: "rent", propertyType: "apartment",
    bedrooms: 1, bathrooms: 1, sqft: 720, yearBuilt: 2014, parking: "None",
    description: "High floor 1BR in the heart of River North. Concrete ceilings, Nest thermostat, and a gym that actually has the equipment you want.",
    photos: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=900",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=900",
    ],
    agentName: "Priya Shah", agentPhone: "(312) 555-0754", agentEmail: "priya@windycitylive.com",
    agentPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    agentBrokerage: "Windy City Living",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s008", status: "sold",
    address: "19 Tidal Marsh Rd", city: "Charleston", state: "SC", zip: "29401", neighborhood: "Downtown",
    price: 989_000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2.5, sqft: 2020, lotSqft: 4800, yearBuilt: 1887, parking: "Off-street",
    description: "Lovingly restored antebellum cottage with wide-plank heart pine floors, a piazza perfect for sweet tea, and a garden that blooms year-round.",
    photos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=900",
    ],
    agentName: "Anna Belle Whitmore", agentPhone: "(843) 555-0841", agentEmail: "annabelle@southernsquare.com",
    agentPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    agentBrokerage: "Southern Square Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s009", status: "active",
    address: "455 Observatory Way", city: "Denver", state: "CO", zip: "80209", neighborhood: "Washington Park",
    price: 740_000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2, sqft: 1650, lotSqft: 6000, yearBuilt: 1963, parking: "Detached garage",
    description: "Crisp ranch-style home two blocks from Wash Park with a finished basement, original terrazzo entry, and mountain views on clear days.",
    photos: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900",
      "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=900",
    ],
    agentName: "Luke Brennan", agentPhone: "(720) 555-0912", agentEmail: "luke@milehustrealty.com",
    agentPhoto: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200",
    agentBrokerage: "Mile High Street Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s010", status: "active",
    address: "603 Catalina St #B", city: "San Francisco", state: "CA", zip: "94110", neighborhood: "Mission District",
    price: 3_800, listingType: "rent", propertyType: "apartment",
    bedrooms: 2, bathrooms: 1, sqft: 1100, yearBuilt: 1908, parking: "None",
    description: "Victorian flat with bay windows, restored wainscoting, and a sunny back deck. On a quiet block between Dolores Park and BART.",
    photos: [
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=900",
      "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=900",
    ],
    agentName: "Chris Lo", agentPhone: "(415) 555-0078", agentEmail: "chris@bayarearoost.com",
    agentPhoto: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200",
    agentBrokerage: "Bay Area Roost",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s011", status: "active",
    address: "1514 Azalea Dr", city: "Nashville", state: "TN", zip: "37206", neighborhood: "East Nashville",
    price: 625_000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2, sqft: 1540, lotSqft: 5500, yearBuilt: 2021, parking: "Driveway",
    description: "New construction craftsman in booming East Nashville. Quartz counters, shiplap accent walls, and an alley access patio. Walk to all the good restaurants.",
    photos: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900",
    ],
    agentName: "Tamara Hughes", agentPhone: "(615) 555-0133", agentEmail: "tamara@musiccityrealty.com",
    agentPhoto: "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=200",
    agentBrokerage: "Music City Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s012", status: "active",
    address: "22 Beacon Hill Pl #4", city: "Boston", state: "MA", zip: "02108", neighborhood: "Beacon Hill",
    price: 6_500, listingType: "rent", propertyType: "condo",
    bedrooms: 2, bathrooms: 2, sqft: 1300, yearBuilt: 1840, parking: "None",
    description: "Stunning Beacon Hill garden unit with 12-foot ceilings, original mantlepieces, and private patio. Steps from the Common.",
    photos: [
      "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=900",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=900",
    ],
    agentName: "Patrick O'Brien", agentPhone: "(617) 555-0299", agentEmail: "pat@bostonbrickwork.com",
    agentPhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
    agentBrokerage: "Boston Brickwork Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s013", status: "active",
    address: "3300 Lakeview Terrace", city: "Seattle", state: "WA", zip: "98102", neighborhood: "Capitol Hill",
    price: 1_100_000, listingType: "sale", propertyType: "townhouse",
    bedrooms: 3, bathrooms: 2.5, sqft: 1990, yearBuilt: 2017, parking: "1-car attached",
    description: "End-unit townhome with Cascade Mountain views, a rooftop deck, and solar panels. Close to Cal Anderson Park and the light rail.",
    photos: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900",
    ],
    agentName: "Yuki Tanaka", agentPhone: "(206) 555-0356", agentEmail: "yuki@emeraldcityrealty.com",
    agentPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
    agentBrokerage: "Emerald City Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s014", status: "sold",
    address: "901 Frenchmen St #2", city: "New Orleans", state: "LA", zip: "70116", neighborhood: "Marigny",
    price: 2_200, listingType: "rent", propertyType: "apartment",
    bedrooms: 1, bathrooms: 1, sqft: 680, yearBuilt: 1925, parking: "None",
    description: "Creole cottage apartment with jalousie shutters, clawfoot tub, and a balcony where the music from Frenchmen Street floats right in.",
    photos: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=900",
    ],
    agentName: "Bridget Fontenot", agentPhone: "(504) 555-0422", agentEmail: "bridget@crescentprops.com",
    agentPhoto: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200",
    agentBrokerage: "Crescent City Properties",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s015", status: "active",
    address: "5500 Desert Rose Dr", city: "Scottsdale", state: "AZ", zip: "85251", neighborhood: "Old Town",
    price: 1_425_000, listingType: "sale", propertyType: "house",
    bedrooms: 4, bathrooms: 3.5, sqft: 3100, lotSqft: 15000, yearBuilt: 2006, parking: "3-car garage",
    description: "Santa Fe-style desert retreat with a heated pool, outdoor kitchen, custom tile work, and a great room that frames the McDowell Mountains.",
    photos: [
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=900",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=900",
    ],
    agentName: "Marcus Wells", agentPhone: "(480) 555-0512", agentEmail: "marcus@suncactusrealty.com",
    agentPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    agentBrokerage: "Sun & Cactus Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s016", status: "active",
    address: "1240 Michigan Ave #803", city: "Chicago", state: "IL", zip: "60605", neighborhood: "South Loop",
    price: 3_100, listingType: "rent", propertyType: "condo",
    bedrooms: 2, bathrooms: 2, sqft: 1150, yearBuilt: 2011, parking: "1 spot",
    description: "Corner unit with floor-to-ceiling lakefront views. Hardwood throughout, spa bath, and a building with a dog run (finally!).",
    photos: [
      "https://images.unsplash.com/photo-1551361415-69c87624334f?w=900",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900",
    ],
    agentName: "Alicia Monroe", agentPhone: "(312) 555-0671", agentEmail: "alicia@lakeshorerentals.com",
    agentPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200",
    agentBrokerage: "Lakeshore Rentals",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s017", status: "active",
    address: "78 Magnolia Ct", city: "Savannah", state: "GA", zip: "31401", neighborhood: "Victorian District",
    price: 548_000, listingType: "sale", propertyType: "house",
    bedrooms: 3, bathrooms: 2, sqft: 1780, lotSqft: 4200, yearBuilt: 1902, parking: "None",
    description: "Storybook Victorian with wraparound porch, stained glass transoms, and a magnolia tree so big it practically owns the block.",
    photos: [
      "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=900",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900",
    ],
    agentName: "Josephine Hale", agentPhone: "(912) 555-0734", agentEmail: "josephine@savrealty.com",
    agentPhoto: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=200",
    agentBrokerage: "Savannah Squares Realty",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s018", status: "active",
    address: "4401 Cedar Springs Rd #110", city: "Dallas", state: "TX", zip: "75219", neighborhood: "Oak Lawn",
    price: 2_400, listingType: "rent", propertyType: "apartment",
    bedrooms: 1, bathrooms: 1, sqft: 850, yearBuilt: 2020, parking: "1 covered spot",
    description: "Brand-new ground-floor apartment with a private terrace, quartz kitchen island, and a pool that actually gets sun all afternoon.",
    photos: [
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=900",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=900",
    ],
    agentName: "Ryan Castro", agentPhone: "(214) 555-0822", agentEmail: "ryan@bigdliving.com",
    agentPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
    agentBrokerage: "Big D Living",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s019", status: "active",
    address: "332 Vineyard Ave", city: "Napa", state: "CA", zip: "94559", neighborhood: "Downtown Napa",
    price: 1_850_000, listingType: "sale", propertyType: "house",
    bedrooms: 4, bathrooms: 3, sqft: 2600, lotSqft: 22000, yearBuilt: 1991, parking: "2-car garage",
    description: "Wine country Craftsman on half an acre with a guest cottage, heritage olive trees, and a wine cellar that holds 800 bottles.",
    photos: [
      "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=900",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=900",
    ],
    agentName: "Vivienne Laurier", agentPhone: "(707) 555-0901", agentEmail: "vivienne@napavalleyhomes.com",
    agentPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    agentBrokerage: "Napa Valley Homes",
    listingUrl: "https://www.zillow.com",
  },
  {
    source: "seed", sourceId: "s020", status: "active",
    address: "12 Harbor Light Way", city: "Newport", state: "RI", zip: "02840", neighborhood: "Historic Hill",
    price: 2_250_000, listingType: "sale", propertyType: "house",
    bedrooms: 5, bathrooms: 4, sqft: 3800, lotSqft: 8400, yearBuilt: 1884, parking: "2-car carriage house",
    description: "Queen Anne Victorian a half-mile from the cliff walk, fully restored with period details, a widow's walk, and ocean views from three bedrooms.",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900",
    ],
    agentName: "Nathaniel Cross", agentPhone: "(401) 555-0988", agentEmail: "nathaniel@sailpointhomes.com",
    agentPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    agentBrokerage: "Sail Point Homes",
    listingUrl: "https://www.zillow.com",
  },
];

// Fake users who feel real — regulars on the platform
const USERS = [
  { name: "Mike D.", email: "miked@fakeemail.com" },
  { name: "Jess T.", email: "jesst@fakeemail.com" },
  { name: "Carlos R.", email: "carlosr@fakeemail.com" },
  { name: "Dana K.", email: "danak@fakeemail.com" },
  { name: "Sam W.", email: "samw@fakeemail.com" },
  { name: "Rachel M.", email: "rachelm@fakeemail.com" },
  { name: "Brandon L.", email: "brandonl@fakeemail.com" },
  { name: "Priya N.", email: "priyan@fakeemail.com" },
  { name: "Nate H.", email: "nateh@fakeemail.com" },
  { name: "Olivia F.", email: "oliviaf@fakeemail.com" },
  { name: "Terrence J.", email: "terrencej@fakeemail.com" },
  { name: "Maggie C.", email: "maggiec@fakeemail.com" },
];

// sourceId → array of { user index, content, minutesAgo }
const SEED_COMMENTS: Record<string, { u: number; content: string; minutesAgo: number }[]> = {
  // Silver Lake bungalow — $1.295M
  s001: [
    { u: 0, content: "1.3M for 1,820 sqft in Silver Lake?? This would've been $600K like 6 years ago. The fig tree is doing a lot of heavy lifting in this listing.", minutesAgo: 4320 },
    { u: 1, content: "I live two streets over. That backyard is legit but the foundation has had work done — ask about it.", minutesAgo: 4100 },
    { u: 2, content: "Hardwood floors look original which is actually a plus. But the kitchen 'remodel' looks like it was done by someone who watched one YouTube video.", minutesAgo: 3800 },
    { u: 3, content: "@Jess T. wait really? what kind of foundation work?", minutesAgo: 3600 },
    { u: 1, content: "The whole east side was releveled like 3 years ago. The previous owner disclosed it. Not a dealbreaker but definitely worth knowing.", minutesAgo: 3400 },
    { u: 4, content: "These photos are doing WORK. I've seen this house in person — it looks way smaller than this.", minutesAgo: 2800 },
    { u: 5, content: "Silver Lake tax: pay $700/sqft for the privilege of waiting 40 minutes for brunch", minutesAgo: 1200 },
  ],
  // Brooklyn rental — $4,200/mo
  s002: [
    { u: 6, content: "$4,200 for a 2BR with no laundry? In Prospect Heights? I remember when this neighborhood was affordable.", minutesAgo: 5000 },
    { u: 7, content: "That exposed brick is 100% cosmetic. I toured a unit in this building — you can literally see where they bricked over drywall.", minutesAgo: 4600 },
    { u: 8, content: "Counterpoint: the Grand Army farmers market IS incredible and being one block away is a genuine lifestyle upgrade", minutesAgo: 4200 },
    { u: 0, content: "The kitchen window 'framing the skyline' is a window facing another building with a sliver of sky at the top. Classic broker poetry.", minutesAgo: 3900 },
    { u: 9, content: "I lived in this exact building 2019-2022. Super can fix anything but takes 3 weeks. Neighbors are quiet though which is rare for PH.", minutesAgo: 2100 },
    { u: 10, content: "Pre-war charm = radiator heat that's either 90° or off, no in between", minutesAgo: 800 },
  ],
  // Austin modern farmhouse — $875K
  s003: [
    { u: 2, content: "Built in 2019 and they're already flipping it? What did they pay, $650K? This market is wild.", minutesAgo: 7200 },
    { u: 5, content: "'Room for a pool' means 'no pool.' That lot is also not that big once you account for the setbacks.", minutesAgo: 6800 },
    { u: 11, content: "Travis Heights is legitimately one of the best neighborhoods in Austin though. Walk to South Congress, close to the greenbelt. Hard to argue with the location.", minutesAgo: 6200 },
    { u: 3, content: "Shiplap. Quartz counters. 'Modern farmhouse.' We're just using the same HGTV checklist at this point huh", minutesAgo: 5500 },
    { u: 0, content: "I toured this — the 'chef's kitchen' has maybe 3 feet of counter space. It's nice but 'chef's kitchen' is doing olympic-level stretching here.", minutesAgo: 4800 },
    { u: 8, content: "At $875K with Austin property taxes this is like $6,200/mo all in. You could rent a way nicer place for $3K.", minutesAgo: 2400 },
    { u: 4, content: "Property taxes in Travis County are no joke. Budget an extra $18K/year minimum.", minutesAgo: 1800 },
  ],
  // Miami condo — $2.1M
  s004: [
    { u: 10, content: "2.1M for 2,100 sqft. That's $1,000/sqft. For a CONDO. In Brickell. With an HOA that's probably $1,500/mo.", minutesAgo: 8000 },
    { u: 6, content: "The HOA on this building is $1,847/mo. I checked. That's $22K/year just for the privilege of sharing a pool.", minutesAgo: 7600 },
    { u: 1, content: "'Live where others vacation' is the most Miami realtor thing I've ever read. Also: hurricane insurance?", minutesAgo: 7000 },
    { u: 9, content: "Floor 12 of this building faces the construction site for the new tower going up on 8th. Enjoy your view for the next 3 years.", minutesAgo: 5500 },
    { u: 5, content: "Genuinely gorgeous unit though. Those bay views don't lie. If you have the money and want Miami, you could do way worse.", minutesAgo: 3200 },
    { u: 2, content: "Insurance is the real story here. Florida condo insurance has tripled since 2021. Budget $15-20K/year on top of everything else.", minutesAgo: 1500 },
  ],
  // Portland rental — $3,500
  s005: [
    { u: 3, content: "'Rooftop deck shared with only 8 neighbors' is the Pearl District version of flex culture", minutesAgo: 3000 },
    { u: 7, content: "$3,500 for a 1BR? In Portland? I moved here specifically because it was supposed to be cheaper than SF.", minutesAgo: 2600 },
    { u: 11, content: "The Juliet balcony thing kills me. It's a window with a railing. You can't even stand on it. It's a WINDOW.", minutesAgo: 2000 },
    { u: 0, content: "Real talk the Pearl is beautiful but it's felt increasingly empty since 2020. Half the storefronts on this block are still vacant.", minutesAgo: 1400 },
  ],
  // Atlanta estate — $1.65M
  s006: [
    { u: 4, content: "Columned porch + wine cellar + pool = the Buckhead starter pack. $1.65M is actually not terrible for 4,200 sqft here.", minutesAgo: 6000 },
    { u: 8, content: "Built in '98 — that kitchen has definitely been updated but the bathrooms look original. Budget $80K for a bathroom refresh.", minutesAgo: 5400 },
    { u: 10, content: "The 'chef's kitchen big enough for the whole team' line is making me irrationally angry. What team? Your cooking team?", minutesAgo: 4200 },
    { u: 2, content: "This is legitimately a nice house for the price. In any northeast city this would be $4M easy. Atlanta still has some real deals if you don't mind the humidity.", minutesAgo: 3600 },
    { u: 1, content: "Just drove by this — the pool is smaller than the photos suggest. Classic wide-angle lens trickery.", minutesAgo: 1600 },
  ],
  // Chicago River North rental — $2,750
  s007: [
    { u: 9, content: "'A gym that actually has the equipment you want' — this is the most relatable thing I've ever read in a listing. Every other building gym has 2 treadmills and a sad rack of 15lb dumbbells.", minutesAgo: 4800 },
    { u: 6, content: "$2,750 for a 1BR with NO parking in River North? You'll spend another $300/mo on a garage. This city's rental market has lost its mind.", minutesAgo: 4200 },
    { u: 3, content: "Concrete ceilings = you'll hear every footstep from your upstairs neighbor. Trust me on this one.", minutesAgo: 3600 },
    { u: 11, content: "River North is fun for about 6 months and then you realize you live above a nightclub district. Good luck sleeping on weekends.", minutesAgo: 2400 },
    { u: 5, content: "Counterpoint: if you're in your 20s and want to be in the mix, this is exactly the right move. Not everything has to be a forever home.", minutesAgo: 1000 },
  ],
  // Charleston SOLD — $989K (locked comments from before it sold)
  s008: [
    { u: 1, content: "An 1887 cottage in downtown Charleston for under $1M? That's actually a steal. These don't come up often.", minutesAgo: 20000 },
    { u: 4, content: "Heart pine floors from 1887 are irreplaceable. You literally cannot buy that wood anymore. Someone's getting a gem.", minutesAgo: 19000 },
    { u: 7, content: "I know this street. Floods every time it rains hard. Beautiful house but check your flood insurance costs before you fall in love.", minutesAgo: 18000 },
    { u: 0, content: "SOLD. I'm actually sad I didn't jump on this one. That piazza would've been my entire personality.", minutesAgo: 15000 },
  ],
  // Denver — $740K
  s009: [
    { u: 11, content: "Mountain views 'on clear days' — so like 4 days a year when there's no wildfire smoke? Being realistic here.", minutesAgo: 5200 },
    { u: 5, content: "Wash Park is incredible though. This is the neighborhood everyone in Denver wishes they could afford. $740K for a ranch with a finished basement is fair.", minutesAgo: 4800 },
    { u: 2, content: "Original terrazzo entry! That's a genuine selling point. Most people ripped those out in the 80s not knowing what they had.", minutesAgo: 4200 },
    { u: 9, content: "Detached garage = your car is going to be covered in snow 5 months a year. Hope you like scraping.", minutesAgo: 3000 },
    { u: 3, content: "Denver home prices have dropped ~8% from peak. This would've been $800K+ in 2022. Might have more room to negotiate.", minutesAgo: 1800 },
  ],
  // SF Mission rental — $3,800
  s010: [
    { u: 0, content: "$3,800 for a 2BR in the Mission with NO parking? In a building from 1908? This is peak San Francisco.", minutesAgo: 6400 },
    { u: 7, content: "The bay windows in these Victorian flats are genuinely gorgeous. Just know that they're also genuinely drafty. Your PG&E bill will be wild.", minutesAgo: 5800 },
    { u: 10, content: "Between Dolores Park and BART is the real selling point. That commute flexibility is worth a lot.", minutesAgo: 5200 },
    { u: 6, content: "Wainscoting 'restored' in a 1908 building means they painted over the original wood with white paint. I guarantee it.", minutesAgo: 3600 },
    { u: 1, content: "Lived on this block 2018-2021. The 'quiet block' thing is true — it's weirdly chill for the Mission. Good taquerias within stumbling distance.", minutesAgo: 2400 },
  ],
  // Nashville — $625K
  s011: [
    { u: 8, content: "New construction 'craftsman' in East Nashville with shiplap accent walls. I have seen this exact house 47 times.", minutesAgo: 4000 },
    { u: 3, content: "Alley access patio = your patio faces the alley. They just reworded 'backs up to an alley' to sound charming. Incredible.", minutesAgo: 3400 },
    { u: 4, content: "East Nashville is legitimately fun though. Great food scene, good bars, and $625K is actually reasonable for new construction.", minutesAgo: 2800 },
    { u: 11, content: "Quartz counters and shiplap — the HGTV effect is STRONG in Nashville. Every flip looks identical.", minutesAgo: 2200 },
    { u: 0, content: "Walk to all the good restaurants until they all close and get replaced by more bachelorette party bars 🤷", minutesAgo: 1200 },
    { u: 5, content: "Harsh but fair. Broadway is eating East Nashville alive. Still a great neighborhood for now though.", minutesAgo: 600 },
  ],
  // Boston Beacon Hill — $6,500
  s012: [
    { u: 2, content: "$6,500/mo for a 2BR with no parking in Beacon Hill. Boston's rental market is genuinely unhinged.", minutesAgo: 7800 },
    { u: 9, content: "12-foot ceilings in a building from 1840. That's not a selling point, that's a heating bill. You'll spend $400/mo in winter keeping that place warm.", minutesAgo: 7200 },
    { u: 6, content: "Original mantlepieces though... those are museum quality. Can't fake that craftsmanship.", minutesAgo: 6400 },
    { u: 10, content: "'Steps from the Common' = you can hear the street performers from your bedroom. Charming for a week, maddening by month two.", minutesAgo: 4800 },
    { u: 7, content: "Garden unit = basement. They said it fancier but it's a basement with a patio. Just so we're clear.", minutesAgo: 2000 },
  ],
  // Seattle townhome — $1.1M
  s013: [
    { u: 4, content: "Solar panels are a genuine flex in Seattle where the sun comes out 4 months a year. Bold investment.", minutesAgo: 5600 },
    { u: 1, content: "Capitol Hill has changed so much. This would've been $650K in 2018. But the light rail access is a real game changer for this neighborhood.", minutesAgo: 5000 },
    { u: 8, content: "Rooftop deck with Cascade views = incredible 80 days a year, rain-soaked and useless the other 285. Still worth it honestly.", minutesAgo: 4400 },
    { u: 3, content: "End unit is the way to go for townhomes. Extra windows, no neighbor on one side. Worth the premium every time.", minutesAgo: 3200 },
    { u: 11, content: "Cal Anderson Park is right there which is great but also gets VERY crowded on nice days. Everyone in Seattle collectively goes outside at the same time.", minutesAgo: 1600 },
  ],
  // New Orleans SOLD rental
  s014: [
    { u: 5, content: "A Frenchmen Street apartment for $2,200? That's actually incredible for the location. The music alone is worth it.", minutesAgo: 25000 },
    { u: 0, content: "Clawfoot tub AND jalousie shutters? This is the most New Orleans apartment I've ever seen. Whoever got this is living the dream.", minutesAgo: 24000 },
    { u: 10, content: "The music 'floating right in' also means you will never sleep before 2am. Just so we're setting expectations correctly.", minutesAgo: 23000 },
  ],
  // Scottsdale — $1.425M
  s015: [
    { u: 6, content: "15,000 sqft lot with a pool and outdoor kitchen for $1.4M. Try getting that in any coastal city. Arizona wins on space, no contest.", minutesAgo: 4600 },
    { u: 2, content: "Heritage olive trees are actually a huge deal. Those take 50+ years to mature and are basically impossible to replace.", minutesAgo: 4000 },
    { u: 9, content: "Beautiful house but it's 120° for 4 months. That heated pool is going to be a hot tub from June to September whether you like it or not.", minutesAgo: 3400 },
    { u: 7, content: "Santa Fe style is either your thing or it's really not. No in between. I personally love it.", minutesAgo: 2200 },
    { u: 3, content: "800-bottle wine cellar in a house in the desert. The climate control costs alone for that room must be astronomical.", minutesAgo: 1000 },
  ],
  // Chicago South Loop — $3,100
  s016: [
    { u: 11, content: "A building with a dog run! That's genuinely the most useful amenity I've ever seen. Finally someone gets it.", minutesAgo: 3800 },
    { u: 0, content: "Lakefront views from the South Loop are underrated. You get the whole skyline + lake without paying River North prices.", minutesAgo: 3200 },
    { u: 4, content: "$3,100 for a 2BR/2BA with parking and lake views? This is actually... reasonable? For Chicago? Am I losing my mind?", minutesAgo: 2600 },
    { u: 8, content: "South Loop is great if you WFH. Kind of dead during the day compared to other neighborhoods. But the museum campus is right there.", minutesAgo: 1800 },
  ],
  // Savannah Victorian — $548K
  s017: [
    { u: 5, content: "$548K for a Victorian in the Victorian District. With a wraparound porch. In Savannah. How is this real.", minutesAgo: 6800 },
    { u: 1, content: "Stained glass transoms from 1902! Those are worth $20K+ to replace if they ever break. Protect them at all costs.", minutesAgo: 6200 },
    { u: 10, content: "No parking though — and Savannah street parking is a competitive sport. Especially during tourist season which is... always.", minutesAgo: 5600 },
    { u: 3, content: "A magnolia tree that 'practically owns the block' is realtor code for 'the roots are destroying the sidewalk and possibly the foundation.' Charming though.", minutesAgo: 4400 },
    { u: 9, content: "I'd buy this in a heartbeat. Savannah is one of the most beautiful cities in the country and $548K is nothing for a house this special.", minutesAgo: 3000 },
    { u: 6, content: "The humidity will destroy you and everything you own, but what a gorgeous way to go. Savannah is magic.", minutesAgo: 1400 },
  ],
  // Dallas rental — $2,400
  s018: [
    { u: 7, content: "$2,400 for a brand new 1BR in Oak Lawn? Dallas rents have come a long way. This was $1,600 territory 5 years ago.", minutesAgo: 3200 },
    { u: 2, content: "'Pool that actually gets sun all afternoon' — they know their audience. Every other Dallas apartment has a pool shaded by the building itself.", minutesAgo: 2600 },
    { u: 4, content: "Ground floor with a private terrace is either your dream or a security concern depending on your perspective.", minutesAgo: 1800 },
    { u: 11, content: "Oak Lawn is a great neighborhood. Walkable by Dallas standards which means... you can technically walk to a few things.", minutesAgo: 800 },
  ],
  // Napa — $1.85M
  s019: [
    { u: 0, content: "Half an acre with a guest cottage AND an 800-bottle wine cellar? In Napa? For under $2M? This is genuinely underpriced.", minutesAgo: 5400 },
    { u: 8, content: "The guest cottage alone is a $50K/year Airbnb income stream in wine country. This house practically pays for itself.", minutesAgo: 4800 },
    { u: 6, content: "Heritage olive trees + 22,000 sqft lot = this property is giving 'I retired early and have opinions about terroir'", minutesAgo: 4000 },
    { u: 1, content: "I've toured this house. The wine cellar is legit — temperature and humidity controlled, not just a room in the basement they stuck shelves in.", minutesAgo: 3200 },
    { u: 5, content: "Fire insurance is the elephant in the room for Napa properties. Some carriers won't even write policies up there anymore. Factor that into your fantasy budget.", minutesAgo: 1800 },
  ],
  // Newport Victorian — $2.25M
  s020: [
    { u: 2, content: "A Queen Anne with a WIDOW'S WALK?? Ocean views from three bedrooms?? A carriage house?? I'm canceling all my plans.", minutesAgo: 7000 },
    { u: 9, content: "Half mile from the cliff walk is the sweet spot — close enough to walk, far enough that tourists aren't in your yard.", minutesAgo: 6400 },
    { u: 3, content: "An 1884 house means 1884 plumbing, 1884 electrical, and 1884 insulation. Budget $200K for the stuff the listing doesn't show you.", minutesAgo: 5600 },
    { u: 7, content: "'Fully restored with period details' — I really hope they also fully restored the wiring. Old knob-and-tube is no joke.", minutesAgo: 4800 },
    { u: 10, content: "Newport in the summer is one of the most beautiful places on earth. Newport in February? Enjoy your $800/mo heating bill and 40mph ocean winds.", minutesAgo: 3400 },
    { u: 4, content: "The carriage house could be converted to a rental unit. Newport allows ADUs now. That's $2,500-3,000/mo in summer rental income.", minutesAgo: 2000 },
    { u: 0, content: "$2.25M for this much history and character is honestly a steal compared to what you'd pay for a soulless new build. Old houses have STORIES.", minutesAgo: 800 },
  ],
};

// Reactions to sprinkle on comments — makes threads feel alive
const SEED_REACTIONS: { sourceId: string; commentIndex: number; emoji: string; userIndex: number }[] = [
  // Silver Lake
  { sourceId: "s001", commentIndex: 0, emoji: "🔥", userIndex: 4 },
  { sourceId: "s001", commentIndex: 0, emoji: "😂", userIndex: 5 },
  { sourceId: "s001", commentIndex: 0, emoji: "💀", userIndex: 8 },
  { sourceId: "s001", commentIndex: 2, emoji: "😂", userIndex: 0 },
  { sourceId: "s001", commentIndex: 6, emoji: "🔥", userIndex: 2 },
  { sourceId: "s001", commentIndex: 6, emoji: "💀", userIndex: 10 },
  // Brooklyn
  { sourceId: "s002", commentIndex: 0, emoji: "🔥", userIndex: 9 },
  { sourceId: "s002", commentIndex: 3, emoji: "😂", userIndex: 7 },
  { sourceId: "s002", commentIndex: 3, emoji: "💀", userIndex: 6 },
  { sourceId: "s002", commentIndex: 5, emoji: "😂", userIndex: 0 },
  // Austin
  { sourceId: "s003", commentIndex: 3, emoji: "😂", userIndex: 5 },
  { sourceId: "s003", commentIndex: 3, emoji: "🔥", userIndex: 11 },
  { sourceId: "s003", commentIndex: 4, emoji: "😮", userIndex: 2 },
  { sourceId: "s003", commentIndex: 5, emoji: "💀", userIndex: 0 },
  // Miami
  { sourceId: "s004", commentIndex: 0, emoji: "😮", userIndex: 1 },
  { sourceId: "s004", commentIndex: 1, emoji: "💀", userIndex: 10 },
  { sourceId: "s004", commentIndex: 1, emoji: "😮", userIndex: 5 },
  // Nashville
  { sourceId: "s011", commentIndex: 0, emoji: "😂", userIndex: 4 },
  { sourceId: "s011", commentIndex: 1, emoji: "💀", userIndex: 8 },
  { sourceId: "s011", commentIndex: 4, emoji: "🔥", userIndex: 3 },
  { sourceId: "s011", commentIndex: 4, emoji: "😂", userIndex: 11 },
  // Savannah
  { sourceId: "s017", commentIndex: 0, emoji: "❤️", userIndex: 1 },
  { sourceId: "s017", commentIndex: 0, emoji: "❤️", userIndex: 9 },
  { sourceId: "s017", commentIndex: 4, emoji: "❤️", userIndex: 5 },
  { sourceId: "s017", commentIndex: 5, emoji: "🔥", userIndex: 10 },
  // Newport
  { sourceId: "s020", commentIndex: 0, emoji: "❤️", userIndex: 9 },
  { sourceId: "s020", commentIndex: 0, emoji: "🔥", userIndex: 7 },
  { sourceId: "s020", commentIndex: 6, emoji: "❤️", userIndex: 2 },
  { sourceId: "s020", commentIndex: 6, emoji: "❤️", userIndex: 5 },
];

async function main() {
  console.log("🌱  Seeding gwakgwak listings…");

  // Upsert all listings
  const listingMap: Record<string, string> = {}; // sourceId → db id
  for (const data of LISTINGS) {
    const listing = await prisma.listing.upsert({
      where: { source_sourceId: { source: data.source, sourceId: data.sourceId } },
      update: data,
      create: data,
    });
    listingMap[data.sourceId] = listing.id;
  }
  console.log(`✅  Seeded ${LISTINGS.length} listings`);

  // Clear existing seed comments & reactions (idempotent re-seed)
  const seedListingIds = Object.values(listingMap);
  await prisma.reaction.deleteMany({
    where: { comment: { listingId: { in: seedListingIds } } },
  });
  await prisma.comment.deleteMany({
    where: { listingId: { in: seedListingIds } },
  });
  await prisma.emailSubscription.deleteMany({
    where: { listingId: { in: seedListingIds } },
  });

  // Insert comments
  const commentIdMap: Record<string, string[]> = {}; // sourceId → [commentId, ...]
  const now = Date.now();

  for (const [sourceId, comments] of Object.entries(SEED_COMMENTS)) {
    const listingId = listingMap[sourceId];
    if (!listingId) continue;
    commentIdMap[sourceId] = [];

    for (const c of comments) {
      const user = USERS[c.u];
      const comment = await prisma.comment.create({
        data: {
          listingId,
          name: user.name,
          email: user.email,
          content: c.content,
          createdAt: new Date(now - c.minutesAgo * 60_000),
        },
      });
      commentIdMap[sourceId].push(comment.id);

      // Auto-subscribe commenter (like the real flow)
      await prisma.emailSubscription.upsert({
        where: { listingId_email: { listingId, email: user.email } },
        update: {},
        create: { listingId, email: user.email },
      });
    }
  }

  const totalComments = Object.values(SEED_COMMENTS).flat().length;
  console.log(`💬  Seeded ${totalComments} comments across ${Object.keys(SEED_COMMENTS).length} listings`);

  // Insert reactions
  for (const r of SEED_REACTIONS) {
    const commentIds = commentIdMap[r.sourceId];
    if (!commentIds || !commentIds[r.commentIndex]) continue;
    const user = USERS[r.userIndex];
    await prisma.reaction.create({
      data: {
        commentId: commentIds[r.commentIndex],
        email: user.email,
        type: r.emoji,
      },
    });
  }
  console.log(`⚡  Seeded ${SEED_REACTIONS.length} reactions`);

  console.log("🎉  Done! gwakgwak is ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
