import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Info, 
  Zap, 
  Layers, 
  SlidersHorizontal, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  FileText, 
  ExternalLink,
  Sliders,
  DollarSign,
  Calendar,
  AlertCircle,
  Building2,
  Scale,
  Sparkles,
  Grid,
  Columns
} from 'lucide-react';

type MatchBreakdownItem = { field: string; score: number; detail: string };
type MatchedContract = {
  contractId: string;
  counterparty: string;
  remainingBalance: number;
  contractPrice: number;
  fuelCode: string;
  expirationDate: string;
  breakdown: MatchBreakdownItem[];
};
type ContractCandidate = {
  contractId: string;
  counterparty: string;
  fuelCode: string;
  contractPrice: number;
  remainingBalance: number;
  confidence: number;
  expirationDate?: string;
  isRecommended?: boolean;
  breakdown?: MatchBreakdownItem[];
};
type Buy = {
  id: string;
  counterparty: string;
  fuelCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  deliveryDate: string;
  location: string;
  confidence: number;
  category: "high" | "fuzzy" | "unmatched";
  reasonSummary?: string;
  matchedContract: MatchedContract | null;
  candidates: ContractCandidate[];
};

const MOCK_BUYS: Buy[] = [
  // High Confidence Matches
  {
    id: "BUY-8841",
    counterparty: "Apex Energy Logistics",
    fuelCode: "D6 Renewable Diesel (RINs)",
    quantity: 50000,
    unit: "Gal",
    unitPrice: 2.85,
    totalValue: 142500,
    deliveryDate: "2026-10-12",
    location: "Houston Ship Channel (Hub 4)",
    confidence: 99,
    category: "high",
    matchedContract: {
      contractId: "CTR-2026-904A",
      counterparty: "Apex Energy Logistics",
      remainingBalance: 320000,
      contractPrice: 2.85,
      fuelCode: "D6 Renewable Diesel (RINs)",
      expirationDate: "2026-12-31",
      breakdown: [
        { field: "Counterparty Exact Match", score: 100, detail: "Apex Energy Logistics = Apex Energy Logistics" },
        { field: "Fuel Spec & RIN Category", score: 100, detail: "D6 Renewable Diesel 100% compliant" },
        { field: "Price Variance", score: 100, detail: "$2.85 vs $2.85 (0.0% Variance)" },
        { field: "Delivery Date Window", score: 98, detail: "Delivery date falls well within active contract range" },
        { field: "Contract Balance Tolerance", score: 100, detail: "50,000 Gal requested out of 320,000 Gal remaining" }
      ]
    },
    candidates: []
  },
  {
    id: "BUY-8842",
    counterparty: "Marathon Fuel Trading",
    fuelCode: "B20 Biodiesel Blend",
    quantity: 25000,
    unit: "Gal",
    unitPrice: 3.10,
    totalValue: 77500,
    deliveryDate: "2026-10-15",
    location: "Pasadena Terminal",
    confidence: 97,
    category: "high",
    matchedContract: {
      contractId: "CTR-2026-118B",
      counterparty: "Marathon Fuel Trading",
      remainingBalance: 110000,
      contractPrice: 3.10,
      fuelCode: "B20 Biodiesel Blend",
      expirationDate: "2026-11-30",
      breakdown: [
        { field: "Counterparty Exact Match", score: 100, detail: "Marathon Fuel Trading = Marathon Fuel Trading" },
        { field: "Fuel Spec & RIN Category", score: 100, detail: "B20 Biodiesel Blend exact match" },
        { field: "Price Variance", score: 100, detail: "$3.10 vs $3.10 (0.0% Variance)" },
        { field: "Delivery Date Window", score: 95, detail: "Delivery in 10 days, contract active" },
        { field: "Contract Balance Tolerance", score: 95, detail: "25,000 Gal requested out of 110,000 Gal remaining" }
      ]
    },
    candidates: []
  },
  {
    id: "BUY-8843",
    counterparty: "Chevron Supply Co.",
    fuelCode: "Conventional Gasoline 87",
    quantity: 100000,
    unit: "Gal",
    unitPrice: 2.15,
    totalValue: 215000,
    deliveryDate: "2026-10-18",
    location: "Port Arthur Hub",
    confidence: 96,
    category: "high",
    matchedContract: {
      contractId: "CTR-2026-441C",
      counterparty: "Chevron Supply Co.",
      remainingBalance: 450000,
      contractPrice: 2.15,
      fuelCode: "Conventional Gasoline 87",
      expirationDate: "2027-01-15",
      breakdown: [
        { field: "Counterparty Exact Match", score: 100, detail: "Chevron Supply Co. = Chevron Supply Co." },
        { field: "Fuel Spec & RIN Category", score: 100, detail: "Conventional Gasoline 87 matches master agreement" },
        { field: "Price Variance", score: 100, detail: "$2.15 vs $2.15 (0.0% Variance)" },
        { field: "Delivery Date Window", score: 92, detail: "Within standard delivery schedule window" },
        { field: "Contract Balance Tolerance", score: 98, detail: "100,000 Gal requested out of 450,000 Gal remaining" }
      ]
    },
    candidates: []
  },

  // Ambiguous & Fuzzy Matches
  {
    id: "BUY-8844",
    counterparty: "Sunoco LP Logistics",
    fuelCode: "ULSD (Ultra-Low Sulfur Diesel)",
    quantity: 40000,
    unit: "Gal",
    unitPrice: 2.92,
    totalValue: 116800,
    deliveryDate: "2026-10-14",
    location: "Beaumont Refinery Terminal",
    confidence: 84,
    category: "fuzzy",
    reasonSummary: "Multiple valid open contracts found with subtle price & balance variances.",
    matchedContract: null,
    candidates: [
      {
        contractId: "CTR-2026-782A",
        counterparty: "Sunoco LP Logistics",
        remainingBalance: 35000, // Slightly lower than buy
        contractPrice: 2.90,     // 0.68% variance
        fuelCode: "ULSD Premium Grade",
        expirationDate: "2026-10-31",
        confidence: 84,
        isRecommended: true,
        breakdown: [
          { field: "Counterparty Match", score: 100, detail: "Exact counterparty match" },
          { field: "Fuel Spec & RIN Category", score: 88, detail: "ULSD vs ULSD Premium Grade (Minor spec uplift)" },
          { field: "Price Variance", score: 92, detail: "Buy $2.92 vs Contract $2.90 (-$0.02 / gal)" },
          { field: "Contract Balance", score: 65, detail: "Requested 40k Gal exceeds available balance 35k Gal by 5k Gal" }
        ]
      },
      {
        contractId: "CTR-2026-890B",
        counterparty: "Sunoco LP Logistics",
        remainingBalance: 120000,
        contractPrice: 2.98,
        fuelCode: "ULSD Standard",
        expirationDate: "2026-11-15",
        confidence: 76,
        isRecommended: false,
        breakdown: [
          { field: "Counterparty Match", score: 100, detail: "Exact counterparty match" },
          { field: "Fuel Spec & RIN Category", score: 95, detail: "ULSD vs ULSD Standard" },
          { field: "Price Variance", score: 60, detail: "Buy $2.92 vs Contract $2.98 (+$0.06 / gal high)" },
          { field: "Contract Balance", score: 100, detail: "120k Gal available amply covers 40k Gal buy" }
        ]
      }
    ]
  },
  {
    id: "BUY-8845",
    counterparty: "Valero Marketing Corp",
    fuelCode: "D4 Biomass-Based Diesel",
    quantity: 60000,
    unit: "Gal",
    unitPrice: 3.45,
    totalValue: 207000,
    deliveryDate: "2026-10-22",
    location: "Corpus Christi Terminal",
    confidence: 78,
    category: "fuzzy",
    reasonSummary: "Subsidiary name match (Valero Marketing vs Valero Energy West) & slight RIN index lag.",
    matchedContract: null,
    candidates: [
      {
        contractId: "CTR-2026-309X",
        counterparty: "Valero Energy West (Subsidiary)",
        remainingBalance: 200000,
        contractPrice: 3.42,
        fuelCode: "D4 Biomass Diesel Tier 2",
        expirationDate: "2026-12-01",
        confidence: 78,
        isRecommended: true,
        breakdown: [
          { field: "Counterparty Match", score: 80, detail: "Valero Marketing Corp mapped to parent master Valero Energy West" },
          { field: "Fuel Spec & RIN Category", score: 90, detail: "D4 Biomass Diesel Tier 2 acceptable replacement" },
          { field: "Price Variance", score: 85, detail: "Buy $3.45 vs Contract $3.42 ($0.03 delta)" },
          { field: "Contract Balance", score: 100, detail: "Sufficient balance (200k Gal available)" }
        ]
      }
    ]
  },

  // Unmatched Buys
  {
    id: "BUY-8846",
    counterparty: "Vanguard Biofuels LLC",
    fuelCode: "Cellulosic Ethanol D3",
    quantity: 15000,
    unit: "Gal",
    unitPrice: 4.10,
    totalValue: 61500,
    deliveryDate: "2026-10-28",
    location: "Des Moines Bio Hub",
    confidence: 0,
    category: "unmatched",
    reasonSummary: "No open contracts found for Vanguard Biofuels LLC or D3 Cellulosic category.",
    matchedContract: null,
    candidates: []
  },
  {
    id: "BUY-8847",
    counterparty: "Global Clean Aviation Inc",
    fuelCode: "Sustainable Aviation Fuel (SAF)",
    quantity: 80000,
    unit: "Gal",
    unitPrice: 4.85,
    totalValue: 38800,
    deliveryDate: "2026-11-05",
    location: "LAX Fuel Depot",
    confidence: 0,
    category: "unmatched",
    reasonSummary: "Master contract pending signature; zero active contract IDs in pipeline.",
    matchedContract: null,
    candidates: []
  }
];

