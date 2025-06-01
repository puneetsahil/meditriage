"""
MediTriage AI - Classification Engine
=====================================
This module provides the AI-powered classification system for medical complaints.
It can use various AI providers (Claude, OpenAI, etc.) or fall back to rule-based classification.
"""

import anthropic
from typing import List, Dict, Optional, Tuple
import json
import time
from dataclasses import dataclass
from enum import Enum
import os
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComplaintCategory(Enum):
    """Categories for medical complaint classification."""
    CONDUCT = "CONDUCT"
    COMPETENCE = "COMPETENCE"
    HEALTH = "HEALTH"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    MONITORING = "MONITORING"
    UNKNOWN = "UNKNOWN"

class SeverityLevel(Enum):
    """Severity levels for prioritization."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

@dataclass
class ClassificationResult:
    """Data class for classification results."""
    category: ComplaintCategory
    confidence: float
    reasoning: str
    keywords: List[str]
    severity: SeverityLevel
    requires_human_review: bool
    suggested_actions: List[str]
    secondary_category: Optional[ComplaintCategory] = None
    processing_time: float = 0.0

class MediTriageClassifier:
    """
    AI-powered medical complaint classification system.
    
    This class provides:
    - Multiple AI provider support
    - Fallback to rule-based classification
    - Batch processing capabilities
    - Detailed analysis and reasoning
    """
    
    def __init__(self, api_key: Optional[str] = None, provider: str = "anthropic"):
        """
        Initialize the classifier.
        
        Args:
            api_key: API key for the AI provider (optional, can use env var)
            provider: AI provider to use ("anthropic", "openai", "local")
        """
        self.provider = provider
        self.api_key = api_key or os.getenv('AI_API_KEY')
        
        # Initialize AI client if API key is available
        self.client = None
        if self.api_key and provider == "anthropic":
            self.client = anthropic.Anthropic(api_key=self.api_key)
            self.model = "claude-3-5-sonnet-20241022"
        
        # System prompt for AI classification
        self.system_prompt = """You are an expert medical complaint classification system helping healthcare organizations triage and categorize patient complaints about medical practitioners.

Your task is to analyze complaints and classify them accurately while considering context, patterns, and severity.

CLASSIFICATION CATEGORIES:

1. CONDUCT: Professional behavior, ethics, boundaries, communication issues
   - Examples: rudeness, inappropriate comments, boundary violations, unprofessional behavior
   - Keywords: rude, inappropriate, dismissive, unprofessional, disrespectful

2. COMPETENCE: Clinical skills, medical knowledge, treatment quality
   - Examples: misdiagnosis, treatment errors, lack of skill, poor clinical judgment
   - Keywords: error, mistake, misdiagnosis, incorrect, failed, wrong

3. HEALTH: Practitioner fitness to practice, impairment issues
   - Examples: substance abuse, mental health concerns, physical impairment
   - Keywords: impaired, intoxicated, unstable, unfit, substance

4. NEEDS_REVIEW: Ambiguous cases requiring human clinical review
   - Use when: Mixed signals, unclear outcomes, insufficient information
   - Keywords: unsure, maybe, possibly, not clear

5. MONITORING: Situations to observe but not immediately actionable
   - Use when: Minor concerns with potential to escalate
   - Example: "Seemed tired but provided correct care"

ANALYSIS REQUIREMENTS:
- Consider the full context, not just keywords
- Identify patterns (repeated behavior, escalation)
- Assess severity and urgency
- Flag cases needing immediate attention
- Provide actionable recommendations

Be objective, thorough, and prioritize patient safety."""

    def classify_single(self, complaint_text: str, context: Optional[Dict] = None) -> ClassificationResult:
        """
        Classify a single complaint using AI or fallback methods.
        
        Args:
            complaint_text: The complaint text to classify
            context: Optional context information (previous complaints, practitioner info)
            
        Returns:
            ClassificationResult with detailed analysis
        """
        start_time = time.time()
        
        # Try AI classification first
        if self.client:
            try:
                result = self._classify_with_ai(complaint_text, context)
                result.processing_time = time.time() - start_time
                return result
            except Exception as e:
                logger.warning(f"AI classification failed, using fallback: {str(e)}")
        
        # Fallback to rule-based classification
        result = self._classify_with_rules(complaint_text)
        result.processing_time = time.time() - start_time
        return result
    
    def _classify_with_ai(self, complaint_text: str, context: Optional[Dict] = None) -> ClassificationResult:
        """
        Classify using AI provider (Claude, etc.).
        
        Args:
            complaint_text: The complaint text
            context: Optional context
            
        Returns:
            ClassificationResult from AI
        """
        # Build the prompt
        context_info = ""
        if context:
            context_info = f"\nCONTEXT INFORMATION:\n{json.dumps(context, indent=2)}\n"
        
        prompt = f"""Analyze this medical complaint and provide classification:

