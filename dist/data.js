export const MISSIONS = [
  { id:'flyby', number:'01', name:'First Light', type:'Lunar flyby', tag:'START HERE', description:'Send a lean explorer past the Moon. Bring home our first close-up images.', detail:'A fast, focused encounter. Build a lightweight spacecraft that can reach the Moon, keep its camera running, and transmit the encounter home.', budget:48, dv:3300, days:4, minScience:35, eclipse:0.35, capture:0, landing:0, scienceWeights:{camera:1.4,spectrometer:0.65,radar:0.4}, baseScience:15, difficulty:'Introductory', objective:'Return close-up lunar images', required:'camera', accent:'mint' },
  { id:'orbiter', number:'02', name:'Hidden Water', type:'Polar lunar orbiter', tag:'RECOMMENDED', description:'Map the lunar poles. Search for clues to the Moon’s water story.', detail:'Enter polar lunar orbit and survey the surface with a spectrometer. Balance energy, instruments, and the fuel required to brake into orbit.', budget:84, dv:4650, days:10, minScience:70, eclipse:0.75, capture:1350, landing:0, scienceWeights:{camera:0.7,spectrometer:1.5,radar:1.1}, baseScience:20, difficulty:'Intermediate', objective:'Complete a polar composition survey', required:'spectrometer', accent:'amber' },
  { id:'lander', number:'03', name:'Quiet Frontier', type:'Robotic lunar lander', tag:'STRETCH MISSION', description:'Touch down, power up, and study a new corner of the lunar surface.', detail:'Take a robotic science package to a sunlit landing zone. Your descent stage adds mass and demands more propellant. Surface operations last one lunar daytime campaign.', budget:118, dv:6500, days:8, minScience:90, eclipse:1, capture:1350, landing:1850, scienceWeights:{camera:0.7,spectrometer:1.1,radar:1.5}, baseScience:25, difficulty:'Advanced', objective:'Land and complete a surface survey', required:'radar', accent:'lavender' }
];
export const PARTS = {
  engine:[
    {id:'storable',name:'Kestrel 320',subtitle:'Storable chemical engine',mass:115,cost:5,isp:320,power:25,description:'Simple and compact. Lower efficiency means you will need more propellant.'},
    {id:'cryo',name:'Peregrine 450',subtitle:'Cryogenic chemical engine',mass:240,cost:11,isp:450,power:65,description:'Higher efficiency and greater reach, with extra mass, cost, and cooling power.'}
  ],
  power:[
    {id:'compact',name:'Fold solar array',subtitle:'650 W nominal',mass:90,cost:3,generation:650,description:'Low mass, low cost. Best for a small instrument package.'},
    {id:'extended',name:'Wing solar array',subtitle:'1,200 W nominal',mass:175,cost:6,generation:1200,description:'Room for a larger science payload and operational margin.'},
    {id:'redundant',name:'Twin solar array',subtitle:'1,800 W nominal',mass:280,cost:10,generation:1800,description:'Independent wings retain more output after an array fault.'}
  ],
  comms:[
    {id:'basic',name:'Patch antenna',subtitle:'4 Mbps game capacity',mass:25,cost:2,power:40,rate:4,description:'A light, economical link. May limit science return from larger payloads.'},
    {id:'dish',name:'High-gain dish',subtitle:'12 Mbps game capacity',mass:70,cost:5,power:110,rate:12,description:'A stronger science downlink, requiring more electrical power.'},
    {id:'relay',name:'Relay-ready dish',subtitle:'24 Mbps game capacity',mass:115,cost:8,power:170,rate:24,description:'Best science capacity with a second communication path during the flight scenario.'}
  ],
  battery:[
    {id:'small',name:'Reserve 600',subtitle:'600 Wh storage',mass:50,cost:2,capacity:600,description:'A short eclipse reserve for a light spacecraft.'},
    {id:'medium',name:'Reserve 1400',subtitle:'1,400 Wh storage',mass:110,cost:4,capacity:1400,description:'A balanced reserve for orbital operations.'},
    {id:'large',name:'Reserve 2600',subtitle:'2,600 Wh storage',mass:200,cost:7,capacity:2600,description:'More time in shadow, at the cost of launch mass.'}
  ],
  payload:[
    {id:'camera',name:'Terrain camera',subtitle:'Imaging & navigation',mass:45,cost:4,power:85,science:25,data:3,description:'Map visible surface features and document the journey.'},
    {id:'spectrometer',name:'IR spectrometer',subtitle:'Composition & water clues',mass:80,cost:8,power:160,science:35,data:5,description:'Study reflected infrared light for clues to surface composition.'},
    {id:'radar',name:'Subsurface radar',subtitle:'Structure below the surface',mass:145,cost:12,power:280,science:40,data:8,description:'Probe subsurface structure. A demanding but valuable instrument.'}
  ],
  launcher:[
    {id:'swift',name:'Swift',subtitle:'6,000 kg to Earth orbit',massLimit:6000,cost:12,description:'A lean launch service for compact explorers.'},
    {id:'atlas',name:'Atlas-class',subtitle:'12,000 kg to Earth orbit',massLimit:12000,cost:24,description:'More payload room for fuel-heavy mission designs.'},
    {id:'heavy',name:'Heavy lift',subtitle:'22,000 kg to Earth orbit',massLimit:22000,cost:38,description:'Maximum launch capacity, with a larger share of your budget.'}
  ]
};
export const DEFAULT_DESIGNS = {
  flyby:{engine:'storable',power:'compact',comms:'basic',battery:'small',payload:['camera'],launcher:'swift',fuel:1600},
  orbiter:{engine:'cryo',power:'extended',comms:'dish',battery:'medium',payload:['spectrometer','camera'],launcher:'swift',fuel:2300},
  lander:{engine:'cryo',power:'extended',comms:'dish',battery:'medium',payload:['radar','spectrometer'],launcher:'atlas',fuel:6000}
};
export const SOURCES = [
  {title:'Blue Marble Earth Mosaic',publisher:'NASA / Goddard SVS',url:'https://svs.gsfc.nasa.gov/2915/',use:'Bundled Earth texture for the 3D flight view. Credit: NASA/Goddard Space Flight Center Scientific Visualization Studio; Reto Stockli (NASA/GSFC) and NASA Earth Observatory. Visualization only, not a live Earth feed.'},
  {title:'Moon Fact Sheet',publisher:'NASA / NSSDC',url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',use:'Lunar mean radius 1,737.4 km, surface gravity 1.62 m/s², and mean Earth–Moon distance 384,400 km.'},
  {title:'Ideal Rocket Equation',publisher:'NASA Glenn Research Center',url:'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/',use:'Δv = Isp × g₀ × ln(wet mass / dry mass). The builder and each simulated burn use this equation.'},
  {title:'A Unique Orbit for a Unique Mission',publisher:'NASA',url:'https://www.nasa.gov/wp-content/uploads/2023/10/nrho-artemis-orbit.pdf',use:'Approximate 3,200 m/s translunar injection and 1,350 m/s polar low-lunar-orbit capture. We add a 100 m/s cruise allowance.'},
  {title:'CGI Moon Kit',publisher:'NASA Scientific Visualization Studio',url:'https://svs.gsfc.nasa.gov/4720/',use:'LRO-derived lunar color texture. Used for the illustrated globe; it is not a navigable terrain model.'},
  {title:'Moon: Facts',publisher:'NASA Science',url:'https://science.nasa.gov/moon/facts/',use:'Background for lunar exploration, surface conditions, and the mission briefings.'}
];
export const CATEGORIES = [
  {id:'engine',name:'Propulsion',icon:'flame'}, {id:'power',name:'Power',icon:'sun'},
  {id:'comms',name:'Communications',icon:'radio'}, {id:'battery',name:'Battery',icon:'battery'},
  {id:'payload',name:'Science payload',icon:'scan'}, {id:'launcher',name:'Launch vehicle',icon:'rocket'}
];
