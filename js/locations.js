// Romanian cities and counties mapping
const romaniaLocations = {
    counties: [
        "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
        "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
        "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
        "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
        "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
        "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui",
        "Vrancea"
    ],
    cities: [
        "București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova",
        "Brașov", "Galați", "Ploiești", "Oradea", "Brăila", "Arad", "Pitești",
        "Sibiu", "Bacău", "Târgu Mureș", "Baia Mare", "Buzău", "Satu Mare",
        "Botoșani", "Râmnicu Vâlcea", "Suceava", "Piatra Neamț", "Drobeta-Turnu Severin",
        "Târgu Jiu", "Focșani", "Tulcea", "Târgoviște", "Reșița", "Bistrița",
        "Slatina", "Călărași", "Alba Iulia", "Giurgiu", "Deva", "Hunedoara",
        "Zalău", "Sfântu Gheorghe", "Turda", "Mediaș", "Slobozia", "Alexandria",
        "Târnăveni", "Miercurea Ciuc", "Sighetu Marmației", "Mangalia", "Bârlad",
        "Câmpulung", "Făgăraș", "Câmpina", "Rădăuți", "Sighișoara", "Băilești",
        "Pașcani", "Caracal", "Onești", "Vaslui", "Petroșani", "Lugoj", "Borcea",
        "Odorheiu Secuiesc", "Râmnicu Sărat", "Cernavodă", "Curtea de Argeș"
    ]
};

// Get all Romanian locations (cities + counties)
function getRomaniaLocations() {
    return [...romaniaLocations.cities, ...romaniaLocations.counties].sort();
}

// Check if a location is in Romania
function isRomaniaLocation(location) {
    const allLocations = getRomaniaLocations();
    return allLocations.some(loc => 
        location.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(location.toLowerCase())
    );
}

