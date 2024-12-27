import React from 'react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span className="font-semibold text-xl">Anonymous Aadhaar</span>
            </div>
            <button
              onClick={onLaunchApp}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Privacy-First Identity Verification
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Prove your identity anonymously using your Aadhaar card. No personal information is stored or shared.
          </p>
          <button
            onClick={onLaunchApp}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Privacy First",
                description: "Your personal information remains private. Only zero-knowledge proofs are stored on-chain.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              },
              {
                title: "Easy to Use",
                description: "Simple interface to generate and verify proofs using your Aadhaar card.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Decentralized",
                description: "Fully on-chain verification with no central authority or database.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Connect Wallet",
                description: "Connect your MetaMask wallet to get started."
              },
              {
                step: "2",
                title: "Scan QR Code",
                description: "Scan the QR code from your Aadhaar card."
              },
              {
                step: "3",
                title: "Generate Proof",
                description: "A zero-knowledge proof will be generated and stored on-chain."
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-50" id="security">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Security & Privacy</h2>
            <p className="text-gray-600 mb-8">
              Your privacy is our top priority. We use zero-knowledge proofs to verify your identity without revealing any personal information.
              All proofs are stored on the Ethereum blockchain, ensuring transparency and immutability.
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-blue-600">Zero-Knowledge Proofs</div>
                <div className="text-sm text-gray-600">Cryptographic privacy</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-blue-600">On-Chain Storage</div>
                <div className="text-sm text-gray-600">Immutable & transparent</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-blue-600">No Personal Data</div>
                <div className="text-sm text-gray-600">Complete anonymity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                <span className="font-semibold text-xl">Anon Aadhaar</span>
              </div>
              <p className="text-gray-600 text-sm">
                Privacy-first identity verification using zero-knowledge proofs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#features" className="hover:text-blue-500">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-500">How it Works</a></li>
                <li><a href="#security" className="hover:text-blue-500">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="https://github.com/privacy-scaling-explorations/anon-aadhaar" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">GitHub</a></li>
                <li><a href="https://github.com/privacy-scaling-explorations/anon-aadhaar/blob/main/docs/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">Whitepaper</a></li>
                <li><a href="https://docs.anon-aadhaar.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="https://twitter.com/privacy_scaling" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">Twitter</a></li>
                <li><a href="https://discord.gg/sF5CT5rzrR" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">Discord</a></li>
                <li><a href="https://medium.com/privacy-scaling-explorations" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Anon Aadhaar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