const MASTER_CONTRACTS_LIBRARY = [
  { id: "CTR-MAN-101", counterparty: "Vanguard Biofuels LLC", fuelCode: "Cellulosic Ethanol D3", balance: 50000, rate: "$4.08/gal" },
  { id: "CTR-MAN-102", counterparty: "Global Clean Aviation Inc", fuelCode: "Sustainable Aviation Fuel (SAF)", balance: 250000, rate: "$4.80/gal" },
  { id: "CTR-MAN-103", counterparty: "Apex Energy Logistics", fuelCode: "D6 Renewable Diesel (RINs)", balance: 180000, rate: "$2.88/gal" },
  { id: "CTR-MAN-104", counterparty: "General Spot Contract Pool", fuelCode: "Multi-Grade Fuel Reserve", balance: 1000000, rate: "Market Floating" }
];

export default function ReconciliationWorkspace() {
  const [activeTab, setActiveTab] = useState('high'); // 'high', 'fuzzy', 'unmatched'
  const [prototypeMode, setPrototypeMode] = useState('grid'); // 'grid' (Prototype A) or 'split' (Prototype B)
  const [buysData, setBuysData] = useState<Buy[]>(MOCK_BUYS);
  
  // Selection and Modal State
  const [selectedBuyIds, setSelectedBuyIds] = useState<string[]>([]);
  const [executingBatch, setExecutingBatch] = useState(false);
  const [executedToast, setExecutedToast] = useState<string | null>(null);
  
  // Fuzzy & Manual Match Details State
  const [focusedFuzzyBuy, setFocusedFuzzyBuy] = useState<Buy | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [manualLinkBuy, setManualLinkBuy] = useState<Buy | null>(null);
  const [unreconcileBuyModal, setUnreconcileBuyModal] = useState<Buy | null>(null);
  const [unreconcileReason, setUnreconcileReason] = useState('Spot Market Exemption');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering and Sorting
  const [filterFuel, setFilterFuel] = useState('ALL');

  // Sync focused fuzzy buy when switching tabs or loading initial state
  const fuzzyBuys = useMemo(() => buysData.filter(b => b.category === 'fuzzy'), [buysData]);
  const highBuys = useMemo(() => buysData.filter(b => b.category === 'high'), [buysData]);
  const unmatchedBuys = useMemo(() => buysData.filter(b => b.category === 'unmatched'), [buysData]);

  // Set default selected fuzzy buy if empty
  React.useEffect(() => {
    if (fuzzyBuys.length > 0 && !focusedFuzzyBuy) {
      const first = fuzzyBuys[0];
      setFocusedFuzzyBuy(first);
      const firstCandidate = first.candidates[0];
      if (firstCandidate) setSelectedCandidateId(firstCandidate.contractId);
    }
  }, [fuzzyBuys, focusedFuzzyBuy]);

  const currentTabBuys = useMemo(() => {
    let list = [];
    if (activeTab === 'high') list = highBuys;
    else if (activeTab === 'fuzzy') list = fuzzyBuys;
    else list = unmatchedBuys;

    return list.filter(buy => {
      const matchesSearch = buy.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            buy.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            buy.fuelCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFuel = filterFuel === 'ALL' || buy.fuelCode.includes(filterFuel);
      return matchesSearch && matchesFuel;
    });
  }, [activeTab, highBuys, fuzzyBuys, unmatchedBuys, searchTerm, filterFuel]);

  // Selection Logic for Tab 1 (Bulk)
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBuyIds(currentTabBuys.map(b => b.id));
    } else {
      setSelectedBuyIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedBuyIds.includes(id)) {
      setSelectedBuyIds(selectedBuyIds.filter(item => item !== id));
    } else {
      setSelectedBuyIds([...selectedBuyIds, id]);
    }
  };

  const handleExecuteBulk = () => {
    const count = selectedBuyIds.length;
    setBuysData(prev => prev.filter(b => !selectedBuyIds.includes(b.id)));
    setSelectedBuyIds([]);
    setExecutingBatch(false);
    triggerToast(`Successfully executed and reconciled ${count} High-Confidence Buys.`);
  };

  const handleApproveFuzzyMatch = (buyId: string, candidateContractId: string) => {
    setBuysData(prev => prev.filter(b => b.id !== buyId));
    triggerToast(`Buy ${buyId} approved & linked to Contract ${candidateContractId}.`);
    // Reset focus to next available item
    const remaining = fuzzyBuys.filter(b => b.id !== buyId);
    if (remaining.length > 0) {
      const next = remaining[0];
      setFocusedFuzzyBuy(next);
      const nextCandidate = next.candidates[0];
      if (nextCandidate) setSelectedCandidateId(nextCandidate.contractId);
    } else {
      setFocusedFuzzyBuy(null);
    }
  };

  const handleManualContractLink = (buyId: string, contractId: string) => {
    setBuysData(prev => prev.filter(b => b.id !== buyId));
    setManualLinkBuy(null);
    triggerToast(`Buy ${buyId} manually mapped to Contract ${contractId} and executed.`);
  };

  const handleApproveUnreconciled = (buyId: string) => {
    setBuysData(prev => prev.filter(b => b.id !== buyId));
    setUnreconcileBuyModal(null);
    triggerToast(`Buy ${buyId} approved as UNRECONCILED. Audit Log updated with tag: "${unreconcileReason}".`);
  };

  const triggerToast = (msg: string) => {
    setExecutedToast(msg);
    setTimeout(() => {
      setExecutedToast(null);
    }, 4500);
  };

  const renderScoreBadge = (score: number, category: 'high' | 'fuzzy' | 'unmatched') => {
    let bgColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    let icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
    
    if (category === 'fuzzy' || (score >= 70 && score < 90)) {
      bgColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      icon = <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
    } else if (category === 'unmatched' || score < 70) {
      bgColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      icon = <XCircle className="w-3.5 h-3.5 mr-1" />;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${bgColor}`}>
        {icon}
        {score > 0 ? `${score}% Match` : 'Unmatched'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-30 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">EnergyTrade Match Studio</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  Reconciliation Center
                </span>
              </div>
              <p className="text-xs text-slate-400">Evaluate Incoming Buys, Open Contract Balances & RINs Alignment</p>
            </div>
          </div>

          {/* Prototype Toggle Control */}
          <div className="flex items-center space-x-4 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Layout Variant:</span>
            </div>
            <button
              onClick={() => setPrototypeMode('grid')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                prototypeMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Prototype A (Grid + Drawer)</span>
            </button>
            <button
              onClick={() => setPrototypeMode('split')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                prototypeMode === 'split'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Prototype B (Split Comparison Workspace)</span>
            </button>
          </div>
        </div>
      </header>

      {}
      {executedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-5 py-3.5 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{executedToast}</span>
        </div>
      )}

      {}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Metric Summary Cards Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tab 1 Trigger Card */}
          <button
            onClick={() => setActiveTab('high')}
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
              activeTab === 'high' 
                ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                High Confidence / Auto-Eligible
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                {highBuys.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              ${highBuys.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Exact match parameters. Fast-track bulk execution ready.</p>
            {activeTab === 'high' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />}
          </button>

          {/* Tab 2 Trigger Card */}
          <button
            onClick={() => setActiveTab('fuzzy')}
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
              activeTab === 'fuzzy' 
                ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Ambiguous & Fuzzy Matches
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                {fuzzyBuys.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              ${fuzzyBuys.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Multiple contract options or variance requires trader review.</p>
            {activeTab === 'fuzzy' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />}
          </button>

          {/* Tab 3 Trigger Card */}
          <button
            onClick={() => setActiveTab('unmatched')}
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
              activeTab === 'unmatched' 
                ? 'bg-slate-900 border-rose-500/50 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Unmatched / Exception Buys
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300">
                {unmatchedBuys.length}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              ${unmatchedBuys.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">No open contract candidate. Require manual link or unreconciled pass.</p>
            {activeTab === 'unmatched' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />}
          </button>
        </div>

        {}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto flex-1">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                placeholder="Search Buy ID, Counterparty, Fuel Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Fuel Types</option>
                <option value="D6 Renewable Diesel">D6 Renewable Diesel</option>
                <option value="B20 Biodiesel">B20 Biodiesel</option>
                <option value="Conventional Gasoline">Conventional Gasoline</option>
                <option value="ULSD">ULSD Diesel</option>
                <option value="SAF">Sustainable Aviation Fuel</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span>Showing <strong className="text-slate-200">{currentTabBuys.length}</strong> items in current queue</span>
          </div>
        </div>

        {}
        {activeTab === 'high' && (
          <div className="space-y-4">
            {/* Bulk Toolbar */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="selectAllHigh"
                  checked={selectedBuyIds.length === currentTabBuys.length && currentTabBuys.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="selectAllHigh" className="text-xs font-semibold text-emerald-300 cursor-pointer">
                  Select All High-Confidence Buys ({selectedBuyIds.length} selected)
                </label>
              </div>

              <button
                disabled={selectedBuyIds.length === 0}
                onClick={() => setExecutingBatch(true)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center space-x-2 ${
                  selectedBuyIds.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute & Approve Selected ({selectedBuyIds.length})</span>
              </button>
            </div>

            {/* High Match Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3.5 w-10"></th>
                    <th className="p-3.5">Buy Details</th>
                    <th className="p-3.5">Fuel / Commodity Spec</th>
                    <th className="p-3.5">Quantity & Price</th>
                    <th className="p-3.5">Auto-Matched Contract</th>
                    <th className="p-3.5 text-center">Confidence Rationale</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentTabBuys.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No high confidence buys pending execution.
                      </td>
                    </tr>
                  ) : (
                    currentTabBuys.map((buy) => {
                      const isSelected = selectedBuyIds.includes(buy.id);
                      return (
                        <tr 
                          key={buy.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-emerald-950/10' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(buy.id)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-100">{buy.id}</div>
                            <div className="text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Building2 className="w-3 h-3" />
                              <span>{buy.counterparty}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-medium text-slate-200">{buy.fuelCode}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">{buy.location}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-200">
                              {buy.quantity.toLocaleString()} {buy.unit}
                            </div>
                            <div className="text-slate-400">${buy.unitPrice.toFixed(2)}/gal (${buy.totalValue.toLocaleString()})</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono text-emerald-400 font-bold">{buy.matchedContract!.contractId}</div>
                            <div className="text-slate-400 text-[11px]">
                              Bal: {buy.matchedContract!.remainingBalance.toLocaleString()} {buy.unit}
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="inline-flex flex-col items-center">
                              {renderScoreBadge(buy.confidence, 'high')}
                              <span className="text-[10px] text-slate-500 mt-1">100% Parameter Alignment</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setBuysData(prev => prev.filter(b => b.id !== buy.id));
                                triggerToast(`Executed Buy ${buy.id} against Contract ${buy.matchedContract!.contractId}`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all"
                            >
                              Execute Buy
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {}
        {activeTab === 'fuzzy' && (
          <div>
            {prototypeMode === 'grid' ? (
              /* PROTOTYPE A: Dense Data Grid Layout with Expandable Accordion Breakdown */
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-2">
                <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs text-amber-400 font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Prototype A View: Select candidate contracts to review score breakdown before approving.</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {currentTabBuys.map((buy) => (
                    <div key={buy.id} className="p-5 space-y-4 hover:bg-slate-800/20 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-bold text-white">{buy.id}</span>
                            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {buy.candidates.length} Candidate Contracts Found
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            Counterparty: <span className="text-white font-semibold">{buy.counterparty}</span> &bull; {buy.fuelCode} &bull; {buy.quantity.toLocaleString()} {buy.unit} @ ${buy.unitPrice.toFixed(2)}/gal
                          </p>
                          <p className="text-xs text-amber-400/90 italic flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" />
                            <span>System Recommendation Note: {buy.reasonSummary}</span>
                          </p>
                        </div>
                      </div>

                      {/* Candidate Comparison Matrix in Grid Mode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {buy.candidates.map((cand) => (
                          <div 
                            key={cand.contractId}
                            className={`p-4 rounded-xl border transition-all space-y-3 ${
                              cand.isRecommended 
                                ? 'bg-amber-950/10 border-amber-500/40 ring-1 ring-amber-500/20' 
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-bold text-slate-100">{cand.contractId}</span>
                                {cand.isRecommended && (
                                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-500 text-slate-950 rounded">
                                    Top Candidate
                                  </span>
                                )}
                              </div>
                              {renderScoreBadge(cand.confidence, 'fuzzy')}
                            </div>

                            <div className="text-xs space-y-1 text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Target Contract Rate:</span>
                                <span className="font-mono text-slate-200">${cand.contractPrice.toFixed(2)}/gal</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Remaining Balance:</span>
                                <span className="font-mono text-slate-200">{cand.remainingBalance.toLocaleString()} {buy.unit}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Spec Alignment:</span>
                                <span className="text-slate-200">{cand.fuelCode}</span>
                              </div>
                            </div>

                            {/* Why this match was suggested parameter score */}
                            <div className="space-y-1.5 border-t border-slate-800/80 pt-2">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Match Rationale Scoring:
                              </span>
                              {cand.breakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-400">{item.field}:</span>
                                  <span className={`font-semibold ${item.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {item.detail} ({item.score}%)
                                  </span>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={() => handleApproveFuzzyMatch(buy.id, cand.contractId)}
                              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center space-x-1.5"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Approve & Link Contract {cand.contractId}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* PROTOTYPE B: Split Visual Decision Queue & Side-by-Side Matrix */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left List Pane */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                    Select Fuzzy Buy to Inspect ({fuzzyBuys.length})
                  </h2>
                  <div className="space-y-2">
                    {fuzzyBuys.map((buy) => {
                      const isFocused = focusedFuzzyBuy?.id === buy.id;
                      return (
                        <div
                          key={buy.id}
                          onClick={() => {
                            setFocusedFuzzyBuy(buy);
                            const firstCandidate = buy.candidates[0];
                            if (firstCandidate) setSelectedCandidateId(firstCandidate.contractId);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isFocused
                              ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{buy.id}</span>
                            <span className="text-xs text-amber-400 font-medium">
                              {buy.candidates.length} Candidate(s)
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 mt-1 font-medium">{buy.counterparty}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {buy.fuelCode} &bull; {buy.quantity.toLocaleString()} Gal
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Decision & Comparison Matrix Pane */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                  {focusedFuzzyBuy ? (
                    <>
                      <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-white">Buy Decision Matrix: {focusedFuzzyBuy.id}</h3>
                            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold">
                              Fuzzy Evaluation
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {focusedFuzzyBuy.counterparty} &bull; Deliverable: {focusedFuzzyBuy.deliveryDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">${focusedFuzzyBuy.totalValue.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">{focusedFuzzyBuy.quantity.toLocaleString()} {focusedFuzzyBuy.unit} @ ${focusedFuzzyBuy.unitPrice.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Candidate Selector Tabs */}
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Choose Target Contract Candidate for Match Resolution:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {focusedFuzzyBuy.candidates.map((cand) => (
                            <button
                              key={cand.contractId}
                              onClick={() => setSelectedCandidateId(cand.contractId)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selectedCandidateId === cand.contractId
                                  ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500/40'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold">{cand.contractId}</span>
                                {cand.isRecommended && (
                                  <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                                    Rec
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-semibold mt-1 text-slate-200">
                                {cand.confidence}% Match Score
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Parameter Diff Side-by-Side Breakdown */}
                      {selectedCandidateId && (() => {
                        const selectedCand = focusedFuzzyBuy.candidates.find(c => c.contractId === selectedCandidateId);
                        if (!selectedCand) return null;
                        return (
                          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                              <Scale className="w-4 h-4 text-amber-400" />
                              <span>Parameter Match Breakdown (Incoming Buy vs Open Contract)</span>
                            </h4>

                            <div className="space-y-3 divide-y divide-slate-800/60 text-xs">
                              <div className="pt-2 flex items-center justify-between">
                                <span className="text-slate-400">Counterparty Name:</span>
                                <div className="text-right">
                                  <div className="font-semibold text-slate-200">{focusedFuzzyBuy.counterparty}</div>
                                  <div className="text-[11px] text-emerald-400">Contract: {selectedCand.counterparty}</div>
                                </div>
                              </div>

                              <div className="pt-2 flex items-center justify-between">
                                <span className="text-slate-400">Fuel Grade Spec:</span>
                                <div className="text-right">
                                  <div className="font-semibold text-slate-200">{focusedFuzzyBuy.fuelCode}</div>
                                  <div className="text-[11px] text-amber-400">Contract: {selectedCand.fuelCode}</div>
                                </div>
                              </div>

                              <div className="pt-2 flex items-center justify-between">
                                <span className="text-slate-400">Unit Price Variance:</span>
                                <div className="text-right">
                                  <div className="font-semibold text-slate-200">${focusedFuzzyBuy.unitPrice.toFixed(2)}/gal</div>
                                  <div className="text-[11px] text-amber-400">Contract: ${selectedCand.contractPrice.toFixed(2)}/gal</div>
                                </div>
                              </div>

                              <div className="pt-2 flex items-center justify-between">
                                <span className="text-slate-400">Quantity vs Open Balance:</span>
                                <div className="text-right">
                                  <div className="font-semibold text-slate-200">Requested: {focusedFuzzyBuy.quantity.toLocaleString()} {focusedFuzzyBuy.unit}</div>
                                  <div className="text-[11px] text-emerald-400">Remaining Bal: {selectedCand.remainingBalance.toLocaleString()} {focusedFuzzyBuy.unit}</div>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 flex items-center space-x-3">
                              <button
                                onClick={() => handleApproveFuzzyMatch(focusedFuzzyBuy.id, selectedCand.contractId)}
                                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-lg shadow-amber-600/20"
                              >
                                Approve Selected Contract Match ({selectedCand.contractId})
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="py-12 text-center text-slate-500">Select a fuzzy buy from the left queue to evaluate.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'unmatched' && (
          <div className="space-y-4">
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Exception Workspace: These buys lack matching open contract candidates in the system.</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3.5">Buy ID</th>
                    <th className="p-3.5">Counterparty</th>
                    <th className="p-3.5">Fuel & Specification</th>
                    <th className="p-3.5">Quantity & Value</th>
                    <th className="p-3.5">Exception Reason</th>
                    <th className="p-3.5 text-right">Manual Resolution Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentTabBuys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No unmatched exception buys present.
                      </td>
                    </tr>
                  ) : (
                    currentTabBuys.map((buy) => (
                      <tr key={buy.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-100">{buy.id}</td>
                        <td className="p-3.5 text-slate-200 font-medium">{buy.counterparty}</td>
                        <td className="p-3.5">
                          <div className="text-slate-200 font-medium">{buy.fuelCode}</div>
                          <div className="text-slate-500 text-[11px]">{buy.location}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">{buy.quantity.toLocaleString()} {buy.unit}</div>
                          <div className="text-slate-400">${buy.totalValue.toLocaleString()}</div>
                        </td>
                        <td className="p-3.5 text-rose-400 font-medium max-w-xs">{buy.reasonSummary}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setManualLinkBuy(buy)}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Manually Link Contract</span>
                          </button>
                          <button
                            onClick={() => setUnreconcileBuyModal(buy)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
                          >
                            Approve Unreconciled
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {}
      {executingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center space-x-3 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Confirm Batch Execution</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to execute <strong className="text-emerald-400 font-bold">{selectedBuyIds.length} high-confidence buys</strong>. 
              All matched parameters have passed automated validation checks with 95%+ confidence scores.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Selected Buy Count:</span>
                <span className="font-bold text-slate-200">{selectedBuyIds.length} Buys</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Value to Settle:</span>
                <span className="font-bold text-emerald-400">
                  ${selectedBuyIds.reduce((acc, id) => {
                    const found = MOCK_BUYS.find(b => b.id === id);
                    return acc + (found ? found.totalValue : 0);
                  }, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setExecutingBatch(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulk}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-emerald-600/30"
              >
                Execute All Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {manualLinkBuy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Manual Contract Link: {manualLinkBuy.id}</h3>
              <button onClick={() => setManualLinkBuy(null)} className="text-slate-500 hover:text-slate-300">
                &times;
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Select an open contract from the master directory to link with <strong className="text-white">{manualLinkBuy.counterparty}</strong> ({manualLinkBuy.fuelCode}).
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {MASTER_CONTRACTS_LIBRARY.map((contract) => (
                <div
                  key={contract.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-blue-500/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200 font-mono">{contract.id}</div>
                    <div className="text-slate-400">{contract.counterparty} &bull; {contract.fuelCode}</div>
                    <div className="text-[11px] text-emerald-400">Open Balance: {contract.balance.toLocaleString()} Gal</div>
                  </div>
                  <button
                    onClick={() => handleManualContractLink(manualLinkBuy.id, contract.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md"
                  >
                    Link & Execute
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      {unreconcileBuyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Approve as Unreconciled</h3>
            </div>

            <p className="text-xs text-slate-300">
              Approving <strong className="text-white">{unreconcileBuyModal.id}</strong> without linking an open contract will route this transaction directly to spot trade audit logging.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select Audit Tag / Reason Code:</label>
              <select
                value={unreconcileReason}
                onChange={(e) => setUnreconcileReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="Spot Market Exemption">Spot Market Exemption</option>
                <option value="Contract Pending Execution">Contract Pending Execution (Legal Hold)</option>
                <option value="Emergency Supply Uplift">Emergency Supply Uplift</option>
                <option value="Trader Override Exception">Trader Override Exception</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                onClick={() => setUnreconcileBuyModal(null)}
                className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveUnreconciled(unreconcileBuyModal.id)}
                className="w-1/2 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}