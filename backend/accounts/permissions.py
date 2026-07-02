from rest_framework.permissions import BasePermission
from .models import Role


class IsTPO(BasePermission):
    """Allow access only to TPO users."""
    message = 'Access restricted to TPO administrators.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.TPO
        )


class IsStudent(BasePermission):
    """Allow access only to Student users."""
    message = 'Access restricted to students.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.STUDENT
        )


class IsRecruiter(BasePermission):
    """Allow access only to approved Recruiter users."""
    message = 'Access restricted to approved recruiters.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.RECRUITER
        )


class IsTPOOrRecruiter(BasePermission):
    """Allow access to TPO or Recruiter."""
    message = 'Access restricted to TPO or Recruiters.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in [Role.TPO, Role.RECRUITER]
        )
