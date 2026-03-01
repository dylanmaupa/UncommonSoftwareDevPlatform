import { Link, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useState } from 'react';
import { getRandomAvatar, type Gender } from '../../lib/avatars';
import { LuRocket } from 'react-icons/lu';
import { supabase } from '../../../lib/supabase';

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

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [hubLocation, setHubLocation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubLocation) {
      toast.error('Please select a Hub Location');
      return;
    }

    if (role === 'instructor' && !specialization) {
      toast.error('Please select an Area of Specialization');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up the user (this creates the auth.users record)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            hub_location: hubLocation,
            specialization: role === 'instructor' ? specialization : null,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        // We now rely on a Supabase Database Trigger to create the profile
        // automatically using the metadata we passed in the options.data object.
        toast.success('Account created! Welcome to your coding journey!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0747a1]/5 via-white to-[#1D4ED8]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0747a1] to-[#8B5CF6] mb-4">
            <LuRocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 heading-font" style={{ color: '#1a1a2e' }}>
            Start Your Journey
          </h1>
          <p className="text-[#6B7280]">Learn to code, completely free</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[rgba(0,0,0,0.08)]">
          <form onSubmit={handleSignup} className="space-y-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={role} onValueChange={(value: 'student' | 'instructor') => setRole(value)} required>
                <SelectTrigger className="w-full h-12 bg-[#F5F5FA] border-0 rounded-xl">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
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

            {role === 'instructor' && (
              <div className="space-y-2">
                <Label htmlFor="specialization">Area of Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization} required={role === 'instructor'}>
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


            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base mt-2" style={{ backgroundColor: '#0747a1' }}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#6B7280]">
            Already have an account?{' '}
            <Link to="/" className="text-[#0747a1] hover:underline font-medium">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




