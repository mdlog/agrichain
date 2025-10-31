// Mock data untuk demo purposes

export interface MockLoan {
    id: number
    farmer: string
    farmerName: string
    cropType: string
    requestedAmount: string
    interestRate: number
    duration: number
    fundedAmount: string
    status: number // 0: Pending, 1: Funded, 2: Repaid, 3: Defaulted
    createdAt: number
    harvestDate: number
    expectedYield: number
    collateralValue: string
}

export interface MockInvestment {
    id: number
    loanId: number
    cropType: string
    farmer: string
    invested: number
    expectedReturn: number
    status: string
    daysLeft: number
    interestRate: number
    investedAt: number
}

export const mockLoans: MockLoan[] = [
    {
        id: 0,
        farmer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        farmerName: 'Budi Santoso',
        cropType: 'Corn',
        requestedAmount: '1400',
        interestRate: 500,
        duration: 90,
        fundedAmount: '700',
        status: 0,
        createdAt: Date.now() / 1000 - 86400 * 2,
        harvestDate: Date.now() / 1000 + 86400 * 88,
        expectedYield: 2000,
        collateralValue: '2000'
    },
    {
        id: 1,
        farmer: '0x8765432109876543210987654321098765432109',
        farmerName: 'Siti Aminah',
        cropType: 'Rice',
        requestedAmount: '2100',
        interestRate: 450,
        duration: 120,
        fundedAmount: '0',
        status: 0,
        createdAt: Date.now() / 1000 - 86400,
        harvestDate: Date.now() / 1000 + 86400 * 119,
        expectedYield: 3000,
        collateralValue: '3000'
    },
    {
        id: 2,
        farmer: '0xabcdef1234567890abcdef1234567890abcdef12',
        farmerName: 'Ahmad Yani',
        cropType: 'Wheat',
        requestedAmount: '1750',
        interestRate: 550,
        duration: 100,
        fundedAmount: '1750',
        status: 1,
        createdAt: Date.now() / 1000 - 86400 * 10,
        harvestDate: Date.now() / 1000 + 86400 * 90,
        expectedYield: 2500,
        collateralValue: '2500'
    },
    {
        id: 3,
        farmer: '0x1234567890abcdef1234567890abcdef12345678',
        farmerName: 'Dewi Lestari',
        cropType: 'Coffee',
        requestedAmount: '3000',
        interestRate: 400,
        duration: 120,
        fundedAmount: '1500',
        status: 0,
        createdAt: Date.now() / 1000 - 86400 * 3,
        harvestDate: Date.now() / 1000 + 86400 * 117,
        expectedYield: 500,
        collateralValue: '4300'
    },
    {
        id: 4,
        farmer: '0x9876543210fedcba9876543210fedcba98765432',
        farmerName: 'Joko Widodo',
        cropType: 'Soybean',
        requestedAmount: '1200',
        interestRate: 480,
        duration: 85,
        fundedAmount: '1200',
        status: 1,
        createdAt: Date.now() / 1000 - 86400 * 5,
        harvestDate: Date.now() / 1000 + 86400 * 80,
        expectedYield: 1800,
        collateralValue: '1700'
    },
    {
        id: 5,
        farmer: '0xfedcba9876543210fedcba9876543210fedcba98',
        farmerName: 'Rina Susanti',
        cropType: 'Corn',
        requestedAmount: '1600',
        interestRate: 520,
        duration: 95,
        fundedAmount: '800',
        status: 0,
        createdAt: Date.now() / 1000 - 86400,
        harvestDate: Date.now() / 1000 + 86400 * 94,
        expectedYield: 2200,
        collateralValue: '2300'
    },
    {
        id: 6,
        farmer: '0x1111222233334444555566667777888899990000',
        farmerName: 'Bambang Hermanto',
        cropType: 'Rice',
        requestedAmount: '2500',
        interestRate: 430,
        duration: 110,
        fundedAmount: '2500',
        status: 2,
        createdAt: Date.now() / 1000 - 86400 * 120,
        harvestDate: Date.now() / 1000 - 86400 * 10,
        expectedYield: 3500,
        collateralValue: '3600'
    },
    {
        id: 7,
        farmer: '0xaaabbbcccdddeeefff000111222333444555666',
        farmerName: 'Sri Mulyani',
        cropType: 'Wheat',
        requestedAmount: '1900',
        interestRate: 510,
        duration: 105,
        fundedAmount: '950',
        status: 0,
        createdAt: Date.now() / 1000 - 86400 * 2,
        harvestDate: Date.now() / 1000 + 86400 * 103,
        expectedYield: 2700,
        collateralValue: '2700'
    }
]

