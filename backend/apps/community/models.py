"""
GlobeTrotter — Community Models

Community posts for sharing trips publicly.
"""

from django.conf import settings
from django.db import models


class CommunityPost(models.Model):
    """A community post that references a user's trip for public sharing."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_posts",
    )
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="community_posts",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "community_posts"
        ordering = ["-created_at"]
        verbose_name = "Community Post"
        verbose_name_plural = "Community Posts"

    def __str__(self):
        return f"{self.title} by {self.user.email}"
