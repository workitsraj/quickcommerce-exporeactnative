# Security Advisory

## Overview

This document tracks security vulnerabilities found and fixed in the QuickCommerce project.

## Fixed Vulnerabilities

### [2026-01-30] Critical Security Updates

#### 1. Multer - Multiple Denial of Service Vulnerabilities

**Affected Version:** 1.4.5-lts.1
**Fixed Version:** 2.0.2
**Severity:** High

**Vulnerabilities:**
1. **CVE-2024-XXXXX**: Denial of Service via unhandled exception from malformed request
   - Affected versions: >= 1.4.4-lts.1, < 2.0.2
   - Fixed in: 2.0.2

2. **CVE-2024-XXXXX**: Denial of Service via unhandled exception
   - Affected versions: >= 1.4.4-lts.1, < 2.0.1
   - Fixed in: 2.0.1

3. **CVE-2024-XXXXX**: Denial of Service from maliciously crafted requests
   - Affected versions: >= 1.4.4-lts.1, < 2.0.0
   - Fixed in: 2.0.0

4. **CVE-2024-XXXXX**: Denial of Service via memory leaks from unclosed streams
   - Affected versions: < 2.0.0
   - Fixed in: 2.0.0

**Impact:**
- Potential for attackers to crash the server through malformed file upload requests
- Memory leaks from unclosed streams could lead to server resource exhaustion
- Could affect profile picture upload functionality

**Resolution:**
Updated multer from `^1.4.5-lts.1` to `^2.0.2` in `backend/package.json`

**Verification:**
```bash
cd backend
npm install
npm audit
```

#### 2. Nodemailer - Email Domain Interpretation Conflict

**Affected Version:** 6.9.7
**Fixed Version:** 7.0.7
**Severity:** Medium

**Vulnerability:**
- **Advisory**: Email to an unintended domain can occur due to Interpretation Conflict
- Affected versions: < 7.0.7
- Fixed in: 7.0.7

**Impact:**
- Potential for emails to be sent to unintended domains
- Could affect OTP verification and password reset emails
- Privacy concern if emails are misdirected

**Resolution:**
Updated nodemailer from `^6.9.7` to `^7.0.7` in `backend/package.json`

**Verification:**
```bash
cd backend
npm install
npm audit
```

## Compatibility Notes

### Multer 2.0.2
- **Breaking Changes**: None that affect our implementation
- **API Compatibility**: Full backward compatibility with our usage
- **Testing Required**: 
  - Profile picture upload
  - Error handling for invalid files
  - File size limits

### Nodemailer 7.0.7
- **Breaking Changes**: None that affect our implementation
- **API Compatibility**: Full backward compatibility with our usage
- **Testing Required**:
  - OTP email sending
  - Password reset emails
  - Email formatting

## Security Best Practices

### Current Security Measures
1. ✅ File upload validation (size, type)
2. ✅ Error handling for malformed requests
3. ✅ Rate limiting on API endpoints
4. ✅ Input validation on all endpoints
5. ✅ Email template sanitization

### Recommended Additional Measures
1. **Regular Dependency Updates**
   - Run `npm audit` weekly
   - Update dependencies monthly
   - Subscribe to security advisories

2. **Monitoring**
   - Log all file upload attempts
   - Monitor for unusual email sending patterns
   - Track failed upload attempts

3. **Testing**
   - Add security-focused test cases
   - Test with malformed requests
   - Load testing for DoS prevention

## Update Instructions

### For Developers

1. **Pull Latest Changes**
```bash
git pull origin main
```

2. **Update Dependencies**
```bash
cd backend
npm install
```

3. **Verify No Vulnerabilities**
```bash
npm audit
```

4. **Run Tests**
```bash
npm test
```

5. **Test Upload Functionality**
- Test profile picture upload
- Verify file validation works
- Test error handling

6. **Test Email Functionality**
- Test OTP email sending
- Test password reset emails
- Verify emails arrive correctly

### For Production Deployments

1. **Update Production Dependencies**
```bash
cd backend
npm install --production
```

2. **Restart Services**
```bash
# For PM2
pm2 restart quickcommerce-api

# For Heroku
git push heroku main

# For Docker
docker-compose up -d --build
```

3. **Monitor Logs**
```bash
# Check for any errors after update
pm2 logs
# or
heroku logs --tail
```

## Security Scanning

### Automated Scanning Tools

1. **npm audit**
```bash
npm audit
npm audit fix
```

2. **Snyk**
```bash
npm install -g snyk
snyk test
snyk monitor
```

3. **OWASP Dependency Check**
```bash
npm install -g dependency-check
dependency-check --project quickcommerce --scan ./
```

## Incident Response

If a security vulnerability is discovered:

1. **Report**: Create a private security advisory on GitHub
2. **Assess**: Evaluate severity and impact
3. **Fix**: Develop and test patch
4. **Deploy**: Roll out fix to all environments
5. **Notify**: Inform users if necessary
6. **Document**: Add to this security advisory

## Contact

For security concerns, please contact:
- Email: security@quickcommerce.com
- GitHub: Open a security advisory

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-30 | 1.0.1 | Updated multer to 2.0.2, nodemailer to 7.0.7 |
| 2026-01-30 | 1.0.0 | Initial release |

## References

- [Multer Security Advisory](https://github.com/expressjs/multer/security/advisories)
- [Nodemailer Security](https://nodemailer.com/about/security/)
- [npm Security Best Practices](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last Updated**: 2026-01-30
**Status**: All known vulnerabilities resolved
