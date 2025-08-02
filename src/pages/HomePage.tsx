import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faSearch, 
  faUsers, 
  faExchangeAlt 
} from '@fortawesome/free-solid-svg-icons';
import { 
  FileText, 
  Users, 
  ArrowRightLeft, 
  Heart, 
  TrendingUp,
  MapPin,
  Shield,
  Activity,
  Plus,
  Eye,
  Zap
} from 'lucide-react';
import { FaShieldAlt, FaSearch, FaUsers, FaExchangeAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLands: 2,
    totalTransfers: 1,
    heirsSet: 1,
    recentActivity: 2
  });
  const [userLands, setUserLands] = useState([
    { tokenId: 1, city: 'Delhi', state: 'Delhi', size: 1000 },
    { tokenId: 2, city: 'Mumbai', state: 'Maharashtra', size: 2000 }
  ]);
  const [loading, setLoading] = useState(false);
  const [recentLands, setRecentLands] = useState([
    { tokenId: 1, city: 'Delhi', state: 'Delhi', size: 1000 },
    { tokenId: 2, city: 'Mumbai', state: 'Maharashtra', size: 2000 }
  ]);

  useEffect(() => {
    // Mock loading function
    const loadData = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const quickActions = [
    {
      title: 'Register New Land',
      description: 'Add a new property to the blockchain',
      icon: FileText,
      link: '/register',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-200'
    },
    {
      title: 'View My Lands',
      description: 'Manage your property portfolio',
      icon: Users,
      link: '/ownership',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      hoverColor: 'hover:bg-emerald-200'
    },
    {
      title: 'Transfer Property',
      description: 'Transfer ownership securely',
      icon: ArrowRightLeft,
      link: '/transfer',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-200'
    },
    {
      title: 'Set Inheritance',
      description: 'Plan for the future',
      icon: Heart,
      link: '/inheritance',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      hoverColor: 'hover:bg-red-200'
    }
  ];

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };


  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Main Spline component */}
      <Spline 
        scene="https://prod.spline.design/MaDCOHnRuptcKeiK/scene.splinecode" 

        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );





};

export default Dashboard;