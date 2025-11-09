import Nav from './Nav';
import Hero from './Hero';
import FloatingSphere from './FloatingSphere';
import RightCards from './RightCards';

const LandingPage = ({ onStartAnalysis }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blue via-white to-primary-50 relative overflow-hidden">
      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <div className="relative pt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 items-center min-h-screen">
            {/* Left Column - Hero Content */}
            <div className="lg:col-span-5 z-10">
              <Hero onStartAnalysis={onStartAnalysis} />
            </div>

            {/* Center Column - Floating Sphere */}
            <div className="lg:col-span-4 flex items-center justify-center relative">
              <div className="w-full max-w-md lg:max-w-lg">
                <FloatingSphere />
              </div>
            </div>

            {/* Right Column - Cards */}
            <div className="lg:col-span-3 z-10">
              <RightCards />
            </div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default LandingPage;
