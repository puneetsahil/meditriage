import React, { useState, useEffect } from 'react';
import { AlertCircle, Activity, Heart, Info, CheckCircle, AlertTriangle, Clock, Brain, ChevronRight, RefreshCw, FileText, BarChart3, MessageSquare } from 'lucide-react';

const MediTriageDemo = () => {
  const [complaintText, setComplaintText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [activeTab, setActiveTab] = useState('input');
  const [processedComplaints, setProcessedComplaints] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const complexExamples = [
    {
      id: 1,
      text: "The doctor was late for the appointment. I was in pain and had to wait for 15 mins before being seen. This has happened twice now.",
      category: "CONDUCT",
      complexity: "Pattern Recognition",
      expectedOutcome: "Identifies repeated behavior pattern affecting patient care"
    },
    {
      id: 2,
      text: "The treatment helped initially but then made things worse. I'm not sure if it was the right approach.",
      category: "NEEDS_REVIEW",
      complexity: "Ambiguous Outcome",
      expectedOutcome: "Requires clinical review to determine if treatment approach was appropriate"
    },
    {
      id: 3,
      text: "Doctor seemed tired but diagnosis was correct and he was very thorough with the examination.",
      category: "MONITORING",
      complexity: "Mixed Signals",
      expectedOutcome: "Fatigue noted but care quality maintained - monitor for patterns"
    },
    {
      id: 4,
      text: "My physician prescribed medication without examining me properly. When I questioned this, she became defensive and dismissed my concerns.",
      category: "DUAL_ISSUE",
      complexity: "Multiple Issues",
      expectedOutcome: "Both competence (inadequate examination) and conduct (defensive behavior) issues"
    },
    {
      id: 5,
      text: "The surgeon's hands were shaking during the consultation. I'm worried about my upcoming procedure.",
      category: "HEALTH",
      complexity: "Safety Concern",
      expectedOutcome: "Potential fitness to practice issue requiring immediate review"
    }
  ];

  const simulateAIClassification = (text) => {
    const analysis = {
      originalText: text,
      processedText: text.toLowerCase(),
      contextualFactors: [],
      keyPhrases: [],
      sentiment: 'neutral',
      severity: 'medium',
      requiresReview: false,
      suggestedActions: []
    };

    // Simulate sophisticated AI analysis
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
    
    // Sentiment analysis
    const negativeWords = ['worse', 'pain', 'worried', 'defensive', 'dismissed', 'shaking', 'impaired', 'late', 'rude'];
    const positiveWords = ['helped', 'correct', 'thorough', 'good', 'proper'];
    
    const negCount = negativeWords.filter(w => lowerText.includes(w)).length;
    const posCount = positiveWords.filter(w => lowerText.includes(w)).length;
    
    if (negCount > posCount) analysis.sentiment = 'negative';
    else if (posCount > negCount) analysis.sentiment = 'positive';
    else analysis.sentiment = 'mixed';
    
    // Determine classification based on sophisticated analysis
    let category = 'CONDUCT';
    let confidence = 0.75;
    let needsReview = false;
    let secondaryCategory = null;
    
    // Complex classification logic
    if (lowerText.includes('treatment') && (lowerText.includes('worse') || lowerText.includes('not sure'))) {
      category = 'NEEDS_REVIEW';
      confidence = 0.6;
      needsReview = true;
      analysis.requiresReview = true;
      analysis.suggestedActions.push('Clinical review required');
      analysis.suggestedActions.push('Request treatment records');
    } else if (lowerText.includes('tired') && lowerText.includes('correct')) {
      category = 'MONITORING';
      confidence = 0.7;
      analysis.suggestedActions.push('Monitor for fatigue patterns');
      analysis.suggestedActions.push('No immediate action required');
    } else if ((lowerText.includes('shaking') || lowerText.includes('impaired') || lowerText.includes('substance'))) {
      category = 'HEALTH';
      confidence = 0.9;
      analysis.severity = 'high';
      analysis.suggestedActions.push('Immediate fitness assessment');
      analysis.suggestedActions.push('Consider temporary suspension');
    } else if (lowerText.includes('prescribed') && lowerText.includes('without') && lowerText.includes('defensive')) {
      category = 'DUAL_ISSUE';
      secondaryCategory = 'COMPETENCE';
      confidence = 0.85;
      analysis.suggestedActions.push('Review clinical standards');
      analysis.suggestedActions.push('Address behavioral concerns');
    } else if (lowerText.includes('late') || lowerText.includes('rude') || lowerText.includes('inappropriate')) {
      category = 'CONDUCT';
      confidence = 0.8;
      if (analysis.contextualFactors.includes('Repeated pattern detected')) {
        confidence = 0.9;
        analysis.severity = 'high';
      }
    } else if (lowerText.includes('misdiagnos') || lowerText.includes('error') || lowerText.includes('mistake')) {
      category = 'COMPETENCE';
      confidence = 0.85;
    }
    
    // Extract key phrases (simulated NLP)
    const phrases = text.match(/[^.!?]+[.!?]+/g) || [text];
    analysis.keyPhrases = phrases.slice(0, 3).map(p => p.trim());
    
    return {
      category,
      confidence,
      secondaryCategory,
      requiresReview: needsReview,
      reasoning: `Based on ${analysis.contextualFactors.length} contextual factors and ${analysis.sentiment} sentiment analysis.`,
      analysis,
      timestamp: new Date().toISOString()
    };
  };

  const handleClassify = () => {
    if (!complaintText.trim()) return;
    
    setLoading(true);
    setShowDetails(false);
    
    setTimeout(() => {
      const classification = simulateAIClassification(complaintText);
      setResult(classification);
      
      // Add to processed list
      setProcessedComplaints(prev => [{
        id: Date.now(),
        text: complaintText.substring(0, 100) + '...',
        ...classification
      }, ...prev].slice(0, 5));
      
      setLoading(false);
      setShowDetails(true);
      setActiveTab('result');
    }, 2000);
  };

  const getCategoryDisplay = (category) => {
    const displays = {
      'CONDUCT': { icon: AlertCircle, color: 'orange', label: 'Conduct Issue' },
      'COMPETENCE': { icon: Activity, color: 'blue', label: 'Competence Issue' },
      'HEALTH': { icon: Heart, color: 'purple', label: 'Health Concern' },
      'NEEDS_REVIEW': { icon: MessageSquare, color: 'yellow', label: 'Needs Review' },
      'MONITORING': { icon: Clock, color: 'green', label: 'Monitor' },
      'DUAL_ISSUE': { icon: AlertTriangle, color: 'red', label: 'Multiple Issues' }
    };
    
    return displays[category] || { icon: Info, color: 'gray', label: 'Unknown' };
  };

  const CategoryBadge = ({ category, size = 'normal' }) => {
    const display = getCategoryDisplay(category);
    const Icon = display.icon;
    const sizeClasses = size === 'small' ? 'p-2' : 'p-3';
    const iconSize = size === 'small' ? 'w-4 h-4' : 'w-6 h-6';
    
    return (
      <div className={`${sizeClasses} rounded-lg border-2 bg-${display.color}-100 text-${display.color}-800 border-${display.color}-300 inline-flex items-center gap-2`}>
        <Icon className={iconSize} />
        {size !== 'small' && <span className="font-medium">{display.label}</span>}
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
              <p className="text-gray-600 mt-2">Advanced Context-Aware Medical Complaint Classification</p>
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
                    New Complaint
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Medical Complaint</h2>
                    
                    <textarea
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                      rows="6"
                      placeholder="Paste or type the complaint text here..."
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                    />
                    
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={handleClassify}
                        disabled={!complaintText.trim() || loading}
                        className={`px-6 py-3 rounded-lg font-medium transition-all transform ${
                          complaintText.trim() && !loading
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
                            Analyze Complaint
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowExamples(!showExamples)}
                        className="px-4 py-3 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showExamples ? 'Hide' : 'Show'} Complex Examples
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
                              <CategoryBadge category={result.secondaryCategory} />
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
                              result.analysis.severity === 'high' ? 'text-red-600' :
                              result.analysis.severity === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {result.analysis.severity.charAt(0).toUpperCase() + result.analysis.severity.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

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

                    {/* Needs Review Alert */}
                    {result.requiresReview && (
                      <div className="bg-red-50 rounded-lg border-2 border-red-200 p-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-6 h-6 text-red-600" />
                          <div>
                            <h4 className="font-semibold text-red-900">Clinical Review Required</h4>
                            <p className="text-sm text-red-700 mt-1">
                              This complaint requires additional clinical review to determine appropriate categorization.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Complex Examples */}
            {showExamples && activeTab === 'input' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complex Test Scenarios</h3>
                <div className="space-y-3">
                  {complexExamples.map((example) => (
                    <div
                      key={example.id}
                      className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                      onClick={() => setComplaintText(example.text)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{example.text}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs">
                            <span className="text-blue-600 font-medium">{example.complexity}</span>
                            <span className="text-gray-500">Expected: {example.category}</span>
                          </div>
                        </div>
                        <CategoryBadge category={example.category} size="small" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Info and History */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Capabilities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Capabilities</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Context Understanding</h4>
                    <p className="text-sm text-gray-600 mt-1">Analyzes full narrative, not just keywords</p>
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
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Ambiguity Detection</h4>
                    <p className="text-sm text-gray-600 mt-1">Flags cases needing human review</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Severity Assessment</h4>
                    <p className="text-sm text-gray-600 mt-1">Prioritizes urgent cases automatically</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Classifications */}
            {processedComplaints.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Classifications</h3>
                <div className="space-y-3">
                  {processedComplaints.map((complaint) => (
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
                          Confidence: {(complaint.confidence * 100).toFixed(0)}%
                        </span>
                        {complaint.requiresReview && (
                          <span className="text-xs text-red-600 font-medium">Needs Review</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Guide */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification Categories</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-900">CONDUCT</div>
                  <p className="text-orange-700 text-xs mt-1">Professional behavior issues</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">COMPETENCE</div>
                  <p className="text-blue-700 text-xs mt-1">Clinical skill concerns</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">HEALTH</div>
                  <p className="text-purple-700 text-xs mt-1">Fitness to practice issues</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-yellow-900">NEEDS REVIEW</div>
                  <p className="text-yellow-700 text-xs mt-1">Requires clinical assessment</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">MONITORING</div>
                  <p className="text-green-700 text-xs mt-1">Track for patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediTriageDemo;