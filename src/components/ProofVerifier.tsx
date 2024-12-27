import React, { useState, useRef } from 'react';
import { BlockchainService } from '../services/BlockchainService';
import { ethers } from 'ethers';

interface ProofVerifierProps {
  blockchainService: BlockchainService | null;
}

const ProofVerifier: React.FC<ProofVerifierProps> = ({ blockchainService }) => {
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [proofDetails, setProofDetails] = useState<any>(null);
  const [proofHash, setProofHash] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !blockchainService) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    try {
      setVerificationStatus('loading');
      setErrorMessage('');
      setProofDetails(null);
      setProofHash('');

      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const proofData = JSON.parse(content);

          // Store proof details for display
          setProofDetails(proofData);

          // Calculate and store proof hash
          const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(JSON.stringify(proofData.proof))
          );
          setProofHash(hash);

          // Verify on-chain
          await blockchainService.verifyProof(proofData);
          setVerificationStatus('success');
          
        } catch (err: any) {
          console.error('Verification error:', err);
          setVerificationStatus('error');
          setErrorMessage(err.message || 'Failed to verify proof');
        }
      };

      fileReader.readAsText(file);
    } catch (err: any) {
      console.error('File reading error:', err);
      setVerificationStatus('error');
      setErrorMessage(err.message || 'Failed to read proof file');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Verify Existing Proof</h2>
      <p className="text-gray-600 mb-4">
        Upload your proof file to verify its validity on-chain.
      </p>
      
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          disabled={verificationStatus === 'loading'}
        >
          {verificationStatus === 'loading' ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Verifying...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload Proof File
            </>
          )}
        </button>
      </div>

      {verificationStatus === 'success' && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 text-green-700 rounded-lg">
            ✅ Proof verified successfully! This proof is valid and stored on-chain.
          </div>
          
          {proofDetails && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Proof Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {proofDetails.proof.id}<br />
                  <strong>Type:</strong> {proofDetails.proof.type}<br />
                  <strong>Generated:</strong> {new Date(proofDetails.proof.created_at).toLocaleString()}<br />
                  <strong>Hash:</strong> <span className="font-mono text-xs break-all">{proofHash}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {verificationStatus === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          ❌ {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ProofVerifier;