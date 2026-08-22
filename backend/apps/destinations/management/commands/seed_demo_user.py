"""
GlobeTrotter — Dedicated Demo User Seed Command

Seeds a comprehensive, high-quality demo dataset for the dedicated test account:
Email: test@gmail.com
Password: test1234

Usage:
    python manage.py seed_demo_user

Idempotent & Safe to run repeatedly.
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
from apps.community.models import CommunityPost

User = get_user_model()


class Command(BaseCommand):
    help = "Seed comprehensive demo dataset for test@gmail.com test account"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding demo user dataset for test@gmail.com..."))

        with transaction.atomic():
            # 1. Primary Test User
            user, created = User.objects.get_or_create(
                email="test@gmail.com",
                defaults={
                    "first_name": "Yash",
                    "last_name": "Traveler",
                    "phone": "+919876543210",
                    "city": "Ahmedabad",
                    "country": "India",
                    "profile_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                },
            )
            user.set_password("test1234")
            user.first_name = "Yash"
            user.last_name = "Traveler"
            user.phone = "+919876543210"
            user.city = "Ahmedabad"
            user.country = "India"
            user.profile_image = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            user.is_active = True
            user.save()

            status_msg = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{status_msg} primary demo user: {user.email}"))

            # 2. Master Cities & Activities Setup (Ensure required catalog data exists)
            cities_to_ensure = [
                {
                    "name": "Paris",
                    "country": "France",
                    "region": "Europe",
                    "description": "The City of Light, famous for romantic architecture, art museums, and cuisine.",
                    "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 4,
                    "popularity_score": Decimal("9.6"),
                    "activities": [
                        ("Louvre Museum Highlights", Activity.Category.CULTURE, 180, Decimal("22.00")),
                        ("Seine River Dinner Cruise", Activity.Category.FOOD, 120, Decimal("95.00")),
                        ("Eiffel Tower Summit Tour", Activity.Category.SIGHTSEEING, 150, Decimal("35.00")),
                        ("Montmartre & Sacré-Cœur Walking Tour", Activity.Category.CULTURE, 120, Decimal("15.00")),
                        ("Le Marais Food & Wine Tasting", Activity.Category.FOOD, 180, Decimal("80.00")),
                        ("Luxembourg Gardens Leisure Walk", Activity.Category.NATURE, 90, Decimal("0.00")),
                    ],
                },
                {
                    "name": "Rome",
                    "country": "Italy",
                    "region": "Europe",
                    "description": "The Eternal City, home to ancient monuments, Vatican City, and rich culinary traditions.",
                    "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 3,
                    "popularity_score": Decimal("9.5"),
                    "activities": [
                        ("Colosseum & Ancient Rome Tour", Activity.Category.SIGHTSEEING, 180, Decimal("45.00")),
                        ("Vatican Museums & Sistine Chapel", Activity.Category.CULTURE, 210, Decimal("38.00")),
                        ("Trastevere Evening Food & Wine Tour", Activity.Category.FOOD, 180, Decimal("75.00")),
                        ("Borghese Gallery & Gardens Tour", Activity.Category.CULTURE, 120, Decimal("25.00")),
                        ("Roman Street Food Tasting", Activity.Category.FOOD, 90, Decimal("35.00")),
                        ("Piazza Navona & Pantheon Evening Walk", Activity.Category.NIGHTLIFE, 120, Decimal("0.00")),
                    ],
                },
                {
                    "name": "Florence",
                    "country": "Italy",
                    "region": "Europe",
                    "description": "The birthplace of the Renaissance, renowned for masterpieces, cathedral dome, and Tuscan gastronomy.",
                    "image": "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 3,
                    "popularity_score": Decimal("9.3"),
                    "activities": [
                        ("Uffizi Gallery Renaissance Tour", Activity.Category.CULTURE, 180, Decimal("30.00")),
                        ("Duomo Dome Climb & Cathedral Tour", Activity.Category.SIGHTSEEING, 120, Decimal("25.00")),
                        ("Tuscan Cooking Class & Wine", Activity.Category.FOOD, 210, Decimal("90.00")),
                        ("Ponte Vecchio & Historic Walking Tour", Activity.Category.CULTURE, 90, Decimal("20.00")),
                        ("Piazzale Michelangelo Sunset View", Activity.Category.SIGHTSEEING, 60, Decimal("0.00")),
                    ],
                },
                {
                    "name": "Tokyo",
                    "country": "Japan",
                    "region": "Asia",
                    "description": "A dazzling metropolis blending cutting-edge modernity with ancient temples and world-class food.",
                    "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 4,
                    "popularity_score": Decimal("9.7"),
                    "activities": [
                        ("Shinjuku & Shibuya Night Food Tour", Activity.Category.FOOD, 180, Decimal("85.00")),
                        ("Senso-ji Temple & Asakusa Walking Tour", Activity.Category.CULTURE, 120, Decimal("20.00")),
                        ("TeamLab Borderless Digital Art", Activity.Category.CULTURE, 120, Decimal("38.00")),
                        ("Tsukiji Outer Market Food Exploration", Activity.Category.FOOD, 120, Decimal("45.00")),
                        ("Roppongi Hills Nightlife Experience", Activity.Category.NIGHTLIFE, 180, Decimal("60.00")),
                    ],
                },
                {
                    "name": "Kyoto",
                    "country": "Japan",
                    "region": "Asia",
                    "description": "The cultural heart of Japan with thousands of classical Buddhist temples, gardens, and imperial palaces.",
                    "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 3,
                    "popularity_score": Decimal("9.4"),
                    "activities": [
                        ("Fushimi Inari Shrine & Bamboo Forest Tour", Activity.Category.SIGHTSEEING, 240, Decimal("40.00")),
                        ("Traditional Tea Ceremony in Gion", Activity.Category.CULTURE, 90, Decimal("35.00")),
                        ("Kinkaku-ji Golden Pavilion Visit", Activity.Category.SIGHTSEEING, 90, Decimal("15.00")),
                    ],
                },
                {
                    "name": "Osaka",
                    "country": "Japan",
                    "region": "Asia",
                    "description": "Japan's food capital, celebrated for lively street food markets, neon-lit canals, and Osaka Castle.",
                    "image": "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 3,
                    "popularity_score": Decimal("9.1"),
                    "activities": [
                        ("Dotonbori Street Food Safari", Activity.Category.FOOD, 150, Decimal("50.00")),
                        ("Osaka Castle & Historical Museum", Activity.Category.CULTURE, 120, Decimal("25.00")),
                    ],
                },
                {
                    "name": "Barcelona",
                    "country": "Spain",
                    "region": "Europe",
                    "description": "A vibrant Mediterranean coastal city famous for Gaudí architecture, beaches, and tapas culture.",
                    "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 3,
                    "popularity_score": Decimal("9.4"),
                    "activities": [
                        ("Sagrada Família Guided Masterpiece Tour", Activity.Category.CULTURE, 120, Decimal("35.00")),
                        ("Park Güell Panoramic Experience", Activity.Category.SIGHTSEEING, 120, Decimal("20.00")),
                        ("Gothic Quarter Tapas & Wine Tour", Activity.Category.FOOD, 180, Decimal("65.00")),
                    ],
                },
                {
                    "name": "Istanbul",
                    "country": "Turkey",
                    "region": "Middle East",
                    "description": "A historic transcontinental city spanning Europe and Asia with Byzantine and Ottoman marvels.",
                    "image": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 2,
                    "popularity_score": Decimal("9.2"),
                    "activities": [
                        ("Hagia Sophia & Blue Mosque Highlights", Activity.Category.CULTURE, 180, Decimal("25.00")),
                        ("Bosphorus Sunset Yacht Cruise", Activity.Category.SIGHTSEEING, 120, Decimal("45.00")),
                        ("Grand Bazaar & Spice Market Walk", Activity.Category.SHOPPING, 120, Decimal("15.00")),
                    ],
                },
                {
                    "name": "Bali",
                    "country": "Indonesia",
                    "region": "Asia",
                    "description": "An Indonesian island known for forested volcanic mountains, iconic rice paddies, beaches and coral reefs.",
                    "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
                    "cost_index": 2,
                    "popularity_score": Decimal("9.5"),
                    "activities": [
                        ("Ubud Monkey Forest & Rice Terraces", Activity.Category.NATURE, 240, Decimal("30.00")),
                        ("Uluwatu Sunset Temple & Kecak Dance", Activity.Category.CULTURE, 180, Decimal("35.00")),
                        ("Seminyak Beach Club & Seafood Dinner", Activity.Category.FOOD, 180, Decimal("50.00")),
                    ],
                },
            ]

            cities_dict = {}
            activities_dict = {}

            for c_data in cities_to_ensure:
                city_obj, _ = City.objects.get_or_create(
                    name=c_data["name"],
                    country=c_data["country"],
                    defaults={
                        "region": c_data["region"],
                        "description": c_data["description"],
                        "image": c_data["image"],
                        "cost_index": c_data["cost_index"],
                        "popularity_score": c_data["popularity_score"],
                    },
                )
                cities_dict[city_obj.name] = city_obj

                for act_tuple in c_data["activities"]:
                    act_name, act_cat, act_dur, act_cost = act_tuple
                    act_obj, _ = Activity.objects.get_or_create(
                        city=city_obj,
                        name=act_name,
                        defaults={
                            "category": act_cat,
                            "duration_minutes": act_dur,
                            "estimated_cost": act_cost,
                            "description": f"Curated experience in {city_obj.name}.",
                        },
                    )
                    activities_dict[(city_obj.name, act_name)] = act_obj

            # 3. Saved Cities for test@gmail.com
            saved_city_names = ["Paris", "Rome", "Florence", "Tokyo", "Kyoto", "Barcelona", "Bali"]
            for s_name in saved_city_names:
                if s_name in cities_dict:
                    SavedCity.objects.get_or_create(user=user, city=cities_dict[s_name])

            self.stdout.write(self.style.SUCCESS(f"Saved {len(saved_city_names)} cities for {user.email}."))

            # ----------------------------------------------------
            # TRIP 1: European Summer Escape (Main Demo Trip, WITHIN_BUDGET, Public)
            # ----------------------------------------------------
            trip1, _ = Trip.objects.get_or_create(
                user=user,
                name="European Summer Escape",
                defaults={
                    "description": "A 10-day journey through Paris, Rome and Florence combining iconic landmarks, local cuisine and cultural experiences.",
                    "start_date": date(2026, 9, 10),
                    "end_date": date(2026, 9, 19),
                    "total_budget": Decimal("3000.00"),
                    "is_public": True,
                    "cover_image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
                },
            )
            trip1.description = "A 10-day journey through Paris, Rome and Florence combining iconic landmarks, local cuisine and cultural experiences."
            trip1.start_date = date(2026, 9, 10)
            trip1.end_date = date(2026, 9, 19)
            trip1.total_budget = Decimal("3000.00")
            trip1.is_public = True
            trip1.cover_image = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80"
            trip1.save()

            SharedTrip.objects.get_or_create(trip=trip1, defaults={"slug": trip1.share_slug})

            # Community post
            CommunityPost.objects.get_or_create(
                user=user,
                trip=trip1,
                defaults={
                    "title": "My 10-Day European Summer Escape (Paris, Rome, Florence)",
                    "description": "Complete itinerary with must-see museums, historic landmarks, and the best local dinners across France and Italy.",
                },
            )

            # Trip 1 Stops
            # Clean old stops for idempotency
            TripStop.objects.filter(trip=trip1).delete()

            # Stop 1: Paris
            stop1_paris = TripStop.objects.create(
                trip=trip1,
                city=cities_dict["Paris"],
                start_date=date(2026, 9, 10),
                end_date=date(2026, 9, 13),
                stop_order=1,
                transport_cost=Decimal("200.00"),
                accommodation_cost=Decimal("400.00"),
                notes="Arrival in Paris and exploration of the city's major landmarks.",
            )
            # Paris activities (timed & unscheduled)
            TripActivity.objects.create(
                trip_stop=stop1_paris,
                activity=activities_dict[("Paris", "Louvre Museum Highlights")],
                activity_date=date(2026, 9, 10),
                start_time=time(9, 0),
                estimated_cost=Decimal("22.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop1_paris,
                activity=activities_dict[("Paris", "Seine River Dinner Cruise")],
                activity_date=date(2026, 9, 10),
                start_time=time(19, 0),
                estimated_cost=Decimal("95.00"),
                activity_order=2,
            )
            TripActivity.objects.create(
                trip_stop=stop1_paris,
                activity=activities_dict[("Paris", "Eiffel Tower Summit Tour")],
                activity_date=date(2026, 9, 11),
                start_time=time(13, 30),
                estimated_cost=Decimal("35.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop1_paris,
                activity=activities_dict[("Paris", "Montmartre & Sacré-Cœur Walking Tour")],
                activity_date=date(2026, 9, 11),
                start_time=time(16, 30),
                estimated_cost=Decimal("15.00"),
                activity_order=2,
            )
            TripActivity.objects.create(
                trip_stop=stop1_paris,
                activity=activities_dict[("Paris", "Le Marais Food & Wine Tasting")],
                activity_date=date(2026, 9, 12),
                start_time=None,  # Flexible / Unscheduled!
                estimated_cost=Decimal("80.00"),
                activity_order=1,
            )

            # Stop 2: Rome
            stop2_rome = TripStop.objects.create(
                trip=trip1,
                city=cities_dict["Rome"],
                start_date=date(2026, 9, 13),
                end_date=date(2026, 9, 16),
                stop_order=2,
                transport_cost=Decimal("150.00"),
                accommodation_cost=Decimal("380.00"),
                notes="Explore ancient Rome, local food and historic landmarks.",
            )
            TripActivity.objects.create(
                trip_stop=stop2_rome,
                activity=activities_dict[("Rome", "Colosseum & Ancient Rome Tour")],
                activity_date=date(2026, 9, 13),
                start_time=time(9, 30),
                estimated_cost=Decimal("45.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop2_rome,
                activity=activities_dict[("Rome", "Vatican Museums & Sistine Chapel")],
                activity_date=date(2026, 9, 14),
                start_time=time(10, 0),
                estimated_cost=Decimal("38.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop2_rome,
                activity=activities_dict[("Rome", "Trastevere Evening Food & Wine Tour")],
                activity_date=date(2026, 9, 14),
                start_time=time(19, 0),
                estimated_cost=Decimal("75.00"),
                activity_order=2,
            )
            TripActivity.objects.create(
                trip_stop=stop2_rome,
                activity=activities_dict[("Rome", "Borghese Gallery & Gardens Tour")],
                activity_date=date(2026, 9, 15),
                start_time=time(15, 0),
                estimated_cost=Decimal("25.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop2_rome,
                activity=activities_dict[("Rome", "Roman Street Food Tasting")],
                activity_date=date(2026, 9, 15),
                start_time=None,  # Flexible / Unscheduled!
                estimated_cost=Decimal("35.00"),
                activity_order=2,
            )

            # Stop 3: Florence
            stop3_florence = TripStop.objects.create(
                trip=trip1,
                city=cities_dict["Florence"],
                start_date=date(2026, 9, 16),
                end_date=date(2026, 9, 19),
                stop_order=3,
                transport_cost=Decimal("100.00"),
                accommodation_cost=Decimal("320.00"),
                notes="Renaissance art, architecture and Tuscan food.",
            )
            TripActivity.objects.create(
                trip_stop=stop3_florence,
                activity=activities_dict[("Florence", "Uffizi Gallery Renaissance Tour")],
                activity_date=date(2026, 9, 16),
                start_time=time(10, 0),
                estimated_cost=Decimal("30.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop3_florence,
                activity=activities_dict[("Florence", "Duomo Dome Climb & Cathedral Tour")],
                activity_date=date(2026, 9, 17),
                start_time=time(14, 0),
                estimated_cost=Decimal("25.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop3_florence,
                activity=activities_dict[("Florence", "Tuscan Cooking Class & Wine")],
                activity_date=date(2026, 9, 17),
                start_time=time(17, 30),
                estimated_cost=Decimal("90.00"),
                activity_order=2,
            )
            TripActivity.objects.create(
                trip_stop=stop3_florence,
                activity=activities_dict[("Florence", "Ponte Vecchio & Historic Walking Tour")],
                activity_date=date(2026, 9, 18),
                start_time=None,  # Flexible / Unscheduled!
                estimated_cost=Decimal("20.00"),
                activity_order=1,
            )
            # Note: 2026-09-19 has NO activities scheduled -> Free Day in calendar!

            # Trip 1 Expenses
            Expense.objects.filter(trip=trip1).delete()
            trip1_expenses = [
                ("MEAL", Decimal("45.00"), "Dinner in Paris", date(2026, 9, 10)),
                ("MEAL", Decimal("55.00"), "Paris lunch and dinner", date(2026, 9, 11)),
                ("MEAL", Decimal("40.00"), "Dinner in Rome", date(2026, 9, 14)),
                ("MEAL", Decimal("40.00"), "Dinner in Florence", date(2026, 9, 17)),
                ("OTHER", Decimal("20.00"), "Local travel/miscellaneous", date(2026, 9, 18)),
            ]
            for cat, amt, desc, exp_dt in trip1_expenses:
                Expense.objects.create(trip=trip1, category=cat, amount=amt, description=desc, expense_date=exp_dt)

            # ----------------------------------------------------
            # TRIP 2: Luxury Japan Adventure (OVER_BUDGET, Private)
            # Budget: 3500.00, Total Costs: > 3500.00
            # ----------------------------------------------------
            trip2, _ = Trip.objects.get_or_create(
                user=user,
                name="Luxury Japan Adventure",
                defaults={
                    "description": "A premium multi-city Japan experience with high-end stays, dining and activities.",
                    "start_date": date(2026, 10, 5),
                    "end_date": date(2026, 10, 16),
                    "total_budget": Decimal("3500.00"),
                    "is_public": False,
                    "cover_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
                },
            )
            trip2.description = "A premium multi-city Japan experience with high-end stays, dining and activities."
            trip2.start_date = date(2026, 10, 5)
            trip2.end_date = date(2026, 10, 16)
            trip2.total_budget = Decimal("3500.00")
            trip2.is_public = False
            trip2.cover_image = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
            trip2.save()

            TripStop.objects.filter(trip=trip2).delete()
            stop2_tokyo = TripStop.objects.create(
                trip=trip2,
                city=cities_dict["Tokyo"],
                start_date=date(2026, 10, 5),
                end_date=date(2026, 10, 9),
                stop_order=1,
                transport_cost=Decimal("350.00"),
                accommodation_cost=Decimal("850.00"),
                notes="Luxury Shinjuku high-rise hotel stay.",
            )
            TripActivity.objects.create(
                trip_stop=stop2_tokyo,
                activity=activities_dict[("Tokyo", "Shinjuku & Shibuya Night Food Tour")],
                activity_date=date(2026, 10, 6),
                start_time=time(18, 30),
                estimated_cost=Decimal("85.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop2_tokyo,
                activity=activities_dict[("Tokyo", "TeamLab Borderless Digital Art")],
                activity_date=date(2026, 10, 7),
                start_time=time(14, 0),
                estimated_cost=Decimal("38.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop2_tokyo,
                activity=activities_dict[("Tokyo", "Roppongi Hills Nightlife Experience")],
                activity_date=date(2026, 10, 8),
                start_time=time(20, 0),
                estimated_cost=Decimal("60.00"),
                activity_order=1,
            )

            stop2_kyoto = TripStop.objects.create(
                trip=trip2,
                city=cities_dict["Kyoto"],
                start_date=date(2026, 10, 9),
                end_date=date(2026, 10, 13),
                stop_order=2,
                transport_cost=Decimal("200.00"),
                accommodation_cost=Decimal("750.00"),
                notes="Traditional boutique Ryokan with onsen.",
            )
            TripActivity.objects.create(
                trip_stop=stop2_kyoto,
                activity=activities_dict[("Kyoto", "Fushimi Inari Shrine & Bamboo Forest Tour")],
                activity_date=date(2026, 10, 10),
                start_time=time(9, 0),
                estimated_cost=Decimal("40.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop2_kyoto,
                activity=activities_dict[("Kyoto", "Traditional Tea Ceremony in Gion")],
                activity_date=date(2026, 10, 11),
                start_time=None,  # Unscheduled
                estimated_cost=Decimal("35.00"),
                activity_order=1,
            )

            stop2_osaka = TripStop.objects.create(
                trip=trip2,
                city=cities_dict["Osaka"],
                start_date=date(2026, 10, 13),
                end_date=date(2026, 10, 16),
                stop_order=3,
                transport_cost=Decimal("150.00"),
                accommodation_cost=Decimal("600.00"),
                notes="Dotonbori district hotel.",
            )
            TripActivity.objects.create(
                trip_stop=stop2_osaka,
                activity=activities_dict[("Osaka", "Dotonbori Street Food Safari")],
                activity_date=date(2026, 10, 14),
                start_time=time(18, 0),
                estimated_cost=Decimal("50.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop2_osaka,
                activity=activities_dict[("Osaka", "Osaka Castle & Historical Museum")],
                activity_date=date(2026, 10, 15),
                start_time=time(10, 0),
                estimated_cost=Decimal("25.00"),
                activity_order=1,
            )

            Expense.objects.filter(trip=trip2).delete()
            Expense.objects.create(trip=trip2, category="MEAL", amount=Decimal("280.00"), description="Omakase Sushi Dinner Tokyo", expense_date=date(2026, 10, 7))
            Expense.objects.create(trip=trip2, category="MEAL", amount=Decimal("220.00"), description="Kaiseki Dining Kyoto", expense_date=date(2026, 10, 11))
            Expense.objects.create(trip=trip2, category="OTHER", amount=Decimal("150.00"), description="Bullet Train Green Car upgrades", expense_date=date(2026, 10, 9))
            # Total ~ 3883 USD -> OVER_BUDGET (> 3500)

            # ----------------------------------------------------
            # TRIP 3: Mediterranean Explorer (NEAR_LIMIT, Private)
            # Budget: 2200.00, Estimated Total ~ 1900.00 (86% of budget)
            # ----------------------------------------------------
            trip3, _ = Trip.objects.get_or_create(
                user=user,
                name="Mediterranean Explorer",
                defaults={
                    "description": "A relaxed Mediterranean itinerary exploring Barcelona and Istanbul.",
                    "start_date": date(2026, 11, 5),
                    "end_date": date(2026, 11, 12),
                    "total_budget": Decimal("2200.00"),
                    "is_public": False,
                    "cover_image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
                },
            )
            trip3.description = "A relaxed Mediterranean itinerary exploring Barcelona and Istanbul."
            trip3.start_date = date(2026, 11, 5)
            trip3.end_date = date(2026, 11, 12)
            trip3.total_budget = Decimal("2200.00")
            trip3.is_public = False
            trip3.cover_image = "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80"
            trip3.save()

            TripStop.objects.filter(trip=trip3).delete()
            stop3_bcn = TripStop.objects.create(
                trip=trip3,
                city=cities_dict["Barcelona"],
                start_date=date(2026, 11, 5),
                end_date=date(2026, 11, 8),
                stop_order=1,
                transport_cost=Decimal("220.00"),
                accommodation_cost=Decimal("450.00"),
                notes="Eixample boutique hotel.",
            )
            TripActivity.objects.create(
                trip_stop=stop3_bcn,
                activity=activities_dict[("Barcelona", "Sagrada Família Guided Masterpiece Tour")],
                activity_date=date(2026, 11, 6),
                start_time=time(10, 0),
                estimated_cost=Decimal("35.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop3_bcn,
                activity=activities_dict[("Barcelona", "Gothic Quarter Tapas & Wine Tour")],
                activity_date=date(2026, 11, 7),
                start_time=time(18, 30),
                estimated_cost=Decimal("65.00"),
                activity_order=1,
            )

            stop3_ist = TripStop.objects.create(
                trip=trip3,
                city=cities_dict["Istanbul"],
                start_date=date(2026, 11, 8),
                end_date=date(2026, 11, 12),
                stop_order=2,
                transport_cost=Decimal("240.00"),
                accommodation_cost=Decimal("520.00"),
                notes="Bosphorus view hotel.",
            )
            TripActivity.objects.create(
                trip_stop=stop3_ist,
                activity=activities_dict[("Istanbul", "Hagia Sophia & Blue Mosque Highlights")],
                activity_date=date(2026, 11, 9),
                start_time=time(9, 30),
                estimated_cost=Decimal("25.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop3_ist,
                activity=activities_dict[("Istanbul", "Bosphorus Sunset Yacht Cruise")],
                activity_date=date(2026, 11, 10),
                start_time=time(17, 0),
                estimated_cost=Decimal("45.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop3_ist,
                activity=activities_dict[("Istanbul", "Grand Bazaar & Spice Market Walk")],
                activity_date=date(2026, 11, 11),
                start_time=None,  # Unscheduled
                estimated_cost=Decimal("15.00"),
                activity_order=1,
            )

            Expense.objects.filter(trip=trip3).delete()
            Expense.objects.create(trip=trip3, category="MEAL", amount=Decimal("140.00"), description="Tapas & Seafood dinners", expense_date=date(2026, 11, 7))
            Expense.objects.create(trip=trip3, category="MEAL", amount=Decimal("110.00"), description="Turkish Kebabs & Meze", expense_date=date(2026, 11, 10))
            # Total ~ 1865 USD / 2200 USD = 84.77% -> NEAR_LIMIT!

            # ----------------------------------------------------
            # TRIP 4: Bali Weekend Escape (COMPLETED TRIP)
            # Past dates: 2026-01-10 to 2026-01-15
            # ----------------------------------------------------
            trip4, _ = Trip.objects.get_or_create(
                user=user,
                name="Bali Weekend Escape",
                defaults={
                    "description": "A completed tropical getaway focused on beaches, food and nature.",
                    "start_date": date(2026, 1, 10),
                    "end_date": date(2026, 1, 15),
                    "total_budget": Decimal("1500.00"),
                    "is_public": False,
                    "cover_image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
                },
            )
            trip4.description = "A completed tropical getaway focused on beaches, food and nature."
            trip4.start_date = date(2026, 1, 10)
            trip4.end_date = date(2026, 1, 15)
            trip4.total_budget = Decimal("1500.00")
            trip4.is_public = False
            trip4.cover_image = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
            trip4.save()

            TripStop.objects.filter(trip=trip4).delete()
            stop4_bali = TripStop.objects.create(
                trip=trip4,
                city=cities_dict["Bali"],
                start_date=date(2026, 1, 10),
                end_date=date(2026, 1, 15),
                stop_order=1,
                transport_cost=Decimal("200.00"),
                accommodation_cost=Decimal("450.00"),
                notes="Private villa in Seminyak.",
            )
            TripActivity.objects.create(
                trip_stop=stop4_bali,
                activity=activities_dict[("Bali", "Ubud Monkey Forest & Rice Terraces")],
                activity_date=date(2026, 1, 11),
                start_time=time(9, 0),
                estimated_cost=Decimal("30.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop4_bali,
                activity=activities_dict[("Bali", "Uluwatu Sunset Temple & Kecak Dance")],
                activity_date=date(2026, 1, 12),
                start_time=time(16, 30),
                estimated_cost=Decimal("35.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop4_bali,
                activity=activities_dict[("Bali", "Seminyak Beach Club & Seafood Dinner")],
                activity_date=date(2026, 1, 13),
                start_time=None,  # Unscheduled
                estimated_cost=Decimal("50.00"),
                activity_order=1,
            )

            Expense.objects.filter(trip=trip4).delete()
            Expense.objects.create(trip=trip4, category="MEAL", amount=Decimal("120.00"), description="Jimbaran Bay Sunset Seafood", expense_date=date(2026, 1, 12))
            Expense.objects.create(trip=trip4, category="OTHER", amount=Decimal("45.00"), description="Scooter rental & fuel", expense_date=date(2026, 1, 11))

            # ----------------------------------------------------
            # TRIP 5: Tokyo Food Weekend (Single-City Simple Trip)
            # Dates: 2026-12-05 to 2026-12-08
            # ----------------------------------------------------
            trip5, _ = Trip.objects.get_or_create(
                user=user,
                name="Tokyo Food Weekend",
                defaults={
                    "description": "A quick culinary trip through Tokyo's finest street food, ramen alleys and nightlife.",
                    "start_date": date(2026, 12, 5),
                    "end_date": date(2026, 12, 8),
                    "total_budget": Decimal("1000.00"),
                    "is_public": False,
                    "cover_image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
                },
            )
            trip5.description = "A quick culinary trip through Tokyo's finest street food, ramen alleys and nightlife."
            trip5.start_date = date(2026, 12, 5)
            trip5.end_date = date(2026, 12, 8)
            trip5.total_budget = Decimal("1000.00")
            trip5.is_public = False
            trip5.cover_image = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80"
            trip5.save()

            TripStop.objects.filter(trip=trip5).delete()
            stop5_tokyo = TripStop.objects.create(
                trip=trip5,
                city=cities_dict["Tokyo"],
                start_date=date(2026, 12, 5),
                end_date=date(2026, 12, 8),
                stop_order=1,
                transport_cost=Decimal("150.00"),
                accommodation_cost=Decimal("320.00"),
                notes="Ginza central boutique hotel.",
            )
            TripActivity.objects.create(
                trip_stop=stop5_tokyo,
                activity=activities_dict[("Tokyo", "Tsukiji Outer Market Food Exploration")],
                activity_date=date(2026, 12, 6),
                start_time=time(9, 0),
                estimated_cost=Decimal("45.00"),
                activity_order=1,
            )
            TripActivity.objects.create(
                trip_stop=stop5_tokyo,
                activity=activities_dict[("Tokyo", "Senso-ji Temple & Asakusa Walking Tour")],
                activity_date=date(2026, 12, 6),
                start_time=time(14, 0),
                estimated_cost=Decimal("20.00"),
                activity_order=2,
            )
            TripActivity.objects.create(
                trip_stop=stop5_tokyo,
                activity=activities_dict[("Tokyo", "Shinjuku & Shibuya Night Food Tour")],
                activity_date=date(2026, 12, 7),
                start_time=time(19, 0),
                estimated_cost=Decimal("85.00"),
                activity_order=1,
            )

            Expense.objects.filter(trip=trip5).delete()
            Expense.objects.create(trip=trip5, category="MEAL", amount=Decimal("75.00"), description="Ramen Street Tasting Tour", expense_date=date(2026, 12, 6))

        self.stdout.write(self.style.SUCCESS("[OK] Successfully seeded demo dataset for test@gmail.com!"))
