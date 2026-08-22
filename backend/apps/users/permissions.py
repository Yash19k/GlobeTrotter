"""
GlobeTrotter — Reusable Permissions

Permissions foundation for object ownership enforcement in future APIs.
"""

from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to access/edit it.
    Assumes the model instance has a `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        # Check if the object is owned by the request user
        owner = getattr(obj, "user", None)
        return owner == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to allow read-only access to anyone,
    but write access only to the owner of the object.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        owner = getattr(obj, "user", None)
        return owner == request.user
