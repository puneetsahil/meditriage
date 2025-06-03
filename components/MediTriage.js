// MediTriage.js
import React, { useState } from 'react';
import {
  AlertCircle, Activity, Heart, Info, CheckCircle, AlertTriangle, Clock, Brain,
  ChevronRight, RefreshCw, FileText, BarChart3, MessageSquare
} from 'lucide-react';

const MediTriageDemo = () => {
  const [complaintText, setComplaintText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [activeTab, setActiveTab] = useState('input');
  const [processedComplaints, setProcessedComplaints] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const [notificationSource, setNotificationSource] = useState('');
  const [triageAnswers, setTriageAnswers] = useState({
    pattern: '',
    severity: '',
    recentChange: ''
  });

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

  const getMCNZCategory = (category) => {
    const mcnzCategories = {
      'CONDUCT': { committee: 'Professional Conduct Committee (PCC)', action: 'Investigation of professional conduct', timeline: '8-12 months', color: 'orange' },
      'COMPETENCE': { committee: 'Performance Assessment Committee (PAC)', action: 'Assessment of clinical performance', timeline: '6-9 months', color: 'blue' },
      'HEALTH': { committee: 'Health Committee', action: 'Non-judgmental health assessment', timeline: '3-6 months', color: 'purple' },
      'NEEDS_REVIEW': { committee: 'Notifications Triage Team (NTT)', action: 'Further information required', timeline: '4-6 weeks', color: 'yellow' },
      'MONITORING': { committee: 'Council Oversight', action: 'Educational guidance provided', timeline: '2-4 weeks', color: 'green' },
      'DUAL_ISSUE': { committee: 'Multiple Committees', action: 'Comprehensive review required', timeline: '9-12 months', color: 'red' }
    };
    return mcnzCategories[category] || mcnzCategories['NEEDS_REVIEW'];
  };

  const simulateAIClassification = (text) => {
    const lower = text.toLowerCase();
    const analysis = {
      contextualFactors: [],
      sentiment: 'neutral',
      severity: 'medium',
      requiresReview: false,
      suggestedActions: []
    };

    let category = 'NEEDS_REVIEW';
    let confidence = 0.6;
    let secondaryCategory = null;

    if (lower.includes('defensive') && lower.includes('prescribed')) {
      category = 'DUAL_ISSUE';
      secondaryCategory = 'COMPETENCE';
      confidence = 0.85;
    } else if (lower.includes('shaking')) {
      category = 'HEALTH';
      confidence = 0.9;
      analysis.severity = 'high';
    } else if (lower.includes('late') || lower.includes('rude')) {
      category = 'CONDUCT';
      confidence = 0.8;
    } else if (lower.includes('not sure') || lower.includes('worse')) {
      category = 'NEEDS_REVIEW';
    } else if (lower.includes('tired') && lower.includes('correct')) {
      category = 'MONITORING';
      confidence = 0.7;
    }

    return {
      category,
      confidence,
      secondaryCategory,
      requiresReview: analysis.requiresReview,
      analysis,
      timestamp: new Date().toISOString()
    };
  };

  const enhancedSimulateAIClassification = (text) => {
    const existingResult = simulateAIClassification(text);
    const enhanced = {
      ...existingResult,
      mcnzFactors: []
    };
    if (triageAnswers.pattern === 'established') {
      enhanced.confidence = Math.min(enhanced.confidence + 0.1, 0.95);
      enhanced.mcnzFactors.push('Established pattern increases concern level');
    }
    if (triageAnswers.severity === 'serious') {
      enhanced.severity = 'high';
      enhanced.requiresReview = true;
      enhanced.mcnzFactors.push('Serious departure requires urgent review');
    }
    if (triageAnswers.recentChange === 'significant' && enhanced.category !== 'HEALTH') {
      enhanced.secondaryCategory = 'HEALTH';
      enhanced.mcnzFactors.push('Recent behavioral change may indicate health issues');
    }
    if (notificationSource === 'patient') {
      enhanced.requiresHDC = true;
      enhanced.mcnzFactors.push('Patient complaint must be referred to HDC');
    }
    return enhanced;
  };

  const handleClassify = () => {
    if (!complaintText.trim()) return;
    setLoading(true);
    setShowDetails(false);
    setTimeout(() => {
      const classification = enhancedSimulateAIClassification(complaintText);
      setResult(classification);
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

  const NotificationSourceSection = () => (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600" />
        Who is making this notification?
      </h3>
      <select 
        value={notificationSource} 
        onChange={(e) => setNotificationSource(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select notification source...</option>
        <option value="patient">Patient/Family Member</option>
        <option value="colleague">Medical Colleague/Health Practitioner</option>
        <option value="employer">Employer/Practice Manager</option>
        <option value="regulatory">Regulatory Body (MOH, ACC, etc)</option>
      </select>
      {notificationSource === 'patient' && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
          ⚠️ <strong>Important:</strong> Patient complaints must be referred to the Health & Disability Commissioner (HDC) by law.
        </div>
      )}
    </div>
  );

  const TriageQuestions = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Initial Assessment Questions</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Is this a pattern or isolated incident?</label>
          <select
            value={triageAnswers.pattern}
            onChange={(e) => setTriageAnswers({...triageAnswers, pattern: e.target.value})}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="isolated">One-off isolated incident</option>
            <option value="emerging">Pattern emerging (2-3 incidents)</option>
            <option value="established">Established pattern (3+ incidents over months)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">How serious is the departure from accepted standards?</label>
          <select
            value={triageAnswers.severity}
            onChange={(e) => setTriageAnswers({...triageAnswers, severity: e.target.value})}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="minor">Minor - slight deviation</option>
            <option value="moderate">Moderate - clear departure</option>
            <option value="serious">Serious - significant risk/harm</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Any recent change in the doctor's behavior/performance?</label>
          <select
            value={triageAnswers.recentChange}
            onChange={(e) => setTriageAnswers({...triageAnswers, recentChange: e.target.value})}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="none">No noticeable change</option>
            <option value="minor">Some changes noted</option>
            <option value="significant">Significant recent deterioration</option>
          </select>
        </div>
      </div>
      {triageAnswers.severity === 'serious' && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
          🚨 <strong>Immediate Action May Be Required:</strong> Serious departures may require urgent Council intervention.
        </div>
      )}
    </div>
  );

  const MCNZProcessDisplay = ({ result }) => {
    const mcnzInfo = getMCNZCategory(result.category);
    return (
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          MCNZ Process Pathway
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Notification to MCNZ</p>
              <p className="text-xs text-gray-600">Doctor receives copy and opportunity to respond</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Notifications Triage Team (NTT) Review</p>
              <p className="text-xs text-gray-600">Initial assessment at next NTT meeting</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Referral to: {mcnzInfo.committee}</p>
              <p className="text-xs text-gray-600">{mcnzInfo.action}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-200">
            <p className="text-xs text-gray-700">
              <strong>Expected Timeline:</strong> {mcnzInfo.timeline}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return null; // Render implementation omitted for brevity
};

export default MediTriageDemo;