# User Data Protection Policy

**Jeeva Learning Platform - Mobile Application**

**Effective Date:** November 21, 2025  
**Last Updated:** November 21, 2025

---

## 1. Executive Summary

Jeeva Learning is committed to protecting your personal data with industry-leading security practices, comprehensive data governance, and transparent communication. This policy details how we safeguard your information from collection to deletion.

---

## 2. Data Protection Principles

We operate on the following core principles:

### 2.1 Privacy by Design
- Data protection is built into our systems from the start
- Minimal data collection - we only collect what's necessary
- Default settings maximize your privacy
- Regular privacy impact assessments

### 2.2 Data Minimization
- Collect only essential data for service delivery
- Don't collect unnecessary information
- Delete data when no longer needed
- Aggregate data where possible

### 2.3 Transparency
- Clear communication about data practices
- You know what we collect and why
- Easy-to-find privacy information
- No hidden or sneaky practices

### 2.4 User Control
- You control your data
- Access, delete, or export your information
- Opt-out of non-essential processing
- Simple data management tools

### 2.5 Security First
- Encrypt all data in transit and at rest
- Regular security audits and testing
- Incident response procedures
- Security-focused culture

---

## 3. Types of Data We Protect

### 3.1 Personal Identifiers
- Full name
- Email address
- Phone number
- Account ID/UUID
- Profile picture

### 3.2 Account Information
- Username and password (encrypted)
- Payment method information
- Billing address
- Account preferences
- Account history

### 3.3 Learning & Progress Data
- Questions answered and responses
- Quiz and exam scores
- Time spent on modules
- Progress through content
- Learning performance data
- Mock exam results

### 3.4 Communication Data
- Chat messages with JeevaBot
- Support tickets and responses
- Email communications
- Feedback and survey responses
- Notification preferences

### 3.5 Device & Usage Data
- Device identifier (UDID, IDFA)
- Device type and model
- Operating system version
- App version
- IP address and location
- Browsing behavior within app

### 3.6 Sensitive Data (Higher Protection)
- Payment card details (NOT stored by us)
- Biometric data (if used for authentication)
- Health information (if related to learning needs)
- Sexual orientation or religious beliefs (if voluntarily shared)

---

## 4. Data Protection by Processing Activity

### 4.1 During Registration

**What We Do:**
- Collect name, email, password
- Verify email address
- Encrypt password immediately
- Create secure account

**Your Control:**
- Provide accurate information
- Choose password strength
- Review privacy policy before accepting

---

### 4.2 During Learning Activity

**What We Do:**
- Track questions answered
- Record assessment scores
- Monitor time spent per topic
- Calculate progress percentage
- Store learning history

**Your Control:**
- View your progress anytime
- Request data export
- Request data deletion
- Review learning history

---

### 4.3 During Payment Processing

**What We Do:**
- **We DON'T:**
  - Store full credit card numbers
  - Store CVV codes
  - Store card expiration dates
  
- **We DO:**
  - Send data to Stripe/Razorpay (PCI-compliant)
  - Store transaction reference
  - Store purchase history
  - Store receipt/invoice data

**Your Control:**
- View payment history
- Download invoices
- Request payment records deletion (post-legal-hold)

---

### 4.4 During AI Interactions

**What We Do:**
- Store chat messages with JeevaBot
- Process text to generate responses
- Improve AI quality over time
- Anonymize data for training (optional)

**Your Control:**
- View chat history
- Delete individual messages
- Clear all chat history
- Opt-out of AI improvement (data not used for training)

---

### 4.5 During Push Notifications

**What We Do:**
- Store device push token
- Log notification send status
- Track notification delivery
- Track read status
- Store notification history

**Your Control:**
- Enable/disable notifications in Settings
- Choose notification types
- Set quiet hours
- View notification history
- Request token deletion

---

## 5. Data Security Infrastructure

### 5.1 Encryption Standards

#### In Transit (Data Moving)
- **Protocol:** TLS 1.3+
- **Certificate:** SHA-256
- **Application:** All connections encrypted
- **Enforcement:** HSTS (HTTP Strict Transport Security)

