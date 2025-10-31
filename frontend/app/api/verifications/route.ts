import { NextRequest, NextResponse } from 'next/server';
import { getAllVerifications, saveVerification, updateVerificationStatus, type VerificationRequest } from '@/lib/verificationDB';

// GET - Get all verifications
export async function GET() {
    try {
        const verifications = getAllVerifications();
        return NextResponse.json({ success: true, data: verifications });
    } catch (error) {
        console.error('Error fetching verifications:', error);
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

        const verification: VerificationRequest = {
            id: body.id || `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            walletAddress: body.walletAddress,
            fullName: body.fullName,
            farmLocation: body.farmLocation,
            farmSize: body.farmSize,
            cropTypes: body.cropTypes,
            yearsExperience: body.yearsExperience,
            phoneNumber: body.phoneNumber,
            email: body.email,
            idDocument: body.idDocument,
            landCertificate: body.landCertificate,
            status: 'pending',
            submittedAt: new Date().toISOString(),
        };

        saveVerification(verification);

        return NextResponse.json({ success: true, data: verification });
    } catch (error) {
        console.error('Error creating verification:', error);
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

        updateVerificationStatus(id, status, reviewedBy, notes);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating verification:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update verification' },
            { status: 500 }
        );
    }
}
