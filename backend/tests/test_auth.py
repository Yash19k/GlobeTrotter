"""
GlobeTrotter — Authentication API Unit Tests

Tests for register, login, me, token refresh, logout, password masking, and permissions.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthAPITests(APITestCase):
    """Test suite for authentication API endpoints."""

    def setUp(self):
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.me_url = reverse("auth-me")
        self.refresh_url = reverse("auth-token-refresh")
        self.logout_url = reverse("auth-logout")

        self.user_data = {
            "email": "testuser@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+1234567890",
            "city": "Paris",
            "country": "France",
        }

        # Pre-created user for login/me tests
        self.existing_user = User.objects.create_user(
            email="existing@example.com",
            password="ExistingPassword123!",
            first_name="Existing",
            last_name="User",
        )

    def test_successful_registration(self):
        """Verify successful user registration returns 201 Created, user object, and tokens."""
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertIn("tokens", response.data)
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])
        self.assertEqual(response.data["user"]["email"], "testuser@example.com")
        self.assertNotIn("password", response.data["user"])

        # Confirm user exists in DB with hashed password
        user = User.objects.get(email="testuser@example.com")
        self.assertTrue(user.check_password("SecurePassword123!"))

    def test_duplicate_email_registration_fails(self):
        """Verify registering with an existing email returns 400 Bad Request."""
        data = self.user_data.copy()
        data["email"] = "existing@example.com"
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_password_mismatch_registration_fails(self):
        """Verify registration with non-matching passwords returns 400 Bad Request."""
        data = self.user_data.copy()
        data["password_confirm"] = "DifferentPassword123!"
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)

    def test_successful_login(self):
        """Verify valid login credentials return access token, refresh token, and user data."""
        payload = {
            "email": "existing@example.com",
            "password": "ExistingPassword123!",
        }
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "existing@example.com")
        self.assertNotIn("password", response.data["user"])

    def test_invalid_login_credentials(self):
        """Verify invalid credentials return safe 401 generic error without leaking specific details."""
        payload = {
            "email": "existing@example.com",
            "password": "WrongPassword!",
        }
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Invalid email or password.")

    def test_current_user_authenticated(self):
        """Verify GET /api/v1/auth/me/ with valid Bearer token returns authenticated user profile."""
        login_resp = self.client.post(
            self.login_url,
            {"email": "existing@example.com", "password": "ExistingPassword123!"},
            format="json",
        )
        token = login_resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "existing@example.com")
        self.assertNotIn("password", response.data)

    def test_current_user_unauthenticated_fails(self):
        """Verify GET /api/v1/auth/me/ without authorization token returns 401 Unauthorized."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Verify refresh token can be used to obtain a new access token."""
        login_resp = self.client.post(
            self.login_url,
            {"email": "existing@example.com", "password": "ExistingPassword123!"},
            format="json",
        )
        refresh_token = login_resp.data["refresh"]

        refresh_resp = self.client.post(
            self.refresh_url, {"refresh": refresh_token}, format="json"
        )
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_resp.data)

    def test_logout_blacklists_refresh_token(self):
        """Verify logout blacklists refresh token so it cannot be used again."""
        login_resp = self.client.post(
            self.login_url,
            {"email": "existing@example.com", "password": "ExistingPassword123!"},
            format="json",
        )
        access_token = login_resp.data["access"]
        refresh_token = login_resp.data["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Perform logout
        logout_resp = self.client.post(
            self.logout_url, {"refresh": refresh_token}, format="json"
        )
        self.assertEqual(logout_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(logout_resp.data["detail"], "Successfully logged out.")

        # Attempt to use blacklisted refresh token
        reuse_resp = self.client.post(
            self.refresh_url, {"refresh": refresh_token}, format="json"
        )
        self.assertEqual(reuse_resp.status_code, status.HTTP_401_UNAUTHORIZED)
