import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('Check your email for the password reset link!');
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
                        Reset Password
                    </h1>
                    <p className="text-[#6B7280]">Enter your email to receive a recovery link</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-[rgba(0,0,0,0.08)]">
                    <form onSubmit={handleReset} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-[#F5F5FA] border-0"
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base" style={{ backgroundColor: '#0747a1' }}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-[#6B7280]">
                        Remember your password?{' '}
                        <Link to="/" className="text-[#0747a1] hover:underline font-medium">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
