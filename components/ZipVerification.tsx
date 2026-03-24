"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Step = "zip" | "details" | "verifying" | "verified";

// Common US zip-to-city mapping for live preview
const ZIP_CITY_MAP: Record<string, string> = {
  "100": "New York",
  "101": "New York",
  "102": "New York",
  "103": "Staten Island",
  "104": "Bronx",
  "110": "Queens",
  "111": "Brooklyn",
  "112": "Brooklyn",
  "113": "Flushing",
  "114": "Jamaica",
  "115": "Western Queens",
  "116": "Far Rockaway",
  "117": "Mid-Island",
  "118": "Staten Island",
  "119": "Brooklyn",
  "120": "Albany",
  "121": "Albany",
  "122": "Albany",
  "130": "Syracuse",
  "131": "Syracuse",
  "140": "Buffalo",
  "141": "Buffalo",
  "142": "Buffalo",
  "143": "Niagara Falls",
  "144": "Rochester",
  "145": "Rochester",
  "146": "Rochester",
  "150": "Pittsburgh",
  "151": "Pittsburgh",
  "152": "Pittsburgh",
  "153": "Pittsburgh",
  "160": "New Castle",
  "161": "New Castle",
  "170": "Harrisburg",
  "171": "Harrisburg",
  "172": "Harrisburg",
  "173": "York",
  "175": "Lancaster",
  "176": "Lancaster",
  "180": "Lehigh Valley",
  "181": "Allentown",
  "190": "Philadelphia",
  "191": "Philadelphia",
  "192": "Philadelphia",
  "193": "Southeastern PA",
  "194": "Southeastern PA",
  "200": "Washington DC",
  "201": "Dulles",
  "202": "Washington DC",
  "203": "Washington DC",
  "204": "Washington DC",
  "205": "Washington DC",
  "206": "Southern MD",
  "207": "Southern MD",
  "208": "Suburban MD",
  "209": "Silver Spring",
  "210": "Baltimore",
  "211": "Baltimore",
  "212": "Baltimore",
  "214": "Annapolis",
  "215": "Cumberland",
  "216": "Easton",
  "217": "Frederick",
  "218": "Salisbury",
  "219": "Elkton",
  "220": "Northern VA",
  "221": "Northern VA",
  "222": "Arlington",
  "223": "Alexandria",
  "224": "Roanoke",
  "226": "Winchester",
  "229": "Charlottesville",
  "230": "Richmond",
  "231": "Richmond",
  "232": "Richmond",
  "233": "Norfolk",
  "234": "Virginia Beach",
  "235": "Norfolk",
  "236": "Norfolk",
  "237": "Portsmouth",
  "238": "Richmond",
  "240": "Roanoke",
  "241": "Roanoke",
  "242": "Bristol",
  "243": "Farmville",
  "244": "Charlottesville",
  "245": "Lynchburg",
  "246": "Bluefield",
  "247": "Bluefield",
  "248": "Charlottesville",
  "250": "Charleston",
  "251": "Charleston",
  "252": "Charleston",
  "253": "Charleston",
  "254": "Martinsburg",
  "255": "Huntington",
  "256": "Huntington",
  "257": "Huntington",
  "258": "Beckley",
  "259": "Beckley",
  "260": "Wheeling",
  "261": "Parkersburg",
  "262": "Clarksburg",
  "263": "Clarksburg",
  "264": "Clarksburg",
  "265": "Clarksburg",
  "266": "Gassaway",
  "267": "Cumberland",
  "268": "Petersburg",
  "270": "Greensboro",
  "271": "Winston-Salem",
  "272": "Greensboro",
  "273": "Greensboro",
  "274": "Greensboro",
  "275": "Raleigh",
  "276": "Raleigh",
  "277": "Durham",
  "278": "Rocky Mount",
  "279": "Elizabeth City",
  "280": "Charlotte",
  "281": "Charlotte",
  "282": "Charlotte",
  "283": "Fayetteville",
  "284": "Wilmington",
  "285": "Kinston",
  "286": "Hickory",
  "287": "Asheville",
  "288": "Asheville",
  "289": "Asheville",
  "290": "Columbia",
  "291": "Columbia",
  "292": "Columbia",
  "293": "Greenville",
  "294": "Charleston",
  "295": "Florence",
  "296": "Greenville",
  "297": "Charlotte",
  "298": "Augusta",
  "299": "Savannah",
  "300": "Atlanta",
  "301": "Atlanta",
  "302": "Atlanta",
  "303": "Atlanta",
  "304": "Swainsboro",
  "305": "Athens",
  "306": "Athens",
  "307": "Chattanooga",
  "308": "Augusta",
  "309": "Augusta",
  "310": "Macon",
  "311": "Atlanta",
  "312": "Macon",
  "313": "Savannah",
  "314": "Savannah",
  "315": "Waycross",
  "316": "Valdosta",
  "317": "Albany",
  "318": "Columbus",
  "319": "Columbus",
  "320": "Jacksonville",
  "321": "Daytona Beach",
  "322": "Jacksonville",
  "323": "Tallahassee",
  "324": "Panama City",
  "325": "Pensacola",
  "326": "Gainesville",
  "327": "Orlando",
  "328": "Orlando",
  "329": "Melbourne",
  "330": "Miami",
  "331": "Miami",
  "332": "Miami",
  "333": "Fort Lauderdale",
  "334": "West Palm Beach",
  "335": "Tampa",
  "336": "Tampa",
  "337": "St. Petersburg",
  "338": "Lakeland",
  "339": "Fort Myers",
  "340": "Virgin Islands",
  "341": "Naples",
  "342": "Manasota",
  "344": "Gainesville",
  "346": "Tampa",
  "347": "Orlando",
  "349": "West Palm Beach",
  "350": "Birmingham",
  "351": "Birmingham",
  "352": "Birmingham",
  "354": "Tuscaloosa",
  "355": "Birmingham",
  "356": "Huntsville",
  "357": "Huntsville",
  "358": "Huntsville",
  "359": "Birmingham",
  "360": "Montgomery",
  "361": "Montgomery",
  "362": "Anniston",
  "363": "Dothan",
  "364": "Evergreen",
  "365": "Mobile",
  "366": "Mobile",
  "367": "Selma",
  "368": "Hattiesburg",
  "369": "Meridian",
  "370": "Nashville",
  "371": "Nashville",
  "372": "Nashville",
  "373": "Chattanooga",
  "374": "Chattanooga",
  "375": "Memphis",
  "376": "Johnson City",
  "377": "Knoxville",
  "378": "Knoxville",
  "379": "Knoxville",
  "380": "Memphis",
  "381": "Memphis",
  "382": "Memphis",
  "383": "Memphis",
  "384": "Columbia",
  "385": "Cookeville",
  "386": "Memphis",
  "387": "Greenville",
  "388": "Tupelo",
  "389": "Grenada",
  "390": "Jackson",
  "391": "Jackson",
  "392": "Jackson",
  "393": "Meridian",
  "394": "Hattiesburg",
  "395": "Gulfport",
  "396": "McComb",
  "397": "Columbus",
  "398": "Albany",
  "399": "Atlanta",
  "400": "Louisville",
  "401": "Louisville",
  "402": "Louisville",
  "403": "Lexington",
  "404": "Lexington",
  "405": "Lexington",
  "406": "Frankfort",
  "410": "Cincinnati",
  "411": "Ashland",
  "412": "Ashland",
  "413": "Campton",
  "414": "Campton",
  "415": "Pikeville",
  "416": "Pikeville",
  "417": "Hazard",
  "418": "Hazard",
  "420": "Paducah",
  "421": "Bowling Green",
  "422": "Bowling Green",
  "423": "Owensboro",
  "424": "Evansville",
  "425": "Somerset",
  "426": "Somerset",
  "427": "Elizabethtown",
  "430": "Columbus",
  "431": "Columbus",
  "432": "Columbus",
  "433": "Columbus",
  "434": "Toledo",
  "435": "Toledo",
  "436": "Toledo",
  "437": "Zanesville",
  "438": "Zanesville",
  "439": "Steubenville",
  "440": "Cleveland",
  "441": "Cleveland",
  "442": "Akron",
  "443": "Akron",
  "444": "Youngstown",
  "445": "Youngstown",
  "446": "Canton",
  "447": "Canton",
  "448": "Mansfield",
  "449": "Mansfield",
  "450": "Cincinnati",
  "451": "Cincinnati",
  "452": "Cincinnati",
  "453": "Dayton",
  "454": "Dayton",
  "455": "Springfield",
  "456": "Chillicothe",
  "457": "Athens",
  "458": "Lima",
  "459": "Cincinnati",
  "460": "Indianapolis",
  "461": "Indianapolis",
  "462": "Indianapolis",
  "463": "Gary",
  "464": "Gary",
  "465": "South Bend",
  "466": "South Bend",
  "467": "Fort Wayne",
  "468": "Fort Wayne",
  "469": "Kokomo",
  "470": "Cincinnati",
  "471": "Louisville",
  "472": "Columbus",
  "473": "Muncie",
  "474": "Bloomington",
  "475": "Washington",
  "476": "Evansville",
  "477": "Evansville",
  "478": "Terre Haute",
  "479": "Lafayette",
  "480": "Detroit",
  "481": "Detroit",
  "482": "Detroit",
  "483": "Detroit",
  "484": "Flint",
  "485": "Flint",
  "486": "Saginaw",
  "487": "Saginaw",
  "488": "Lansing",
  "489": "Lansing",
  "490": "Kalamazoo",
  "491": "Kalamazoo",
  "492": "Jackson",
  "493": "Grand Rapids",
  "494": "Grand Rapids",
  "495": "Grand Rapids",
  "496": "Traverse City",
  "497": "Gaylord",
  "498": "Iron Mountain",
  "499": "Iron Mountain",
  "500": "Des Moines",
  "501": "Des Moines",
  "502": "Des Moines",
  "503": "Des Moines",
  "504": "Mason City",
  "505": "Fort Dodge",
  "506": "Waterloo",
  "507": "Waterloo",
  "508": "Creston",
  "509": "Des Moines",
  "510": "Sioux City",
  "511": "Sioux City",
  "512": "Sheldon",
  "513": "Spencer",
  "514": "Carroll",
  "515": "Omaha",
  "516": "Shenandoah",
  "520": "Dubuque",
  "521": "Decorah",
  "522": "Cedar Rapids",
  "523": "Cedar Rapids",
  "524": "Cedar Rapids",
  "525": "Ottumwa",
  "526": "Burlington",
  "527": "Rock Island",
  "528": "Davenport",
  "530": "Milwaukee",
  "531": "Milwaukee",
  "532": "Milwaukee",
  "534": "Racine",
  "535": "Madison",
  "537": "Madison",
  "538": "Madison",
  "539": "Portage",
  "540": "St. Paul",
  "541": "Green Bay",
  "542": "Green Bay",
  "543": "Green Bay",
  "544": "Wausau",
  "545": "Rhinelander",
  "546": "La Crosse",
  "547": "Eau Claire",
  "548": "Spooner",
  "549": "Oshkosh",
  "550": "St. Paul",
  "551": "St. Paul",
  "553": "Minneapolis",
  "554": "Minneapolis",
  "555": "Minneapolis",
  "556": "Duluth",
  "557": "Duluth",
  "558": "Duluth",
  "559": "Rochester",
  "560": "Mankato",
  "561": "Mankato",
  "562": "Willmar",
  "563": "St. Cloud",
  "564": "Brainerd",
  "565": "Detroit Lakes",
  "566": "Bemidji",
  "567": "Thief River Falls",
  "569": "Washington DC",
  "570": "Sioux Falls",
  "571": "Sioux Falls",
  "572": "Watertown",
  "573": "Mitchell",
  "574": "Aberdeen",
  "575": "Pierre",
  "576": "Mobridge",
  "577": "Rapid City",
  "580": "Fargo",
  "581": "Fargo",
  "582": "Grand Forks",
  "583": "Devils Lake",
  "584": "Jamestown",
  "585": "Bismarck",
  "586": "Bismarck",
  "587": "Minot",
  "588": "Williston",
  "590": "Billings",
  "591": "Billings",
  "592": "Wolf Point",
  "593": "Miles City",
  "594": "Great Falls",
  "595": "Havre",
  "596": "Helena",
  "597": "Butte",
  "598": "Missoula",
  "599": "Kalispell",
  "600": "Chicago",
  "601": "Chicago",
  "602": "Evanston",
  "603": "Oak Park",
  "604": "Joliet",
  "605": "South Suburbs",
  "606": "Chicago",
  "607": "Chicago",
  "608": "Kankakee",
  "609": "Kankakee",
  "610": "Rockford",
  "611": "Rockford",
  "612": "Rock Island",
  "613": "La Salle",
  "614": "Galesburg",
  "615": "Peoria",
  "616": "Peoria",
  "617": "Bloomington",
  "618": "Champaign",
  "619": "Champaign",
  "620": "St. Louis",
  "622": "St. Louis",
  "623": "Quincy",
  "624": "Effingham",
  "625": "Springfield",
  "626": "Springfield",
  "627": "Springfield",
  "628": "Centralia",
  "629": "Carbondale",
  "630": "St. Louis",
  "631": "St. Louis",
  "633": "Columbia",
  "634": "Hannibal",
  "635": "Springfield",
  "636": "Springfield",
  "637": "Springfield",
  "638": "Cape Girardeau",
  "639": "Poplar Bluff",
  "640": "Kansas City",
  "641": "Kansas City",
  "644": "St. Joseph",
  "645": "St. Joseph",
  "646": "Chillicothe",
  "647": "Harrisonville",
  "648": "Joplin",
  "649": "Kansas City",
  "650": "Jefferson City",
  "651": "Jefferson City",
  "652": "Columbia",
  "653": "Sedalia",
  "654": "Rolla",
  "655": "Rolla",
  "656": "Springfield",
  "657": "Springfield",
  "658": "Springfield",
  "660": "Kansas City",
  "661": "Kansas City",
  "662": "Shawnee Mission",
  "664": "Topeka",
  "665": "Topeka",
  "666": "Topeka",
  "667": "Fort Scott",
  "668": "Topeka",
  "669": "Salina",
  "670": "Wichita",
  "671": "Wichita",
  "672": "Wichita",
  "673": "Independence",
  "674": "Salina",
  "675": "Hutchinson",
  "676": "Hays",
  "677": "Colby",
  "678": "Dodge City",
  "679": "Liberal",
  "680": "Omaha",
  "681": "Omaha",
  "683": "Lincoln",
  "684": "Lincoln",
  "685": "Lincoln",
  "686": "Columbus",
  "687": "Norfolk",
  "688": "Grand Island",
  "689": "Hastings",
  "690": "McCook",
  "691": "North Platte",
  "692": "Valentine",
  "693": "Alliance",
  "700": "New Orleans",
  "701": "New Orleans",
  "703": "Thibodaux",
  "704": "Hammond",
  "705": "Lafayette",
  "706": "Lake Charles",
  "707": "Baton Rouge",
  "708": "Baton Rouge",
  "710": "Shreveport",
  "711": "Shreveport",
  "712": "Monroe",
  "713": "Alexandria",
  "714": "Alexandria",
  "716": "Pine Bluff",
  "717": "Camden",
  "718": "Texarkana",
  "719": "Hot Springs",
  "720": "Little Rock",
  "721": "Little Rock",
  "722": "Little Rock",
  "723": "Memphis",
  "724": "Jonesboro",
  "725": "Batesville",
  "726": "Harrison",
  "727": "Fayetteville",
  "728": "Russellville",
  "729": "Fort Smith",
  "730": "Oklahoma City",
  "731": "Oklahoma City",
  "734": "Ardmore",
  "735": "Lawton",
  "736": "Clinton",
  "737": "Enid",
  "738": "Woodward",
  "739": "Liberal",
  "740": "Tulsa",
  "741": "Tulsa",
  "743": "Tulsa",
  "744": "Muskogee",
  "745": "McAlester",
  "746": "Ponca City",
  "747": "Durant",
  "748": "Shawnee",
  "749": "Poteau",
  "750": "Dallas",
  "751": "Dallas",
  "752": "Dallas",
  "753": "Dallas",
  "754": "Greenville",
  "755": "Texarkana",
  "756": "Longview",
  "757": "Tyler",
  "758": "Palestine",
  "759": "Lufkin",
  "760": "Fort Worth",
  "761": "Fort Worth",
  "762": "Denton",
  "763": "Wichita Falls",
  "764": "Stephenville",
  "765": "Waco",
  "766": "Waco",
  "767": "Waco",
  "768": "Abilene",
  "769": "Midland",
  "770": "Houston",
  "771": "Houston",
  "772": "Houston",
  "773": "Huntsville",
  "774": "Houston",
  "775": "Houston",
  "776": "Beaumont",
  "777": "Beaumont",
  "778": "Bryan",
  "779": "Victoria",
  "780": "San Antonio",
  "781": "San Antonio",
  "782": "San Antonio",
  "783": "Corpus Christi",
  "784": "Corpus Christi",
  "785": "McAllen",
  "786": "Austin",
  "787": "Austin",
  "788": "Austin",
  "789": "Austin",
  "790": "Amarillo",
  "791": "Amarillo",
  "792": "Lubbock",
  "793": "Lubbock",
  "794": "Lubbock",
  "795": "Abilene",
  "796": "Abilene",
  "797": "Midland",
  "798": "El Paso",
  "799": "El Paso",
  "800": "Denver",
  "801": "Denver",
  "802": "Denver",
  "803": "Boulder",
  "804": "Denver",
  "805": "Longmont",
  "806": "Denver",
  "807": "Denver",
  "808": "Colorado Springs",
  "809": "Colorado Springs",
  "810": "Colorado Springs",
  "811": "Alamosa",
  "812": "Salida",
  "813": "Durango",
  "814": "Grand Junction",
  "815": "Grand Junction",
  "816": "Glenwood Springs",
  "820": "Cheyenne",
  "821": "Yellowstone",
  "822": "Wheatland",
  "823": "Rawlins",
  "824": "Worland",
  "825": "Riverton",
  "826": "Casper",
  "827": "Gillette",
  "828": "Sheridan",
  "829": "Rock Springs",
  "830": "Rock Springs",
  "831": "Rock Springs",
  "832": "Pocatello",
  "833": "Twin Falls",
  "834": "Pocatello",
  "835": "Lewiston",
  "836": "Boise",
  "837": "Boise",
  "838": "Spokane",
  "840": "Salt Lake City",
  "841": "Salt Lake City",
  "842": "Ogden",
  "843": "Ogden",
  "844": "Ogden",
  "845": "Provo",
  "846": "Provo",
  "847": "Provo",
  "850": "Phoenix",
  "851": "Phoenix",
  "852": "Phoenix",
  "853": "Phoenix",
  "855": "Globe",
  "856": "Tucson",
  "857": "Tucson",
  "859": "Show Low",
  "860": "Flagstaff",
  "863": "Prescott",
  "864": "Kingman",
  "865": "Gallup",
  "870": "Albuquerque",
  "871": "Albuquerque",
  "872": "Albuquerque",
  "873": "Gallup",
  "874": "Farmington",
  "875": "Santa Fe",
  "877": "Las Vegas",
  "878": "Socorro",
  "879": "Truth or Consequences",
  "880": "Las Cruces",
  "881": "Clovis",
  "882": "Roswell",
  "883": "Alamogordo",
  "884": "Tucumcari",
  "885": "El Paso",
  "889": "Las Vegas",
  "890": "Las Vegas",
  "891": "Las Vegas",
  "893": "Ely",
  "894": "Reno",
  "895": "Reno",
  "897": "Carson City",
  "898": "Elko",
  "900": "Los Angeles",
  "901": "Los Angeles",
  "902": "Inglewood",
  "903": "Inglewood",
  "904": "Santa Monica",
  "905": "Torrance",
  "906": "Whittier",
  "907": "Long Beach",
  "908": "Long Beach",
  "910": "Pasadena",
  "911": "Pasadena",
  "912": "Glendale",
  "913": "Van Nuys",
  "914": "Van Nuys",
  "915": "Burbank",
  "916": "North Hollywood",
  "917": "Alhambra",
  "918": "Alhambra",
  "919": "San Diego",
  "920": "San Diego",
  "921": "San Diego",
  "922": "Indio",
  "923": "San Bernardino",
  "924": "San Bernardino",
  "925": "Riverside",
  "926": "Santa Ana",
  "927": "Santa Ana",
  "928": "Anaheim",
  "930": "Ventura",
  "931": "Santa Barbara",
  "932": "Bakersfield",
  "933": "Bakersfield",
  "934": "Santa Barbara",
  "935": "Mojave",
  "936": "Fresno",
  "937": "Fresno",
  "938": "Fresno",
  "939": "Salinas",
  "940": "San Francisco",
  "941": "San Francisco",
  "942": "Sacramento",
  "943": "Palo Alto",
  "944": "San Mateo",
  "945": "Oakland",
  "946": "Oakland",
  "947": "Berkeley",
  "948": "Richmond",
  "949": "San Rafael",
  "950": "San Jose",
  "951": "San Jose",
  "952": "Stockton",
  "953": "Stockton",
  "954": "Santa Rosa",
  "955": "Eureka",
  "956": "Sacramento",
  "957": "Sacramento",
  "958": "Sacramento",
  "959": "Marysville",
  "960": "Redding",
  "961": "Reno",
  "967": "Honolulu",
  "968": "Honolulu",
  "969": "Guam",
  "970": "Portland",
  "971": "Portland",
  "972": "Portland",
  "973": "Salem",
  "974": "Eugene",
  "975": "Medford",
  "976": "Klamath Falls",
  "977": "Bend",
  "978": "Pendleton",
  "979": "Boise",
  "980": "Seattle",
  "981": "Seattle",
  "982": "Everett",
  "983": "Tacoma",
  "984": "Tacoma",
  "985": "Olympia",
  "986": "Portland",
  "988": "Wenatchee",
  "989": "Yakima",
  "990": "Spokane",
  "991": "Spokane",
  "992": "Spokane",
  "993": "Pasco",
  "994": "Lewiston",
  "995": "Anchorage",
  "996": "Anchorage",
  "997": "Fairbanks",
  "998": "Juneau",
  "999": "Ketchikan",
};

