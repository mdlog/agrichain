/**
 * Utility to clear old loan data from localStorage
 * 
 * Use this if you encounter issues with old data format
 */

export const clearOldLoans = () => {
    if (typeof window === 'undefined') {
        console.warn('clearOldLoans can only be called in browser environment')
        return false
    }

    try {
        // Clear farmer loans
        localStorage.removeItem('farmerCreatedLoans')

        // Clear marketplace loans
        localStorage.removeItem('marketplaceLoans')

        // Clear investor data
        localStorage.removeItem('investorInvestments')

        console.log('✅ Old loan data cleared successfully')
        console.log('Please refresh the page to load fresh data from blockchain')

        return true
    } catch (error) {
        console.error('Error clearing old data:', error)
        return false
    }
}

export const clearAllAppData = () => {
    if (typeof window === 'undefined') {
        console.warn('clearAllAppData can only be called in browser environment')
        return false
    }

    try {
        // Get all keys
        const keys = Object.keys(localStorage)

        // Filter app-specific keys
        const appKeys = keys.filter(key =>
            key.includes('farmer') ||
            key.includes('marketplace') ||
            key.includes('investor') ||
            key.includes('loan') ||
            key.includes('verification')
        )

        // Remove each key
        appKeys.forEach(key => {
            localStorage.removeItem(key)
            console.log(`Removed: ${key}`)
        })

        console.log(`✅ Cleared ${appKeys.length} app data items`)
        console.log('Please refresh the page')

        return true
    } catch (error) {
        console.error('Error clearing app data:', error)
        return false
    }
}

export const showStorageInfo = () => {
    if (typeof window === 'undefined') {
        console.warn('showStorageInfo can only be called in browser environment')
        return
    }

    console.log('=== LocalStorage Info ===')

    const keys = Object.keys(localStorage)
    console.log(`Total keys: ${keys.length}`)

    // Show app-specific data
    const appKeys = keys.filter(key =>
        key.includes('farmer') ||
        key.includes('marketplace') ||
        key.includes('investor') ||
        key.includes('loan')
    )

    console.log(`\nApp-specific keys (${appKeys.length}):`)
    appKeys.forEach(key => {
        const value = localStorage.getItem(key)
        const size = value ? new Blob([value]).size : 0
        console.log(`  ${key}: ${size} bytes`)

        // Try to parse and show count
        try {
            const parsed = JSON.parse(value || '[]')
            if (Array.isArray(parsed)) {
                console.log(`    → ${parsed.length} items`)
            }
        } catch {
            // Not JSON or not array
        }
    })

    console.log('========================')
}

// Export for console usage
if (typeof window !== 'undefined') {
    (window as any).clearOldLoans = clearOldLoans;
    (window as any).clearAllAppData = clearAllAppData;
    (window as any).showStorageInfo = showStorageInfo;

    console.log('💡 Data management functions available:')
    console.log('  - clearOldLoans() - Clear old loan data')
    console.log('  - clearAllAppData() - Clear all app data')
    console.log('  - showStorageInfo() - Show storage info')
}
