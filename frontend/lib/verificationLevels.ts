export interface VerificationLevel {
    level: number
    title: string
    badge: string
    maxLoan: number
    maxLoanDisplay: string
    interestRange: string
    minInterest: number
    maxInterest: number
    requirements: string[]
    benefits: string[]
}

export const verificationLevels: VerificationLevel[] = [
    {
        level: 1,
        title: 'Basic',
        badge: '🥉',
        maxLoan: 2000,
        maxLoanDisplay: '$2,000',
        interestRange: '5-7%',
        minInterest: 5,
        maxInterest: 7,
        requirements: [
            'Wallet connected',
            'Harvest token created',
            'Collateral validated'
        ],
        benefits: [
            'Quick loan approval',
            'No KYC required',
            'Start immediately'
        ]
    },
    {
        level: 2,
        title: 'Verified',
        badge: '🥈',
        maxLoan: 5000,
        maxLoanDisplay: '$5,000',
        interestRange: '4-6%',
        minInterest: 4,
        maxInterest: 6,
        requirements: [
            'KYC completed',
            'ID verified',
            'Phone verified',
            'Land ownership verified'
        ],
        benefits: [
            'Higher loan limits',
            'Lower interest rates',
            'Verified badge',
            'Priority listing'
        ]
    },
    {
        level: 3,
        title: 'Premium',
        badge: '🥇',
        maxLoan: 20000,
        maxLoanDisplay: '$20,000',
        interestRange: '3-5%',
        minInterest: 3,
        maxInterest: 5,
        requirements: [
            'Level 2 complete',
            'Satellite verification',
            'IoT sensors active',
            '3+ successful loans',
            'Credit score > 700'
        ],
        benefits: [
            'Highest loan limits',
            'Best interest rates',
            'Premium badge',
            'Featured listing',
            'Insurance options'
        ]
    },
    {
        level: 4,
        title: 'Elite',
        badge: '💎',
        maxLoan: Infinity,
        maxLoanDisplay: 'Unlimited',
        interestRange: '2-4%',
        minInterest: 2,
        maxInterest: 4,
        requirements: [
            'Level 3 complete',
            '10+ successful loans',
            'Credit score > 850',
            'Community endorsed',
            'Insurance covered'
        ],
        benefits: [
            'Unlimited loan amounts',
            'Lowest interest rates',
            'Elite badge',
            'Instant approval',
            'Dedicated support'
        ]
    }
]

export function getVerificationLevel(level: number): VerificationLevel {
    return verificationLevels.find(v => v.level === level) || verificationLevels[0]
}

export function getMaxLoanForLevel(level: number): number {
    const verification = getVerificationLevel(level)
    return verification.maxLoan
}

export function getSuggestedInterestRange(level: number): { min: number, max: number } {
    const verification = getVerificationLevel(level)
    return {
        min: verification.minInterest,
        max: verification.maxInterest
    }
}

export function canRequestLoan(level: number, amount: number): boolean {
    const maxLoan = getMaxLoanForLevel(level)
    return amount <= maxLoan
}