function getCityFromZip(zip: string): string | null {
  if (zip.length >= 3) {
    return ZIP_CITY_MAP[zip.slice(0, 3)] || null;
  }
  return null;
}

// Confetti particle component
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const colors = ["#D4763C", "#F5A623", "#E8945A", "#FFD700", "#FF8C42", "#FAFAF8", "#C0392B", "#8E44AD"];
    const particles: {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      rotSpeed: number;
      opacity: number;
    }[] = [];

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 60,
        y: height / 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -14 - 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 90;

    function animate() {
      if (frame >= maxFrames) return;
      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.35;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - frame / maxFrames);

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      frame++;
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// Verifying spinner animation
function VerifyingSpinner() {
  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-[3px] border-divider"
        />
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-amber"
          style={{ animation: "zvSpin 0.8s linear infinite" }}
        />
        <div
          className="absolute inset-[6px] rounded-full border-[2px] border-transparent border-b-amber/40"
          style={{ animation: "zvSpin 1.2s linear infinite reverse" }}
        />
      </div>
      <div className="text-center">
        <p
          className="text-title text-ink font-display"
          style={{ animation: "zvPulseText 1.5s ease-in-out infinite" }}
        >
          Verifying your address...
        </p>
        <p className="text-caption text-secondary mt-1">This only takes a moment</p>
      </div>
    </div>
  );
}

