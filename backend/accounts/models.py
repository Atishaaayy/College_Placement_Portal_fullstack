from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Role(models.TextChoices):
    STUDENT = 'STUDENT', 'Student'
    RECRUITER = 'RECRUITER', 'Recruiter'
    TPO = 'TPO', 'TPO'


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.TPO)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.full_name} ({self.role})"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class StudentProfile(models.Model):
    BRANCH_CHOICES = [
        ('CSE', 'Computer Science'),
        ('IT', 'Information Technology'),
        ('ECE', 'Electronics & Communication'),
        ('EEE', 'Electrical & Electronics'),
        ('ME', 'Mechanical Engineering'),
        ('CE', 'Civil Engineering'),
        ('CH', 'Chemical Engineering'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=30, unique=True)
    branch = models.CharField(max_length=10, choices=BRANCH_CHOICES)
    graduation_year = models.IntegerField()
    cgpa = models.DecimalField(max_digits=4, decimal_places=2)
    active_backlogs = models.IntegerField(default=0)
    verification_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    about = models.TextField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.user.full_name} - {self.roll_number}"


class RecruiterProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=200)
    company_website = models.URLField(blank=True)
    company_description = models.TextField(blank=True)
    hr_contact_name = models.CharField(max_length=150, blank=True)
    hr_contact_email = models.EmailField(blank=True)
    hr_contact_phone = models.CharField(max_length=15, blank=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.company_name} ({self.user.email})"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"ResetToken for {self.user.email}"
