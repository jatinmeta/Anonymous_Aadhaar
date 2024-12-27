import { ethers } from 'ethers';
import AnonAadhaarVerifier from '../contracts/artifacts/AnonAadhaarVerifier.json';

export interface ProofSubmissionResult {
    proofHash: string;
    transactionHash: string;
}

interface StoredProof {
    proofHash: string;
    timestamp: number;
    isValid: boolean;
}

export class BlockchainService {
    private provider: ethers.providers.Web3Provider | null = null;
    private contract: ethers.Contract | null = null;
    private contractAddress: string;

    constructor(contractAddress: string) {
        this.contractAddress = contractAddress;
    }

    private async initializeProvider() {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = this.provider.getSigner();
        
        this.contract = new ethers.Contract(
            this.contractAddress,
            AnonAadhaarVerifier.abi,
            signer
        );
    }

    async connectWallet(): Promise<string> {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }

            // Initialize provider and contract with the connected account
            await this.initializeProvider();

            return accounts[0];
        } catch (error: any) {
            if (error.code === 4001) {
                throw new Error('Please connect your MetaMask wallet');
            }
            throw error;
        }
    }

    async verifyProof(proofData: any): Promise<boolean> {
        try {
            if (!proofData || !proofData.proof) {
                throw new Error('Invalid proof format');
            }

            if (!this.provider || !this.contract) {
                await this.initializeProvider();
            }

            if (!this.provider || !this.contract) {
                throw new Error('Failed to initialize blockchain connection');
            }

            // Calculate the proof hash
            const proofHash = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(JSON.stringify(proofData.proof))
            );

            try {
                // Check if this proof exists in the contract
                const exists = await this.contract.verifyProofExists(proofHash);
                
                if (!exists) {
                    throw new Error('This proof was not found on chain. The proof may not have been submitted or may be invalid.');
                }

                return true;
            } catch (error) {
                console.error('Error verifying on chain:', error);
                throw new Error('Failed to verify proof on chain. Make sure you\'re connected to the correct network.');
            }
        } catch (error: any) {
            console.error('Error verifying proof:', error);
            throw new Error(error.message || 'Failed to verify proof');
        }
    }

    async submitProof(proof: any): Promise<ProofSubmissionResult> {
        if (!this.provider || !this.contract) {
            await this.initializeProvider();
        }

        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        const proofHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(JSON.stringify(proof))
        );

        const tx = await this.contract.submitProof(proofHash);
        const receipt = await tx.wait();

        return {
            proofHash,
            transactionHash: receipt.transactionHash
        };
    }

    async getUserProofs(userAddress: string): Promise<StoredProof[]> {
        if (!this.provider || !this.contract) {
            await this.initializeProvider();
        }

        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        return await this.contract.getUserProofs(userAddress);
    }
}
