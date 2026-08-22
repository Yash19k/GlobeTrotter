"""
GlobeTrotter — Demo Seed Data Management Command

Populates realistic demo users, trips, multi-city itineraries, activities,
expenses, saved cities, and public sharing data for hackathon demonstrations.

Usage: python manage.py seed_demo
Idempotent & Safe to run multiple times.
"""

from datetime import date, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from apps.destinations.models import City, SavedCity
from apps.activities.models import Activity
from apps.trips.models import Trip, SharedTrip
from apps.itinerary.models import TripStop, TripActivity
from apps.budget.models import Expense
from services.sharing_service import copy_public_trip

User = get_user_model()


class Command(BaseCommand):
    help = "Seed realistic demo users, trips, itineraries, and expenses for hackathon presentation"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting GlobeTrotter demo data seeding..."))

        with transaction.atomic():
            # 1. Create Demo Users
            alice, created_a = User.objects.get_or_create(
                email="alice.demo@globetrotter.local",
                defaults={
                    "first_name": "Alice",
                    "last_name": "Traveler",
                    "city": "Ahmedabad",
                    "country": "India",
                },
            )
            alice.set_password("Demo@12345!")
            alice.first_name = "Alice"
            alice.last_name = "Traveler"
            alice.city = "Ahmedabad"
            alice.country = "India"
            alice.save()

            bob, created_b = User.objects.get_or_create(
                email="bob.demo@globetrotter.local",
                defaults={
                    "first_name": "Bob",
                    "last_name": "Explorer",
                    "city": "Ahmedabad",
                    "country": "India",
                },
            )
            bob.set_password("Demo@12345!")
            bob.first_name = "Bob"
            bob.last_name = "Explorer"
            bob.city = "Ahmedabad"
            bob.country = "India"
            bob.save()

            self.stdout.write(self.style.SUCCESS(f"Demo Users: Alice ({alice.email}) & Bob ({bob.email}) configured."))

            # 2. Ensure Required Master Cities (Florence & Osaka if missing)
            florence, _ = City.objects.get_or_create(
                name="Florence",
                country="Italy",
                defaults={
                    "region": "Europe",
                    "description": "The birthplace of the Renaissance, renowned for its historic center, iconic Duomo, world-class art galleries, and Tuscan gastronomy.",
                    "image": "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 3,
                    "popularity_score": Decimal("9.3"),
                },
            )

            florence_activities = [
                {
                    "name": "Uffizi Gallery Renaissance Masterpieces",
                    "category": Activity.Category.CULTURE,
                    "description": "See Botticelli's Birth of Venus, Da Vinci masterworks, and Michelangelo paintings.",
                    "duration_minutes": 150,
                    "estimated_cost": Decimal("24.00"),
                    "image": "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Florence Duomo & Cathedral Dome Climb",
                    "category": Activity.Category.SIGHTSEEING,
                    "description": "Climb Brunelleschi's famous dome for breathtaking 360-degree views of Florence.",
                    "duration_minutes": 120,
                    "estimated_cost": Decimal("30.00"),
                    "image": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Tuscan Food & Chianti Wine Tasting",
                    "category": Activity.Category.FOOD,
                    "description": "Sample Florentine steak, truffle crostini, pecorino cheese, and vintage Chianti wine.",
                    "duration_minutes": 180,
                    "estimated_cost": Decimal("65.00"),
                    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Ponte Vecchio & Oltrarno Artisans Stroll",
                    "category": Activity.Category.CULTURE,
                    "description": "Cross the medieval stone bridge and discover goldsmith workshops in Oltrarno.",
                    "duration_minutes": 90,
                    "estimated_cost": Decimal("15.00"),
                    "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Piazzale Michelangelo Panoramic Sunset",
                    "category": Activity.Category.SIGHTSEEING,
                    "description": "Watch the sunset illuminate the terra-cotta roofs and Arno river from the hilltop plaza.",
                    "duration_minutes": 90,
                    "estimated_cost": Decimal("0.00"),
                    "image": "https://images.unsplash.com/photo-1528114039593-4366cc08227d?auto=format&fit=crop&w=800&q=80",
                },
            ]
            for act_info in florence_activities:
                Activity.objects.get_or_create(
                    city=florence,
                    name=act_info["name"],
                    defaults=act_info,
                )

            osaka, _ = City.objects.get_or_create(
                name="Osaka",
                country="Japan",
                defaults={
                    "region": "Asia",
                    "description": "Japan's culinary capital, celebrated for neon streetscapes, Dotonbori food culture, and Osaka Castle.",
                    "image": "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 3,
                    "popularity_score": Decimal("9.2"),
                },
            )
            osaka_activities = [
                {
                    "name": "Dotonbori Street Food Crawl",
                    "category": Activity.Category.FOOD,
                    "description": "Sample fresh takoyaki octopus balls, okonomiyaki savory pancakes, and kushikatsu.",
                    "duration_minutes": 150,
                    "estimated_cost": Decimal("35.00"),
                    "image": "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Osaka Castle & Park Exploration",
                    "category": Activity.Category.CULTURE,
                    "description": "Tour the 16th-century samurai fortress, citadel moats, and stone garden walls.",
                    "duration_minutes": 120,
                    "estimated_cost": Decimal("10.00"),
                    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
                },
            ]
            for act_info in osaka_activities:
                Activity.objects.get_or_create(
                    city=osaka,
                    name=act_info["name"],
                    defaults=act_info,
                )

            paris = City.objects.get(name="Paris", country="France")
            rome = City.objects.get(name="Rome", country="Italy")
            tokyo = City.objects.get(name="Tokyo", country="Japan")
            kyoto = City.objects.get(name="Kyoto", country="Japan")
            barcelona = City.objects.get(name="Barcelona", country="Spain")
            istanbul = City.objects.get(name="Istanbul", country="Turkey")

            # 3. Trip 1 — Primary Demo Trip ("European Summer Escape")
            trip_1, _ = Trip.objects.get_or_create(
                user=alice,
                name="European Summer Escape",
                defaults={
                    "description": "A 10-day journey through Paris, Rome and Florence combining iconic landmarks, local food and cultural experiences.",
                    "start_date": date(2026, 9, 10),
                    "end_date": date(2026, 9, 19),
                    "total_budget": Decimal("3000.00"),
                    "is_public": True,
                    "cover_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                    "share_slug": "european-summer-escape",
                },
            )
            trip_1.description = "A 10-day journey through Paris, Rome and Florence combining iconic landmarks, local food and cultural experiences."
            trip_1.start_date = date(2026, 9, 10)
            trip_1.end_date = date(2026, 9, 19)
            trip_1.total_budget = Decimal("3000.00")
            trip_1.is_public = True
            trip_1.cover_image = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
            if not trip_1.share_slug:
                trip_1.share_slug = "european-summer-escape"
            trip_1.save()

            SharedTrip.objects.update_or_create(
                trip=trip_1,
                defaults={"slug": trip_1.share_slug},
            )

            # Stop 1: Paris
            stop_p, _ = TripStop.objects.update_or_create(
                trip=trip_1,
                stop_order=1,
                defaults={
                    "city": paris,
                    "start_date": date(2026, 9, 10),
                    "end_date": date(2026, 9, 13),
                    "transport_cost": Decimal("250.00"),
                    "accommodation_cost": Decimal("450.00"),
                    "notes": "Arrival in Paris and exploration of the city center.",
                },
            )

            # Paris Activities
            act_eiffel = Activity.objects.get(city=paris, name="Eiffel Tower Summit Tour")
            act_marais = Activity.objects.get(city=paris, name="Le Marais Food & Wine Tasting")
            act_louvre = Activity.objects.get(city=paris, name="Louvre Museum Highlights")
            act_seine = Activity.objects.get(city=paris, name="Seine River Dinner Cruise")
            act_mont = Activity.objects.get(city=paris, name="Montmartre & Sacré-Cœur Walking Tour")

            TripActivity.objects.update_or_create(
                trip_stop=stop_p, activity=act_eiffel, activity_date=date(2026, 9, 10),
                defaults={"start_time": time(9, 0), "estimated_cost": Decimal("35.00"), "activity_order": 1, "notes": "Morning views from Eiffel summit"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_p, activity=act_marais, activity_date=date(2026, 9, 10),
                defaults={"start_time": time(13, 0), "estimated_cost": Decimal("75.00"), "activity_order": 2, "notes": "Artisanal cheeses & wine tasting in Le Marais"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_p, activity=act_louvre, activity_date=date(2026, 9, 11),
                defaults={"start_time": time(9, 30), "estimated_cost": Decimal("22.00"), "activity_order": 1, "notes": "Guided Mona Lisa & Greek masterworks tour"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_p, activity=act_seine, activity_date=date(2026, 9, 11),
                defaults={"start_time": time(16, 0), "estimated_cost": Decimal("95.00"), "activity_order": 2, "notes": "Sunset dinner cruise along the Seine river"}
            )
            # Unscheduled / Flexible activity (No start_time)
            TripActivity.objects.update_or_create(
                trip_stop=stop_p, activity=act_mont, activity_date=date(2026, 9, 12),
                defaults={"start_time": None, "estimated_cost": Decimal("15.00"), "activity_order": 1, "notes": "Flexible afternoon stroll through Montmartre artists' quarter"}
            )

            # Stop 2: Rome
            stop_r, _ = TripStop.objects.update_or_create(
                trip=trip_1,
                stop_order=2,
                defaults={
                    "city": rome,
                    "start_date": date(2026, 9, 13),
                    "end_date": date(2026, 9, 16),
                    "transport_cost": Decimal("180.00"),
                    "accommodation_cost": Decimal("420.00"),
                    "notes": "Travel from Paris to Rome and explore ancient landmarks.",
                },
            )

            # Rome Activities
            act_col = Activity.objects.get(city=rome, name="Colosseum & Roman Forum Underground Tour")
            act_vat = Activity.objects.get(city=rome, name="Vatican Museums & Sistine Chapel")
            act_tras = Activity.objects.get(city=rome, name="Trastevere Evening Food & Gelato Walk")
            act_trevi = Activity.objects.get(city=rome, name="Trevi Fountain & Spanish Steps Sunset Stroll")
            act_pasta = Activity.objects.get(city=rome, name="Handmade Pasta & Tiramisu Cooking Masterclass")

            TripActivity.objects.update_or_create(
                trip_stop=stop_r, activity=act_col, activity_date=date(2026, 9, 13),
                defaults={"start_time": time(15, 0), "estimated_cost": Decimal("48.00"), "activity_order": 1, "notes": "Gladiator arena & underground dungeon access"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_r, activity=act_vat, activity_date=date(2026, 9, 14),
                defaults={"start_time": time(9, 0), "estimated_cost": Decimal("40.00"), "activity_order": 1, "notes": "Sistine Chapel ceiling frescoes tour"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_r, activity=act_tras, activity_date=date(2026, 9, 14),
                defaults={"start_time": time(18, 0), "estimated_cost": Decimal("60.00"), "activity_order": 2, "notes": "Trastevere pasta & gelato crawl"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_r, activity=act_trevi, activity_date=date(2026, 9, 15),
                defaults={"start_time": time(10, 0), "estimated_cost": Decimal("0.00"), "activity_order": 1, "notes": "Coin toss at Trevi Fountain & Spanish Steps walk"}
            )
            # Unscheduled / Flexible activity (No start_time)
            TripActivity.objects.update_or_create(
                trip_stop=stop_r, activity=act_pasta, activity_date=date(2026, 9, 15),
                defaults={"start_time": None, "estimated_cost": Decimal("70.00"), "activity_order": 2, "notes": "Flexible evening pasta masterclass in Roman trattoria"}
            )

            # Stop 3: Florence
            stop_f, _ = TripStop.objects.update_or_create(
                trip=trip_1,
                stop_order=3,
                defaults={
                    "city": florence,
                    "start_date": date(2026, 9, 16),
                    "end_date": date(2026, 9, 19),
                    "transport_cost": Decimal("120.00"),
                    "accommodation_cost": Decimal("350.00"),
                    "notes": "Final destination focused on Renaissance art, architecture and local food.",
                },
            )

            act_uffizi = Activity.objects.get(city=florence, name="Uffizi Gallery Renaissance Masterpieces")
            act_duomo = Activity.objects.get(city=florence, name="Florence Duomo & Cathedral Dome Climb")
            act_tuscan = Activity.objects.get(city=florence, name="Tuscan Food & Chianti Wine Tasting")
            act_ponte = Activity.objects.get(city=florence, name="Ponte Vecchio & Oltrarno Artisans Stroll")
            act_michel = Activity.objects.get(city=florence, name="Piazzale Michelangelo Panoramic Sunset")

            TripActivity.objects.update_or_create(
                trip_stop=stop_f, activity=act_uffizi, activity_date=date(2026, 9, 16),
                defaults={"start_time": time(14, 0), "estimated_cost": Decimal("24.00"), "activity_order": 1, "notes": "Botticelli Birth of Venus gallery tour"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_f, activity=act_duomo, activity_date=date(2026, 9, 17),
                defaults={"start_time": time(10, 0), "estimated_cost": Decimal("30.00"), "activity_order": 1, "notes": "Climb Brunelleschi dome for city view"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_f, activity=act_tuscan, activity_date=date(2026, 9, 17),
                defaults={"start_time": time(18, 30), "estimated_cost": Decimal("65.00"), "activity_order": 2, "notes": "Florentine steak & Chianti wine pairing"}
            )
            TripActivity.objects.update_or_create(
                trip_stop=stop_f, activity=act_ponte, activity_date=date(2026, 9, 18),
                defaults={"start_time": time(11, 0), "estimated_cost": Decimal("15.00"), "activity_order": 1, "notes": "Goldsmith workshops on Ponte Vecchio"}
            )
            # Unscheduled / Flexible activity (No start_time)
            TripActivity.objects.update_or_create(
                trip_stop=stop_f, activity=act_michel, activity_date=date(2026, 9, 18),
                defaults={"start_time": None, "estimated_cost": Decimal("0.00"), "activity_order": 2, "notes": "Flexible sunset view over Florence red roofs"}
            )

            # Expenses for Alice's Trip 1
            Expense.objects.update_or_create(
                trip=trip_1, description="Welcome bistro dinner in Paris",
                defaults={"category": Expense.Category.MEAL, "amount": Decimal("45.00"), "expense_date": date(2026, 9, 10)}
            )
            Expense.objects.update_or_create(
                trip=trip_1, description="Lunch near Louvre museum",
                defaults={"category": Expense.Category.MEAL, "amount": Decimal("60.00"), "expense_date": date(2026, 9, 11)}
            )
            Expense.objects.update_or_create(
                trip=trip_1, description="Trastevere pizzeria dinner",
                defaults={"category": Expense.Category.MEAL, "amount": Decimal("55.00"), "expense_date": date(2026, 9, 14)}
            )
            Expense.objects.update_or_create(
                trip=trip_1, description="Tuscan trattoria lunch",
                defaults={"category": Expense.Category.MEAL, "amount": Decimal("50.00"), "expense_date": date(2026, 9, 17)}
            )
            Expense.objects.update_or_create(
                trip=trip_1, description="Paris metro pass & souvenirs",
                defaults={"category": Expense.Category.OTHER, "amount": Decimal("25.00"), "expense_date": date(2026, 9, 12)}
            )

            # 4. Trip 2: "Japan Discovery" (Owner: Alice, Public)
            trip_2, _ = Trip.objects.get_or_create(
                user=alice,
                name="Japan Discovery",
                defaults={
                    "description": "An unforgettable 10-day journey through Tokyo, Kyoto, and Osaka exploring ancient temples, neon streetscapes, and world-class cuisine.",
                    "start_date": date(2026, 10, 1),
                    "end_date": date(2026, 10, 10),
                    "total_budget": Decimal("3500.00"),
                    "is_public": True,
                    "cover_image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
                    "share_slug": "japan-discovery",
                },
            )
            SharedTrip.objects.update_or_create(trip=trip_2, defaults={"slug": trip_2.share_slug})

            stop_t, _ = TripStop.objects.update_or_create(
                trip=trip_2, stop_order=1,
                defaults={"city": tokyo, "start_date": date(2026, 10, 1), "end_date": date(2026, 10, 4), "transport_cost": Decimal("300.00"), "accommodation_cost": Decimal("600.00"), "notes": "Arrival in Tokyo & Shinjuku neon tour"}
            )
            act_t1 = Activity.objects.get(city=tokyo, name="TeamLab Planets Immersive Digital Art")
            act_t2 = Activity.objects.get(city=tokyo, name="Senso-ji Temple & Asakusa Traditional Walk")
            TripActivity.objects.update_or_create(trip_stop=stop_t, activity=act_t1, activity_date=date(2026, 10, 2), defaults={"start_time": time(10, 0), "estimated_cost": Decimal("32.00"), "activity_order": 1})
            TripActivity.objects.update_or_create(trip_stop=stop_t, activity=act_t2, activity_date=date(2026, 10, 3), defaults={"start_time": time(14, 0), "estimated_cost": Decimal("10.00"), "activity_order": 1})

            stop_k, _ = TripStop.objects.update_or_create(
                trip=trip_2, stop_order=2,
                defaults={"city": kyoto, "start_date": date(2026, 10, 4), "end_date": date(2026, 10, 7), "transport_cost": Decimal("140.00"), "accommodation_cost": Decimal("480.00"), "notes": "Bullet train to Kyoto & temple visits"}
            )
            act_k1 = Activity.objects.get(city=kyoto, name="Fushimi Inari Shrine Torii Gate Hike")
            act_k2 = Activity.objects.get(city=kyoto, name="Traditional Matcha Tea Ceremony")
            TripActivity.objects.update_or_create(trip_stop=stop_k, activity=act_k1, activity_date=date(2026, 10, 5), defaults={"start_time": time(8, 30), "estimated_cost": Decimal("0.00"), "activity_order": 1})
            TripActivity.objects.update_or_create(trip_stop=stop_k, activity=act_k2, activity_date=date(2026, 10, 6), defaults={"start_time": time(15, 0), "estimated_cost": Decimal("40.00"), "activity_order": 1})

            stop_o, _ = TripStop.objects.update_or_create(
                trip=trip_2, stop_order=3,
                defaults={"city": osaka, "start_date": date(2026, 10, 7), "end_date": date(2026, 10, 10), "transport_cost": Decimal("80.00"), "accommodation_cost": Decimal("360.00"), "notes": "Osaka food tour & castle exploration"}
            )
            act_o1 = Activity.objects.get(city=osaka, name="Dotonbori Street Food Crawl")
            TripActivity.objects.update_or_create(trip_stop=stop_o, activity=act_o1, activity_date=date(2026, 10, 8), defaults={"start_time": time(18, 0), "estimated_cost": Decimal("35.00"), "activity_order": 1})

            # 5. Trip 3: "Mediterranean Weekend" (Owner: Bob, Public)
            trip_3, _ = Trip.objects.get_or_create(
                user=bob,
                name="Mediterranean Weekend",
                defaults={
                    "description": "A vibrant 6-day Mediterranean escape exploring Gaudí architecture in Barcelona and historic minarets in Istanbul.",
                    "start_date": date(2026, 11, 5),
                    "end_date": date(2026, 11, 10),
                    "total_budget": Decimal("2200.00"),
                    "is_public": True,
                    "cover_image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
                    "share_slug": "mediterranean-weekend",
                },
            )
            SharedTrip.objects.update_or_create(trip=trip_3, defaults={"slug": trip_3.share_slug})

            stop_b, _ = TripStop.objects.update_or_create(
                trip=trip_3, stop_order=1,
                defaults={"city": barcelona, "start_date": date(2026, 11, 5), "end_date": date(2026, 11, 8), "transport_cost": Decimal("200.00"), "accommodation_cost": Decimal("400.00"), "notes": "Gaudí architecture & tapas crawl"}
            )
            act_b1 = Activity.objects.get(city=barcelona, name="Sagrada Família Fast-Track Guided Tour")
            act_b2 = Activity.objects.get(city=barcelona, name="Gothic Quarter & Tapas Crawl")
            TripActivity.objects.update_or_create(trip_stop=stop_b, activity=act_b1, activity_date=date(2026, 11, 6), defaults={"start_time": time(10, 0), "estimated_cost": Decimal("34.00"), "activity_order": 1})
            TripActivity.objects.update_or_create(trip_stop=stop_b, activity=act_b2, activity_date=date(2026, 11, 7), defaults={"start_time": time(19, 0), "estimated_cost": Decimal("50.00"), "activity_order": 1})

            stop_i, _ = TripStop.objects.update_or_create(
                trip=trip_3, stop_order=2,
                defaults={"city": istanbul, "start_date": date(2026, 11, 8), "end_date": date(2026, 11, 10), "transport_cost": Decimal("180.00"), "accommodation_cost": Decimal("250.00"), "notes": "Bosphorus cruise & Grand Bazaar"}
            )
            act_i1 = Activity.objects.get(city=istanbul, name="Hagia Sophia & Blue Mosque Architecture Walk")
            act_i2 = Activity.objects.get(city=istanbul, name="Sunset Bosphorus Cruise between Two Continents")
            TripActivity.objects.update_or_create(trip_stop=stop_i, activity=act_i1, activity_date=date(2026, 11, 9), defaults={"start_time": time(9, 30), "estimated_cost": Decimal("25.00"), "activity_order": 1})
            TripActivity.objects.update_or_create(trip_stop=stop_i, activity=act_i2, activity_date=date(2026, 11, 9), defaults={"start_time": time(17, 30), "estimated_cost": Decimal("20.00"), "activity_order": 2})

            # 6. Bob's Copied Trip Demo ("Copy of European Summer Escape")
            if not Trip.objects.filter(user=bob, name="Copy of European Summer Escape").exists():
                copy_public_trip(bob, trip_1.share_slug)
                self.stdout.write(self.style.SUCCESS("Bob's Copied Trip created via copy_public_trip()."))

            # 7. Saved Cities
            SavedCity.objects.get_or_create(user=alice, city=paris)
            SavedCity.objects.get_or_create(user=alice, city=rome)
            SavedCity.objects.get_or_create(user=alice, city=florence)

            SavedCity.objects.get_or_create(user=bob, city=tokyo)
            SavedCity.objects.get_or_create(user=bob, city=kyoto)
            SavedCity.objects.get_or_create(user=bob, city=barcelona)

        # Output Summary
        total_users = User.objects.count()
        total_trips = Trip.objects.count()
        total_cities = City.objects.count()
        total_activities = Activity.objects.count()

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDemo data successfully seeded!\n"
                f"• Total Users in DB: {total_users}\n"
                f"• Total Trips in DB: {total_trips}\n"
                f"• Total Cities in DB: {total_cities}\n"
                f"• Total Activities in DB: {total_activities}\n"
                f"• Alice's Main Trip Share Slug: /public/trips/{trip_1.share_slug}\n"
            )
        )
