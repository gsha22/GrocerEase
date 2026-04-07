# GrocerEase — Minor's PII Policy

**Effective date:** 2026-04-05
**Owners:** AvalonMei (Eric Du), evelyn-lo (Evelyn)

---

## 1. Scope

This policy governs how GrocerEase handles Personally Identifying Information (PII) that may belong to a person under the age of 18 (a "minor"). It applies to all long-term storage (PostgreSQL database), all team members with production access, and all third-party services that process GrocerEase user data.

---

## 2. Platform intent

GrocerEase is a B2B platform for grocery store owners and shoppers. Store owner accounts require operating a retail business, which presupposes legal adult status (18+ years of age in the United States). GrocerEase does not target, market to, or knowingly collect PII from minors.

---

## 3. Data collected and age verification

The store-owner registration form collects:
- Email address
- Full name
- Password (stored as a bcrypt hash)

**No age or date-of-birth field is collected.** GrocerEase does not technically verify that the registrant is 18 or older. Compliance with the age requirement is achieved through:

1. The Terms of Service (to be implemented), which require the user to affirm they are 18 or older at registration.
2. The platform's nature as a business-management tool, which is not attractive or useful to minors.

---

## 4. Discovery procedure

If a team member discovers or has reason to believe that a store owner account belongs to a minor:

1. **Immediately suspend the account** by removing the `store_owners` row's associated store from the published index (`is_published = false`) so shoppers can no longer see the store.
2. **Notify both owners** (AvalonMei and evelyn-lo) within 24 hours.
3. **Delete the account** within 72 hours of discovery:
   - Delete the `store_owners` row (cascades to `password_reset_tokens` and `owner_notifications`).
   - Delete the associated `stores` row and all child rows (`items`, `deals`, `fresh_updates`).
   - Verify deletion with a direct database query.
4. **Log the incident** in the project's incident log with the date of discovery, the date of deletion, and the team member who performed the deletion. Do not log the minor's PII in the incident entry.
5. If the minor provided contact information, send a single notification that the account was removed in accordance with our age policy, and do not retain the contact information.

---

## 5. Guardian consent

GrocerEase does not solicit guardian consent because the platform is not directed at minors. If a minor has nonetheless registered:

- No consent was ever solicited.
- The account is deleted under the discovery procedure above.
- No ongoing data retention is permitted; deletion is the only appropriate action.

---

## 6. Access controls for production PII

Access to production data (Vercel project, database credentials, GitHub repository secrets) is limited to:

| Team member | GitHub handle | Access level |
|---|---|---|
| Eric Du | `AvalonMei` | Full production access |
| Evelyn | `evelyn-lo` | Full production access |

All production access requires multi-factor authentication on both GitHub and Vercel.

---

## 7. Policy for team members convicted or suspected of child abuse

If any person with production access (as listed in Section 6) is convicted of, charged with, or under active law enforcement investigation for child abuse or any crime against a minor:

1. **Immediately revoke all production access**: remove the person from the Vercel project, rotate all shared secrets (`NEXTAUTH_SECRET`, `DATABASE_URL`, any API keys), and remove the person from the GitHub repository.
2. **Rotate database credentials** so any previously known connection strings are invalidated.
3. **Document the access revocation** with a timestamp in the project incident log.
4. If no other team member with full access remains, escalate to the course staff or project supervisor to arrange a handover of credentials.

This policy applies regardless of whether the person has been formally convicted; a credible ongoing investigation is sufficient to trigger immediate access revocation.

---

## 8. Retention and deletion

Store owner PII (email, name, password hash) is retained for as long as the account is active. There is currently no automated account expiry. When an account is deleted (voluntarily or under the discovery procedure above), all PII is removed from `store_owners`, `password_reset_tokens`, and `owner_notifications` via database cascade deletes.

Auth audit log entries (`auth_audit_logs`) do not store plaintext PII — they store a one-way SHA-256 hash of the email address and the plaintext IP address. These records are retained indefinitely for security purposes and are not subject to the same deletion procedures as identity PII, though they may be purged on request.

---

## 9. Review schedule

This policy must be reviewed and updated:
- At the start of each semester / project phase.
- Any time the data model changes in a way that affects PII storage.
- Any time a team member's access status changes.
