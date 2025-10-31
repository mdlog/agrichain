export function formatAddress(address: string): string {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(num)
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export function calculateInterest(principal: number, rate: number): number {
    return (principal * rate) / 10000
}

export function calculateTotalRepayment(principal: number, rate: number): number {
    return principal + calculateInterest(principal, rate)
}

export function getLoanStatusText(status: number): string {
    switch (status) {
        case 0:
            return 'Pending'
        case 1:
            return 'Funded'
        case 2:
            return 'Repaid'
        case 3:
            return 'Defaulted'
        default:
            return 'Unknown'
    }
}

export function getLoanStatusColor(status: number): string {
    switch (status) {
        case 0:
            return 'bg-yellow-100 text-yellow-800'
        case 1:
            return 'bg-blue-100 text-blue-800'
        case 2:
            return 'bg-green-100 text-green-800'
        case 3:
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}
