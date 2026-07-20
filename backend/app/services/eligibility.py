"""
Eligibility Engine – calculates if a student qualifies for a scholarship.
Returns: "eligible" | "partial" | "not_eligible" + reasons list
"""
from typing import Tuple, List
from datetime import datetime
from app.models.user import User
from app.models.scholarship import Scholarship


def check_eligibility(user: User, scholarship: Scholarship) -> Tuple[str, List[str]]:
    """
    Returns (status, reasons) where status is one of:
      'eligible'     – meets all criteria
      'partial'      – meets most but missing 1-2 soft requirements
      'not_eligible' – fails one or more hard criteria
    """
    reasons: List[str] = []
    hard_failures: List[str] = []
    soft_warnings: List[str] = []

    # --- CGPA Check ---
    if scholarship.min_cgpa is not None:
        if user.cgpa is None:
            soft_warnings.append("CGPA not provided in your profile")
        elif user.cgpa < scholarship.min_cgpa:
            hard_failures.append(
                f"Minimum CGPA required: {scholarship.min_cgpa} (yours: {user.cgpa:.2f})"
            )

    # --- Income Check ---
    if scholarship.max_income is not None:
        if user.family_income is None:
            soft_warnings.append("Family income not provided in your profile")
        elif user.family_income > scholarship.max_income:
            hard_failures.append(
                f"Family income exceeds limit of ₹{scholarship.max_income:,.0f}/year"
            )

    # --- Category Check ---
    if scholarship.eligible_categories:
        if user.category is None:
            soft_warnings.append("Category not set in your profile")
        elif user.category not in scholarship.eligible_categories:
            hard_failures.append(
                f"Category '{user.category}' not eligible. Required: {', '.join(scholarship.eligible_categories)}"
            )

    # --- State Check ---
    if scholarship.eligible_states:
        if user.state is None:
            soft_warnings.append("State not set in your profile")
        elif user.state not in scholarship.eligible_states:
            hard_failures.append(
                f"Scholarship only available in: {', '.join(scholarship.eligible_states)}"
            )

    # --- Course Check ---
    if scholarship.eligible_courses:
        if user.course is None:
            soft_warnings.append("Course not set in your profile")
        else:
            course_match = any(
                c.lower() in user.course.lower() or user.course.lower() in c.lower()
                for c in scholarship.eligible_courses
            )
            if not course_match:
                hard_failures.append(
                    f"Course '{user.course}' not eligible. Eligible: {', '.join(scholarship.eligible_courses)}"
                )

    # --- Gender Check ---
    if scholarship.eligible_gender and scholarship.eligible_gender != "all":
        if user.gender is None:
            soft_warnings.append("Gender not set in your profile")
        elif user.gender.lower() != scholarship.eligible_gender.lower():
            hard_failures.append(
                f"Scholarship is for {scholarship.eligible_gender} students only"
            )

    # --- Minority Check ---
    if scholarship.minority_only and not user.is_minority:
        hard_failures.append("Scholarship is for minority students only")

    # --- Disability Check ---
    if scholarship.disability_only and not user.has_disability:
        hard_failures.append("Scholarship is for students with disabilities only")

    # --- Sports Quota ---
    if scholarship.sports_quota and not user.has_sports_quota:
        soft_warnings.append("Scholarship prefers students with sports quota")

    # --- NCC ---
    if scholarship.ncc_required and not user.has_ncc:
        hard_failures.append("NCC certification required for this scholarship")

    # --- Year of Study Check ---
    if scholarship.year_of_study:
        if user.year_of_study is None:
            soft_warnings.append("Year of study not set in your profile")
        elif user.year_of_study not in scholarship.year_of_study:
            hard_failures.append(
                f"Year of study '{user.year_of_study}' not eligible. Eligible years: {', '.join(str(y) for y in scholarship.year_of_study)}"
            )

    # --- Max Age Check ---
    if scholarship.max_age is not None:
        if user.dob is None:
            soft_warnings.append("Date of birth not set in your profile to check age limit")
        else:
            try:
                # Basic age calculation from dob string (YYYY-MM-DD or similar)
                # Let's parse YYYY-MM-DD or standard formats
                import dateutil.parser
                birth_date = dateutil.parser.parse(user.dob)
                today = datetime.utcnow()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                if age > scholarship.max_age:
                    hard_failures.append(
                        f"Age exceeds limit of {scholarship.max_age} years (yours: {age})"
                    )
            except Exception:
                soft_warnings.append("Could not parse date of birth to check age limit")

    # Determine overall status
    all_reasons = hard_failures + soft_warnings
    if hard_failures:
        status = "not_eligible"
        reasons = hard_failures
    elif soft_warnings:
        status = "partial"
        reasons = soft_warnings
    else:
        status = "eligible"
        reasons = ["You meet all eligibility criteria!"]

    return status, reasons


def get_missing_documents(user_documents: list, required_docs: list) -> List[str]:
    """Return list of required document types that haven't been uploaded or verified."""
    uploaded_types = {doc.doc_type for doc in user_documents if doc.status != "rejected"}
    return [doc for doc in (required_docs or []) if doc not in uploaded_types]