#### At Rest (Data Stored)
- **Algorithm:** AES-256
- **Key Management:** Separate key per data type
- **Storage:** Encrypted database at Supabase
- **Backups:** Encrypted backups stored separately

---

### 5.2 Access Controls

#### Role-Based Access
- **Admin:** Can manage content and users
- **Moderator:** Can review and approve content
- **Editor:** Can create content
- **User:** Can only access own data
- **System:** Automated processes only access needed data

#### Multi-Factor Authentication
- Admin accounts: Required 2FA
- User accounts: Optional 2FA available
- API access: Token-based authentication

#### Session Management
- Sessions expire after 30 minutes of inactivity
- Logout clears all session data
- Concurrent sessions: Limited to prevent hijacking

---

### 5.3 Network Security

#### Firewalls
- Perimeter firewall blocks unauthorized access
- Database firewall restricts queries
- WAF (Web Application Firewall) protects against attacks

#### Intrusion Detection
- Real-time monitoring for suspicious activity
- Automated alerts for anomalies
- Incident response team on standby

#### DDoS Protection
- DDoS mitigation services
- Traffic filtering and rate limiting
- Automatic backup routing

---

### 5.4 Physical Security

#### Data Center Security
- Biometric access controls
- Security guards and CCTV
- Restricted zones with multi-layer security
- Environmental controls (fire, flooding, temperature)

#### Backup Locations
- Geographically distributed
- Secure vaults with restricted access
- Climate-controlled environments
- Redundant power systems

---

## 6. Employee & Third-Party Data Protection

### 6.1 Employee Access

**Who Has Access:**
- Developers (limited to necessary code/systems)
- Ops team (infrastructure/monitoring)
- Support staff (customer tickets only)
- Executives (aggregated reports only)

**Access Control:**
- Principle of least privilege (minimum needed access)
- Access logs for audit trails
- Termination immediately revokes access

### 6.2 Confidentiality Agreements

All staff sign:
- Non-disclosure agreements (NDAs)
- Data protection agreements
- Code of conduct regarding data handling

### 6.3 Third-Party Vendor Management

**Before Sharing:**
- Vendor risk assessment
- Data protection audit
- Security certifications review
- Contract includes data protection terms

**Third Parties We Work With:**
- **Supabase** (database): SOC 2 certified
- **Stripe/Razorpay** (payments): PCI-DSS compliant
- **Expo** (push): Privacy agreement signed
- **Resend** (email): GDPR compliant
- **Google AI** (JeevaBot): Data processing agreement

**Restrictions:**
- Vendors cannot sell or share your data
- Contractual obligations enforced
- Regular audit of vendor compliance

---

## 7. Data Breach Response

### 7.1 Prevention Measures

- Regular penetration testing
- Vulnerability scanning
- Security patch management
- Employee security training
- Incident response drills

### 7.2 Detection & Monitoring

- 24/7 security monitoring
- Automated anomaly detection
- Real-time threat monitoring
- Database activity monitoring
- Log aggregation and analysis

### 7.3 Incident Response Plan

#### If Breach Occurs:

**Immediate (0-24 hours):**
1. Containment - isolate affected systems
2. Investigation - determine scope
3. Preservation - collect evidence
4. Notification team - activate response

**Short-term (24-72 hours):**
1. Full assessment of what was breached
2. Affected users identified
3. Notification template prepared
4. Regulatory bodies notified

**Notification (Legal Requirement):**
- Affected users notified via email
- Details of what was compromised
- Steps they should take
- Credit monitoring offered (if applicable)
- Regulatory bodies notified as required

**Long-term:**
- Root cause analysis
- System improvements
- Enhanced monitoring
- Lessons learned documented
- Regular security updates

---

## 8. Data Subject Rights (GDPR/CCPA)

### 8.1 Access Right
- **What:** Get a copy of your data
- **Request:** Go to Settings → Data Management → Export
- **Timeline:** 30 days
- **Format:** JSON or CSV file

