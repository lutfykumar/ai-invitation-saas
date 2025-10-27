# Security Guidelines for AI Invitation SaaS

This document outlines the security best practices and controls you must implement when developing the AI-powered digital invitation SaaS. It aligns with core security principles—Security by Design, Least Privilege, Defense in Depth—and addresses the unique requirements of user authentication, AI-driven content, theme management, and public invitation sharing.

---

## 1. Authentication & Access Control

• **Robust User Authentication**
  - Use Better Auth (or comparable library) with secure defaults.
  - Enforce strong password policies: minimum 12 characters, mixed-case, digits, symbols.
  - Hash passwords with Argon2 or bcrypt + unique per-user salt.
  - Protect authentication endpoints with rate limiting (e.g., 5 attempts/min per IP).

• **Session Management**
  - Issue unpredictable, signed session tokens or JWTs.
  - Set short idle timeouts (e.g., 15 min) and absolute timeouts (e.g., 8 hours).
  - Use Secure, HttpOnly, SameSite=strict cookies for session storage.
  - Invalidate sessions on logout or password change.
  - Rotate refresh tokens regularly; reject token reuse.

• **Role-Based Access Control (RBAC)**
  - Define roles: `user`, `admin`, (future) `super-admin`.
  - Enforce server-side checks for each API route and page.
  - Ensure users can only CRUD their own invitations.
  - Protect admin theme/category management under `/app/admin` with strict role checks.

• **Multi-Factor Authentication (MFA)**
  - Offer optional MFA (TOTP or SMS) for privileged users (admins).
  - Require MFA for theme uploads and global configuration changes.

---

## 2. Input Validation & Output Encoding

• **Server-Side Validation**
  - Validate all incoming data on server: use Zod or Joi schemas.
  - Check invitation fields: date must be ≥ today, text length limits, category IDs exist.
  - Validate theme metadata: allowed CSS variables only, max file size for preview images (e.g., 2 MB).

• **Prevent Injection Attacks**
  - Use parameterized queries or Drizzle ORM APIs exclusively—no string concatenation.
  - For AI-generated text, sanitize output before storing or rendering.

• **Cross-Site Scripting (XSS) Mitigation**
  - Escape/encode all user-supplied data in React components.
  - Use `dangerouslySetInnerHTML` only on sanitized HTML (e.g., DOMPurify).
  - Define a strict Content Security Policy (CSP) in HTTP headers:
      ```
      Content-Security-Policy: default-src 'self';
                               script-src 'self' https://cdn.vercel.ai;
                               style-src 'self' 'unsafe-inline';
                               img-src 'self' data:;
                               frame-ancestors 'none';
                               object-src 'none';
      ```

• **Prevent Template Injection**
  - Do not interpolate untrusted strings into server-side templates.
  - Use typed template engines or React’s JSX for rendering.

---

## 3. Data Protection & Privacy

• **Encryption In Transit & At Rest**
  - Enforce HTTPS/TLS 1.2+ for all traffic (Next.js, APIs).
  - Use HSTS (`Strict-Transport-Security` header).
  - Encrypt stored PII (emails, phone numbers) in the database with AES-256.

• **Secret Management**
  - Store API keys, DB credentials, JWT secrets in a dedicated vault (e.g., AWS Secrets Manager).
  - Do not commit secrets to source control or environment files.

• **Minimal Data Retention**
  - Only keep invitation data for active accounts; purge old/inactive data per policy.
  - Implement GDPR/CCPA rights: data export and deletion endpoints.

• **Logging & Monitoring**
  - Log authentication events, role changes, admin actions.
  - Mask PII in logs.
  - Stream logs to a centralized, access-controlled SIEM.

---

## 4. API & Service Security

• **Rate Limiting & Throttling**
  - Apply per-user and per-IP rate limits on all public APIs (e.g., 100 req/min).

• **CORS Policy**
  - Restrict `Access-Control-Allow-Origin` to trusted frontend domains.
  - Preflight only necessary HTTP methods for each route.

• **Versioned API**
  - Prefix routes with `/api/v1/...`.
  - Deprecate old endpoints properly.

• **Authentication & Authorization**
  - Authenticate every `/api` route; reject missing or invalid tokens.
  - Authorize invitation edits by comparing `invitation.ownerId` with `session.userId`.

---

## 5. Web Application Security Hygiene

• **Security Headers**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=()` (unless explicitly used)

• **CSRF Protection**
  - For form submissions, implement anti-CSRF tokens (SameSite=strict helps but use synchronizer tokens).

• **Secure Cookies**
  - Mark cookies `Secure; HttpOnly; SameSite=Strict`.

• **Third-Party Scripts**
  - Use Subresource Integrity (SRI) for any CDN-loaded assets.
  - Audit and pin package versions in lockfiles.

---

## 6. Infrastructure & Configuration Management

• **Server Hardening**
  - Disable unused ports and services on production servers.
  - Remove default credentials; enforce SSH key auth.
  - Regularly patch OS and dependencies.

• **TLS Configuration**
  - Use A+ cipher suites, disallow TLS 1.0/1.1.
  - Automate cert renewal (e.g., Let’s Encrypt).

• **Container Security**
  - Run containers as non-root users.
  - Use minimal base images (e.g., Distroless).
  - Scan images for vulnerabilities before deployment.

• **CI/CD Pipeline**
  - Enforce branch protections and code reviews.
  - Run automated SCA and SAST tools on each PR.
  - Deploy only tagged releases; sign release artifacts.

---

## 7. Dependency Management

• **Library Vetting**
  - Only use actively maintained packages with no critical CVEs.
  - Subscribe to vulnerability alerts for core dependencies (Next.js, Drizzle, Tailwind).

• **Lockfiles & Pinning**
  - Commit `package-lock.json` or `pnpm-lock.yaml`.
  - Avoid wildcards in version ranges.

• **Regular Updates**
  - Schedule quarterly audits and dependency upgrades.
  - Test thoroughly before deploying updates.

---

## 8. AI-Specific Security Considerations

• **Prompt Injection Protection**
  - Sanitize user-supplied parameters before passing to the AI model.
  - Whitelist allowed prompt templates; avoid direct string concatenation of user input.

• **Model Output Validation**
  - Filter or truncate generated text to prevent embedded malicious scripts or unsafe instructions.
  - Log generation requests and responses for anomaly detection.

• **Privacy of AI Logs**
  - Scrub PII from AI request/response logs.
  - Encrypt log storage and restrict access.

---

## 9. Ongoing Monitoring & Incident Response

• **Real-Time Alerts**
  - Detect abnormal authentication patterns or rate-limit breaches.

• **Incident Playbook**
  - Define roles and steps for breach detection, containment, eradication, and recovery.
  - Notify users and regulators per legal requirements.

• **Periodic Security Reviews**
  - Conduct annual penetration tests.
  - Update this guideline based on new threats or learnings.

---

Adhering to these guidelines will help ensure that your AI Invitation SaaS is secure by design, resistant to common web threats, and compliant with data protection regulations. If you have questions or encounter edge cases, please escalate to your security architect for review.