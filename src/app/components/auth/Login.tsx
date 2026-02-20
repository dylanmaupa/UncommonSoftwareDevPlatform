import { LuSparkles } from 'react-icons/lu';


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = authService.login(email, password);
      if (user) {
        toast.success(`Welcome back, ${user.nickname}!`);
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0747a1]/5 via-white to-[#FF6B35]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0747a1] mb-4">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 heading-font" style={{ color: '#1a1a2e' }}>
            Welcome Back
          </h1>
          <p className="text-[#6B7280]">
            Continue your coding journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[rgba(0,0,0,0.08)]">
          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-sm text-[#0747a1] hover:underline"
                  onClick={() => toast.info('Password reset feature coming soon!')}
                >
                  Forgot?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-[#F5F5FA] border-0"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base"
              style={{ backgroundColor: '#0747a1' }}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 rounded-xl bg-[#F5F5FA] border border-[rgba(91,79,255,0.2)]">
            <div className="flex items-start gap-2">
              <LuSparkles className="w-5 h-5 text-[#0747a1] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-[#1a1a2e] mb-1">Try the demo account:</p>
                <p className="text-[#6B7280]">
                  Email: <span className="font-mono">demo@example.com</span>
                  <br />
                  Password: <span className="font-mono">demo123</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-[#6B7280]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#0747a1] hover:underline font-medium">
              Sign up for free
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#6B7280] mt-6">
          Free, open-access coding education for everyone
        </p>
      </div>
    </div>
  );
}
