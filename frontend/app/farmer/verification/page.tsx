'use client'

import { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Shield, Upload, CheckCircle2, AlertCircle, User, MapPin, FileText, Camera, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function FarmerVerification() {
    const { account, connectWallet } = useWallet()
    const [currentLevel, setCurrentLevel] = useState(1)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        otherCountry: '', // For "Other" country option
        landSize: '',
        landLocation: '',
        farmingExperience: ''
    })
    const [files, setFiles] = useState({
        idCard: null as File | null,
        selfie: null as File | null,
        landDocument: null as File | null,
        farmPhoto: null as File | null
    })

    if (!account) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="card max-w-lg text-center">
                    <Shield className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Farmer Verification</h2>
                    <p className="text-gray-600 mb-6">
                        Connect your wallet to start the verification process
                    </p>
                    <button onClick={connectWallet} className="btn-primary w-full">
                        Connect Wallet
                    </button>
                </div>
            </div>
        )
    }

    const handleFileChange = (field: keyof typeof files, file: File | null) => {
        setFiles({ ...files, [field]: file })
    }

    // Validation for each step
    const isStep1Valid = () => {
        const hasBasicInfo = formData.fullName && formData.idNumber && formData.phoneNumber && formData.address && formData.city
        const hasCountry = formData.country && (formData.country !== 'Other' || formData.otherCountry)
        return hasBasicInfo && hasCountry
    }

    const isStep2Valid = () => {
        return files.idCard && files.selfie && files.landDocument
    }

    const isStep3Valid = () => {
        return formData.landSize && formData.farmingExperience && formData.landLocation && files.farmPhoto
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate "Other" country
        if (formData.country === 'Other' && !formData.otherCountry) {
            toast.error('Please specify your country name')
            return
        }

        if (!account) {
            toast.error('Please connect your wallet')
            return
        }

        // Prepare final country value
        const finalCountry = formData.country === 'Other' ? formData.otherCountry : formData.country

        const loadingToast = toast.loading('Submitting verification request...')

        try {
            // Submit to API
            const response = await fetch('/api/verifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: account,
                    fullName: formData.fullName,
                    farmLocation: `${formData.city}, ${finalCountry}`,
                    farmSize: formData.landSize,
                    cropTypes: ['Mixed'], // You can add crop selection if needed
                    yearsExperience: formData.farmingExperience,
                    phoneNumber: formData.phoneNumber,
                    email: '', // Add email field if needed
                    idDocument: files.idCard?.name || '',
                    landCertificate: files.landDocument?.name || '',
                }),
            })

            const result = await response.json()

            toast.dismiss(loadingToast)

            if (result.success) {
                toast.success('Verification submitted! Our team will review within 24-48 hours.')

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/farmer'
                }, 2000)
            } else {
                toast.error(result.error || 'Failed to submit verification')
            }
        } catch (error) {
            toast.dismiss(loadingToast)
            console.error('Error submitting verification:', error)
            toast.error('Failed to submit verification. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link href="/farmer" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10 text-primary-600" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Farmer Verification</h1>
                    <p className="text-gray-600 text-lg">
                        Complete KYC to unlock better loan terms and higher limits
                    </p>
                </div>

                {/* Current Level */}
                <div className="card mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Current Verification Level</p>
                            <p className="text-2xl font-bold">Level {currentLevel}: Basic</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Max Loan Amount</p>
                            <p className="text-2xl font-bold text-primary-600">$2,000</p>
                        </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                </div>

                {/* Verification Levels */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <LevelCard
                        level="1"
                        title="Basic"
                        badge="🥉"
                        maxLoan="$2,000"
                        interest="5-7%"
                        active={currentLevel === 1}
                        completed={currentLevel > 1}
                    />
                    <LevelCard
                        level="2"
                        title="Verified"
                        badge="🥈"
                        maxLoan="$5,000"
                        interest="4-6%"
                        active={currentLevel === 2}
                        completed={currentLevel > 2}
                    />
                    <LevelCard
                        level="3"
                        title="Premium"
                        badge="🥇"
                        maxLoan="$20,000"
                        interest="3-5%"
                        active={currentLevel === 3}
                        completed={currentLevel > 3}
                    />
                    <LevelCard
                        level="4"
                        title="Elite"
                        badge="💎"
                        maxLoan="Unlimited"
                        interest="2-4%"
                        active={currentLevel === 4}
                        completed={false}
                    />
                </div>

                {/* Verification Form */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Complete Level 2 Verification</h2>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-4">
                            <StepIndicator number={1} label="Personal Info" active={step >= 1} />
                            <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                            <StepIndicator number={2} label="Documents" active={step >= 2} />
                            <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                            <StepIndicator number={3} label="Farm Details" active={step >= 3} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">ID Number *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="ID/Passport Number"
                                            value={formData.idNumber}
                                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="input"
                                            placeholder="+1234567890"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Country *</label>
                                        <select
                                            className="input"
                                            value={formData.country}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                setFormData({
                                                    ...formData,
                                                    country: value,
                                                    // Clear otherCountry if not "Other"
                                                    otherCountry: value === 'Other' ? formData.otherCountry : ''
                                                })
                                            }}
                                            required
                                        >
                                            <option value="">Select country</option>

                                            {/* Asia */}
                                            <optgroup label="Asia">
                                                <option value="Indonesia">Indonesia</option>
                                                <option value="India">India</option>
                                                <option value="China">China</option>
                                                <option value="Thailand">Thailand</option>
                                                <option value="Vietnam">Vietnam</option>
                                                <option value="Philippines">Philippines</option>
                                                <option value="Bangladesh">Bangladesh</option>
                                                <option value="Pakistan">Pakistan</option>
                                                <option value="Malaysia">Malaysia</option>
                                                <option value="Myanmar">Myanmar</option>
                                            </optgroup>

                                            {/* Africa */}
                                            <optgroup label="Africa">
                                                <option value="Kenya">Kenya</option>
                                                <option value="Nigeria">Nigeria</option>
                                                <option value="Ghana">Ghana</option>
                                                <option value="Tanzania">Tanzania</option>
                                                <option value="Uganda">Uganda</option>
                                                <option value="Ethiopia">Ethiopia</option>
                                                <option value="South Africa">South Africa</option>
                                                <option value="Egypt">Egypt</option>
                                                <option value="Morocco">Morocco</option>
                                                <option value="Senegal">Senegal</option>
                                            </optgroup>

                                            {/* Americas */}
                                            <optgroup label="Americas">
                                                <option value="Brazil">Brazil</option>
                                                <option value="United States">United States</option>
                                                <option value="Mexico">Mexico</option>
                                                <option value="Argentina">Argentina</option>
                                                <option value="Colombia">Colombia</option>
                                                <option value="Peru">Peru</option>
                                                <option value="Canada">Canada</option>
                                                <option value="Chile">Chile</option>
                                            </optgroup>

                                            {/* Europe */}
                                            <optgroup label="Europe">
                                                <option value="France">France</option>
                                                <option value="Germany">Germany</option>
                                                <option value="Spain">Spain</option>
                                                <option value="Italy">Italy</option>
                                                <option value="Poland">Poland</option>
                                                <option value="Romania">Romania</option>
                                                <option value="Ukraine">Ukraine</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                            </optgroup>

                                            {/* Oceania */}
                                            <optgroup label="Oceania">
                                                <option value="Australia">Australia</option>
                                                <option value="New Zealand">New Zealand</option>
                                                <option value="Papua New Guinea">Papua New Guinea</option>
                                            </optgroup>

                                            <option value="Other">Other</option>
                                        </select>
                                        {formData.country === 'Other' && (
                                            <input
                                                type="text"
                                                className="input mt-3"
                                                placeholder="Please specify your country"
                                                value={formData.otherCountry}
                                                onChange={(e) => setFormData({ ...formData, otherCountry: e.target.value })}
                                                required
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Address *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Street address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">City *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="City name"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={!isStep1Valid()}
                                >
                                    Next: Upload Documents →
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <FileUpload
                                    icon={<User className="w-6 h-6" />}
                                    label="Government ID Card"
                                    description="Upload a clear photo of your ID card or passport"
                                    file={files.idCard}
                                    onChange={(file) => handleFileChange('idCard', file)}
                                    required
                                />

                                <FileUpload
                                    icon={<Camera className="w-6 h-6" />}
                                    label="Selfie with ID"
                                    description="Take a selfie holding your ID card"
                                    file={files.selfie}
                                    onChange={(file) => handleFileChange('selfie', file)}
                                    required
                                />

                                <FileUpload
                                    icon={<FileText className="w-6 h-6" />}
                                    label="Land Ownership Document"
                                    description="Upload land title, lease agreement, or ownership proof"
                                    file={files.landDocument}
                                    onChange={(file) => handleFileChange('landDocument', file)}
                                    required
                                />

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="btn-secondary flex-1"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="btn-primary flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={!isStep2Valid()}
                                    >
                                        Next: Farm Details →
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Land Size (hectares) *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="e.g., 2.5"
                                            value={formData.landSize}
                                            onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Farming Experience (years) *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="e.g., 5"
                                            value={formData.farmingExperience}
                                            onChange={(e) => setFormData({ ...formData, farmingExperience: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Farm Location *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="GPS coordinates or detailed location"
                                        value={formData.landLocation}
                                        onChange={(e) => setFormData({ ...formData, landLocation: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This helps us verify your farm location
                                    </p>
                                </div>

                                <FileUpload
                                    icon={<MapPin className="w-6 h-6" />}
                                    label="Farm Photo"
                                    description="Upload a recent photo of your farm"
                                    file={files.farmPhoto}
                                    onChange={(file) => handleFileChange('farmPhoto', file)}
                                    required
                                />

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-900 mb-1">Review Time</p>
                                            <p className="text-sm text-yellow-800">
                                                Our team will review your application within 24-48 hours. You'll receive an email notification once approved.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="btn-secondary flex-1"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={!isStep3Valid()}
                                    >
                                        Submit for Verification
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Benefits */}
                <div className="card mt-8 bg-primary-50 border-primary-200">
                    <h3 className="font-bold text-lg mb-4">Benefits of Level 2 Verification</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Higher Loan Limits</p>
                                <p className="text-sm text-gray-600">Up to $5,000 per loan</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Lower Interest Rates</p>
                                <p className="text-sm text-gray-600">4-6% instead of 5-7%</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Verified Badge</p>
                                <p className="text-sm text-gray-600">Build trust with investors</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Priority Listing</p>
                                <p className="text-sm text-gray-600">Your loans appear first</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LevelCard({ level, title, badge, maxLoan, interest, active, completed }: {
    level: string
    title: string
    badge: string
    maxLoan: string
    interest: string
    active: boolean
    completed: boolean
}) {
    return (
        <div className={`card text-center ${active ? 'border-2 border-primary-600 bg-primary-50' :
            completed ? 'border-2 border-green-600 bg-green-50' :
                'opacity-60'
            }`}>
            <div className="text-3xl mb-2">{badge}</div>
            <p className="font-bold mb-1">Level {level}</p>
            <p className="text-sm text-gray-600 mb-3">{title}</p>
            <div className="text-xs space-y-1">
                <p className="font-medium">{maxLoan}</p>
                <p className="text-gray-600">{interest}</p>
            </div>
            {completed && (
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mt-2" />
            )}
        </div>
    )
}

function StepIndicator({ number, label, active }: {
    number: number
    label: string
    active: boolean
}) {
    return (
        <div className={`flex flex-col items-center ${active ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${active ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}>
                {number}
            </div>
            <span className="text-xs font-medium hidden sm:inline">{label}</span>
        </div>
    )
}

function FileUpload({ icon, label, description, file, onChange, required }: {
    icon: React.ReactNode
    label: string
    description: string
    file: File | null
    onChange: (file: File | null) => void
    required?: boolean
}) {
    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="font-medium mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">{description}</p>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        className="text-sm"
                        required={required}
                    />
                    {file && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {file.name}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