COMPLAINT:
{complaint_text}
{context_info}

Provide your analysis in this exact JSON format:
{{
    "category": "CONDUCT|COMPETENCE|HEALTH|NEEDS_REVIEW|MONITORING",
    "confidence": 0.0-1.0,
    "reasoning": "Detailed explanation of classification decision",
    "keywords": ["keyword1", "keyword2", ...],
    "severity": "HIGH|MEDIUM|LOW",
    "requires_human_review": true/false,
    "suggested_actions": ["action1", "action2", ...],
    "secondary_category": "CATEGORY|null"
}}"""

        try:
            response = self.client.messages.create(
                model=self.model,
                system=self.system_prompt,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.1  # Low temperature for consistency
            )
            
            # Parse AI response
            result_text = response.content[0].text
            result_json = json.loads(result_text)
            
            return ClassificationResult(
                category=ComplaintCategory[result_json['category']],
                confidence=float(result_json['confidence']),
                reasoning=result_json['reasoning'],
                keywords=result_json['keywords'],
                severity=SeverityLevel[result_json['severity']],
                requires_human_review=result_json['requires_human_review'],
                suggested_actions=result_json['suggested_actions'],
                secondary_category=ComplaintCategory[result_json['secondary_category']] 
                    if result_json.get('secondary_category') else None
            )
            
        except Exception as e:
            logger.error(f"Error in AI classification: {str(e)}")
            raise
    
    def _classify_with_rules(self, complaint_text: str) -> ClassificationResult:
        """
        Rule-based classification fallback.
        
        Args:
            complaint_text: The complaint text
            
        Returns:
            ClassificationResult from rules
        """
        text_lower = complaint_text.lower()
        keywords_found = []
        suggested_actions = []
        
        # Keyword scores
        conduct_score = 0
        competence_score = 0
        health_score = 0
        
        # Conduct keywords
        conduct_keywords = ['rude', 'inappropriate', 'unprofessional', 'dismissive', 
                          'disrespectful', 'harassment', 'boundary', 'behavior']
        for keyword in conduct_keywords:
            if keyword in text_lower:
                conduct_score += 1
                keywords_found.append(keyword)
        
        # Competence keywords
        competence_keywords = ['error', 'mistake', 'misdiagnos', 'wrong', 'incorrect',
                             'failed', 'incompetent', 'negligent']
        for keyword in competence_keywords:
            if keyword in text_lower:
                competence_score += 1
                keywords_found.append(keyword)
        
        # Health keywords
        health_keywords = ['impaired', 'drunk', 'intoxicated', 'substance', 'unfit',
                         'unstable', 'mental health', 'addiction']
        for keyword in health_keywords:
            if keyword in text_lower:
                health_score += 1
                keywords_found.append(keyword)
        
        # Determine category
        max_score = max(conduct_score, competence_score, health_score)
        
        if max_score == 0:
            category = ComplaintCategory.NEEDS_REVIEW
            confidence = 0.3
            reasoning = "No clear indicators found. Requires human review."
            suggested_actions.append("Manual review required")
        elif conduct_score > competence_score and conduct_score > health_score:
            category = ComplaintCategory.CONDUCT
            confidence = min(0.9, 0.5 + conduct_score * 0.1)
            reasoning = f"Behavioral/conduct indicators found: {', '.join(keywords_found[:3])}"
            suggested_actions.append("Review professional standards policy")
        elif competence_score > health_score:
            category = ComplaintCategory.COMPETENCE
            confidence = min(0.9, 0.5 + competence_score * 0.1)
            reasoning = f"Clinical competence concerns identified: {', '.join(keywords_found[:3])}"
            suggested_actions.append("Clinical review recommended")
        else:
            category = ComplaintCategory.HEALTH
            confidence = min(0.9, 0.5 + health_score * 0.1)
            reasoning = f"Health/fitness concerns detected: {', '.join(keywords_found[:3])}"
            suggested_actions.append("Immediate fitness assessment required")
        
        # Determine severity
        severity_keywords = {
            'high': ['death', 'serious', 'emergency', 'critical', 'dangerous'],
            'medium': ['repeated', 'multiple', 'pattern', 'concerning'],
            'low': ['minor', 'slight', 'small']
        }
        
        severity = SeverityLevel.LOW
        for level, keywords in severity_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                if level == 'high':
                    severity = SeverityLevel.HIGH
                    suggested_actions.insert(0, "URGENT: Immediate action required")
                elif level == 'medium' and severity != SeverityLevel.HIGH:
                    severity = SeverityLevel.MEDIUM
        
        # Check if needs review
        ambiguous_phrases = ['not sure', 'maybe', 'possibly', 'might be', 'unclear']
        requires_review = any(phrase in text_lower for phrase in ambiguous_phrases) or confidence < 0.6
        
        return ClassificationResult(
            category=category,
            confidence=confidence,
            reasoning=reasoning,
            keywords=keywords_found[:5],  # Top 5 keywords
            severity=severity,
            requires_human_review=requires_review,
            suggested_actions=suggested_actions
        )
    
    def classify_batch(self, complaints: List[Dict], parallel: bool = False) -> List[Dict]:
        """
        Classify multiple complaints.
        
        Args:
            complaints: List of complaint dictionaries
            parallel: Whether to process in parallel (not implemented yet)
            
        Returns:
            List of classification results
        """
        results = []
        total = len(complaints)
        
        for idx, complaint in enumerate(complaints):
            logger.info(f"Processing complaint {idx + 1}/{total}")
            
            try:
                # Extract complaint info
                complaint_id = complaint.get('id', f'COMPLAINT_{idx:04d}')
                complaint_text = complaint.get('text', '')
                context = complaint.get('context', {})
                
                # Classify
                result = self.classify_single(complaint_text, context)
                
                # Build result dictionary
                result_dict = {
                    'complaint_id': complaint_id,
                    'original_text': complaint_text,
                    'classification': {
                        'primary_category': result.category.value,
                        'secondary_category': result.secondary_category.value if result.secondary_category else None,
                        'confidence': result.confidence,
                        'severity': result.severity.value,
                        'requires_review': result.requires_human_review
                    },
                    'analysis': {
                        'reasoning': result.reasoning,
                        'keywords': result.keywords,
                        'suggested_actions': result.suggested_actions,
                        'processing_time': result.processing_time
                    },
                    'timestamp': datetime.now().isoformat()
                }
                
                # Add actual category for accuracy calculation if provided
                if 'category' in complaint:
                    result_dict['actual_category'] = complaint['category']
                
                results.append(result_dict)
                
                # Rate limiting for API calls
                if self.client and idx < total - 1:
                    time.sleep(0.5)
                    
            except Exception as e:
                logger.error(f"Error processing complaint {complaint_id}: {str(e)}")
                results.append({
                    'complaint_id': complaint_id,
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                })
        
        return results
    
    def evaluate_accuracy(self, results: List[Dict]) -> Dict:
        """
        Calculate classification accuracy metrics.
        
        Args:
            results: List of classification results with actual categories
            
        Returns:
            Dictionary with accuracy metrics
        """
        metrics = {
            'total_processed': len(results),
            'successful_classifications': 0,
            'errors': 0,
            'overall_accuracy': 0.0,
            'category_metrics': {},
            'confidence_distribution': {
                'high': 0,  # > 0.8
                'medium': 0,  # 0.6 - 0.8
                'low': 0  # < 0.6
            },
            'severity_distribution': {},
            'review_required': 0
        }
        
        # Filter successful classifications
        successful = [r for r in results if 'classification' in r and 'actual_category' in r]
        metrics['successful_classifications'] = len(successful)
        metrics['errors'] = len(results) - len(successful)
        
        if not successful:
            return metrics
        
        # Calculate accuracy
        correct = 0
        category_stats = {}
        
        for result in successful:
            predicted = result['classification']['primary_category']
            actual = result['actual_category']
            confidence = result['classification']['confidence']
            
            # Overall accuracy
            if predicted == actual:
                correct += 1
            
            # Category-specific stats
            if actual not in category_stats:
                category_stats[actual] = {'total': 0, 'correct': 0}
            category_stats[actual]['total'] += 1
            if predicted == actual:
                category_stats[actual]['correct'] += 1
            
            # Confidence distribution
            if confidence > 0.8:
                metrics['confidence_distribution']['high'] += 1
            elif confidence >= 0.6:
                metrics['confidence_distribution']['medium'] += 1
            else:
                metrics['confidence_distribution']['low'] += 1
            
            # Review required
            if result['classification']['requires_review']:
                metrics['review_required'] += 1
            
            # Severity distribution
            severity = result['classification']['severity']
            metrics['severity_distribution'][severity] = metrics['severity_distribution'].get(severity, 0) + 1
        
        # Calculate overall accuracy
        metrics['overall_accuracy'] = correct / len(successful) if successful else 0
        
        # Calculate per-category accuracy
        for category, stats in category_stats.items():
            accuracy = stats['correct'] / stats['total'] if stats['total'] > 0 else 0
            metrics['category_metrics'][category] = {
                'accuracy': accuracy,
                'total': stats['total'],
                'correct': stats['correct']
            }
        
        return metrics
    
    def generate_report(self, results: List[Dict], include_examples: bool = True) -> str:
        """
        Generate a human-readable classification report.
        
        Args:
            results: List of classification results
            include_examples: Whether to include example classifications
            
        Returns:
            Formatted report string
        """
        metrics = self.evaluate_accuracy(results)
        
        report = f"""
