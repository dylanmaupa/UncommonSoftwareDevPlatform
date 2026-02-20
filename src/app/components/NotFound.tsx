import { LuArrowLeft } from 'react-icons/lu';


export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0747a1]/5 via-white to-[#FF6B35]/5 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl heading-font mb-4" style={{ color: '#0747a1' }}>
            404
          </h1>
          <h2 className="text-3xl heading-font mb-2" style={{ color: '#1a1a2e' }}>
            Page Not Found
          </h2>
          <p className="text-[#6B7280] text-lg">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard">
            <Button
              className="rounded-xl"
              style={{ backgroundColor: '#0747a1' }}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="rounded-xl"
          >
            <LuArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
