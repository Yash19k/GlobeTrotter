"""
GlobeTrotter — Seed Data Management Command

Populates the database with realistic destination cities and activities.
Usage: python manage.py seed_data
"""

from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.destinations.models import City
from apps.activities.models import Activity


CITIES_DATA = [
    {
        "name": "Paris",
        "country": "France",
        "region": "Europe",
        "description": "The City of Light, famous for its romantic atmosphere, iconic art museums, high fashion, and culinary excellence.",
        "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 4,
        "popularity_score": Decimal("9.6"),
        "activities": [
            {
                "name": "Eiffel Tower Summit Tour",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Ascend to the top of Paris's iconic landmark for panoramic views of the entire city.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("35.00"),
                "image": "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Louvre Museum Highlights",
                "category": Activity.Category.CULTURE,
                "description": "Explore the world's largest art museum, home to the Mona Lisa and Venus de Milo.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("22.00"),
                "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Seine River Dinner Cruise",
                "category": Activity.Category.FOOD,
                "description": "Glide past illuminated monuments while enjoying a 3-course gourmet French meal.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("95.00"),
                "image": "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Montmartre & Sacré-Cœur Walking Tour",
                "category": Activity.Category.CULTURE,
                "description": "Discover the bohemian artists' quarter, historic cobblestone streets, and the hilltop basilica.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("15.00"),
                "image": "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Le Marais Food & Wine Tasting",
                "category": Activity.Category.FOOD,
                "description": "Sample artisanal cheeses, fresh croissants, macarons, and fine French wines with a local expert.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("75.00"),
                "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Rome",
        "country": "Italy",
        "region": "Europe",
        "description": "An open-air museum filled with nearly 3,000 years of globally influential art, architecture, and ancient history.",
        "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 3,
        "popularity_score": Decimal("9.4"),
        "activities": [
            {
                "name": "Colosseum & Roman Forum Underground Tour",
                "category": Activity.Category.CULTURE,
                "description": "Step into the arena floor where gladiators fought and explore the ruins of the Roman Republic.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("48.00"),
                "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Vatican Museums & Sistine Chapel",
                "category": Activity.Category.CULTURE,
                "description": "Marvel at Michelangelo's ceiling frescoes and the vast papal art collections.",
                "duration_minutes": 210,
                "estimated_cost": Decimal("40.00"),
                "image": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Trastevere Evening Food & Gelato Walk",
                "category": Activity.Category.FOOD,
                "description": "Walk through charming medieval alleys to taste authentic Roman pasta, street food, and gelato.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("60.00"),
                "image": "https://images.unsplash.com/photo-1533777857889-4be7c70b3185?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Trevi Fountain & Spanish Steps Sunset Stroll",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Toss a coin into the Trevi Fountain and soak in the vibrant atmosphere of Rome's plazas.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("0.00"),
                "image": "https://images.unsplash.com/photo-1525874684015-5837e7168b0b?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Handmade Pasta & Tiramisu Cooking Masterclass",
                "category": Activity.Category.FOOD,
                "description": "Learn the secret techniques to craft traditional Italian pasta and dessert from scratch.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("70.00"),
                "image": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Tokyo",
        "country": "Japan",
        "region": "Asia",
        "description": "A dazzling metropolis blending futuristic skyscrapers, neon lights, ancient historic temples, and pop culture.",
        "image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 4,
        "popularity_score": Decimal("9.7"),
        "activities": [
            {
                "name": "Shinjuku Neon & Golden Gai Izakaya Tour",
                "category": Activity.Category.NIGHTLIFE,
                "description": "Navigate the narrow alleys of Golden Gai and sample yakitori and Japanese craft beers.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("65.00"),
                "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Senso-ji Temple & Asakusa Traditional Walk",
                "category": Activity.Category.CULTURE,
                "description": "Visit Tokyo's oldest Buddhist temple and shop along the historic Nakamise market street.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("10.00"),
                "image": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "TeamLab Planets Immersive Digital Art",
                "category": Activity.Category.CULTURE,
                "description": "Wade through water and enter mind-bending full-body interactive digital installations.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("32.00"),
                "image": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Tsukiji Outer Market Food Exploration",
                "category": Activity.Category.FOOD,
                "description": "Taste fresh sashimi, tamagoyaki, oysters, and Wagyu beef skewers at Tokyo's food haven.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("45.00"),
                "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Shibuya Crossing & Harajuku Shopping Stroll",
                "category": Activity.Category.SHOPPING,
                "description": "Cross the world's busiest intersection and explore fashion boutiques along Takeshita Street.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("20.00"),
                "image": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "London",
        "country": "United Kingdom",
        "region": "Europe",
        "description": "A global capital of culture, history, world-class theatre, royal parks, and iconic architecture.",
        "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 4,
        "popularity_score": Decimal("9.5"),
        "activities": [
            {
                "name": "Tower of London & Crown Jewels",
                "category": Activity.Category.CULTURE,
                "description": "Explore nearly 1,000 years of royal history, meet the Yeoman Warders, and view royal gems.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("38.00"),
                "image": "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "West End Musical Performance",
                "category": Activity.Category.CULTURE,
                "description": "Enjoy a world-class theatrical production in London's famous theatre district.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("85.00"),
                "image": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "British Museum Guided Tour",
                "category": Activity.Category.CULTURE,
                "description": "See the Rosetta Stone, Egyptian mummies, and Parthenon Sculptures with an expert guide.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("25.00"),
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Borough Market Culinary Stroll",
                "category": Activity.Category.FOOD,
                "description": "Indulge in artisanal cheeses, hot salt beef bagels, fresh pastries, and craft ciders.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("30.00"),
                "image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Thames Speedboat Adventure",
                "category": Activity.Category.ADVENTURE,
                "description": "Blast down the River Thames past the Houses of Parliament and Tower Bridge.",
                "duration_minutes": 50,
                "estimated_cost": Decimal("55.00"),
                "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Dubai",
        "country": "United Arab Emirates",
        "region": "Middle East",
        "description": "A luxury oasis known for ultra-modern architecture, desert safaris, glamorous shopping, and nightlife.",
        "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 5,
        "popularity_score": Decimal("9.3"),
        "activities": [
            {
                "name": "Burj Khalifa At the Top Observation Deck",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Look down at the desert and city skyline from the 124th and 125th floors of the world's tallest building.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("50.00"),
                "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Desert Safari with BBQ & Camel Ride",
                "category": Activity.Category.ADVENTURE,
                "description": "Dune bashing in a 4x4, sandboarding, camel rides, and a traditional Bedouin dinner show.",
                "duration_minutes": 360,
                "estimated_cost": Decimal("75.00"),
                "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Dubai Marina Yacht Cruise",
                "category": Activity.Category.RELAXATION if hasattr(Activity.Category, 'RELAXATION') else Activity.Category.SIGHTSEEING,
                "description": "Relax on board a luxury yacht taking in views of Ain Dubai, JBR, and Atlantis The Palm.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("85.00"),
                "image": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Old Dubai Souk & Abra Boat Tour",
                "category": Activity.Category.SHOPPING,
                "description": "Cross Dubai Creek on a wooden abra boat to wander through the Gold & Spice Souks.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("15.00"),
                "image": "https://images.unsplash.com/photo-1578895210405-907db48a7812?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Museum of the Future Interactive Experience",
                "category": Activity.Category.CULTURE,
                "description": "Step into the year 2071 inside an architectural marvel exploring futuristic space and climate tech.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("40.00"),
                "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Barcelona",
        "country": "Spain",
        "region": "Europe",
        "description": "Famed for Antoni Gaudí's whimsical architecture, Mediterranean beaches, lively tapas culture, and football.",
        "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 3,
        "popularity_score": Decimal("9.2"),
        "activities": [
            {
                "name": "Sagrada Família Fast-Track Guided Tour",
                "category": Activity.Category.CULTURE,
                "description": "Marvel at Gaudí's unfinished masterpiece and its forest of stone columns illuminated by stained glass.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("34.00"),
                "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Park Güell Architectural Walk",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Wander through Gaudí's vibrant mosaic dragon, serpentine bench, and hilltop gardens.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("14.00"),
                "image": "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Gothic Quarter & Tapas Crawl",
                "category": Activity.Category.FOOD,
                "description": "Savor authentic Iberian ham, patatas bravas, croquetas, and sangria in historic taverns.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("50.00"),
                "image": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Barceloneta Beach Paddleboarding",
                "category": Activity.Category.ADVENTURE,
                "description": "Rent a stand-up paddleboard and glide over the calm Mediterranean waters at sunrise.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("25.00"),
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Flamenco Show at Tablao Cordobes",
                "category": Activity.Category.CULTURE,
                "description": "Experience passionate live Andalusian music and traditional dance on La Rambla.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("45.00"),
                "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "New York",
        "country": "United States",
        "region": "North America",
        "description": "The Empire City — home to Broadway, Wall Street, Central Park, iconic museums, and endless energy.",
        "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 5,
        "popularity_score": Decimal("9.6"),
        "activities": [
            {
                "name": "Statue of Liberty & Ellis Island Ferry",
                "category": Activity.Category.CULTURE,
                "description": "Visit America's symbol of freedom and explore the historic immigration station museum.",
                "duration_minutes": 240,
                "estimated_cost": Decimal("30.00"),
                "image": "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Summit One Vanderbilt Observation Deck",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Experience multi-sensory glass rooms and mirrors looking down over midtown Manhattan.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("42.00"),
                "image": "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Central Park Bike Rental & Tour",
                "category": Activity.Category.NATURE,
                "description": "Cycle past Bethesda Fountain, Strawberry Fields, the Reservoir, and Bow Bridge.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("25.00"),
                "image": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "High Line & Chelsea Market Food Tour",
                "category": Activity.Category.FOOD,
                "description": "Walk the elevated linear park built on a historic rail line and taste artisanal foods.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("55.00"),
                "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Metropolitan Museum of Art (The Met)",
                "category": Activity.Category.CULTURE,
                "description": "Explore over 5,000 years of global art, from Temple of Dendur to Impressionist masterworks.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("30.00"),
                "image": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Kyoto",
        "country": "Japan",
        "region": "Asia",
        "description": "Japan's cultural heart, adorned with thousands of classical Buddhist temples, gardens, shrines, and traditional geisha culture.",
        "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 3,
        "popularity_score": Decimal("9.5"),
        "activities": [
            {
                "name": "Fushimi Inari Shrine Torii Gate Hike",
                "category": Activity.Category.CULTURE,
                "description": "Walk beneath thousands of vermilion torii gates stretching up Mount Inari.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("0.00"),
                "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Arashiyama Bamboo Grove & Monkey Park",
                "category": Activity.Category.NATURE,
                "description": "Stroll through towering green bamboo stalks and visit wild macaques at the hilltop park.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("10.00"),
                "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Traditional Matcha Tea Ceremony",
                "category": Activity.Category.CULTURE,
                "description": "Participate in a serene tea master ritual wearing a traditional Japanese kimono.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("40.00"),
                "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Kinkaku-ji (Golden Pavilion) Visit",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Admire the top two floors covered in pure gold leaf reflecting over the tranquil mirror pond.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("5.00"),
                "image": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Gion Geisha District Evening Walk",
                "category": Activity.Category.CULTURE,
                "description": "Wander through lantern-lit wooden machiya townhouses in search of geiko and maiko.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("20.00"),
                "image": "https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Singapore",
        "country": "Singapore",
        "region": "Asia",
        "description": "A garden city state celebrated for futuristic greenery, diverse street hawker food, and tropical luxury.",
        "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 4,
        "popularity_score": Decimal("9.1"),
        "activities": [
            {
                "name": "Gardens by the Bay & Supertree Grove",
                "category": Activity.Category.NATURE,
                "description": "Explore the Flower Dome, Cloud Forest waterfall, and light show at the 50-meter Supertrees.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("28.00"),
                "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Marina Bay Sands SkyPark Observation Deck",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Enjoy unmatched 360-degree views of Singapore's harbour and skyline from 57 stories high.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("22.00"),
                "image": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Maxwell Hawker Center Food Adventure",
                "category": Activity.Category.FOOD,
                "description": "Taste Michelin-recommended Tian Tian Hainanese Chicken Rice, laksa, and satay.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("12.00"),
                "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Night Safari Tram Experience",
                "category": Activity.Category.ADVENTURE,
                "description": "Observe over 900 nocturnal animals roaming in naturalistic habitats after dark.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("42.00"),
                "image": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Chinatown & Little India Heritage Trail",
                "category": Activity.Category.CULTURE,
                "description": "Visit Sri Mariamman Temple, Buddha Tooth Relic Temple, and shop colorful spice markets.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("0.00"),
                "image": "https://images.unsplash.com/photo-1565967511849-76a459823771?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Amsterdam",
        "country": "Netherlands",
        "region": "Europe",
        "description": "Famed for its canal network, gabled houses, rich artistic heritage, and bike-friendly culture.",
        "image": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 4,
        "popularity_score": Decimal("9.0"),
        "activities": [
            {
                "name": "Canal Cruise with Cheese & Wine",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Cruise past UNESCO heritage canals while nibbling Dutch Gouda cheese and drinking wine.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("30.00"),
                "image": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Rijksmuseum Dutch Masters Tour",
                "category": Activity.Category.CULTURE,
                "description": "See Rembrandt's The Night Watch and Vermeer's Milkmaid up close.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("24.00"),
                "image": "https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Van Gogh Museum Guided Visit",
                "category": Activity.Category.CULTURE,
                "description": "Explore the largest collection of Vincent van Gogh's paintings, drawings, and letters.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("22.00"),
                "image": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Jordaan District Bike & Stroopwafel Stroll",
                "category": Activity.Category.FOOD,
                "description": "Cycle past art galleries and courtyard gardens, stopping for fresh warm stroopwafels.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("18.00"),
                "image": "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Zaanse Schans Windmills Day Trip",
                "category": Activity.Category.CULTURE,
                "description": "Visit historic working wooden windmills, wooden shoe clog workshops, and cheese farms.",
                "duration_minutes": 240,
                "estimated_cost": Decimal("35.00"),
                "image": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Bali",
        "country": "Indonesia",
        "region": "Asia",
        "description": "The Island of the Gods, renowned for volcanic mountains, iconic rice terraces, beaches, and spiritual coral reefs.",
        "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 2,
        "popularity_score": Decimal("9.4"),
        "activities": [
            {
                "name": "Tegallalang Rice Terrace & Jungle Swing",
                "category": Activity.Category.NATURE,
                "description": "Soar over lush green valley terraces on a giant swing and snap photos.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("15.00"),
                "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Uluwatu Temple Sunset & Kecak Fire Dance",
                "category": Activity.Category.CULTURE,
                "description": "Watch a hypnotic traditional fire dance on a cliff edge high above the crashing waves.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("20.00"),
                "image": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Mount Batur Sunrise Volcano Trek",
                "category": Activity.Category.ADVENTURE,
                "description": "Hike an active volcano in the dark to eat breakfast prepared by volcanic steam at sunrise.",
                "duration_minutes": 360,
                "estimated_cost": Decimal("45.00"),
                "image": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Nusa Penida Island Snorkeling Tour",
                "category": Activity.Category.ADVENTURE,
                "description": "Swim alongside giant manta rays and visit the dramatic T-Rex shaped Kelingking Beach.",
                "duration_minutes": 480,
                "estimated_cost": Decimal("65.00"),
                "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Ubud Sacred Monkey Forest Sanctuary",
                "category": Activity.Category.NATURE,
                "description": "Walk among ancient mossy temples guarded by hundreds of Balinese long-tailed macaques.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("6.00"),
                "image": "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
    {
        "name": "Istanbul",
        "country": "Turkey",
        "region": "Europe / Asia",
        "description": "A transcontinental metropolis where East meets West across the Bosphorus strait, steeped in Byzantine and Ottoman history.",
        "image": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
        "cost_index": 2,
        "popularity_score": Decimal("9.3"),
        "activities": [
            {
                "name": "Hagia Sophia & Blue Mosque Architecture Walk",
                "category": Activity.Category.CULTURE,
                "description": "Marvel at 1,500-year-old domes, gold mosaics, and hand-painted Iznik tiles.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("25.00"),
                "image": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Grand Bazaar & Spice Market Exploration",
                "category": Activity.Category.SHOPPING,
                "description": "Bargain for Turkish carpets, ceramics, lamps, spices, and Turkish delight in 4,000 shops.",
                "duration_minutes": 180,
                "estimated_cost": Decimal("10.00"),
                "image": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Sunset Bosphorus Cruise between Two Continents",
                "category": Activity.Category.SIGHTSEEING,
                "description": "Sail past Ottoman palaces, wooden mansions, and fortress ruins linking Europe and Asia.",
                "duration_minutes": 120,
                "estimated_cost": Decimal("20.00"),
                "image": "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Authentic Turkish Bath (Hammam) Spa",
                "category": Activity.Category.CULTURE,
                "description": "Relax on a heated marble stone with a traditional scrub and bubble massage.",
                "duration_minutes": 90,
                "estimated_cost": Decimal("50.00"),
                "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Karaköy Street Food & Turkish Coffee Tasting",
                "category": Activity.Category.FOOD,
                "description": "Sample grilled fish sandwiches (balık ekmek), baklava, döner kebab, and sand-brewed coffee.",
                "duration_minutes": 150,
                "estimated_cost": Decimal("25.00"),
                "image": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed database with 12 realistic cities and 60+ activities"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting database seed..."))

        city_count = 0
        activity_count = 0

        for city_info in CITIES_DATA:
            activities_info = city_info.pop("activities", [])

            city, created = City.objects.get_or_create(
                name=city_info["name"],
                country=city_info["country"],
                defaults=city_info,
            )

            if not created:
                for key, val in city_info.items():
                    setattr(city, key, val)
                city.save()
                self.stdout.write(f"Updated city: {city.name}, {city.country}")
            else:
                city_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created city: {city.name}, {city.country}"))

            for act_info in activities_info:
                activity, act_created = Activity.objects.get_or_create(
                    city=city,
                    name=act_info["name"],
                    defaults=act_info,
                )
                if not act_created:
                    for key, val in act_info.items():
                        setattr(activity, key, val)
                    activity.save()
                else:
                    activity_count += 1

        total_cities = City.objects.count()
        total_activities = Activity.objects.count()

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully seeded database!\n"
                f"Cities in DB: {total_cities} (added {city_count} new)\n"
                f"Activities in DB: {total_activities} (added {activity_count} new)\n"
            )
        )
