import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { LuMail, LuLogOut, LuRefreshCw } from 'react-icons/lu';
import { useNavigate } from 'react-router';

export default function EmailVerificationBlock({
    user,
    onChecked
}: {
    user: any;
    onChecked: () => void;
}) {
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const navigate = useNavigate();

    const handleResend = async () => {
        setIsResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard',
                }
            });
            if (error) throw error;
            toast.success('Verification email sent! Please check your inbox.');
        } catch (err: any) {
            toast.error(err.message || 'Failed to resend email');
        } finally {
            setIsResending(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const handleCheckAndReload = async () => {
        setIsChecking(true);
        await onChecked();
        setIsChecking(false);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-[rgba(0,0,0,0.08)] text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-6">
                <LuMail className="h-8 w-8 text-[#0747a1]" />
            </div>

            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2 heading-font">Verify your email</h2>
            <p className="text-[#6B7280] mb-6 text-sm">
                It's been a day or two since you joined! To ensure we can fully capture your email for our directories and keep your account secure, email verification is now mandatory to continue.
            </p>

            <div className="space-y-3">
                <Button
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full h-12 rounded-xl text-base"
                    style={{ backgroundColor: '#0747a1', color: 'white' }}
                >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>

                <Button
                    onClick={handleCheckAndReload}
                    disabled={isChecking}
                    variant="outline"
                    className="w-full h-12 rounded-xl text-base"
                >
                    <LuRefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                    I have verified my email
                </Button>

                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full h-12 rounded-xl text-base text-[#FF6B35] hover:text-[#FF6B35] hover:bg-red-50"
                >
                    <LuLogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
