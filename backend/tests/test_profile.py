"""
GlobeTrotter — Profile Unit Tests

Tests covering user profile retrieval, profile updates (PATCH), protected field immutability,
email immutability, and access control.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class ProfileAPITests(APITestCase):
    """Test suite for user profile management endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="profile_tester@example.com",
            password="Password123!",
            first_name="InitialFirst",
            last_name="InitialLast",
            city="OldCity",
            country="OldCountry",
        )
        self.url = reverse("auth-me")  # /api/v1/auth/me/

    # 1. Authenticated user can retrieve profile
    def test_authenticated_user_can_get_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "profile_tester@example.com")
        self.assertEqual(response.data["first_name"], "InitialFirst")
        self.assertEqual(response.data["city"], "OldCity")

    # 2. Unauthenticated user rejected
    def test_unauthenticated_user_cannot_get_profile(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 3. Authenticated user can update editable profile fields
    def test_user_can_update_profile(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "first_name": "UpdatedFirst",
            "last_name": "UpdatedLast",
            "phone": "+1234567890",
            "city": "Paris",
            "country": "France",
            "profile_image": "https://example.com/avatar.jpg",
        }
        response = self.client.patch(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "UpdatedFirst")
        self.assertEqual(response.data["last_name"], "UpdatedLast")
        self.assertEqual(response.data["city"], "Paris")
        self.assertEqual(response.data["country"], "France")
        self.assertEqual(response.data["profile_image"], "https://example.com/avatar.jpg")

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "UpdatedFirst")
        self.assertEqual(self.user.city, "Paris")

    # 4. Email remains unchanged when attempting PATCH
    def test_email_cannot_be_modified(self):
        self.client.force_authenticate(user=self.user)
        payload = {"email": "hacked_email@example.com", "first_name": "NewName"}
        response = self.client.patch(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "profile_tester@example.com")

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "profile_tester@example.com")

    # 5. Protected fields cannot be modified
    def test_protected_fields_cannot_be_modified(self):
        self.client.force_authenticate(user=self.user)
        payload = {"is_staff": True, "is_superuser": True}
        response = self.client.patch(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)

    # 6. Partial update works
    def test_partial_profile_update(self):
        self.client.force_authenticate(user=self.user)
        payload = {"city": "Rome"}
        response = self.client.patch(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["city"], "Rome")
        self.assertEqual(response.data["first_name"], "InitialFirst")
