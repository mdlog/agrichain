/**
 * Security Utilities
 * Input validation, sanitization, and security helpers
 * Uses Web APIs for Edge runtime compatibility
 */

/**
 * Sanitize log output to prevent log injection
 * Removes newlines and control characters
 */
export function sanitizeLogOutput(input: any): string {
    if (typeof input !== 'string') {
        input = JSON.stringify(input)
    }

    // Remove newlines, carriage returns, and other control characters
    return input
        .replaceAll(/[\r\n\t]/g, ' ')
        .replaceAll(/[\u0000-\u001F\u007F]/g, '')
        .trim()
}

/**
 * Validate and sanitize file path to prevent path traversal
 */
export function sanitizePath(path: string): string {
    // Remove any path traversal attempts
    const sanitized = path
        .replaceAll(/\.\./g, '')
        .replaceAll(/[/\\]{2,}/g, '/')
        .replaceAll(/^[/\\]/, '')

    // Ensure path doesn't start with / or contain ..
    if (sanitized.includes('..') || sanitized.startsWith('/')) {
        throw new Error('Invalid path: Path traversal detected')
    }

    return sanitized
}

/**
 * Validate path is within allowed directory
 * Note: This is a simplified version for Edge runtime
 * For full path validation, use this in Node.js API routes
 */
export function validatePathInDirectory(path: string, allowedDir: string): boolean {
    // Normalize paths by removing duplicate slashes and resolving relative segments
    const normalizePath = (p: string) => {
        return p.split('/').filter(segment => segment && segment !== '.').reduce((acc: string[], segment) => {
            if (segment === '..') {
                acc.pop()
            } else {
                acc.push(segment)
            }
            return acc
        }, []).join('/')
    }

    const normalizedPath = normalizePath(path)
    const normalizedAllowedDir = normalizePath(allowedDir)

    return normalizedPath.startsWith(normalizedAllowedDir)
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;')
        .replaceAll(/"/g, '&quot;')
        .replaceAll(/'/g, '&#039;')
}

/**
 * Validate URL to prevent SSRF attacks
 * Only allows specific whitelisted domains
 */
export function validateExternalUrl(urlString: string, allowedDomains: string[]): boolean {
    try {
        const url = new URL(urlString)

        // Only allow HTTPS
        if (url.protocol !== 'https:') {
            return false
        }

        // Check if domain is in whitelist
        const hostname = url.hostname.toLowerCase()
        const isAllowed = allowedDomains.some(domain =>
            hostname === domain.toLowerCase() ||
            hostname.endsWith(`.${domain.toLowerCase()}`)
        )

        if (!isAllowed) {
            return false
        }

        // Prevent private IP ranges
        const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|169\.254\.|::1|fc00:|fe80:)/
        if (privateIpRegex.test(hostname)) {
            return false
        }

        return true
    } catch {
        return false
    }
}

/**
 * Safe logger that sanitizes all output
 */
export const safeLogger = {
    log: (...args: any[]) => {
        console.log(...args.map(sanitizeLogOutput))
    },
    error: (...args: any[]) => {
        console.error(...args.map(sanitizeLogOutput))
    },
    warn: (...args: any[]) => {
        console.warn(...args.map(sanitizeLogOutput))
    },
    info: (...args: any[]) => {
        console.info(...args.map(sanitizeLogOutput))
    }
}

/**
 * Validate Hedera address format
 */
export function validateHederaAddress(address: string): boolean {
    // Hedera address format: 0.0.xxxxx
    const hederaRegex = /^0\.0\.\d+$/
    return hederaRegex.test(address)
}

/**
 * Validate Ethereum address format
 */
export function validateEthereumAddress(address: string): boolean {
    // Ethereum address format: 0x followed by 40 hex characters
    const ethRegex = /^0x[a-fA-F0-9]{40}$/
    return ethRegex.test(address)
}
