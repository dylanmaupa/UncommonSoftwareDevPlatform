import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { authService } from '../../services/mockData';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Code2, Rocket } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = authService.signup(email, password, nickname);
      if (user) {
        toast.success('🎉 Account created! Welcome to your coding journey!');
        navigate('/dashboard');
      } else {
        toast.error('Email already exists');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0747a1]/5 via-white to-[#FF6B35]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0747a1] to-[#8B5CF6] mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 heading-font" style={{ color: '#1a1a2e' }}>
            Start Your Journey
          </h1>
          <p className="text-[#6B7280]">
            Learn to code, completely free
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[rgba(0,0,0,0.08)]">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Choose a cool nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="h-12 rounded-xl bg-[#F5F5FA] border-0"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-xl bg-[#F5F5FA] border-0"
              />
              <p className="text-xs text-[#6B7280]">At least 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base"
              style={{ backgroundColor: '#0747a1' }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-[#6B7280]">
            Already have an account?{' '}
            <Link to="/" className="text-[#0747a1] hover:underline font-medium">
              Log in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 space-y-2">
          {[
            '✨ All courses and content unlocked',
            '🎯 Interactive coding challenges',
            '🏆 Earn XP and unlock achievements',
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-[#6B7280]">
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
