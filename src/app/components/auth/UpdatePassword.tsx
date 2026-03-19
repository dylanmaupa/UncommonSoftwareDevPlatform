import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export default function UpdatePassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if the user is actually in a recovery session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Invalid or expired recovery link. Please try resetting your password again.');
                navigate('/forgot-password');
            }
        };
        checkSession();
    }, [navigate]);

    const passwordStrength = useMemo(() => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 8) score += 1;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score += 1;
        if (password.match(/\d/)) score += 1;
        if (password.match(/[^a-zA-Z\d]/)) score += 1;
        return score;
    }, [password]);

    const strengthColor = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'][passwordStrength];
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordStrength < 2) {
            toast.error('Please choose a stronger password');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('Password updated successfully! You can now log in.');
            navigate('/');
        } catch (err: any) {
            toast.error(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0747a1]/5 via-white to-[#1D4ED8]/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl mb-2 heading-font" style={{ color: '#1a1a2e' }}>
                        Update Password
                    </h1>
                    <p className="text-[#6B7280]">Enter your new secure password below</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-[rgba(0,0,0,0.08)]">
                    <form onSubmit={handleUpdate} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-12 rounded-xl bg-[#F5F5FA] border-0"
                                />
                            </div>

                            {password && (
                                <div className="space-y-1.5">
                                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                        <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${Math.max(10, passwordStrength * 25)}%` }} />
                                    </div>
                                    <p className="text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{strengthText}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-12 rounded-xl bg-[#F5F5FA] border-0"
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base" style={{ backgroundColor: '#0747a1' }}>
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
