import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import CustomUser, StudentProfile, RecruiterProfile, Role
from placements.models import Company, CampusDrive, Application, Announcement
from django.utils import timezone
import datetime

def seed():
    print("Seeding database...")
    
    # 1. Create TPO
    tpo_email = 'tpo@college.edu'
    if not CustomUser.objects.filter(email=tpo_email).exists():
        tpo = CustomUser.objects.create_user(
            email=tpo_email,
            password='Admin@123',
            full_name='TPO Administrator',
            role=Role.TPO,
            is_staff=True,
            is_superuser=True
        )
        print(f"Created TPO: {tpo_email}")
    else:
        tpo = CustomUser.objects.get(email=tpo_email)
        print(f"TPO already exists: {tpo_email}")

    # 2. Create Recruiter
    rec_email = 'recruiter@company.com'
    if not CustomUser.objects.filter(email=rec_email).exists():
        rec_user = CustomUser.objects.create_user(
            email=rec_email,
            password='Recruiter@123',
            full_name='HR Google',
            role=Role.RECRUITER
        )
        rec_profile = RecruiterProfile.objects.create(
            user=rec_user,
            company_name='Google',
            company_website='https://google.com',
            company_description='Google LLC is an American multinational technology company.',
            hr_contact_name='HR Google',
            hr_contact_email='google-hr@company.com',
            hr_contact_phone='+1-555-0199',
            is_approved=True
        )
        print(f"Created Recruiter: {rec_email}")
    else:
        rec_user = CustomUser.objects.get(email=rec_email)
        print(f"Recruiter already exists: {rec_email}")

    # 2b. Create second recruiter (pending approval)
    rec_email2 = 'pending_recruiter@company.com'
    if not CustomUser.objects.filter(email=rec_email2).exists():
        rec_user2 = CustomUser.objects.create_user(
            email=rec_email2,
            password='Recruiter@123',
            full_name='HR Meta',
            role=Role.RECRUITER
        )
        rec_profile2 = RecruiterProfile.objects.create(
            user=rec_user2,
            company_name='Meta',
            company_website='https://meta.com',
            company_description='Meta Platforms, Inc. builds technologies that help people connect.',
            hr_contact_name='HR Meta',
            hr_contact_email='meta-hr@company.com',
            hr_contact_phone='+1-555-0188',
            is_approved=False
        )
        print(f"Created Pending Recruiter: {rec_email2}")

    # 3. Create Companies
    google_company, _ = Company.objects.get_or_create(
        name='Google',
        defaults={
            'description': 'Google LLC is an American multinational technology company.',
            'website': 'https://google.com',
            'hr_contact_email': 'google-hr@company.com',
            'created_by': tpo
        }
    )
    
    microsoft_company, _ = Company.objects.get_or_create(
        name='Microsoft',
        defaults={
            'description': 'Microsoft Corporation is an American multinational technology company.',
            'website': 'https://microsoft.com',
            'hr_contact_email': 'microsoft-hr@company.com',
            'created_by': tpo
        }
    )

    # 4. Create Students
    students_data = [
        {
            'email': 'student@college.edu',
            'password': 'Student@123',
            'full_name': 'Alex Mercer',
            'roll_number': '22CSE001',
            'branch': 'CSE',
            'graduation_year': 2027,
            'cgpa': 8.75,
            'backlogs': 0,
            'status': 'VERIFIED'
        },
        {
            'email': 'student2@college.edu',
            'password': 'Student@123',
            'full_name': 'Bob Miller',
            'roll_number': '22ME002',
            'branch': 'ME',
            'graduation_year': 2027,
            'cgpa': 6.50,
            'backlogs': 1,
            'status': 'PENDING'
        },
        {
            'email': 'student3@college.edu',
            'password': 'Student@123',
            'full_name': 'Charlie Smith',
            'roll_number': '22ECE003',
            'branch': 'ECE',
            'graduation_year': 2026,
            'cgpa': 9.20,
            'backlogs': 0,
            'status': 'VERIFIED'
        }
    ]

    students_list = []
    for s_info in students_data:
        if not CustomUser.objects.filter(email=s_info['email']).exists():
            s_user = CustomUser.objects.create_user(
                email=s_info['email'],
                password=s_info['password'],
                full_name=s_info['full_name'],
                role=Role.STUDENT
            )
            s_profile = StudentProfile.objects.create(
                user=s_user,
                roll_number=s_info['roll_number'],
                branch=s_info['branch'],
                graduation_year=s_info['graduation_year'],
                cgpa=s_info['cgpa'],
                active_backlogs=s_info['backlogs'],
                verification_status=s_info['status'],
                about=f"Hi, I'm {s_info['full_name']} from the {s_info['branch']} branch.",
                phone='+919876543210',
                linkedin_url=f"https://linkedin.com/in/{s_info['full_name'].lower().replace(' ', '')}",
                github_url=f"https://github.com/{s_info['full_name'].lower().replace(' ', '')}"
            )
            students_list.append(s_user)
            print(f"Created Student: {s_info['email']}")
        else:
            s_user = CustomUser.objects.get(email=s_info['email'])
            students_list.append(s_user)
            print(f"Student already exists: {s_info['email']}")

    # 5. Create Campus Drives
    drive1, _ = CampusDrive.objects.get_or_create(
        company=google_company,
        job_profile='Frontend Engineer',
        defaults={
            'job_description': 'Looking for a skilled React developer who is familiar with HTML, CSS, and TypeScript.',
            'selection_steps': 'Resume Screening, Coding Test, Technical Interview, HR Round',
            'ctc': 25.00,
            'vacancies': 5,
            'visit_date': datetime.date(2026, 7, 15),
            'last_apply_date': datetime.date(2026, 7, 10),
            'min_cgpa': 7.50,
            'allowed_branches': ['CSE', 'IT', 'ECE'],
            'max_backlogs': 0,
            'min_graduation_year': 2026,
            'is_active': True,
            'posted_by': tpo
        }
    )
    print("Created Google Campus Drive")

    drive2, _ = CampusDrive.objects.get_or_create(
        company=microsoft_company,
        job_profile='Software Development Engineer',
        defaults={
            'job_description': 'Build scalable applications and services. Strong fundamentals in C++, Java, or C#.',
            'selection_steps': 'Aptitude & Coding Test, Technical Panel Interview, HR Discussion',
            'ctc': 32.00,
            'vacancies': 10,
            'visit_date': datetime.date(2026, 8, 20),
            'last_apply_date': datetime.date(2026, 8, 15),
            'min_cgpa': 8.00,
            'allowed_branches': ['CSE', 'IT', 'ECE', 'EEE'],
            'max_backlogs': 0,
            'min_graduation_year': 2026,
            'is_active': True,
            'posted_by': tpo
        }
    )
    print("Created Microsoft Campus Drive")

    # 6. Create Applications
    # Alex Mercer (Student 1) applies to Google
    app1, created = Application.objects.get_or_create(
        student=students_list[0],
        drive=drive1,
        defaults={
            'status': 'INTERVIEWING',
            'notes': 'Strong background in web UI development. Performing well in test round.'
        }
    )
    if created:
        print("Created Application: Alex Mercer -> Google")

    # Charlie Smith (Student 3) applies to Google (Selected)
    app2, created = Application.objects.get_or_create(
        student=students_list[2],
        drive=drive1,
        defaults={
            'status': 'SELECTED',
            'notes': 'Excellent coding and system design skills. Offer rolled out.'
        }
    )
    if created:
        print("Created Application: Charlie Smith -> Google (Selected)")

    # Charlie Smith (Student 3) applies to Microsoft (Selected)
    app3, created = Application.objects.get_or_create(
        student=students_list[2],
        drive=drive2,
        defaults={
            'status': 'SELECTED',
            'notes': 'Top tier candidate.'
        }
    )
    if created:
        print("Created Application: Charlie Smith -> Microsoft (Selected)")

    # 7. Create Announcements
    announcement1, _ = Announcement.objects.get_or_create(
        title='Welcome to Placement Season 2026',
        defaults={
            'message': 'Welcome students! Please update your profiles, upload resumes, and double check your CGPA information.',
            'priority': 'MEDIUM',
            'created_by': tpo,
            'is_active': True
        }
    )
    print("Created Announcement")

    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed()
