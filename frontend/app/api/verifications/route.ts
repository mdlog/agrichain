import { NextRequest, NextResponse } from 'next/server';
import { getAllVerifications, saveVerification, updateVerificationStatus, type VerificationRequest } from '@/lib/verificationDB';
import { safeLogger, escapeHtml, validateEthereumAddress } from '@/lib/security';

// GET - Get all verifications
export async function GET() {
    try {
        const verifications = getAllVerifications();
        return NextResponse.json({ success: true, data: verifications });
    } catch (error) {
        safeLogger.error('Error fetching verifications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch verifications' },
            { status: 500 }
        );
    }
}

// POST - Create new verification request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate wallet address
        if (!validateEthereumAddress(body.walletAddress)) {
            return NextResponse.json(
                { success: false, error: 'Invalid wallet address format' },
                { status: 400 }
            );
        }

        // Sanitize string inputs to prevent XSS
        const verification: VerificationRequest = {
            id: body.id || `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            walletAddress: body.walletAddress,
            fullName: escapeHtml(body.fullName),
            farmLocation: escapeHtml(body.farmLocation),
            farmSize: escapeHtml(body.farmSize),
            cropTypes: Array.isArray(body.cropTypes) ? body.cropTypes.map((c: string) => escapeHtml(c)) : [],
            yearsExperience: body.yearsExperience,
            phoneNumber: escapeHtml(body.phoneNumber),
            email: escapeHtml(body.email),
            idDocument: body.idDocument,
            landCertificate: body.landCertificate,
            status: 'pending',
            submittedAt: new Date().toISOString(),
        };

        saveVerification(verification);

        return NextResponse.json({ success: true, data: verification });
    } catch (error) {
        safeLogger.error('Error creating verification:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create verification' },
            { status: 500 }
        );
    }
}

// PATCH - Update verification status
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, reviewedBy, notes } = body;

        if (!id || !status || !reviewedBy) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedId = escapeHtml(id);
        const sanitizedStatus = escapeHtml(status);
        const sanitizedReviewedBy = escapeHtml(reviewedBy);
        const sanitizedNotes = notes ? escapeHtml(notes) : undefined;

        updateVerificationStatus(sanitizedId, sanitizedStatus, sanitizedReviewedBy, sanitizedNotes);

        return NextResponse.json({ success: true });
    } catch (error) {
        safeLogger.error('Error updating verification:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update verification' },
            { status: 500 }
        );
    }
}
