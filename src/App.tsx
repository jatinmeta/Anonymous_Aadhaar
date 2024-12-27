import {
  AnonAadhaarProof,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { useEffect, useState, useCallback } from "react";
import { BlockchainService } from "./services/BlockchainService";
import { ProofStatus } from "./components/ProofStatus";
import { ethers } from "ethers";
import ProofGenerationLoader from "./components/ProofGenerationLoader";
import AnonAadhaarWrapper from "./components/AnonAadhaarWrapper";
import ProofVerifier from "./components/ProofVerifier";
import LandingPage from "./components/LandingPage";

// const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ADDRESS= "0xff20Aab444486F560e8989115c1B469a3C2E57C9";
export default function App() {
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proofHistory, setProofHistory] = useState<any[]>([]);
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [networkName, setNetworkName] = useState<string>("");
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [mode, setMode] = useState<'generate' | 'verify' | null>(null);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    const initializeBlockchainService = async () => {
      try {
        if (window.ethereum) {
          setIsMetaMaskInstalled(true);
          const service = new BlockchainService(CONTRACT_ADDRESS);
          setBlockchainService(service);
          setCurrentStep(2); // Set to connect wallet step if MetaMask is installed
        } else {
          setIsMetaMaskInstalled(false);
          console.error('MetaMask is not installed');
        }
      } catch (error) {
        console.error('Error initializing blockchain service:', error);
      }
    };

    initializeBlockchainService();
  }, []);

  // Update network name
  const updateNetworkName = useCallback(async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setNetworkName(network.name);
    }
  }, []);

  // Check initial connection and set up listeners
  useEffect(() => {
    if (!blockchainService) return;

    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            setWalletAddress(address);
            setCurrentStep(3);
            await updateNetworkName();
          }
        }
      } catch (err) {
        console.error('Connection check error:', err);
      }
    };

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setCurrentStep(3);
      } else {
        setWalletAddress(null);
        setCurrentStep(2);
      }
    };

    const handleNetworkChanged = async () => {
      await updateNetworkName();
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleNetworkChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleNetworkChanged);
      }
    };
  }, [blockchainService, updateNetworkName]);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      if (!blockchainService) {
        throw new Error('Blockchain service not initialized');
      }

      const address = await blockchainService.connectWallet();
      setWalletAddress(address);
      setCurrentStep(3);
      await updateNetworkName();
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  useEffect(() => {
    const handleProofGeneration = async () => {
      if (!blockchainService) return;

      if (anonAadhaar.status === "logging-in") {
        setIsGeneratingProof(true);
        setError(null);
      } else if (anonAadhaar.status === "logged-in" && latestProof) {
        setIsGeneratingProof(false);
        setCurrentStep(4);
        
        try {
          setCurrentStep(5);
          setIsLoading(true);
          const result = await blockchainService.submitProof(latestProof);
          setTransactionHash(result.transactionHash);
          setProofHistory(prev => [...prev, latestProof]);
          setIsLoading(false);
        } catch (err: any) {
          setError("Failed to store proof on blockchain. Please try again.");
          setIsLoading(false);
        }
      } else if (anonAadhaar.status === "error") {
        setIsGeneratingProof(false);
        setError("Failed to verify identity. Please try again.");
      }
    };

    handleProofGeneration();
  }, [anonAadhaar.status, latestProof, blockchainService]);

  const renderStep = (stepNumber: number, title: string, isComplete: boolean) => {
    let status = "";
    if (stepNumber === 4 && currentStep === 4) {
      status = "Proof Generated";
    } else if (stepNumber === 5 && currentStep === 5 && !transactionHash) {
      status = "Storing on Blockchain...";
    } else if (stepNumber === 5 && transactionHash) {
      status = "Stored Successfully";
    }

    return (
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === stepNumber ? 'bg-blue-500 text-white' :
          isComplete ? 'bg-green-500 text-white' : 'bg-gray-200'
        }`}>
          {isComplete ? '✓' : stepNumber}
        </div>
        <div className="flex flex-col">
          <span className={currentStep === stepNumber ? 'font-bold' : ''}>{title}</span>
          {status && (
            <span className="text-sm text-gray-600">{status}</span>
          )}
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    setProofHistory([]);
    setTransactionHash(null);
    setCurrentStep(isMetaMaskInstalled ? 2 : 1);
  };

  const handleDownloadProof = () => {
    if (!latestProof || !transactionHash) return;

    const proofData = {
      proof: latestProof,
      transactionHash,
      timestamp: Date.now(),
      network: networkName,
      contract: CONTRACT_ADDRESS
    };

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anon-aadhaar-proof-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      {!showApp ? (
        <LandingPage onLaunchApp={() => setShowApp(true)} />
      ) : (
        <div className="min-h-screen bg-gray-100 px-4 py-8">
          <h2 className="text-xl font-semibold text-center mb-6"></h2>
          <main className="flex flex-col items-center gap-8 bg-white rounded-2xl max-w-screen-sm mx-auto min-h-[24rem] p-8">
            <h2 className="font-bold text-3xl"> Aadhaar Verification</h2>
            {/* Mode Selection */}
            {!mode && (
              <div className="w-full max-w-md space-y-4">
                <button
                  onClick={() => setShowApp(false)}
                  className="mb-6 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Home
                </button>
                <h2 className="text-xl font-semibold text-center mb-6">Choose an Option</h2>
                
                <button
                  onClick={() => setMode('generate')}
                  className="w-full p-6 text-left border rounded-lg hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Option 1: New User</h3>
                  </div>
                  <p className="text-gray-600 ml-11">
                    Generate a new anonymous proof using your Aadhaar card and store it on-chain.
                  </p>
                </button>

                <button
                  onClick={() => setMode('verify')}
                  className="w-full p-6 text-left border rounded-lg hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Option 2: Verify Existing Proof</h3>
                  </div>
                  <p className="text-gray-600 ml-11">
                    Verify an existing proof by uploading the JSON file and checking its validity on-chain.
                  </p>
                </button>

                {mode === 'verify' && !isMetaMaskInstalled && (
                  <div className="text-red-500 text-center mt-4">
                    Please install MetaMask to verify proofs on-chain.
                  </div>
                )}
              </div>
            )}

            {/* Generation Flow */}
            {mode === 'generate' && (
              <div className="w-full max-w-md">
                <button
                  onClick={() => setMode(null)}
                  className="mb-6 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Options
                </button>

                {renderStep(1, "Install MetaMask", currentStep > 1 || isMetaMaskInstalled)}
                {renderStep(2, "Connect Wallet", currentStep > 2)}
                {renderStep(3, "Provide Aadhaar QR", currentStep > 3)}
                {renderStep(4, "Generate Proof", currentStep > 4)}
                {renderStep(5, "Store on Blockchain", currentStep === 5 && transactionHash !== null)}

                {currentStep === 2 && (
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={handleConnectWallet}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Connect Wallet
                    </button>
                    <p className="text-sm text-gray-600">
                      Connect your wallet to continue with the verification process
                    </p>
                  </div>
                )}

                {currentStep === 3 && (
                  <>
                    <p className="text-center text-gray-600">
                      Prove your Identity anonymously using your Aadhaar card.
                      <br />
                      <span className="text-sm">Your proof will be securely stored on Sepolia testnet.</span>
                    </p>
                    <AnonAadhaarWrapper
                      onProofGenerated={() => {
                        setIsGeneratingProof(true);
                      }}
                      onVerify={() => {
                        setCurrentStep(4);
                      }}
                      onError={(error) => {
                        setError(error.message);
                        setIsGeneratingProof(false);
                      }}
                    />
                  </>
                )}
              </div>
            )}

            {/* Verification Flow */}
            {mode === 'verify' && (
              <div className="w-full">
                <button
                  onClick={() => setMode(null)}
                  className="mb-6 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Options
                </button>

                <ProofVerifier blockchainService={blockchainService} />
              </div>
            )}

            {/* Loading and Error States */}
            {isGeneratingProof && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                <div 
                  className="bg-white rounded-lg p-8 mx-4"
                  style={{
                    width: 'fit-content',
                    height: 'fit-content'
                  }}
                >
                  <ProofGenerationLoader 
                    width="400px"    
                    height="554px"   
                    spinnerSize="80px"  
                  />
                </div>
              </div>
            )}

            {isLoading && !isGeneratingProof && (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p>Processing blockchain transaction...</p>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg w-full">
                {error}
              </div>
            )}

            {/* Success States */}
            {anonAadhaar.status === "logged-in" && mode === 'generate' && (
              <div className="flex flex-col items-center gap-4 w-full">
                <ProofStatus 
                  status="success"
                  proofHash={latestProof ? ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(latestProof))) : undefined}
                  transactionHash={transactionHash || undefined}
                  timestamp={Date.now() / 1000}
                />

                {latestProof && transactionHash && (
                  <div className="flex gap-4">
                    <button
                      onClick={handleDownloadProof}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Proof
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMode(null);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Start New Verification
                    </button>
                  </div>
                )}

                {latestProof && (
                  <div className="w-full">
                    <h3 className="font-semibold mb-2">Proof Details</h3>
                    <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}
