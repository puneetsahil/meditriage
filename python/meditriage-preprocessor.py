"""
MediTriage AI - Complaint Preprocessing Pipeline
================================================
This module handles the initial processing of medical complaints before AI classification.
It cleans text, removes personal information, and prepares data for analysis.
"""

import re
import pandas as pd
from typing import Dict, List, Tuple
import json
from datetime import datetime

class MedicalComplaintPreprocessor:
    """
    Preprocesses medical complaints for AI classification.
    
    This class handles:
    - Text cleaning and normalization
    - Personal information removal (privacy protection)
    - Feature extraction for classification
    - Formatting for AI analysis
    """
    
    def __init__(self):
        """Initialize the preprocessor with medical domain indicators."""
        
        # Keywords that indicate different types of medical complaints
        self.conduct_indicators = [
            'unprofessional', 'inappropriate', 'boundary', 'ethics', 
            'misconduct', 'behavior', 'attitude', 'communication',
            'disrespectful', 'harassment', 'discrimination', 'rude',
            'dismissive', 'hostile', 'aggressive'
        ]
        
        self.competence_indicators = [
            'misdiagnosis', 'error', 'mistake', 'incorrect', 'failed',
            'negligent', 'competency', 'skill', 'knowledge', 'treatment',
            'procedure', 'assessment', 'clinical', 'wrong', 'incompetent',
            'malpractice', 'oversight'
        ]
        
        self.health_indicators = [
            'impaired', 'addiction', 'mental health', 'substance',
            'alcohol', 'fitness', 'illness', 'condition', 'wellbeing',
            'psychological', 'psychiatric', 'tired', 'exhausted',
            'unstable', 'intoxicated'
        ]
        
        # Severity indicators
        self.severity_high = ['death', 'serious', 'critical', 'emergency', 'urgent']
        self.severity_medium = ['concerning', 'repeated', 'multiple', 'pattern']
        self.severity_low = ['minor', 'slight', 'small']
    
    def clean_text(self, text: str) -> str:
        """
        Clean and anonymize complaint text.
        
        Args:
            text: Raw complaint text
            
        Returns:
            Cleaned and anonymized text
        """
        if not text:
            return ""
            
        # Remove personal identifiers for privacy
        # Replace names (basic pattern - enhance for production)
        text = re.sub(r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b', '[NAME]', text)
        
        # Replace IDs and reference numbers
        text = re.sub(r'\b[A-Z0-9]{3,}\b', '[ID]', text)
        text = re.sub(r'\b\d{3,}\b', '[NUMBER]', text)
        
        # Replace dates but keep temporal context
        text = re.sub(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', '[DATE]', text)
        text = re.sub(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b', '[DATE]', text)
        
        # Replace email addresses
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
        
        # Replace phone numbers
        text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
        
        # Normalize whitespace
        text = ' '.join(text.split())
        
        return text
    
    def extract_features(self, text: str) -> Dict[str, float]:
        """
        Extract classification features from complaint text.
        
        Args:
            text: Cleaned complaint text
            
        Returns:
            Dictionary of extracted features
        """
        cleaned = self.clean_text(text).lower()
        words = cleaned.split()
        
        features = {
            'text_length': len(words),
            'sentence_count': len(re.split(r'[.!?]+', text)),
            
            # Category indicators
            'conduct_score': sum(1 for term in self.conduct_indicators if term in cleaned),
            'competence_score': sum(1 for term in self.competence_indicators if term in cleaned),
            'health_score': sum(1 for term in self.health_indicators if term in cleaned),
            
            # Severity indicators
            'severity_high_count': sum(1 for term in self.severity_high if term in cleaned),
            'severity_medium_count': sum(1 for term in self.severity_medium if term in cleaned),
            'severity_low_count': sum(1 for term in self.severity_low if term in cleaned),
            
            # Pattern indicators
            'has_temporal_pattern': int(any(word in cleaned for word in ['repeatedly', 'again', 'multiple times', 'pattern', 'twice', 'several'])),
            'has_progression': int(any(phrase in cleaned for phrase in ['initially', 'but then', 'at first', 'later', 'eventually'])),
            
            # Urgency indicators
            'is_urgent': int(any(word in cleaned for word in ['urgent', 'emergency', 'immediate', 'asap'])),
            
            # Emotional content
            'emotional_words': sum(1 for word in ['angry', 'upset', 'frustrated', 'worried', 'scared', 'anxious'] if word in cleaned)
        }
        
        # Calculate normalized scores
        total_score = sum([features['conduct_score'], 
                          features['competence_score'], 
                          features['health_score']])
        
        if total_score > 0:
            features['conduct_ratio'] = features['conduct_score'] / total_score
            features['competence_ratio'] = features['competence_score'] / total_score
            features['health_ratio'] = features['health_score'] / total_score
        else:
            features['conduct_ratio'] = 0
            features['competence_ratio'] = 0
            features['health_ratio'] = 0
        
        # Determine likely severity
        if features['severity_high_count'] > 0:
            features['estimated_severity'] = 'HIGH'
        elif features['severity_medium_count'] > 0 or features['has_temporal_pattern']:
            features['estimated_severity'] = 'MEDIUM'
        else:
            features['estimated_severity'] = 'LOW'
            
        return features
    
    def prepare_for_llm(self, complaint: str) -> str:
        """
        Format complaint for Large Language Model classification.
        
        Args:
            complaint: Original complaint text
            
        Returns:
            Formatted prompt for LLM
        """
        cleaned = self.clean_text(complaint)
        features = self.extract_features(complaint)
        
        prompt = f"""Classify this medical practitioner complaint into the most appropriate category.

COMPLAINT TEXT:
{cleaned}

EXTRACTED FEATURES:
- Length: {features['text_length']} words
- Estimated Severity: {features['estimated_severity']}
- Has Temporal Pattern: {'Yes' if features['has_temporal_pattern'] else 'No'}
- Has Progression: {'Yes' if features['has_progression'] else 'No'}

CLASSIFICATION CATEGORIES:
1. CONDUCT: Issues with professional behavior, ethics, boundaries, communication
2. COMPETENCE: Clinical errors, skill deficiencies, treatment failures
3. HEALTH: Practitioner fitness issues, impairment, mental/physical health concerns
4. NEEDS_REVIEW: Ambiguous cases requiring human clinical review
5. MONITORING: Situations to watch but not immediately actionable

INSTRUCTIONS:
- Consider the main issue being raised
- Assess the context and severity
- If uncertain, classify as NEEDS_REVIEW
- Provide confidence level (0-1) and brief reasoning

Respond in JSON format:
{{
    "category": "CATEGORY_NAME",
    "confidence": 0.0-1.0,
    "reasoning": "Brief explanation",
    "requires_human_review": true/false,
    "suggested_priority": "HIGH/MEDIUM/LOW"
}}"""
        
        return prompt
    
    def process_batch(self, complaints: List[Dict]) -> pd.DataFrame:
        """
        Process multiple complaints for batch analysis.
        
        Args:
            complaints: List of complaint dictionaries with 'id' and 'text' fields
            
        Returns:
            DataFrame with processed complaints and features
        """
        processed_data = []
        
        for idx, complaint in enumerate(complaints):
            try:
                complaint_id = complaint.get('id', f'COMP_{idx:04d}')
                complaint_text = complaint.get('text', '')
                
                # Extract all features
                features = self.extract_features(complaint_text)
                
                # Create record
                record = {
                    'complaint_id': complaint_id,
                    'original_text': complaint_text,
                    'cleaned_text': self.clean_text(complaint_text),
                    'llm_prompt': self.prepare_for_llm(complaint_text),
                    'processed_date': datetime.now().isoformat(),
                    **features,
                    'predicted_category': self._predict_category(features),
                    'actual_category': complaint.get('category', 'UNKNOWN')
                }
                
                processed_data.append(record)
                
            except Exception as e:
                print(f"Error processing complaint {complaint_id}: {str(e)}")
                continue
        
        return pd.DataFrame(processed_data)
    
    def _predict_category(self, features: Dict) -> str:
        """
        Simple rule-based prediction as baseline.
        This is a fallback when AI is not available.
        
        Args:
            features: Extracted features dictionary
            
        Returns:
            Predicted category
        """
        # High severity health issues take priority
        if features['health_ratio'] > 0.4 and features['estimated_severity'] == 'HIGH':
            return 'HEALTH'
        
        # Check for clear category dominance
        ratios = {
            'CONDUCT': features['conduct_ratio'],
            'COMPETENCE': features['competence_ratio'],
            'HEALTH': features['health_ratio']
        }
        
        max_ratio = max(ratios.values())
        
        # If no clear signal, needs review
        if max_ratio < 0.3:
            return 'NEEDS_REVIEW'
        
        # If temporal pattern with mixed signals, monitor
        if features['has_temporal_pattern'] and features['has_progression']:
            return 'MONITORING'
        
        # Return category with highest ratio
        return max(ratios, key=ratios.get)
    
    def generate_summary_report(self, df: pd.DataFrame) -> Dict:
        """
        Generate summary statistics from processed complaints.
        
        Args:
            df: DataFrame of processed complaints
            
        Returns:
            Dictionary with summary statistics
        """
        summary = {
            'total_complaints': len(df),
            'processing_date': datetime.now().isoformat(),
            'category_distribution': df['predicted_category'].value_counts().to_dict(),
            'severity_distribution': df['estimated_severity'].value_counts().to_dict(),
            'average_text_length': df['text_length'].mean(),
            'temporal_patterns_found': df['has_temporal_pattern'].sum(),
            'urgent_cases': df['is_urgent'].sum(),
            'accuracy': None
        }
        
        # Calculate accuracy if actual categories are provided
        if 'actual_category' in df.columns and df['actual_category'].notna().any():
            correct = (df['predicted_category'] == df['actual_category']).sum()
            total = df['actual_category'].notna().sum()
            summary['accuracy'] = correct / total if total > 0 else None
        
        return summary


# Example usage and testing
if __name__ == "__main__":
    # Initialize preprocessor
    preprocessor = MedicalComplaintPreprocessor()
    
    # Sample complaints for testing
    test_complaints = [
        {
            'id': '001',
            'text': 'Dr Smith was very rude and dismissive during my appointment. He interrupted me constantly and made inappropriate comments.',
            'category': 'CONDUCT'
        },
        {
            'id': '002', 
            'text': 'The doctor misdiagnosed my condition three times, leading to unnecessary procedures.',
            'category': 'COMPETENCE'
        },
        {
            'id': '003',
            'text': 'I noticed my physician seemed impaired during the visit. His speech was slurred.',
            'category': 'HEALTH'
        },
        {
            'id': '004',
            'text': 'The treatment helped initially but then made things worse. Not sure what went wrong.',
            'category': 'NEEDS_REVIEW'
        }
    ]
    
    # Process complaints
    results_df = preprocessor.process_batch(test_complaints)
    
    # Display results
    print("Processed Complaints Summary:")
    print("-" * 50)
    print(results_df[['complaint_id', 'predicted_category', 'actual_category', 
                     'conduct_ratio', 'competence_ratio', 'health_ratio', 
                     'estimated_severity']])
    
    # Generate summary report
    summary = preprocessor.generate_summary_report(results_df)
    print("\nSummary Report:")
    print("-" * 50)
    print(json.dumps(summary, indent=2))