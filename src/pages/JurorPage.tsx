import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  FaWallet,
  FaUserCircle,
  FaGavel,
  FaRedo,
  FaSyncAlt,
  FaTimes,
  FaRegEye,
  FaCheckCircle,
  FaInfoCircle,
  FaLink,
  FaCloudDownloadAlt,
  FaCloud,
} from "react-icons/fa";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface LocalStorageDispute {
  id: string;
  txHash: string;
  description: string;
  contractAddress: string;
  recipientAddress: string;
  ipfsHash: string;
  aiAnalysis: string;
  status: string;
  submitter: string;
  timestamp: string;
  version: string;
  proofFileNames?: string[];
  proofFilesCount?: number;
}

const JurorPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [localDisputes, setLocalDisputes] = useState<LocalStorageDispute[]>([]);
  const [isAuthorizedJuror, setIsAuthorizedJuror] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDispute, setSelectedDispute] =
    useState<LocalStorageDispute | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Dark mode toggle
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found.");
      return;
    }
    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      await ethProvider.send("eth_requestAccounts", []);
      const signer = await ethProvider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Set as authorized juror for demo purposes
      setIsAuthorizedJuror(true);

      // Load local storage disputes
      loadLocalStorageDisputes();
    } catch (err) {
      alert("Wallet connection failed.");
      console.error(err);
    }
  };

  // Load disputes from local storage
  const loadLocalStorageDisputes = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("resolveAI_disputes");
      if (stored) {
        const disputes = JSON.parse(stored);
        const disputesArray = Array.isArray(disputes) ? disputes : [disputes];
        setLocalDisputes(disputesArray);
      } else {
        setLocalDisputes([]);
      }
    } catch (error) {
      console.error("Error loading disputes from local storage:", error);
      setLocalDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  // Update dispute status in local storage
  const updateDisputeStatus = (disputeId: string, newStatus: string) => {
    try {
      const updatedDisputes = localDisputes.map((dispute) =>
        dispute.id === disputeId ? { ...dispute, status: newStatus } : dispute
      );
      setLocalDisputes(updatedDisputes);
      localStorage.setItem(
        "resolveAI_disputes",
        JSON.stringify(updatedDisputes)
      );
    } catch (error) {
      console.error("Error updating dispute status:", error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status color based on status string
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ai analyzed":
        return "bg-indigo-600 dark:bg-indigo-500";
      case "deny refund":
        return "bg-red-500 dark:bg-red-400";
      case "partial refund":
        return "bg-amber-500 dark:bg-amber-400";
      case "full refund":
        return "bg-emerald-500 dark:bg-emerald-400";
      case "pending":
        return "bg-gray-500 dark:bg-gray-400";
      default:
        return "bg-slate-500 dark:bg-slate-400";
    }
  };

  // Handle review decision with confirmation
  const handleReviewDecision = (decision: string) => {
    if (!selectedDispute) return;
    const isConfirmed = window.confirm(
      `Are you sure you want to set the status to "${decision}" for Dispute #${selectedDispute.id}? This action cannot be undone.`
    );
    if (isConfirmed) {
      updateDisputeStatus(selectedDispute.id, decision);
      setShowReviewModal(false);
      setSelectedDispute(null);
    }
  };

  useEffect(() => {
    if (walletAddress && isAuthorizedJuror) {
      loadLocalStorageDisputes();
    }
  }, [walletAddress, isAuthorizedJuror]);

  return (
    // Use slate-900 or blue-950 for a deep colored but not-black bg
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 transition-colors">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-800 px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaGavel className="text-2xl text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Juror Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode((val) => !val)}
              className="rounded-full transition-colors duration-200 text-xs bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 px-3 py-1 mr-2 text-gray-800 dark:text-white"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? <FaCloud /> : <FaCloudDownloadAlt />}
            </button>
            {!walletAddress ? (
              <button
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-md"
                onClick={connectWallet}
              >
                <FaWallet />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                {isAuthorizedJuror && (
                  <div className="bg-emerald-500 dark:bg-emerald-400 text-white px-3 py-1 rounded-full text-sm shadow-sm flex items-center">
                    <FaCheckCircle className="mr-1" /> Authorized Juror
                  </div>
                )}
                <div className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 border dark:border-slate-600">
                  <FaUserCircle />
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
          <div className="text-center py-20">
            <FaGavel className="text-8xl mb-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Juror Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-xl mb-8">
              Connect your wallet to review disputed transactions
            </p>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-700 text-white px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto text-lg font-semibold shadow-lg"
              onClick={connectWallet}
            >
              <FaWallet />
              <span>Connect Wallet</span>
            </button>
          </div>
        ) : !isAuthorizedJuror ? (
          <div className="text-center py-20">
            <FaTimes className="text-8xl mb-8 text-red-600 dark:text-red-400 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-xl mb-4">
              You are not an authorized juror
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Contact the administrator to request juror authorization
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-200 mb-2">
                    Dispute Reviews
                  </h2>
                  <p className="text-gray-300">
                    Review and make decisions on disputed transactions
                  </p>
                </div>
                <button
                  onClick={loadLocalStorageDisputes}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <FaSyncAlt className="animate-spin" />
                  ) : (
                    <FaRedo />
                  )}
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <FaSyncAlt className="animate-spin text-6xl text-indigo-500 dark:text-indigo-300 mx-auto mb-4" />
                <p className="text-gray-300">Loading disputes...</p>
              </div>
            ) : localDisputes.length === 0 ? (
              <div className="text-center py-20">
                <FaInfoCircle className="text-8xl mb-8 text-gray-400 dark:text-gray-700 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-200 mb-4">
                  No Disputes Found
                </h3>
                <p className="text-gray-400">
                  No disputes available for review
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localDisputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          #{dispute.id}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                            dispute.status
                          )}`}
                        >
                          {dispute.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Transaction Hash
                        </label>
                        <p className="text-gray-800 dark:text-gray-200 text-sm break-all font-mono bg-gray-50 dark:bg-slate-900 p-2 rounded mt-1 border dark:border-slate-700">
                          {dispute.txHash.slice(0, 20)}...
                          {dispute.txHash.slice(-8)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Description
                        </label>
                        <p className="text-gray-800 dark:text-gray-200 text-sm bg-gray-50 dark:bg-slate-900 p-2 rounded mt-1 border dark:border-slate-700">
                          {dispute.description.slice(0, 60)}...
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-auto">
                        <button
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowDetailsModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1 text-sm shadow-sm"
                        >
                          <FaRegEye className="mr-1" />
                          <span>Details</span>
                        </button>
                        {dispute.status === "AI Analyzed" && (
                          <button
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowReviewModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1 text-sm shadow-sm"
                          >
                            <FaGavel className="mr-1" />
                            <span>Review</span>
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

        {/* Details Modal */}
        {showDetailsModal && selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 border dark:border-slate-700 max-h-[80vh] flex flex-col transition-colors">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Dispute #{selectedDispute.id} Details
                    </h2>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                        selectedDispute.status
                      )} mt-2`}
                    >
                      {selectedDispute.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
                    aria-label="Close"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Transaction Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Transaction Hash
                    </label>
                    <p className="text-gray-800 dark:text-gray-200 text-sm break-all font-mono bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700">
                      {selectedDispute.txHash}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Recipient Address
                    </label>
                    <p className="text-gray-800 dark:text-gray-200 text-sm break-all font-mono bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700">
                      {selectedDispute.recipientAddress}
                    </p>
                  </div>

                  {selectedDispute.contractAddress && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Contract Address
                      </label>
                      <p className="text-gray-800 dark:text-gray-200 text-sm break-all font-mono bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700">
                        {selectedDispute.contractAddress}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Submitted By
                    </label>
                    <p className="text-gray-800 dark:text-gray-200 text-sm break-all font-mono bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700">
                      {selectedDispute.submitter}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Submission Date
                    </label>
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700">
                      {formatTimestamp(selectedDispute.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    User's Complaint
                  </label>
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 text-sm mt-1">
                    {selectedDispute.description}
                  </p>
                </div>

                {/* AI Analysis */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    AI Analysis
                  </label>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700 mt-1">
                    <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                      {selectedDispute.aiAnalysis
                        .replace(/\*\*/g, "")
                        .replace(/\*/g, "")
                        .replace(/#{1,6}\s*/g, "")
                        .trim()}
                    </p>
                  </div>
                </div>

                {/* Proof Files */}
                {selectedDispute.proofFileNames &&
                  selectedDispute.proofFileNames.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Evidence Files
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedDispute.proofFileNames.map(
                          (fileName, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded text-sm border dark:border-blue-600 flex items-center"
                            >
                              <FaLink className="mr-1" /> {fileName}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                {selectedDispute.ipfsHash && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://gateway.pinata.cloud/ipfs/${selectedDispute.ipfsHash}`,
                        "_blank"
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm"
                  >
                    <FaCloud className="mr-1" />
                    <span>View IPFS</span>
                  </button>
                )}

                {selectedDispute.status === "AI Analyzed" && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowReviewModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm"
                  >
                    <FaGavel className="mr-1" />
                    <span>Review Dispute</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border dark:border-slate-700">
              <div className="text-center mb-6">
                <FaGavel className="text-4xl mb-3 text-indigo-600 dark:text-indigo-400 mx-auto" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Review Dispute #{selectedDispute.id}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Choose your decision for this dispute
                </p>
              </div>

              {/* Dispute Summary */}
              <div className="mb-6 bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border dark:border-slate-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Transaction
                </div>
                <div className="text-gray-800 dark:text-gray-200 font-mono text-xs break-all">
                  {selectedDispute.txHash.slice(0, 30)}...
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-2 mb-1">
                  Description
                </div>
                <div className="text-gray-800 dark:text-gray-200 text-sm">
                  {selectedDispute.description}
                </div>
              </div>

              {/* -- All decision buttons same color (Indigo) -- */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                <button
                  onClick={() => handleReviewDecision("Deny Refund")}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaCheckCircle />
                  <span className="font-medium">Deny Refund</span>
                </button>

                <button
                  onClick={() => handleReviewDecision("Partial Refund")}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaCheckCircle />
                  <span className="font-medium">Partial Refund</span>
                </button>

                <button
                  onClick={() => handleReviewDecision("Full Refund")}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaCheckCircle />
                  <span className="font-medium">Full Refund</span>
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-50 px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Cancel
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
