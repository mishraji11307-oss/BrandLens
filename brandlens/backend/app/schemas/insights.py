from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SmartInsight(BaseModel):
    id: str
    type: str  # warning, recommendation, rule_dispute, campaign_alert
    title: str
    message: str
    action_prompt: str
    severity: str

class GovernanceInsightsOut(BaseModel):
    total_submissions: int
    approved_count: int
    pending_count: int
    rejected_count: int
    critical_violations_caught: int
    average_compliance_score: float
    category_distribution: Dict[str, int]
    severity_distribution: Dict[str, int]
    weekly_activity: List[Dict[str, Any]]
    most_violated_rules: List[Dict[str, Any]]
    smart_insights: List[SmartInsight]