export const mockInvestments: MockInvestment[] = [
    {
        id: 0,
        loanId: 0,
        cropType: 'Corn',
        farmer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        invested: 700,
        expectedReturn: 735,
        status: 'Active',
        daysLeft: 88,
        interestRate: 5,
        investedAt: Date.now() / 1000 - 86400 * 2
    },
    {
        id: 1,
        loanId: 2,
        cropType: 'Wheat',
        farmer: '0xabcdef1234567890abcdef1234567890abcdef12',
        invested: 875,
        expectedReturn: 923.13,
        status: 'Active',
        daysLeft: 90,
        interestRate: 5.5,
        investedAt: Date.now() / 1000 - 86400 * 10
    },
    {
        id: 2,
        loanId: 4,
        cropType: 'Soybean',
        farmer: '0x9876543210fedcba9876543210fedcba98765432',
        invested: 600,
        expectedReturn: 628.8,
        status: 'Active',
        daysLeft: 80,
        interestRate: 4.8,
        investedAt: Date.now() / 1000 - 86400 * 5
    },
    {
        id: 3,
        loanId: 6,
        cropType: 'Rice',
        farmer: '0x1111222233334444555566667777888899990000',
        invested: 1250,
        expectedReturn: 1303.75,
        status: 'Completed',
        daysLeft: 0,
        interestRate: 4.3,
        investedAt: Date.now() / 1000 - 86400 * 120
    }
]

export const mockFarmerLoans: MockLoan[] = [
    {
        id: 0,
        farmer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        farmerName: 'You',
        cropType: 'Corn',
        requestedAmount: '1400',
        interestRate: 500,
        duration: 90,
        fundedAmount: '700',
        status: 0,
        createdAt: Date.now() / 1000 - 86400 * 2,
        harvestDate: Date.now() / 1000 + 86400 * 88,
        expectedYield: 2000,
        collateralValue: '2000'
    }
]

export const mockStats = {
    totalInvested: 3425,
    totalReturns: 170.68,
    activeInvestments: 3,
    avgDuration: 86,
    totalValueLocked: 12650,
    totalLoans: 8,
    activeFarmers: 8,
    successRate: 87.5
}

export function getLoanById(id: number): MockLoan | undefined {
    return mockLoans.find(loan => loan.id === id)
}

export function getLoansByStatus(status: number): MockLoan[] {
    return mockLoans.filter(loan => loan.status === status)
}

export function getInvestmentsByLoanId(loanId: number): MockInvestment[] {
    return mockInvestments.filter(inv => inv.loanId === loanId)
}

export function calculateProgress(funded: string, requested: string): number {
    return (parseFloat(funded) / parseFloat(requested)) * 100
}

export function calculateExpectedReturn(principal: number, rate: number): number {
    return principal * (1 + rate / 100)
}

export function formatTimeLeft(timestamp: number): string {
    const now = Date.now() / 1000
    const diff = timestamp - now
    const days = Math.floor(diff / 86400)

    if (days < 0) return 'Overdue'
    if (days === 0) return 'Today'
    if (days === 1) return '1 day'
    return `${days} days`
}
