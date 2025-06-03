import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, Activity, Heart, Info, CheckCircle, AlertTriangle, Clock, Brain, 
  ChevronRight, RefreshCw, FileText, BarChart3, MessageSquare, BookOpen, 
  ExternalLink, Shield, Users, FileSearch
} from 'lucide-react';

const MediTriageDemo = () => {
  const [complaintText, setComplaintText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [activeTab, setActiveTab] = useState('input');
  const [processedComplaints, setProcessedComplaints] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  
  // New state for enhanced features
  const [notificationSource, setNotificationSource] = useState('');
  const [triageAnswers, setTriageAnswers] = useState({
    pattern: '',
    severity: '',
    recentChange: '',
    immediateRisk: ''
  });

  // Enhanced examples with more realistic scenarios
  const complexExamples = [
    {
      id: 1,
      text: "The doctor was late for the appointment. I was in pain and had to wait for 15 mins before being seen. This has happened twice now.",
      category: "CONDUCT_COMMITTEE",
      complexity: "Pattern Recognition",
      expectedOutcome: "Professional Conduct Committee referral - repeated pattern affecting patient care"
    },
    {
      id: 2,
      text: "The treatment helped initially but then made things worse. I'm not sure if it was the right approach.",
      category: "FURTHER_INFO",
      complexity: "Ambiguous Outcome",
      expectedOutcome: "Requires additional information and clinical review"
    },
    {
      id: 3,
      text: "Doctor seemed tired but diagnosis was correct and he was very thorough with the examination.",
      category: "EDUCATION",
      complexity: "Mixed Signals",
      expectedOutcome: "Educational guidance on fatigue management"
    },
    {
      id: 4,
      text: "My physician prescribed medication without examining me properly. When I questioned this, she became defensive and dismissed my concerns.",
      category: "DUAL_REFERRAL",
      complexity: "Multiple Issues",
      expectedOutcome: "Both Performance Assessment and Professional Conduct review needed"
    },
    {
      id: 5,
      text: "The surgeon's hands were shaking during the consultation. I'm worried about my upcoming procedure.",
      category: "IMMEDIATE_ACTION",
      complexity: "Safety Concern",
      expectedOutcome: "Immediate health assessment required - potential public safety risk"
    },
    {
      id: 6,
      text: "Multiple diagnostic errors over the past 6 months have led to my condition worsening significantly.",
      category: "PERFORMANCE_ASSESSMENT",
      complexity: "Competence Pattern",
      expectedOutcome: "Performance Assessment Committee review for competence concerns"
    }
  ];

  // Enhanced category mapping aligned with regulatory processes
  const getRegulatoryCategory = (category) => {
    const categories = {
      'NO_ACTION': { 
        label: 'No Further Action',
        committee: 'None',
        action: 'Case closed - isolated minor incident',
        timeline: 'Immediate',
        color: 'green',
        icon: CheckCircle
      },
      'EDUCATION': { 
        label: 'Educational Guidance',
        committee: 'Professional Standards Team',
        action: 'Provide targeted education and resources',
        timeline: '2-4 weeks',
        color: 'blue',
        icon: BookOpen
      },
      'CONDUCT_COMMITTEE': { 
        label: 'Professional Conduct Review',
        committee: 'Professional Conduct Committee',
        action: 'Formal investigation of conduct concerns',
        timeline: '8-12 months',
        color: 'orange',
        icon: AlertCircle
      },
      'PERFORMANCE_ASSESSMENT': { 
        label: 'Performance Assessment',
        committee: 'Performance Assessment Committee',
        action: 'Comprehensive competence evaluation',
        timeline: '6-9 months',
        color: 'yellow',
        icon: Activity
      },
      'HEALTH_REVIEW': { 
        label: 'Health Committee Review',
        committee: 'Health Committee',
        action: 'Supportive health and fitness assessment',
        timeline: '3-6 months',
        color: 'purple',
        icon: Heart
      },
      'IMMEDIATE_ACTION': { 
        label: 'Immediate Risk Management',
        committee: 'Executive Committee',
        action: 'Urgent intervention - practice restrictions possible',
        timeline: '24-48 hours',
        color: 'red',
        icon: AlertTriangle
      },
      'EXTERNAL_REFERRAL': { 
        label: 'External Agency Referral',
        committee: 'Compliance Team',
        action: 'Referral to appropriate external body',
        timeline: '1-2 weeks',
        color: 'indigo',
        icon: ExternalLink
      },
      'FURTHER_INFO': { 
        label: 'Additional Information Required',
        committee: 'Triage Team',
        action: 'Gather more details before decision',
        timeline: '2-3 weeks',
        color: 'gray',
        icon: FileSearch
      },
      'DUAL_REFERRAL': { 
        label: 'Multiple Committee Review',
        committee: 'Multiple Committees',
        action: 'Coordinated review across committees',
        timeline: '9-12 months',
        color: 'pink',
        icon: Users
      }
    };
    
    return categories[category] || categories['FURTHER_INFO'];
  };

  // Notification source component
  const NotificationSourceSection = () => (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600" />
        Who is making this notification?
      </h3>
      <select 
        value={notificationSource} 
        onChange={(e) => setNotificationSource(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select notification source...</option>
        <option value="patient">Patient/Family Member</option>
        <option value="colleague">Medical Colleague/Health Practitioner</option>
        <option value="employer">Employer/Practice Manager</option>
        <option value="regulatory">Regulatory Body/Agency</option>
        <option value="self">Self-referral by Practitioner</option>
      </select>
      {notificationSource === 'patient' && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
          <strong>Note:</strong> Patient complaints may need to be referred to the appropriate patient advocacy body in your jurisdiction.
        </div>
      )}
    </div>
  );

  // Triage questions component
  const TriageQuestions = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Initial Assessment Questions</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Is this a pattern or isolated incident?
          </label>
          <select
            value={triageAnswers.pattern}
            onChange={(e) => setTriageAnswers({...triageAnswers, pattern: e.target.value})}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select...</option>
            <option value="isolated">One-off isolated incident</option>
            <option value="emerging">Emerging pattern (2-3 incidents)</option>
            <option value="established">Established pattern (multiple incidents over months)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How serious is the departure from accepted standards?
          </label>
          <select
            value={triageAnswers.severity}
            onChange={(e) => setTriageAnswers({...triageAnswers, severity: e.target.value})}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select...</option>
            <option value="minor">Minor deviation</option>
            <option value="moderate">Moderate departure</option>
            <option value="serious">Serious departure with potential harm</option>
            <option value="critical">Critical - actual harm occurred</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Any recent change in the practitioner's behavior/performance?
          </label>
          <select
            value={triageAnswers.recentChange}
            onChange={(e) => setTriageAnswers({...triageAnswers, recentChange: e.target.value})}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select...</option>
            <option value="none">No noticeable change</option>
            <option value="minor">Some changes noted</option>
            <option value="significant">Significant recent deterioration</option>
            <option value="sudden">Sudden dramatic change</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Is there immediate risk to public safety?
          </label>
          <select
            value={triageAnswers.immediateRisk}
            onChange={(e) => setTriageAnswers({...triageAnswers, immediateRisk: e.target.value})}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select...</option>
            <option value="none">No immediate risk</option>
            <option value="potential">Potential risk if continues</option>
            <option value="likely">Likely risk to patients</option>
            <option value="immediate">Clear and immediate danger</option>
          </select>
        </div>
      </div>
      
      {triageAnswers.immediateRisk === 'immediate' && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
          <strong>🚨 Urgent Action Required:</strong> This case may require immediate intervention to protect public safety.
        </div>
      )}
    </div>
  );

  // Enhanced AI classification with regulatory alignment
  const enhancedAIClassification = (text) => {
    const analysis = {
      originalText: text,
      processedText: text.toLowerCase(),
      contextualFactors: [],
      keyPhrases: [],
      sentiment: 'neutral',
      severity: 'medium',
      requiresReview: false,
      suggestedActions: [],
      regulatoryFactors: []
    };

    const lowerText = text.toLowerCase();
    
    // Pattern detection
    if (lowerText.includes('happened') && (lowerText.includes('twice') || lowerText.includes('multiple') || lowerText.includes('again'))) {
      analysis.contextualFactors.push('Repeated pattern detected');
    }
    
    // Temporal analysis
    if (lowerText.includes('initially') || lowerText.includes('but then') || lowerText.includes('at first')) {
      analysis.contextualFactors.push('Temporal progression identified');
    }
    
    // Mixed signals detection
    if ((lowerText.includes('but') || lowerText.includes('however')) && 
        (lowerText.includes('correct') || lowerText.includes('good') || lowerText.includes('proper'))) {
      analysis.contextualFactors.push('Mixed assessment detected');
    }

    // Enhanced regulatory factors based on triage answers
    if (triageAnswers.pattern === 'established') {
      analysis.regulatoryFactors.push('Established pattern requires formal review');
      analysis.severity = 'high';
    }
    
    if (triageAnswers.severity === 'critical' || triageAnswers.severity === 'serious') {
      analysis.regulatoryFactors.push('Serious departure from standards');
      analysis.requiresReview = true;
    }
    
    if (triageAnswers.recentChange === 'significant' || triageAnswers.recentChange === 'sudden') {
      analysis.regulatoryFactors.push('Recent behavioral change - consider health assessment');
    }
    
    if (triageAnswers.immediateRisk === 'immediate' || triageAnswers.immediateRisk === 'likely') {
      analysis.regulatoryFactors.push('Public safety risk identified');
      analysis.severity = 'critical';
    }

    // Sentiment analysis
    const negativeWords = ['worse', 'pain', 'worried', 'defensive', 'dismissed', 'shaking', 'impaired', 'late', 'rude', 'error', 'mistake'];
    const positiveWords = ['helped', 'correct', 'thorough', 'good', 'proper', 'careful'];
    
    const negCount = negativeWords.filter(w => lowerText.includes(w)).length;
    const posCount = positiveWords.filter(w => lowerText.includes(w)).length;
    
    if (negCount > posCount) analysis.sentiment = 'negative';
    else if (posCount > negCount) analysis.sentiment = 'positive';
    else analysis.sentiment = 'mixed';
    
    // Determine classification based on comprehensive analysis
    let category = 'FURTHER_INFO';
    let confidence = 0.75;
    let requiresExternalReferral = false;
    let secondaryCategory = null;
    
    // Immediate risk takes priority
    if (triageAnswers.immediateRisk === 'immediate' || 
        (lowerText.includes('shaking') || lowerText.includes('impaired') || lowerText.includes('intoxicated'))) {
      category = 'IMMEDIATE_ACTION';
      confidence = 0.95;
      analysis.suggestedActions.push('Immediate practice review required');
      analysis.suggestedActions.push('Consider interim suspension');
    }
    // Patient complaints may need external referral
    else if (notificationSource === 'patient') {
      requiresExternalReferral = true;
      category = 'EXTERNAL_REFERRAL';
      confidence = 0.9;
      analysis.suggestedActions.push('Refer to patient advocacy body');
      analysis.suggestedActions.push('Await external investigation outcome');
    }
    // Health concerns
    else if ((triageAnswers.recentChange === 'significant' || triageAnswers.recentChange === 'sudden') &&
             (lowerText.includes('tired') || lowerText.includes('stressed') || lowerText.includes('unwell'))) {
      category = 'HEALTH_REVIEW';
      confidence = 0.85;
      analysis.suggestedActions.push('Supportive health assessment');
      analysis.suggestedActions.push('Consider workplace factors');
    }
    // Competence issues - Performance Assessment
    else if ((triageAnswers.pattern === 'established' || triageAnswers.pattern === 'emerging') &&
             (lowerText.includes('misdiagnos') || lowerText.includes('error') || lowerText.includes('mistake') || lowerText.includes('wrong'))) {
      category = 'PERFORMANCE_ASSESSMENT';
      confidence = 0.85;
      analysis.suggestedActions.push('Comprehensive competence review');
      analysis.suggestedActions.push('Educational programme likely');
    }
    // Conduct issues - Professional Conduct
    else if ((lowerText.includes('rude') || lowerText.includes('inappropriate') || lowerText.includes('unprofessional') || 
              lowerText.includes('boundary') || lowerText.includes('defensive')) &&
             (triageAnswers.severity === 'moderate' || triageAnswers.severity === 'serious')) {
      category = 'CONDUCT_COMMITTEE';
      confidence = 0.8;
      analysis.suggestedActions.push('Formal conduct investigation');
      analysis.suggestedActions.push('Interview witnesses');
    }
    // Multiple issues
    else if (lowerText.includes('prescribed') && lowerText.includes('without') && lowerText.includes('defensive')) {
      category = 'DUAL_REFERRAL';
      secondaryCategory = 'PERFORMANCE_ASSESSMENT';
      confidence = 0.85;
      analysis.suggestedActions.push('Coordinate multiple reviews');
      analysis.suggestedActions.push('Comprehensive assessment needed');
    }
    // Educational intervention
    else if (triageAnswers.pattern === 'isolated' && triageAnswers.severity === 'minor') {
      category = 'EDUCATION';
      confidence = 0.7;
      analysis.suggestedActions.push('Provide educational resources');
      analysis.suggestedActions.push('Monitor for recurrence');
    }
    // No action needed
    else if (triageAnswers.severity === 'minor' && !analysis.contextualFactors.length) {
      category = 'NO_ACTION';
      confidence = 0.8;
      analysis.suggestedActions.push('Document for future reference');
    }
    // Needs more information
    else if (lowerText.includes('not sure') || lowerText.includes('maybe') || confidence < 0.6) {
      category = 'FURTHER_INFO';
      confidence = 0.5;
      analysis.requiresReview = true;
      analysis.suggestedActions.push('Request additional information');
      analysis.suggestedActions.push('Interview involved parties');
    }
    
    // Extract key phrases
    const phrases = text.match(/[^.!?]+[.!?]+/g) || [text];
    analysis.keyPhrases = phrases.slice(0, 3).map(p => p.trim());
    
    return {
      category,
      confidence,
      secondaryCategory,
      requiresReview: analysis.requiresReview,
      requiresExternalReferral,
      reasoning: `Based on ${analysis.contextualFactors.length} contextual factors, ${analysis.regulatoryFactors.length} regulatory considerations, and ${analysis.sentiment} sentiment.`,
      analysis,
      timestamp: new Date().toISOString()
    };
  };

  const handleClassify = () => {
    if (!complaintText.trim()) return;
    
    setLoading(true);
    setShowDetails(false);
    
    setTimeout(() => {
      const classification = enhancedAIClassification(complaintText);
      setResult(classification);
      
      // Add to processed list
      setProcessedComplaints(prev => [{
        id: Date.now(),
        text: complaintText.substring(0, 100) + '...',
        source: notificationSource,
        ...classification
      }, ...prev].slice(0, 5));
      
      setLoading(false);
      setShowDetails(true);
      setActiveTab('result');
    }, 2000);
  };

  // Process pathway display
  const ProcessPathwayDisplay = ({ result }) => {
    const categoryInfo = getRegulatoryCategory(result.category);
    
    return (
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Regulatory Process Pathway
        </h4>
        
        <div className="space-y-3">
          <ProcessStep 
            number="1" 
            title="Notification Received" 
            description="Practitioner notified and given opportunity to respond"
            completed={true}
          />
          
          <ProcessStep 
            number="2" 
            title="Initial Triage Assessment" 
            description="Review by triage team for appropriate pathway"
            completed={true}
          />
          
          <ProcessStep 
            number="3" 
            title={`Referral: ${categoryInfo.committee}`}
            description={categoryInfo.action}
            highlight={true}
          />
          
          <ProcessStep 
            number="4" 
            title="Investigation/Assessment" 
            description="Thorough review according to established procedures"
          />
          
          <ProcessStep 
            number="5" 
            title="Outcome Determination" 
            description="Decision and any required actions"
          />
        </div>
        
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              <strong>Expected Timeline:</strong> {categoryInfo.timeline}
            </span>
            <span className={`font-medium text-${categoryInfo.color}-700`}>
              {result.confidence >= 0.8 ? 'High' : result.confidence >= 0.6 ? 'Medium' : 'Low'} Confidence
            </span>
          </div>
        </div>
      </div>
    );
  };

  const ProcessStep = ({ number, title, description, completed = false, highlight = false }) => (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
        ${completed ? 'bg-green-500 text-white' : 
          highlight ? 'bg-indigo-600 text-white animate-pulse' : 
          'bg-gray-300 text-gray-600'}`}>
        {completed && number < 3 ? '✓' : number}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${highlight ? 'text-indigo-900' : 'text-gray-900'}`}>
          {title}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  );

  const CategoryBadge = ({ category, size = 'normal' }) => {
    const categoryInfo = getRegulatoryCategory(category);
    const Icon = categoryInfo.icon;
    const sizeClasses = size === 'small' ? 'p-2' : 'p-3';
    const iconSize = size === 'small' ? 'w-4 h-4' : 'w-6 h-6';
    
    // Dynamic color classes
    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
      pink: 'bg-pink-100 text-pink-800 border-pink-300'
    };
    
    return (
      <div className={`${sizeClasses} rounded-lg border-2 ${colorClasses[categoryInfo.color]} inline-flex items-center gap-2`}>
        <Icon className={iconSize} />
        {size !== 'small' && <span className="font-medium">{categoryInfo.label}</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                MediTriage AI System
              </h1>
              <p className="text-gray-600 mt-2">Intelligent Medical Professional Notification Assessment</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{processedComplaints.length}</div>
                <div className="text-sm text-gray-600">Processed Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input and Examples */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('input')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'input' 
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    New Notification
                  </button>
                  <button
                    onClick={() => setActiveTab('result')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'result' 
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    disabled={!result}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Analysis Result
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'input' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Professional Notification</h2>
                    
                    {/* Notification Source */}
                    <NotificationSourceSection />
                    
                    {/* Triage Questions */}
                    <TriageQuestions />
                    
                    {/* Complaint Text */}
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Describe the concern:</h3>
                    <textarea
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                      rows="6"
                      placeholder="Provide detailed information about the incident, pattern of behavior, or concern..."
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                    />
                    
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={handleClassify}
                        disabled={!complaintText.trim() || !notificationSource || loading}
                        className={`px-6 py-3 rounded-lg font-medium transition-all transform ${
                          complaintText.trim() && notificationSource && !loading
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                            Analyzing Context...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 inline mr-2" />
                            Analyze Notification
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowExamples(!showExamples)}
                        className="px-4 py-3 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showExamples ? 'Hide' : 'Show'} Example Scenarios
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'result' && result && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">AI Analysis Results</h2>
                    
                    {/* Primary Classification */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <CategoryBadge category={result.category} />
                          {result.secondaryCategory && (
                            <>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                              <CategoryBadge category={result.secondaryCategory} size="small" />
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">{(result.confidence * 100).toFixed(0)}%</div>
                          <div className="text-sm text-gray-600">Confidence</div>
                        </div>
                      </div>
                      
                      {/* Confidence Bar */}
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Context Analysis */}
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        Contextual Analysis
                      </h3>
                      
                      <div className="space-y-3">
                        {result.analysis.contextualFactors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{factor}</span>
                          </div>
                        ))}
                        
                        {result.analysis.regulatoryFactors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-700">{factor}</span>
                          </div>
                        ))}
                        
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Sentiment Analysis:</span>
                            <span className={`font-medium ${
                              result.analysis.sentiment === 'negative' ? 'text-red-600' :
                              result.analysis.sentiment === 'positive' ? 'text-green-600' :
                              'text-yellow-600'
                            }`}>
                              {result.analysis.sentiment.charAt(0).toUpperCase() + result.analysis.sentiment.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-600">Severity Level:</span>
                            <span className={`font-medium ${
                              result.analysis.severity === 'critical' ? 'text-red-600' :
                              result.analysis.severity === 'high' ? 'text-orange-600' :
                              result.analysis.severity === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {result.analysis.severity.charAt(0).toUpperCase() + result.analysis.severity.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Process Pathway */}
                    <ProcessPathwayDisplay result={result} />

                    {/* Suggested Actions */}
                    {result.analysis.suggestedActions.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          Recommended Actions
                        </h3>
                        <ul className="space-y-2">
                          {result.analysis.suggestedActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* External Referral Alert */}
                    {result.requiresExternalReferral && (
                      <div className="bg-indigo-50 rounded-lg border-2 border-indigo-200 p-4">
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-6 h-6 text-indigo-600" />
                          <div>
                            <h4 className="font-semibold text-indigo-900">External Referral Required</h4>
                            <p className="text-sm text-indigo-700 mt-1">
                              This notification must be referred to the appropriate external agency for investigation.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Needs Review Alert */}
                    {result.requiresReview && !result.requiresExternalReferral && (
                      <div className="bg-amber-50 rounded-lg border-2 border-amber-200 p-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-6 h-6 text-amber-600" />
                          <div>
                            <h4 className="font-semibold text-amber-900">Additional Review Required</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              This case requires further information and clinical review before final determination.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Legal Protection Notice */}
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-800">
                        <Shield className="w-3 h-3 inline mr-1" />
                        <strong>Legal Protection:</strong> Notifications made in good faith and with reasonable care are typically protected from legal liability under health practitioner legislation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Complex Examples */}
            {showExamples && activeTab === 'input' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Scenarios</h3>
                <div className="space-y-3">
                  {complexExamples.map((example) => {
                    const categoryInfo = getRegulatoryCategory(example.category);
                    return (
                      <div
                        key={example.id}
                        className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() => {
                          setComplaintText(example.text);
                          // Set appropriate triage answers for the example
                          if (example.id === 1) {
                            setTriageAnswers({
                              pattern: 'emerging',
                              severity: 'moderate',
                              recentChange: 'none',
                              immediateRisk: 'none'
                            });
                          } else if (example.id === 5) {
                            setTriageAnswers({
                              pattern: 'isolated',
                              severity: 'serious',
                              recentChange: 'significant',
                              immediateRisk: 'immediate'
                            });
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{example.text}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs">
                              <span className="text-blue-600 font-medium">{example.complexity}</span>
                              <span className="text-gray-500">→ {categoryInfo.label}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 italic">{example.expectedOutcome}</p>
                          </div>
                          <CategoryBadge category={example.category} size="small" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Info and History */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Capabilities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI System Features</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Regulatory Alignment</h4>
                    <p className="text-sm text-gray-600 mt-1">Follows established regulatory pathways</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Pattern Recognition</h4>
                    <p className="text-sm text-gray-600 mt-1">Identifies repeated behaviors and trends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Risk Assessment</h4>
                    <p className="text-sm text-gray-600 mt-1">Prioritizes public safety concerns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Multi-path Routing</h4>
                    <p className="text-sm text-gray-600 mt-1">Routes to appropriate committees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Classifications */}
            {processedComplaints.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h3>
                <div className="space-y-3">
                  {processedComplaints.map((complaint) => {
                    const categoryInfo = getRegulatoryCategory(complaint.category);
                    return (
                      <div key={complaint.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <CategoryBadge category={complaint.category} size="small" />
                          <span className="text-xs text-gray-500">
                            {new Date(complaint.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{complaint.text}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {complaint.source ? `From: ${complaint.source}` : 'Source: Unknown'}
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {(complaint.confidence * 100).toFixed(0)}% conf
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categories Guide */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Categories</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(getRegulatoryCategory()).map(([key, info]) => {
                  if (key === 'NO_ACTION' || key === 'EDUCATION' || key === 'CONDUCT_COMMITTEE' || 
                      key === 'PERFORMANCE_ASSESSMENT' || key === 'HEALTH_REVIEW' || key === 'IMMEDIATE_ACTION') {
                    return (
                      <div key={key} className={`p-3 bg-${info.color}-50 rounded-lg`}>
                        <div className={`font-medium text-${info.color}-900 flex items-center gap-2`}>
                          <info.icon className="w-4 h-4" />
                          {info.label}
                        </div>
                        <p className={`text-${info.color}-700 text-xs mt-1`}>
                          {info.timeline} • {info.committee}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediTriageDemo;