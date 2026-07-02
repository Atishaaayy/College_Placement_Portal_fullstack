from django.db import models
from django.conf import settings
import json


class Company(models.Model):
    name = models.CharField(max_length=200, unique=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    hr_contact_email = models.EmailField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_companies'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']


class CampusDrive(models.Model):
    BRANCH_CHOICES = [
        ('CSE', 'Computer Science'),
        ('IT', 'Information Technology'),
        ('ECE', 'Electronics & Communication'),
        ('EEE', 'Electrical & Electronics'),
        ('ME', 'Mechanical Engineering'),
        ('CE', 'Civil Engineering'),
        ('CH', 'Chemical Engineering'),
        ('OTHER', 'Other'),
        ('ALL', 'All Branches'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='drives')
    job_profile = models.CharField(max_length=200)
    job_description = models.TextField(blank=True)
    selection_steps = models.TextField(
        help_text="Comma-separated: e.g. Aptitude Test, Technical Interview, HR Interview"
    )
    ctc = models.DecimalField(max_digits=10, decimal_places=2, help_text="CTC in LPA")
    vacancies = models.IntegerField(default=1)
    visit_date = models.DateField()
    last_apply_date = models.DateField(null=True, blank=True)

    # Eligibility cutoffs
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    allowed_branches = models.JSONField(default=list, help_text="List of branch codes, or ['ALL']")
    max_backlogs = models.IntegerField(default=0)
    min_graduation_year = models.IntegerField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='posted_drives'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company.name} – {self.job_profile} ({self.visit_date})"

    class Meta:
        ordering = ['-visit_date']

    def get_selection_steps_list(self):
        return [s.strip() for s in self.selection_steps.split(',') if s.strip()]

    def is_student_eligible(self, student_profile):
        """Check if a student meets eligibility criteria."""
        reasons = []
        if float(student_profile.cgpa) < float(self.min_cgpa):
            reasons.append(f"Minimum CGPA required: {self.min_cgpa}")
        if student_profile.active_backlogs > self.max_backlogs:
            reasons.append(f"Maximum active backlogs allowed: {self.max_backlogs}")
        allowed = self.allowed_branches
        if 'ALL' not in allowed and student_profile.branch not in allowed:
            reasons.append(f"Branch not eligible. Allowed: {', '.join(allowed)}")
        if self.min_graduation_year and student_profile.graduation_year < self.min_graduation_year:
            reasons.append(f"Graduation year must be {self.min_graduation_year} or later")
        return len(reasons) == 0, reasons


class Application(models.Model):
    STATUS_CHOICES = [
        ('APPLIED', 'Applied'),
        ('SHORTLISTED_TEST', 'Shortlisted for Test'),
        ('INTERVIEWING', 'Interviewing'),
        ('SELECTED', 'Selected'),
        ('REJECTED', 'Rejected'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications'
    )
    drive = models.ForeignKey(CampusDrive, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPLIED')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, help_text="Recruiter/TPO notes on this application")

    class Meta:
        unique_together = ['student', 'drive']
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.full_name} → {self.drive} [{self.status}]"


class Announcement(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='announcements'
    )
    drive = models.ForeignKey(
        CampusDrive, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='announcements'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.priority}] {self.title}"

    class Meta:
        ordering = ['-created_at']
