'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Shield, CheckCircle2, XCircle, Clock, User, FileText, AlertCircle } from 'lucide-react'
import { getContract } from '@/lib/contract'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// Helper function to normalize address
const normalizeAddress = (address: string): string => {
    try {
        // ethers.getAddress returns checksum address, then we lowercase it
        return ethers.getAddress(address.trim()).toLowerCase()
    } catch {
        // If invalid address, just return lowercase trimmed version
        return address.trim().toLowerCase()
    }
}

interface VerificationRequest {
    id: string
    farmer: string
    fullName: string
    idNumber: string
    phoneNumber: string
    country: string
    landSize: string
    farmingExperience: string
    requestedLevel: number
    status: 'pending' | 'approved' | 'rejected'
    submittedAt: number
    documents: {
        idCard: string
        selfie: string
        landDocument: string
        farmPhoto: string
    }
}

export default function AdminPanel() {
    const { account, connectWallet, signer } = useWallet()
    const [isOwner, setIsOwner] = useState(false)
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState<VerificationRequest[]>([])
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')

    useEffect(() => {
        checkOwner()
        loadRequests()
    }, [account, signer])

    const checkOwner = async () => {
        if (!signer || !account) {
            setLoading(false)
            return
        }

        try {
            const contract = getContract(signer)
            const owner = await contract.owner()

            // Normalize addresses using helper function
            const normalizedOwner = normalizeAddress(owner)
            const normalizedAccount = normalizeAddress(account)

            // Debug logging
            console.log('=== OWNER CHECK DEBUG ===')
            console.log('Contract owner (raw):', owner)
            console.log('Your account (raw):', account)
            console.log('Contract owner (normalized):', normalizedOwner)
            console.log('Your account (normalized):', normalizedAccount)
            console.log('Match:', normalizedOwner === normalizedAccount)
            console.log('========================')

            const isMatch = normalizedOwner === normalizedAccount
            setIsOwner(isMatch)

            if (!isMatch) {
                console.error('❌ Access denied: You are not the contract owner')
            } else {
                console.log('✅ Access granted: You are the contract owner')
            }
        } catch (error) {
            console.error('Error checking owner:', error)
            setIsOwner(false)
        } finally {
            setLoading(false)
        }
    }

    const loadRequests = async () => {
        try {
            const response = await fetch('/api/verifications')
            const result = await response.json()

            console.log('=== LOADING VERIFICATION REQUESTS ===')
            console.log('API response:', result)

            if (result.success && result.data) {
                console.log('Loaded requests:', result.data)
                console.log('Number of requests:', result.data.length)

                // Convert API format to component format
                const formattedRequests = result.data.map((req: any) => ({
                    id: req.id,
                    farmer: req.walletAddress,
                    fullName: req.fullName,
                    idNumber: '', // Not stored in new format
                    phoneNumber: req.phoneNumber,
                    country: req.farmLocation,
                    landSize: req.farmSize,
                    farmingExperience: req.yearsExperience,
                    requestedLevel: 2,
                    status: req.status,
                    submittedAt: new Date(req.submittedAt).getTime(),
                    documents: {
                        idCard: req.idDocument,
                        selfie: '',
                        landDocument: req.landCertificate,
                        farmPhoto: ''
                    }
                }))

                setRequests(formattedRequests)
            } else {
                console.log('No verification requests found')
                setRequests([])
            }
            console.log('=====================================')
        } catch (error) {
            console.error('Error loading requests:', error)
            setRequests([])
        }
    }

    const approveVerification = async (request: VerificationRequest) => {
        if (!signer) {
            toast.error('Please connect wallet')
            return
        }

        try {
            const contract = getContract(signer)

            // Create document hash
            const documentData = JSON.stringify({
                idNumber: request.idNumber,
                fullName: request.fullName,
                country: request.country,
                submittedAt: request.submittedAt
            })
            const documentHash = ethers.keccak256(ethers.toUtf8Bytes(documentData))

            const loadingToast = toast.loading('Approving verification on blockchain...')

            // Call contract to set verification
            const tx = await contract.setVerification(
                request.farmer,
                request.requestedLevel,
                documentHash
            )

            await tx.wait()

            toast.dismiss(loadingToast)

            // Update status in API
            await fetch('/api/verifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: request.id,
                    status: 'approved',
                    reviewedBy: account,
                }),
            })

            toast.success(
                `✅ Verification approved for ${request.fullName}!\n` +
                `Level ${request.requestedLevel} has been set on blockchain.\n` +
                `Farmer will see the update within 30 seconds or can refresh manually.`,
                { duration: 6000 }
            )

            // Reload requests from API
            await loadRequests()
            setSelectedRequest(null)
        } catch (error: any) {
            console.error('Error approving verification:', error)
            toast.error(error.message || 'Failed to approve verification')
        }
    }

    const rejectVerification = async (request: VerificationRequest) => {
        try {
            // Update status in API
            await fetch('/api/verifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: request.id,
                    status: 'rejected',
                    reviewedBy: account,
                    notes: 'Rejected by admin',
                }),
            })

            toast.success('Verification rejected')

            // Reload requests from API
            await loadRequests()
            setSelectedRequest(null)
        } catch (error) {
            console.error('Error rejecting verification:', error)
            toast.error('Failed to reject verification')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!account) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <Shield className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
                    <p className="text-gray-600 mb-6">
                        Connect your wallet to access admin features
                    </p>
                    <button onClick={connectWallet} className="btn-primary w-full">
                        Connect Wallet
                    </button>
                </div>
            </div>
        )
    }

    if (!isOwner) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You are not authorized to access this page. Only contract owner can approve verifications.
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                        Your address: {account}
                    </p>
                </div>
            </div>
        )
    }

    const pendingRequests = requests.filter(r => r.status === 'pending')
    const approvedRequests = requests.filter(r => r.status === 'approved')
    const rejectedRequests = requests.filter(r => r.status === 'rejected')

    // Filter requests based on active tab
    const displayedRequests = activeTab === 'all' ? requests :
        activeTab === 'pending' ? pendingRequests :
            activeTab === 'approved' ? approvedRequests :
                rejectedRequests

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
                            <p className="text-gray-600">Manage farmer verification requests</p>
                        </div>
                        <button
                            onClick={loadRequests}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            <span className="text-2xl font-bold">{pendingRequests.length}</span>
                        </div>
                        <p className="text-gray-600">Pending Requests</p>
                    </div>
                    <div className="card">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <span className="text-2xl font-bold">{approvedRequests.length}</span>
                        </div>
                        <p className="text-gray-600">Approved</p>
                    </div>
                    <div className="card">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <span className="text-2xl font-bold">{rejectedRequests.length}</span>
                        </div>
                        <p className="text-gray-600">Rejected</p>
                    </div>
                </div>

                {/* Requests List */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Verification Requests</h2>

                    {requests.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No verification requests yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="border rounded-lg p-4 hover:border-primary-400 transition cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <User className="w-10 h-10 text-gray-400" />
                                            <div>
                                                <p className="font-bold">{request.fullName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {request.farmer.slice(0, 10)}...{request.farmer.slice(-8)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Level {request.requestedLevel} • {request.country}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(request.submittedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold">Verification Details</h3>
                                    <button
                                        onClick={() => setSelectedRequest(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="font-bold">{selectedRequest.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Wallet Address</p>
                                        <p className="font-mono text-sm">{selectedRequest.farmer}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">ID Number</p>
                                            <p className="font-bold">{selectedRequest.idNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-bold">{selectedRequest.phoneNumber}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Country</p>
                                            <p className="font-bold">{selectedRequest.country}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Requested Level</p>
                                            <p className="font-bold">Level {selectedRequest.requestedLevel}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Land Size</p>
                                            <p className="font-bold">{selectedRequest.landSize} hectares</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Experience</p>
                                            <p className="font-bold">{selectedRequest.farmingExperience} years</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="text-sm text-gray-600 mb-2">Documents</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <p>✓ ID Card</p>
                                            <p>✓ Selfie with ID</p>
                                            <p>✓ Land Document</p>
                                            <p>✓ Farm Photo</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedRequest.status === 'pending' && (
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            onClick={() => rejectVerification(selectedRequest)}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => approveVerification(selectedRequest)}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
