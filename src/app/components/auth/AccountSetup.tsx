import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { LuUser } from 'react-icons/lu';

const HUB_LOCATIONS = [
    'Dzivarasekwa',
    'Kuwadzana',
    'Kambuzuma',
    'Mbare',
    'Mufakose',
    'Warren Park',
    'Bulawayo',
    'Victoria Falls',
    'Gwai',
    'Gokwe',
];

const SPECIALIZATIONS = [
    'Digital Marketing',
    'Product Design',
    'Software Engineering'
];

interface AccountSetupProps {
    onComplete: () => void;
    userRole: 'student' | 'instructor';
}

export default function AccountSetup({ onComplete, userRole }: AccountSetupProps) {
    const [fullName, setFullName] = useState('');
    const [hubLocation, setHubLocation] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hubLocation) {
            toast.error('Please select a Hub Location');
            return;
        }

        if (userRole === 'instructor' && !specialization) {
            toast.error('Please select an Area of Specialization');
            return;
        }

        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Update the profile table
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    hub_location: hubLocation,
                    specialization: userRole === 'instructor' ? specialization : null,
                })
                .eq('id', user.id);

            if (error) {
                throw error;
            }

            toast.success('Account setup complete!');
            onComplete();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#F5F5FA] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0747a1] mb-4">
                        <LuUser className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl mb-2 heading-font" style={{ color: '#1a1a2e' }}>
                        Complete Your Profile
                    </h1>
                    <p className="text-[#6B7280]">Just a few more details to personalize your experience. {userRole === 'instructor' ? 'Welcome Instructor!' : ''}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-[rgba(0,0,0,0.08)]">
                    <form onSubmit={handleSetup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-[#F5F5FA] border-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hubLocation">Reporting Hub Location</Label>
                            <Select value={hubLocation} onValueChange={setHubLocation} required>
                                <SelectTrigger className="w-full h-12 bg-[#F5F5FA] border-0 rounded-xl">
                                    <SelectValue placeholder="Select Hub Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {HUB_LOCATIONS.map((hub) => (
                                        <SelectItem key={hub} value={hub}>{hub}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {userRole === 'instructor' && (
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Area of Specialization</Label>
                                <Select value={specialization} onValueChange={setSpecialization} required>
                                    <SelectTrigger className="w-full h-12 bg-[#F5F5FA] border-0 rounded-xl">
                                        <SelectValue placeholder="Select your specialization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPECIALIZATIONS.map((spec) => (
                                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base mt-4" style={{ backgroundColor: '#0747a1' }}>
                            {isLoading ? 'Saving...' : 'Finish Setup'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