MediTriage AI - Classification Report
=====================================
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

SUMMARY STATISTICS
------------------
Total Complaints Processed: {metrics['total_processed']}
Successful Classifications: {metrics['successful_classifications']}
Errors Encountered: {metrics['errors']}
Overall Accuracy: {metrics['overall_accuracy']:.1%}
Cases Requiring Review: {metrics['review_required']}

CATEGORY PERFORMANCE
-------------------"""
        
        for category, stats in metrics['category_metrics'].items():
            report += f"\n{category}:"
            report += f"\n  - Accuracy: {stats['accuracy']:.1%}"
            report += f"\n  - Total Cases: {stats['total']}"
            report += f"\n  - Correctly Classified: {stats['correct']}"
        
        report += f"\n\nCONFIDENCE DISTRIBUTION\n-----------------------"
        report += f"\nHigh Confidence (>80%): {metrics['confidence_distribution']['high']}"
        report += f"\nMedium Confidence (60-80%): {metrics['confidence_distribution']['medium']}"
        report += f"\nLow Confidence (<60%): {metrics['confidence_distribution']['low']}"
        
        report += f"\n\nSEVERITY DISTRIBUTION\n---------------------"
        for severity, count in metrics['severity_distribution'].items():
            report += f"\n{severity}: {count}"
        
        if include_examples and results:
            report += "\n\nEXAMPLE CLASSIFICATIONS\n-----------------------"
            
            # Show up to 3 examples
            for result in results[:3]:
                if 'classification' in result:
                    report += f"\n\nComplaint ID: {result['complaint_id']}"
                    report += f"\nCategory: {result['classification']['primary_category']}"
                    report += f"\nConfidence: {result['classification']['confidence']:.1%}"
                    report += f"\nSeverity: {result['classification']['severity']}"
                    report += f"\nReasoning: {result['analysis']['reasoning']}"
                    if result['analysis']['suggested_actions']:
                        report += f"\nActions: {', '.join(result['analysis']['suggested_actions'])}"
                    report += "\n" + "-" * 50
        
        report += "\n\n[End of Report]"
        
        return report


# Example usage and testing
if __name__ == "__main__":
    # Initialize classifier (in demo mode without API key)
    classifier = MediTriageClassifier(api_key=None, provider="local")
    
    # Test complaints
    test_complaints = [
        {
            'id': 'TEST001',
            'text': 'The doctor was extremely rude and made inappropriate comments about my personal life.',
            'category': 'CONDUCT'
        },
        {
            'id': 'TEST002',
            'text': 'Multiple misdiagnoses over 6 months resulted in my condition worsening significantly.',
            'category': 'COMPETENCE'
        },
        {
            'id': 'TEST003',
            'text': 'The physician appeared intoxicated during my appointment - slurred speech and unsteady.',
            'category': 'HEALTH'
        },
        {
            'id': 'TEST004',
            'text': 'Treatment helped initially but then made things worse. Not sure what happened.',
            'category': 'NEEDS_REVIEW'
        },
        {
            'id': 'TEST005',
            'text': 'Doctor seemed tired but was thorough and diagnosis was correct.',
            'category': 'MONITORING'
        }
    ]
    
    # Run classification
    print("Starting classification...")
    results = classifier.classify_batch(test_complaints)
    
    # Generate and print report
    report = classifier.generate_report(results)
    print(report)
    
    # Save results to file
    with open('classification_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\nResults saved to classification_results.json")