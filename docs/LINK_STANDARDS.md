# 🔗 Link Standards - AgriChain Finance

## Professional Link Guidelines

This document outlines the link standards used throughout the AgriChain Finance application.

## 1. Internal Links (Next.js)

### Use Next.js Link Component
```tsx
import Link from 'next/link'

// ✅ Good
<Link href="/marketplace">Marketplace</Link>

// ❌ Bad
<a href="/marketplace">Marketplace</a>
```

### Benefits:
- Client-side navigation (faster)
- Prefetching
- No full page reload
- Better SEO

## 2. External Links

### Always Include Security Attributes
```tsx
// ✅ Good - External link with security
<a 
  href="https://docs.hedera.com" 
  target="_blank" 
  rel="noopener noreferrer"
>
  Hedera Docs
</a>

// ❌ Bad - Missing security attributes
<a href="https://docs.hedera.com" target="_blank">
  Hedera Docs
</a>
```

### Security Attributes Explained:

**`target="_blank"`**
- Opens link in new tab
- Better UX for external sites

**`rel="noopener"`**
- Prevents new page from accessing `window.opener`
- Security protection against tabnabbing

**`rel="noreferrer"`**
- Prevents referrer information from being passed
- Privacy protection

## 3. Accessibility

### Always Include aria-label for Icon Links
```tsx
// ✅ Good
<a 
  href="https://github.com/user/repo" 
  target="_blank" 
  rel="noopener noreferrer"
  aria-label="GitHub Repository"
>
  <Github className="w-6 h-6" />
</a>

// ❌ Bad - No aria-label
<a href="https://github.com/user/repo">
  <Github className="w-6 h-6" />
</a>
```

### Use Descriptive Link Text
```tsx
// ✅ Good
<Link href="/marketplace">View all available loans</Link>

// ❌ Bad
<Link href="/marketplace">Click here</Link>
```

## 4. Email Links

```tsx
// ✅ Good
<a href="mailto:hello@agrichain.finance">
  hello@agrichain.finance
</a>

// With subject and body
<a href="mailto:hello@agrichain.finance?subject=Support%20Request&body=Hello">
  Contact Support
</a>
```

## 5. Dynamic Routes

### Loan Detail Pages
```tsx
// ✅ Good - Dynamic route
<Link href={`/loan/${loanId}`}>
  View Loan Details
</Link>

// URL structure: /loan/0, /loan/1, etc.
```

## 6. URL Structure

### RESTful Conventions
```
✅ Good URL Structure:
/marketplace              - List all loans
/loan/[id]               - Single loan detail
/farmer                  - Farmer dashboard
/investor                - Investor dashboard
/about                   - About page
/privacy                 - Privacy policy
/terms                   - Terms of service

❌ Bad URL Structure:
/marketplace.html
/loan?id=123
/farmer_dashboard
/aboutUs
```

## 7. Navigation Links

### Navbar Links
```tsx
<nav>
  <Link href="/">Home</Link>
  <Link href="/marketplace">Marketplace</Link>
  <Link href="/farmer">Farmer</Link>
  <Link href="/investor">Investor</Link>
  <Link href="/about">About</Link>
</nav>
```

### Active Link Styling
```tsx
import { usePathname } from 'next/navigation'

const pathname = usePathname()

<Link 
  href="/marketplace"
  className={pathname === '/marketplace' ? 'active' : ''}
>
  Marketplace
</Link>
```

## 8. Button vs Link

### When to Use Link
```tsx
// ✅ Navigation to another page
<Link href="/marketplace" className="btn-primary">
  Go to Marketplace
</Link>
```

### When to Use Button
```tsx
// ✅ Action (submit, toggle, etc.)
<button onClick={handleSubmit} className="btn-primary">
  Submit Form
</button>
```

## 9. Social Media Links

### Standard Format
```tsx
const socialLinks = {
  github: 'https://github.com/yourusername/agrichain-finance',
  twitter: 'https://twitter.com/agrichain',
  email: 'mailto:hello@agrichain.finance'
}

<a 
  href={socialLinks.github}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="GitHub Repository"
>
  <Github />
</a>
```

## 10. Footer Links

### Legal Pages
```tsx
<footer>
  <Link href="/privacy">Privacy Policy</Link>
  <Link href="/terms">Terms of Service</Link>
  <Link href="/cookies">Cookie Policy</Link>
</footer>
```

## 11. Breadcrumbs

### Implementation
```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex gap-2">
    <li><Link href="/">Home</Link></li>
    <li>/</li>
    <li><Link href="/marketplace">Marketplace</Link></li>
    <li>/</li>
    <li>Loan #123</li>
  </ol>
</nav>
```

## 12. Back Navigation

### Back Button
```tsx
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const router = useRouter()

// Option 1: Router back
<button onClick={() => router.back()}>
  <ArrowLeft /> Back
</button>

// Option 2: Specific link
<Link href="/marketplace">
  <ArrowLeft /> Back to Marketplace
</Link>
```

## 13. Loading States

### Link with Loading
```tsx
const [loading, setLoading] = useState(false)

<Link 
  href="/marketplace"
  onClick={() => setLoading(true)}
  className={loading ? 'opacity-50 pointer-events-none' : ''}
>
  {loading ? 'Loading...' : 'View Marketplace'}
</Link>
```

## 14. SEO Best Practices

### Canonical URLs
```tsx
// In layout.tsx or page.tsx
<head>
  <link rel="canonical" href="https://agrichain.finance/marketplace" />
</head>
```

### Structured Data
```tsx
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": "https://agrichain.finance/marketplace",
    "name": "Loan Marketplace"
  })}
</script>
```

## 15. Testing Links

### Checklist
- [ ] All internal links use Next.js Link component
- [ ] External links have `target="_blank"` and `rel="noopener noreferrer"`
- [ ] Icon links have `aria-label`
- [ ] Links have descriptive text
- [ ] Dynamic routes work correctly
- [ ] No broken links (404)
- [ ] Links are keyboard accessible
- [ ] Links have hover states
- [ ] Mobile links are touch-friendly (min 44x44px)

## 16. Common Mistakes to Avoid

❌ **Don't:**
- Use `<a>` for internal navigation
- Forget security attributes on external links
- Use "click here" as link text
- Make links too small on mobile
- Forget to test all links
- Use JavaScript for simple navigation

✅ **Do:**
- Use Next.js Link for internal navigation
- Add security attributes to external links
- Use descriptive link text
- Make links accessible
- Test on all devices
- Follow RESTful URL conventions

## 17. Performance

### Prefetching
```tsx
// Next.js automatically prefetches visible links
<Link href="/marketplace" prefetch={true}>
  Marketplace
</Link>

// Disable prefetch if needed
<Link href="/marketplace" prefetch={false}>
  Marketplace
</Link>
```

## 18. Analytics

### Track Link Clicks
```tsx
<Link 
  href="/marketplace"
  onClick={() => {
    // Track with analytics
    analytics.track('marketplace_link_clicked')
  }}
>
  Marketplace
</Link>
```

---

## Summary

Following these link standards ensures:
- ✅ Better security
- ✅ Improved accessibility
- ✅ Enhanced SEO
- ✅ Better user experience
- ✅ Professional appearance
- ✅ Easier maintenance

All links in AgriChain Finance follow these standards for a professional, secure, and accessible application.
