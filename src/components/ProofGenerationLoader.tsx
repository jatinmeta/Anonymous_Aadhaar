import React from 'react';

interface ProofGenerationLoaderProps {
  width?: string;
  height?: string;
  spinnerSize?: string;
}

const ProofGenerationLoader: React.FC<ProofGenerationLoaderProps> = ({
  width = "400px",
  height = "554px",
  spinnerSize = "80px"
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-8 text-center"
      style={{ width, height }}
    >
      <div 
        className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        style={{ width: spinnerSize, height: spinnerSize }}
      />
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Generating Your Proof
        </h3>
        <p className="text-gray-600">
          Please wait while we generate your anonymous proof.<br />
          This may take a few minutes.
        </p>
      </div>
    </div>
  );
};

export default ProofGenerationLoader;