// Progress dots
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-500 ease-out rounded-full"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            backgroundColor: i <= current ? "#D4763C" : "#E8E6E3",
          }}
        />
      ))}
    </div>
  );
}

export default function ZipVerification({
  onVerified,
}: {
  onVerified?: (data: { zipCode: string; name: string; email: string }) => void;
}) {
  const [step, setStep] = useState<Step>("zip");
  const [prevStep, setPrevStep] = useState<Step | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward");

  const zipInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const cityName = getCityFromZip(zipCode);

  // Auto-focus zip input on mount
  useEffect(() => {
    if (step === "zip") {
      setTimeout(() => zipInputRef.current?.focus(), 300);
    }
  }, [step]);

  // Auto-focus name input when step 2 appears
  useEffect(() => {
    if (step === "details") {
      setTimeout(() => nameInputRef.current?.focus(), 400);
    }
  }, [step]);

  const goToStep = useCallback((next: Step, direction: "forward" | "back" = "forward") => {
    setSlideDir(direction);
    setPrevStep(step);
    setStep(next);
  }, [step]);

  const handleZipSubmit = () => {
    if (!/^\d{5}$/.test(zipCode)) {
      setError("Enter a valid 5-digit zip code");
      return;
    }
    setError("");
    goToStep("details", "forward");
  };

  const handleVerify = async () => {
    if (!address.trim() || !name.trim() || !email.trim()) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    goToStep("verifying", "forward");

    try {
      const res = await fetch("/api/community/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, name, email, address }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verification failed");
      }
      // Store verification in localStorage
      localStorage.setItem(
        "gwaky-verified",
        JSON.stringify({
          zipCode,
          name,
          email,
          verifiedAt: new Date().toISOString(),
        })
      );

      // Brief delay for the verifying animation to feel intentional
      await new Promise((r) => setTimeout(r, 1800));

      setShowConfetti(true);
      goToStep("verified", "forward");
      onVerified?.({ zipCode, name, email });
    } catch (e: any) {
      setError(e.message);
      goToStep("details", "back");
    } finally {
      setLoading(false);
    }
  };

  const handleZipKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleZipSubmit();
  };

  const handleDetailsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim() && email.trim() && address.trim()) {
      handleVerify();
    }
  };

  const stepIndex = step === "zip" ? 0 : step === "details" ? 1 : 2;

  // Verified state
  if (step === "verified") {
    return (
      <div className="relative overflow-hidden rounded-2xl" style={{ background: "#FFFFFF" }}>
        {showConfetti && <ConfettiCanvas />}
        <style>{`
          @keyframes zvBadgeIn {
            0% { transform: scale(0) rotate(-20deg); opacity: 0; }
            60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes zvGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(212,118,60,0.15), 0 0 40px rgba(212,118,60,0.05); }
            50% { box-shadow: 0 0 30px rgba(212,118,60,0.25), 0 0 60px rgba(212,118,60,0.1); }
          }
          @keyframes zvTextIn {
            0% { transform: translateY(12px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <div className="relative z-10 p-8 text-center">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
            style={{
              background: "linear-gradient(135deg, #D4763C 0%, #F5A623 100%)",
              animation: "zvBadgeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, zvGlow 3s ease-in-out infinite 0.6s",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h3
            className="text-headline text-ink font-display mb-2"
            style={{ animation: "zvTextIn 0.5s ease-out 0.3s both" }}
          >
            Welcome to {zipCode}!
          </h3>
          <p
            className="text-body text-secondary mb-5"
            style={{ animation: "zvTextIn 0.5s ease-out 0.45s both" }}
          >
            You&apos;re a verified local{cityName ? ` in ${cityName}` : ""}. Your takes matter.
          </p>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(212,118,60,0.08) 0%, rgba(245,166,35,0.08) 100%)",
              border: "1px solid rgba(212,118,60,0.2)",
              animation: "zvTextIn 0.5s ease-out 0.6s both",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#D4763C",
                boxShadow: "0 0 6px rgba(212,118,60,0.5)",
              }}
            />
            <span className="text-caption font-medium" style={{ color: "#D4763C" }}>
              Verified Neighbor
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Verifying state
  if (step === "verifying") {
    return (
      <div className="rounded-2xl p-6 border border-divider" style={{ background: "#FFFFFF" }}>
        <style>{`
          @keyframes zvSpin {
            to { transform: rotate(360deg); }
          }
          @keyframes zvPulseText {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <VerifyingSpinner />
      </div>
    );
  }

  // Input steps (zip & details)
  return (
    <div className="rounded-2xl border border-divider overflow-hidden" style={{ background: "#FFFFFF" }}>
      <style>{`
        @keyframes zvSlideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zvSlideInLeft {
          from { transform: translateX(-40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zvFadeUp {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zvSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes zvPulseText {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .zv-input {
          width: 100%;
          padding: 12px 16px;
          background: #FAFAF8;
          border: 1.5px solid #E8E6E3;
          border-radius: 12px;
          font-size: 0.875rem;
          color: #1A1A1A;
          font-family: "Space Grotesk", system-ui, sans-serif;
          transition: all 0.2s ease;
          outline: none;
        }
        .zv-input::placeholder {
          color: #999999;
        }
        .zv-input:focus {
          border-color: #D4763C;
          box-shadow: 0 0 0 3px rgba(212,118,60,0.12);
        }
        .zv-input-lg {
          font-size: 2rem;
          text-align: center;
          letter-spacing: 0.15em;
          padding: 16px 24px;
          font-weight: 600;
          font-family: "Space Grotesk", system-ui, sans-serif;
        }
        .zv-input-lg::placeholder {
          font-size: 1.25rem;
          letter-spacing: 0;
          font-weight: 400;
        }
        .zv-btn {
          width: 100%;
          padding: 14px 24px;
          background: #1A1A1A;
          color: #FAFAF8;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: "Space Grotesk", system-ui, sans-serif;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .zv-btn:hover {
          background: #333333;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .zv-btn:active {
          transform: translateY(0);
        }
        .zv-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>

      <div className="p-6 pb-5">
        <ProgressDots current={stepIndex} total={3} />

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-caption"
            style={{
              background: "rgba(220,38,38,0.06)",
              border: "1px solid rgba(220,38,38,0.12)",
              color: "#DC2626",
              animation: "zvFadeUp 0.3s ease-out",
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1: Zip Code */}
        {step === "zip" && (
          <div
            key="zip"
            style={{
              animation: `${slideDir === "forward" ? "zvSlideInRight" : "zvSlideInLeft"} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            }}
          >
            <div className="text-center mb-6">
              <h3 className="text-headline text-ink font-display mb-1">
                Join your neighborhood
              </h3>
              <p className="text-caption text-secondary">
                Enter your zip code to get started
              </p>
            </div>

            <div className="mb-4">
              <input
                ref={zipInputRef}
                type="text"
                inputMode="numeric"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                onKeyDown={handleZipKeyDown}
                placeholder="00000"
                className="zv-input zv-input-lg"
                autoComplete="postal-code"
              />
            </div>

            {/* Live city preview */}
            <div
              className="text-center mb-6 overflow-hidden"
              style={{
                height: cityName ? 32 : 0,
                opacity: cityName ? 1 : 0,
                transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              <p
                className="text-body font-medium"
                style={{ color: "#D4763C" }}
              >
                Joining the {cityName} community
              </p>
            </div>

            <button
              onClick={handleZipSubmit}
              className="zv-btn"
              disabled={zipCode.length !== 5}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <div
            key="details"
            style={{
              animation: `${slideDir === "forward" ? "zvSlideInRight" : "zvSlideInLeft"} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            }}
          >
            <div className="text-center mb-5">
              <h3 className="text-headline text-ink font-display mb-1">
                Almost there
              </h3>
              <p className="text-caption text-secondary">
                Step 2 of 3 &mdash; Tell us about yourself
              </p>
            </div>

            {/* Zip badge */}
            <div className="flex items-center justify-center mb-5">
              <button
                onClick={() => {
                  setError("");
                  goToStep("zip", "back");
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-caption transition-colors"
                style={{
                  background: "rgba(212,118,60,0.08)",
                  color: "#D4763C",
                }}
              >
                <span className="font-medium">{zipCode}</span>
                {cityName && <span className="text-secondary">&middot; {cityName}</span>}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <div className="space-y-3" onKeyDown={handleDetailsKeyDown}>
              {/* Name + Email row */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="zv-input"
                  autoComplete="name"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="zv-input"
                  autoComplete="email"
                />
              </div>

              {/* Address */}
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                className="zv-input"
                autoComplete="street-address"
              />
              <p className="text-[11px] text-tertiary flex items-center gap-1.5 pl-1">
                <span>&#128274;</span> Encrypted. Never shown publicly.
              </p>
            </div>

            <div className="mt-5">
              <button
                onClick={handleVerify}
                className="zv-btn"
                disabled={loading || !name.trim() || !email.trim() || !address.trim()}
              >
                Verify &amp; Join
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