### 8.2 Rectification Right
- **What:** Correct inaccurate data
- **Request:** Settings → Edit Profile or contact support
- **Timeline:** 30 days
- **Proof:** May be asked for verification

### 8.3 Erasure Right ("Right to be Forgotten")
- **What:** Delete your personal data
- **Request:** Settings → Data Management → Delete Account
- **Exceptions:** Legally required data retention (tax records)
- **Timeline:** 30 days post-legal-hold

### 8.4 Restrict Processing Right
- **What:** Limit how we use your data
- **Request:** Email privacy@jeeva.app
- **Scope:** Marketing, analytics, optional processing
- **Timeline:** Implemented within 30 days

### 8.5 Data Portability Right
- **What:** Receive your data in portable format
- **Request:** Settings → Data Management → Export
- **Format:** CSV, JSON, or similar
- **Timeline:** 30 days

### 8.6 Withdraw Consent Right
- **What:** Stop processing based on consent
- **Request:** Marketing opt-out or privacy settings
- **Scope:** Marketing emails, analytics, optional features
- **Timeline:** Immediate

### 8.7 Object Right
- **What:** Oppose certain processing
- **Request:** Email privacy@jeeva.app with reason
- **Scope:** Profiling, marketing, automated decisions
- **Timeline:** Review within 30 days

---

## 9. Data Retention Schedule

### 9.1 Retention by Data Type

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| Account data | Until deletion | Active account |
| Learning progress | Until deletion | User records |
| Payment records | 7 years | Tax & legal |
| Tax invoices | 6-7 years | Legal requirement |
| Support tickets | 2 years | Support history |
| Chat history | Until deletion | User records |
| Analytics (aggregated) | Indefinitely | Service improvement |
| Device tokens | Until revocation | Push notifications |
| IP logs | 90 days | Security |
| System logs | 30 days | Debugging |
| Failed login attempts | 30 days | Security |
| Account deletion requests | 90 days | Compliance |

### 9.2 Automatic Deletion

- Inactive accounts (3+ years): Marked for deletion
- Abandoned carts: Deleted after 90 days
- Device tokens: Deleted after logout
- Session data: Deleted after logout or expiry
- Cache: Cleared regularly

### 9.3 Manual Deletion

You can request deletion:
- Individual entries (chat messages, device tokens)
- All personal data (account deletion)
- Specific data types (learning history, payments)

---

## 10. Data Protection During Special Circumstances

### 10.1 Account Suspension/Termination

**Your data remains:**
- Encrypted and inaccessible
- Stored for legal hold period
- Never shared or sold

**After suspension lift:**
- All data available again
- Nothing deleted without request

**After termination:**
- 90-day grace period to reactivate
- Then deleted per retention schedule

### 10.2 Law Enforcement Requests

**If police/government requests data:**
1. We verify request legitimacy
2. We challenge overly broad requests
3. We notify you when legally permitted
4. We provide minimum necessary data
5. We document all requests

**We won't provide without legal process:**
- Subpoena
- Court order
- Search warrant
- Lawful government authority

### 10.3 Data Breaches

See Section 7: Data Breach Response for full details

---

## 11. International Data Transfers

### 11.1 Transfer Mechanisms

**For EU/UK users sending data internationally:**
- Standard Contractual Clauses (SCC)
- Data Processing Agreements (DPA)
- Privacy Shield/Data Privacy Framework
- Your consent in Privacy Policy

### 11.2 Countries Where Data Stored

- **Primary:** United States (Supabase)
- **Backup:** EU servers (Supabase)
- **Processing:** Multiple jurisdictions as needed
- **No data:** Shared with China, Russia, or state-level surveillance countries

---

## 12. Automated Decision-Making & Profiling

### 12.1 What We Do

**Automated:**
- Personalized learning recommendations
- Exam readiness score calculation
- Content suggestion algorithm
- Cheat detection in exams
- Spam/abuse detection

**NOT automated:**
- Account suspension
- Content rejection
- Payment authorization
- Legal decisions

