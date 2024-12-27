import React from 'react';

interface ProofStatusProps {
  status: string;
  proofHash?: string;
  transactionHash?: string;
  timestamp?: number;
}

export const ProofStatus: React.FC<ProofStatusProps> = ({ 
  status, 
  proofHash, 
  transactionHash,
  timestamp 
}) => {
  return (
    <div className="w-full p-4 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${
          status === 'success' ? 'bg-green-500' :
          status === 'pending' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
        <h3 className="font-semibold">
          {status === 'success' ? 'Proof Verified & Stored' :
           status === 'pending' ? 'Verifying Proof' :
           'Verification Failed'}
        </h3>
      </div>
      
      {proofHash && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Proof Hash: </span>
          <span className="font-mono">{`${proofHash.slice(0, 10)}...${proofHash.slice(-8)}`}</span>
        </div>
      )}
      
      {timestamp && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Timestamp: </span>
          {new Date(timestamp * 1000).toLocaleString()}
        </div>
      )}
      
      {status === 'success' && transactionHash && (
        <a 
          href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:text-blue-600 mt-2 inline-block"
        >
          View on Etherscan
        </a>
      )}
    </div>
  );
};
