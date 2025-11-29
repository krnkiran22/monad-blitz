import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import DisputeResolutionABI from '../contracts/DisputeResolutionABI.json';

const DISPUTE_CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

interface DisputeData {
  id: number;
  plaintiff: string;
  defendant: string;
  description: string;
  amount: string;
  ipfsHash: string;
  status: number; // 0: Pending, 1: UnderReview, 2: Resolved, 3: Challenged
  aiRecommendation: string;
  jurorDecision: string;
  winner: string;
  timestamp: number;
}

export default function ResolutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [dispute, setDispute] = useState<DisputeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    loadDisputeDetails();
  }, [id]);

  useEffect(() => {
    if (dispute && dispute.status === 2) {
      // Trigger animations
      setTimeout(() => setAnimationPhase(1), 300);
      setTimeout(() => setAnimationPhase(2), 800);
      setTimeout(() => setAnimationPhase(3), 1300);
      setTimeout(() => setShowConfetti(true), 1500);
    }
  }, [dispute]);

  const loadDisputeDetails = async () => {
    if (!id) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        DISPUTE_CONTRACT_ADDRESS,
        DisputeResolutionABI,
        provider
      );

      const disputeData = await contract.getDispute(id);
      
      setDispute({
        id: parseInt(id),
        plaintiff: disputeData[0],
        defendant: disputeData[1],
        description: disputeData[2],
        amount: ethers.formatEther(disputeData[3]),
        ipfsHash: disputeData[4],
        status: disputeData[5],
        aiRecommendation: disputeData[6] || "No AI analysis available",
        jurorDecision: disputeData[7] || "No juror decision yet",
        winner: disputeData[8] || ethers.ZeroAddress,
        timestamp: disputeData[9] ? Number(disputeData[9]) : Date.now() / 1000,
      });
    } catch (error) {
      console.error("Error loading dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (status: number) => {
    switch (status) {
      case 0: return { text: "DISPUTE PENDING", color: "text-yellow-600", bg: "bg-yellow-50" };
      case 1: return { text: "UNDER REVIEW", color: "text-blue-600", bg: "bg-blue-50" };
      case 2: return { text: "DISPUTE RESOLVED", color: "text-green-600", bg: "bg-green-50" };
      case 3: return { text: "CHALLENGED BY JURORS", color: "text-purple-600", bg: "bg-purple-50" };
      default: return { text: "UNKNOWN STATUS", color: "text-gray-600", bg: "bg-gray-50" };
    }
  };

  const getOutcomeMessage = () => {
    if (!dispute || dispute.status !== 2) return null;
    
    const userAddress = window.ethereum?.selectedAddress?.toLowerCase();
    const winnerLower = dispute.winner.toLowerCase();
    
    if (winnerLower === userAddress) {
      return {
        title: "🎉 YOU WON THE DISPUTE!",
        message: "The resolution has been decided in your favor.",
        icon: "🏆",
        color: "text-green-600"
      };
    } else if (dispute.plaintiff.toLowerCase() === userAddress || dispute.defendant.toLowerCase() === userAddress) {
      return {
        title: "😔 DISPUTE RESOLVED AGAINST YOU",
        message: "Unfortunately, the decision was not in your favor.",
        icon: "⚖️",
        color: "text-red-600"
      };
    } else {
      return {
        title: "✅ DISPUTE RESOLVED",
        message: "The dispute has been successfully resolved.",
        icon: "⚖️",
        color: "text-blue-600"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dispute resolution...</p>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dispute Not Found</h2>
          <p className="text-gray-600 mb-6">The requested dispute could not be found.</p>
          <button
            onClick={() => navigate('/disputes')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Disputes
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(dispute.status);
  const outcomeMessage = getOutcomeMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className={`inline-block px-6 py-3 ${statusInfo.bg} rounded-full mb-4 transform transition-all duration-500 ${animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <span className={`${statusInfo.color} font-bold text-lg`}>{statusInfo.text}</span>
          </div>
          
          {outcomeMessage && (
            <div className={`transform transition-all duration-700 ${animationPhase >= 2 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="text-7xl mb-4 animate-bounce">{outcomeMessage.icon}</div>
              <h1 className={`text-4xl md:text-5xl font-bold ${outcomeMessage.color} mb-3`}>
                {outcomeMessage.title}
              </h1>
              <p className="text-xl text-gray-600">{outcomeMessage.message}</p>
            </div>
          )}
        </div>

        {/* Main Resolution Card */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden mb-6 transform transition-all duration-700 ${animationPhase >= 3 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          {/* Dispute Summary */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dispute #{dispute.id}</h2>
              <div className="text-sm text-gray-500">
                {new Date(dispute.timestamp * 1000).toLocaleString()}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Plaintiff</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <code className="text-sm font-mono text-blue-900 break-all">{dispute.plaintiff}</code>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Amount in Dispute</label>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{dispute.amount} MONAD</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Defendant</label>
                  <div className="mt-1 p-3 bg-purple-50 rounded-lg">
                    <code className="text-sm font-mono text-purple-900 break-all">{dispute.defendant}</code>
                  </div>
                </div>
                {dispute.winner !== ethers.ZeroAddress && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Winner</label>
                    <div className="mt-1 p-3 bg-green-50 rounded-lg flex items-center">
                      <span className="text-2xl mr-2">🏆</span>
                      <code className="text-sm font-mono text-green-900 break-all">{dispute.winner}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</label>
              <p className="mt-2 text-gray-700 p-4 bg-gray-50 rounded-lg leading-relaxed">
                {dispute.description}
              </p>
            </div>
          </div>

          {/* AI Analysis Section */}
          {dispute.aiRecommendation && dispute.aiRecommendation !== "No AI analysis available" && (
            <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">🤖</div>
                <h3 className="text-xl font-bold text-gray-800">AI Analysis</h3>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{dispute.aiRecommendation}</p>
              </div>
            </div>
          )}

          {/* Juror Decision Section */}
          {dispute.jurorDecision && dispute.jurorDecision !== "No juror decision yet" && (
            <div className="p-8 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">⚖️</div>
                <h3 className="text-xl font-bold text-gray-800">Juror Decision</h3>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{dispute.jurorDecision}</p>
              </div>
            </div>
          )}

          {/* IPFS Evidence Link */}
          {dispute.ipfsHash && (
            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📎</span>
                  <div>
                    <p className="font-semibold text-gray-700">Evidence stored on IPFS</p>
                    <code className="text-xs text-gray-500">{dispute.ipfsHash}</code>
                  </div>
                </div>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${dispute.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  View Evidence
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/disputes')}
            className="px-8 py-4 bg-white text-gray-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold flex items-center justify-center"
          >
            <span className="mr-2">←</span>
            Back to Disputes
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold flex items-center justify-center"
          >
            <span className="mr-2">🏠</span>
            Return Home
          </button>

          {dispute.status === 1 && (
            <button
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold flex items-center justify-center"
            >
              <span className="mr-2">⚔️</span>
              Challenge Decision
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes confetti {
          0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
