/**
 * HBAR Utility Functions
 * 
 * Standardized functions for handling HBAR amounts throughout the application.
 * All blockchain values use 18 decimals (wei), same as Ethereum.
 * 
 * 1 HBAR = 10^18 wei = 1,000,000,000,000,000,000 wei
 */

import { ethers } from 'ethers'

/**
 * Format HBAR amount for display
 * @param value - Value in HBAR (string or number)
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string with HBAR suffix
 */
export const formatHBAR = (value: string | number, decimals: number = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(num)) {
        return '0.00 HBAR'
    }

    return `${num.toFixed(decimals)} HBAR`
}

/**
 * Format HBAR amount for display (number only, no suffix)
 * @param value - Value in HBAR (string or number)
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted number string
 */
export const formatHBARNumber = (value: string | number, decimals: number = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(num)) {
        return '0.00'
    }

    return num.toFixed(decimals)
}

/**
 * Convert HBAR to wei (for blockchain transactions)
 * @param hbarAmount - Amount in HBAR
 * @returns BigInt value in wei
 */
export const hbarToWei = (hbarAmount: string | number): bigint => {
    const amount = typeof hbarAmount === 'number' ? hbarAmount.toString() : hbarAmount

    // Validate input
    if (!amount || amount === '' || amount === '0') {
        throw new Error('Invalid HBAR amount: must be greater than 0')
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Invalid HBAR amount: must be a positive number')
    }

    // Use ethers.parseEther for 18 decimal conversion
    return ethers.parseEther(amount)
}

/**
 * DEPRECATED: Do not use hbarToTinybar!
 * 
 * Hedera EVM uses standard wei (18 decimals), NOT tinybar (8 decimals).
 * Use hbarToWei() instead.
 * 
 * Note: Hedera Native uses tinybar (8 decimals), but Hedera EVM uses wei (18 decimals).
 * These are different layers of the Hedera network.
 */

// Commented out to prevent usage - use hbarToWei() instead
// export const hbarToTinybar = (hbarAmount: string | number): bigint => {
//     return ethers.parseUnits(hbarAmount.toString(), 8)  // WRONG for EVM!
// }

// export const tinybarToHBAR = (tinybarAmount: bigint | string): string => {
//     return ethers.formatUnits(tinybarAmount, 8)  // WRONG for EVM!
// }

/**
 * Convert wei to HBAR (for display)
 * @param weiAmount - Amount in wei (BigInt or string)
 * @returns String value in HBAR
 */
export const weiToHBAR = (weiAmount: bigint | string): string => {
    // Use ethers.formatEther for 18 decimal conversion
    return ethers.formatEther(weiAmount)
}

/**
 * Validate HBAR amount input
 * @param value - Input value to validate
 * @param min - Minimum allowed value (default: 0.01)
 * @param max - Maximum allowed value (default: 1000000)
 * @returns Error message if invalid, null if valid
 */
export const validateHBARAmount = (
    value: string | number,
    min: number = 0.01,
    max: number = 1000000
): string | null => {
    const amount = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(amount)) {
        return 'Please enter a valid number'
    }

    if (amount < min) {
        return `Minimum amount is ${min} HBAR`
    }

    if (amount > max) {
        return `Maximum amount is ${max.toLocaleString()} HBAR`
    }

    return null
}

/**
 * Calculate loan repayment amount
 * @param principal - Loan principal in HBAR
 * @param interestRate - Interest rate in basis points (e.g., 500 = 5%)
 * @returns Total repayment amount in HBAR
 */
export const calculateRepayment = (
    principal: string | number,
    interestRate: number
): number => {
    const principalNum = typeof principal === 'string' ? parseFloat(principal) : principal
    const interest = (principalNum * interestRate) / 10000
    return principalNum + interest
}

/**
 * Calculate investment return
 * @param investment - Investment amount in HBAR
 * @param interestRate - Interest rate in basis points (e.g., 500 = 5%)
 * @returns Expected return amount in HBAR
 */
export const calculateReturn = (
    investment: string | number,
    interestRate: number
): number => {
    const investmentNum = typeof investment === 'string' ? parseFloat(investment) : investment
    return (investmentNum * interestRate) / 10000
}

/**
 * Debug log for HBAR transactions
 * @param label - Label for the log
 * @param hbarAmount - Amount in HBAR
 * @param weiAmount - Amount in wei (optional)
 */
export const debugHBARTransaction = (
    label: string,
    hbarAmount: string | number,
    weiAmount?: bigint
): void => {
    console.log(`=== ${label} ===`)
    console.log('HBAR Amount:', hbarAmount)

    if (weiAmount) {
        console.log('Wei Amount:', weiAmount.toString())
        console.log('Formatted Back:', ethers.formatEther(weiAmount), 'HBAR')
    } else {
        const wei = hbarToWei(hbarAmount)
        console.log('Wei Amount:', wei.toString())
        console.log('Formatted Back:', ethers.formatEther(wei), 'HBAR')
    }

    console.log('=================')
}

/**
 * Check if two HBAR amounts are equal (with tolerance for floating point)
 * @param amount1 - First amount in HBAR
 * @param amount2 - Second amount in HBAR
 * @param tolerance - Tolerance for comparison (default: 0.000001)
 * @returns True if amounts are equal within tolerance
 */
export const isHBAREqual = (
    amount1: string | number,
    amount2: string | number,
    tolerance: number = 0.000001
): boolean => {
    const num1 = typeof amount1 === 'string' ? parseFloat(amount1) : amount1
    const num2 = typeof amount2 === 'string' ? parseFloat(amount2) : amount2

    return Math.abs(num1 - num2) < tolerance
}

/**
 * Format wei amount for display (converts to HBAR first)
 * @param weiAmount - Amount in wei
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted HBAR string
 */
export const formatWeiToHBAR = (weiAmount: bigint | string, decimals: number = 2): string => {
    const hbar = weiToHBAR(weiAmount)
    return formatHBAR(hbar, decimals)
}

/**
 * Constants for HBAR
 */
export const HBAR_CONSTANTS = {
    WEI_PER_HBAR: BigInt('1000000000000000000'), // 10^18
    MIN_LOAN_AMOUNT: 1, // 1 HBAR
    MAX_LOAN_AMOUNT: 1000000, // 1 million HBAR
    MIN_INVESTMENT: 0.01, // 0.01 HBAR
    DECIMALS: 18
} as const

/**
 * Example usage and tests
 */
export const testHBARUtils = () => {
    console.log('=== HBAR Utils Test ===')

    // Test 1: Convert 140 HBAR to wei
    const amount1 = hbarToWei(140)
    console.log('140 HBAR in wei:', amount1.toString())
    console.log('Expected:', '140000000000000000000')
    console.log('Match:', amount1.toString() === '140000000000000000000')

    // Test 2: Convert wei back to HBAR
    const hbar1 = weiToHBAR(amount1)
    console.log('Wei to HBAR:', hbar1)
    console.log('Expected:', '140.0')
    console.log('Match:', hbar1 === '140.0')

    // Test 3: Format for display
    const formatted = formatHBAR(140.5, 2)
    console.log('Formatted:', formatted)
    console.log('Expected:', '140.50 HBAR')

    // Test 4: Validate amount
    const validation1 = validateHBARAmount(140)
    console.log('Validate 140 HBAR:', validation1 === null ? 'Valid' : validation1)

    const validation2 = validateHBARAmount(0.005)
    console.log('Validate 0.005 HBAR:', validation2)

    console.log('======================')
}