### 12.2 Your Rights

- Right to know we're using automated decisions
- Right to human review of automated decisions
- Right to object to profiling
- Right to explanation of how scores/decisions calculated

---

## 13. Cookies & Tracking Technologies

### 13.1 Types of Cookies Used

| Cookie Type | Purpose | Duration | Control |
|------------|---------|----------|---------|
| Session | Keep you logged in | Session | Automatic |
| Preference | Remember settings | 1 year | Settings |
| Analytics | Track app usage | 2 years | Opt-out |
| Security | Fraud prevention | Session | System-only |

### 13.2 Your Control

- Disable cookies in device settings
- Clear cookies anytime
- Opt-out of analytics
- Deny tracking in first-use prompt

---

## 14. Data Protection by Jurisdiction

### 14.1 GDPR (EU/UK) Compliance
- Legal basis documented
- Data Processing Agreements with vendors
- Data Protection Impact Assessment completed
- DPO contact available
- 14-day cooling-off period honored
- Rights fully supported (access, erasure, portability, etc.)

### 14.2 CCPA (California) Compliance
- Consumer rights fully supported
- Opt-out mechanisms provided
- "Do Not Sell" honored
- Deletion requests processed
- Privacy policy specificity

### 14.3 COPPA (US Children) Compliance
- Age verification (18+)
- Parental consent if <13 identified
- Child data deleted upon discovery
- No marketing to children

### 14.4 UK Data Protection Act 2018
- Lawful basis for processing
- DPA compliance
- Right to independent remedy
- Enforcement by ICO

---

## 15. Regular Audits & Assessments

### 15.1 Security Audits
- Quarterly internal audits
- Annual external penetration testing
- Continuous vulnerability scanning
- Annual security certifications (SOC 2)

### 15.2 Privacy Audits
- Annual DPIA (Data Protection Impact Assessment)
- Regular review of data practices
- Vendor compliance checks
- Incident analysis and improvement

### 15.3 Compliance Reviews
- Regular GDPR/CCPA compliance checks
- Policy update reviews
- Regulatory change monitoring
- Certification maintenance

---

## 16. Contact & Escalation

### 16.1 Data Protection Officer

**Email:** dpo@jeeva.app  
**Address:** [Your UK Address]  
**Response Time:** 14 days

**Reach Out For:**
- Data protection complaints
- Privacy policy questions
- Data subject rights requests
- DPIA requests

### 16.2 Privacy Team

**Email:** privacy@jeeva.app  
**Response Time:** 30 days

**Reach Out For:**
- General privacy questions
- Data processing inquiries
- Vendor assessment questions

### 16.3 Regulatory Bodies

**If we don't resolve your concern:**

**UK:** Information Commissioner's Office (ICO)  
**EU:** Your local data protection authority  
**California:** California Attorney General  

---

## 17. Policy Updates

### 17.1 Changes & Notifications

- Policy changes effective 30 days after notice (major changes)
- Minor clarifications effective immediately
- Email notification for material changes
- In-app notification banner
- Updated policy version with date

### 17.2 Your Options

If you disagree with policy changes:
- You have 30 days to object
- Request data deletion before changes take effect
- Contact us to discuss concerns

---

## 18. Summary: Your Data Protection at Jeeva Learning

✅ **Encryption:** All data encrypted in transit and at rest  
✅ **Minimal Collection:** We collect only essential data  
✅ **User Control:** You control your data and can delete anytime  
✅ **No Selling:** We never sell your data to third parties  
✅ **Transparent:** Clear policies and easy-to-find information  
✅ **Secure Vendors:** All third parties security-vetted  
✅ **Regular Audits:** Annual security and privacy audits  
✅ **Quick Response:** Breach notification within 72 hours  
✅ **Your Rights:** Full GDPR, CCPA, COPPA compliance  
✅ **Support:** Dedicated privacy team to help  

---

**By using Jeeva Learning, you agree to this User Data Protection Policy.**

**Your data privacy is our top priority.**

---

© 2025 Jeeva Learning. All Rights Reserved.
