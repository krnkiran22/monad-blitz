import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DisputeResolutionABI from "../contracts/DisputeResolutionABI.json";

// Replace with your deployed contract address
const DISPUTE_CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

interface Dispute {
  id: number;
  submitter: string;
  txHash: string;
  description: string;
  contractAddress: string;
  recipientAddress: string;
  ipfsHash: string;
  aiAnalysis: string;
  status: number;
  jurorDecision: number;
  juror: string;
  jurorReasoning: string;
  submissionTime: number;
  reviewTime: number;
  isChallenged: boolean;
}

const RefundDecision = {
  0: "Pending",
  1: "Full Refund",
  2: "Partial Refund", 
  3: "No Refund",
  4: "Not Possible"
} as const;

const DisputeStatus = {
  0: "Submitted",
  1: "Under Review",
  2: "Resolved",
  3: "Challenged"
} as const;

const JurorPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isAuthorizedJuror, setIsAuthorizedJuror] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewDecision, setReviewDecision] = useState<number>(1);
  const [reviewReasoning, setReviewReasoning] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Connect wallet
  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      toast.error("MetaMask not found.");
      return;
    }
    try {
      const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
      await ethProvider.send("eth_requestAccounts", []);
      const signer = await ethProvider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      
      const disputeContract = new ethers.Contract(
        DISPUTE_CONTRACT_ADDRESS,
        DisputeResolutionABI,
        signer
      );
      setContract(disputeContract);
      
      // Check if user is authorized juror
      const isJuror = await disputeContract.isAuthorizedJuror(address);
      setIsAuthorizedJuror(isJuror);
      
      toast.success("Wallet connected!");
      
      if (isJuror) {
        toast.success("Welcome, authorized juror!");
        fetchChallengedDisputes(disputeContract);
      } else {
        toast.warn("You are not an authorized juror.");
      }
    } catch (err) {
      toast.error("Wallet connection failed.");
      console.error(err);
    }
  };

  // Fetch challenged disputes from contract
  const fetchChallengedDisputes = async (contractInstance?: ethers.Contract) => {
    const contractToUse = contractInstance || contract;
    if (!contractToUse) return;
    
    setLoading(true);
    try {
      console.log("=== FETCHING CHALLENGED DISPUTES ===");
      
      // Get array of dispute IDs
      const disputeIds = await contractToUse.getAllChallengedDisputes();
      console.log("Challenged dispute IDs:", disputeIds);
      
      // Fetch full dispute data for each ID
      const disputes = [];
      for (let i = 0; i < disputeIds.length; i++) {
        const disputeId = disputeIds[i];
        const dispute = await contractToUse.getDispute(disputeId);
        disputes.push(dispute);
      }
      
      console.log("Raw disputes from contract:", disputes);
      
      const formattedDisputes = disputes.map((dispute: any) => ({
        id: Number(dispute.id),
        submitter: dispute.submitter,
        txHash: dispute.txHash,
        description: dispute.description,
        contractAddress: dispute.contractAddress,
        recipientAddress: dispute.recipientAddress,
        ipfsHash: dispute.ipfsHash,
        aiAnalysis: dispute.aiAnalysis,
        status: Number(dispute.status),
        jurorDecision: Number(dispute.jurorDecision),
        juror: dispute.juror,
        jurorReasoning: dispute.jurorReasoning,
        submissionTime: Number(dispute.submissionTime),
        reviewTime: Number(dispute.reviewTime),
        isChallenged: dispute.isChallenged
      }));
      
      setDisputes(formattedDisputes);
      console.log("Formatted disputes:", formattedDisputes);
      toast.success(`Loaded ${formattedDisputes.length} challenged disputes`);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to fetch disputes");
    } finally {
      setLoading(false);
    }
  };

  // Submit juror review
  const submitReview = async () => {
    if (!contract || !selectedDispute) return;
    
    if (!reviewReasoning.trim()) {
      toast.error("Please provide reasoning for your decision");
      return;
    }
    
    setSubmittingReview(true);
    try {
      console.log("=== SUBMITTING JUROR REVIEW ===");
      console.log("Dispute ID:", selectedDispute.id);
      console.log("Decision:", reviewDecision);
      console.log("Reasoning:", reviewReasoning);
      
      const tx = await contract.reviewDispute(
        selectedDispute.id,
        reviewDecision,
        reviewReasoning
      );
      
      toast.info("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      
      toast.success("Review submitted successfully!");
      
      // Reset form
      setShowReviewModal(false);
      setSelectedDispute(null);
      setReviewDecision(1);
      setReviewReasoning("");
      
      // Refresh disputes
      fetchChallengedDisputes();
      
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-blue-600";
      case 1: return "bg-yellow-600";
      case 2: return "bg-green-600";
      case 3: return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  useEffect(() => {
    if (contract && isAuthorizedJuror) {
      fetchChallengedDisputes();
    }
  }, [contract, isAuthorizedJuror]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ToastContainer theme="dark" />
      
      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              ⚖️ Juror Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {!walletAddress ? (
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                onClick={connectWallet}
              >
                <span>🔗</span>
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                {isAuthorizedJuror && (
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                    ✅ Authorized Juror
                  </div>
                )}
                <div className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <span>👤</span>
                  <span className="text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {!walletAddress ? (
          // Not connected state
          <div className="text-center py-20">
            <div className="text-8xl mb-8">⚖️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Juror Dashboard
            </h2>
            <p className="text-gray-400 text-xl mb-8">
              Connect your wallet to review challenged disputes
            </p>
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto text-lg font-semibold"
              onClick={connectWallet}
            >
              <span>🔗</span>
              <span>Connect Wallet</span>
            </button>
          </div>
        ) : !isAuthorizedJuror ? (
          // Not authorized state
          <div className="text-center py-20">
            <div className="text-8xl mb-8">🚫</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Access Denied
            </h2>
            <p className="text-gray-400 text-xl mb-4">
              You are not an authorized juror
            </p>
            <p className="text-gray-500">
              Contact the administrator to request juror authorization
            </p>
          </div>
        ) : (
          // Authorized juror interface
          <div>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Challenged Disputes
                  </h2>
                  <p className="text-gray-400">
                    Review and make decisions on disputed transactions
                  </p>
                </div>
                <button
                  onClick={() => fetchChallengedDisputes()}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <span>🔄</span>
                  )}
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Disputes List */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading disputes...</p>
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-8">📭</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Challenged Disputes
                </h3>
                <p className="text-gray-400">
                  There are currently no disputes that require your review
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl hover:border-gray-600 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white">
                            Dispute #{dispute.id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(dispute.status)}`}>
                            {DisputeStatus[dispute.status as keyof typeof DisputeStatus]}
                          </span>
                        </div>

                        {/* Transaction Details */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-300">Transaction Hash:</label>
                            <p className="text-white text-sm break-all font-mono bg-gray-700 p-2 rounded">
                              {dispute.txHash}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300">Recipient Address:</label>
                            <p className="text-white text-sm break-all font-mono bg-gray-700 p-2 rounded">
                              {dispute.recipientAddress}
                            </p>
                          </div>
                          {dispute.contractAddress && (
                            <div>
                              <label className="text-sm font-medium text-gray-300">Contract Address:</label>
                              <p className="text-white text-sm break-all font-mono bg-gray-700 p-2 rounded">
                                {dispute.contractAddress}
                              </p>
                            </div>
                          )}
                          <div>
                            <label className="text-sm font-medium text-gray-300">Submitted By:</label>
                            <p className="text-white text-sm break-all font-mono bg-gray-700 p-2 rounded">
                              {dispute.submitter}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="text-sm font-medium text-gray-300">User's Complaint:</label>
                          <p className="text-white bg-gray-700 p-3 rounded mt-1">
                            {dispute.description}
                          </p>
                        </div>

                        {/* AI Analysis */}
                        <div>
                          <label className="text-sm font-medium text-gray-300">AI Analysis:</label>
                          <div className="bg-gray-700 p-3 rounded mt-1">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">
                              {dispute.aiAnalysis
                                .replace(/\*\*/g, '') // Remove ** symbols
                                .replace(/\*/g, '') // Remove * symbols
                                .replace(/#{1,6}\s*/g, '') // Remove markdown headers
                                .trim()
                              }
                            </p>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex space-x-4 text-sm text-gray-400">
                          <div>
                            <span className="font-medium">Submitted:</span> {formatTimestamp(dispute.submissionTime)}
                          </div>
                          {dispute.reviewTime > 0 && (
                            <div>
                              <span className="font-medium">Reviewed:</span> {formatTimestamp(dispute.reviewTime)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="lg:ml-6 mt-4 lg:mt-0 flex flex-col space-y-3">
                        {dispute.ipfsHash && (
                          <button
                            onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${dispute.ipfsHash}`, "_blank")}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <span>🌐</span>
                            <span>View IPFS</span>
                          </button>
                        )}
                        
                        {dispute.status === 3 && ( // Challenged status
                          <button
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowReviewModal(true);
                            }}
                            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <span>⚖️</span>
                            <span>Review Dispute</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-700">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚖️</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Review Dispute #{selectedDispute.id}
                </h2>
                <p className="text-gray-400">
                  Make your final decision on this dispute
                </p>
              </div>

              {/* Decision Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Your Decision:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 1, label: "Full Refund", color: "from-green-600 to-emerald-600", icon: "💰" },
                    { value: 2, label: "Partial Refund", color: "from-yellow-600 to-orange-600", icon: "💸" },
                    { value: 3, label: "No Refund", color: "from-red-600 to-pink-600", icon: "❌" },
                    { value: 4, label: "Not Possible", color: "from-gray-600 to-slate-600", icon: "🚫" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setReviewDecision(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                        reviewDecision === option.value
                          ? `bg-gradient-to-r ${option.color} border-white text-white`
                          : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reasoning */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reasoning (Required):
                </label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 text-white p-4 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Explain your decision based on the evidence and transaction details..."
                  value={reviewReasoning}
                  onChange={(e) => setReviewReasoning(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={submittingReview || !reviewReasoning.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>⚖️</span>
                      <span>Submit Decision</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JurorPage;
