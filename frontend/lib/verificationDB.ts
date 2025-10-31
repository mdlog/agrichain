// Simple file-based database for verification requests
// In production, use a real database like PostgreSQL or MongoDB

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'verifications.json');

export interface VerificationRequest {
    id: string;
    walletAddress: string;
    fullName: string;
    farmLocation: string;
    farmSize: string;
    cropTypes: string[];
    yearsExperience: string;
    phoneNumber: string;
    email: string;
    idDocument: string;
    landCertificate: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
}

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// Read all verification requests
export function getAllVerifications(): VerificationRequest[] {
    try {
        ensureDataDir();
        if (!fs.existsSync(DB_PATH)) {
            return [];
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading verifications:', error);
        return [];
    }
}

// Save verification request
export function saveVerification(request: VerificationRequest): void {
    try {
        ensureDataDir();
        const verifications = getAllVerifications();

        // Check if already exists
        const existingIndex = verifications.findIndex(v => v.id === request.id);
        if (existingIndex >= 0) {
            verifications[existingIndex] = request;
        } else {
            verifications.push(request);
        }

        fs.writeFileSync(DB_PATH, JSON.stringify(verifications, null, 2));
    } catch (error) {
        console.error('Error saving verification:', error);
        throw error;
    }
}

// Get verification by wallet address
export function getVerificationByWallet(walletAddress: string): VerificationRequest | null {
    const verifications = getAllVerifications();
    return verifications.find(v => v.walletAddress.toLowerCase() === walletAddress.toLowerCase()) || null;
}

// Update verification status
export function updateVerificationStatus(
    id: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    notes?: string
): void {
    const verifications = getAllVerifications();
    const verification = verifications.find(v => v.id === id);

    if (!verification) {
        throw new Error('Verification not found');
    }

    verification.status = status;
    verification.reviewedAt = new Date().toISOString();
    verification.reviewedBy = reviewedBy;
    if (notes) {
        verification.notes = notes;
    }

    saveVerification(verification);
}
