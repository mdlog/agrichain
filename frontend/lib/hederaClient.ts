/**
 * Hedera Client Configuration
 * Manages connection to Hedera network
 */

import {
    Client,
    AccountId,
    PrivateKey
} from "@hashgraph/sdk"

let client: Client | null = null

/**
 * Get or create Hedera client instance
 */
export function getHederaClient(): Client {
    if (client) {
        return client
    }

    // Initialize client for testnet
    client = Client.forTestnet()

    // Set operator account
    const operatorId = AccountId.fromString(
        process.env.HEDERA_ACCOUNT_ID || ""
    )
    const operatorKey = PrivateKey.fromString(
        process.env.HEDERA_PRIVATE_KEY || ""
    )

    client.setOperator(operatorId, operatorKey)

    // Set default max transaction fee
    client.setDefaultMaxTransactionFee(20) // 20 HBAR

    return client
}

/**
 * Close Hedera client connection
 */
export function closeHederaClient(): void {
    if (client) {
        client.close()
        client = null
    }
}

/**
 * Get operator account ID
 */
export function getOperatorAccountId(): string {
    return process.env.HEDERA_ACCOUNT_ID || ""
}

/**
 * Check if Hedera is configured
 */
export function isHederaConfigured(): boolean {
    return !!(
        process.env.HEDERA_ACCOUNT_ID &&
        process.env.HEDERA_PRIVATE_KEY
    )
}
