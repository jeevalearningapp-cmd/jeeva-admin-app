# AI Phase 2: Advanced ML Implementation Guide (BEFORE Development)

## Overview

This document outlines **Phase 2 AI implementation** using **Google Vertex AI** for custom machine learning models, adaptive learning paths, auto-generated content, and predictive analytics. This phase builds upon Phase 1's JeevaBot chatbot foundation.

**Timeline:** 2-3 months after Phase 1 completion  
**Cost Estimate:** ₹80,000-₹2,50,000/month (~$1,000-$3,000 USD)  
**Prerequisites:** Phase 1 fully operational, sufficient user data collected

---

## 1. Phase 2 Objectives

### 1.1 Core Features

**Adaptive Learning Engine:**
- Personalized learning paths based on student performance
- Dynamic difficulty adjustment
- Optimal topic sequencing using ML models

**Auto-Generated Content:**
- AI-generated practice questions from syllabus
- Automated flashcard creation
- Lesson summary generation

**Predictive Analytics:**
- Exam score predictions
- Dropout risk identification
- Study time optimization recommendations

**Enhanced JeevaBot:**
- Multimodal responses (text, images, diagrams)
- Voice interaction support
- Offline capabilities with cached models

### 1.2 Technical Approach

**Vertex AI Components:**
- **AutoML Tables:** For structured prediction (scores, retention)
- **Custom Training:** For specialized models (question generation, adaptive paths)
- **Vertex AI Workbench:** For model development and experimentation
- **Vertex AI Pipelines:** For automated retraining workflows
- **Model Registry:** For version control and deployment

---

## 2. Data Requirements for Model Training

### 2.1 Training Datasets

Unlike Phase 1 (no training required), Phase 2 requires **historical user data** to train custom ML models:

**Minimum Data Requirements:**
- ✅ 10,000+ completed practice sessions
- ✅ 5,000+ mock exam attempts
- ✅ 50,000+ question responses (correct/incorrect)
- ✅ 3+ months of user interaction data
- ✅ Diverse user cohort (different learning levels)

**Data Collection Period:**
- Start collecting from Phase 1 launch
- Monitor data quality and coverage
- Target 6-12 months before Phase 2 training

### 2.2 Feature Engineering

**Student Performance Features:**
```python
# student_features.py
features = {
    'avg_session_score': float,        # Average practice score
    'session_consistency': float,       # Standard deviation of scores
    'time_per_question_avg': float,    # Average time spent per question
    'topics_mastered_count': int,      # Number of topics with >80% score
    'weak_topic_count': int,           # Topics with <60% score
    'study_streak_days': int,          # Consecutive days active
    'total_study_hours': float,        # Cumulative learning time
    'question_accuracy_rate': float,   # Overall correct answer %
    'topic_diversity_score': float,    # Coverage across syllabus
    'preferred_study_time': str,       # Morning/Afternoon/Evening/Night
}
```

**Content Features:**
```python
content_features = {
    'question_difficulty': float,      # 1.0 (easy) to 5.0 (hard)
    'question_type': str,              # MCQ, True/False, Numerical
    'topic_id': str,                   # UUID of topic
    'avg_attempt_time': float,         # Historical avg time for this question
    'success_rate': float,             # % of students who got it right
    'topic_prerequisite_count': int,   # Number of prerequisite topics
}
```

**Interaction Features:**
```python
interaction_features = {
    'session_duration': int,           # Seconds spent in session
    'questions_attempted': int,        # Number of questions tried
    'hints_used': int,                 # Help requests
    'time_of_day': int,                # Hour (0-23)
    'device_type': str,                # Mobile/Tablet
    'session_type': str,               # Practice/Mock/Revision
}
```

### 2.3 Data Preparation Pipeline

```python
# data_preparation.py (for Vertex AI training)

import pandas as pd
from google.cloud import bigquery

def prepare_training_data():
    """Extract and prepare data for ML training"""
    
    # Query Supabase data (export to BigQuery for Vertex AI)
    query = """
    SELECT 
        ps.user_id,
        ps.topic_id,
        ps.score,
        ps.total_questions,
        ps.session_duration,
        ps.created_at,
        u.created_at as user_signup_date,
        lc.count as lessons_completed,
        me.avg_score as mock_exam_avg
    FROM practice_sessions ps
    JOIN users u ON ps.user_id = u.id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM learning_completions
        GROUP BY user_id
    ) lc ON ps.user_id = lc.user_id
    LEFT JOIN (
        SELECT user_id, AVG(score) as avg_score
        FROM mock_exams
        GROUP BY user_id
    ) me ON ps.user_id = me.user_id
    WHERE ps.created_at >= '2025-01-01'
    """
    
    # Load into DataFrame
    df = pd.read_sql(query, supabase_connection)
    
    # Feature engineering
    df['days_since_signup'] = (df['created_at'] - df['user_signup_date']).dt.days
    df['score_normalized'] = df['score'] / 100
    df['questions_per_minute'] = df['total_questions'] / (df['session_duration'] / 60)
    
    # Train/test split (80/20)
    train_data = df[df['created_at'] < '2025-09-01']
    test_data = df[df['created_at'] >= '2025-09-01']
    
    return train_data, test_data
```

---

## 3. ML Model Specifications

### 3.1 Adaptive Learning Path Model

**Model Type:** Sequential Recommender (LSTM/Transformer)  
**Input:** Student performance history, topic dependencies  
**Output:** Next best topic to study

**Architecture:**
```python
# adaptive_learning_model.py

from tensorflow import keras
from tensorflow.keras import layers

def build_learning_path_model(num_topics=500, embedding_dim=128):
    """
    Predicts next optimal topic based on student history
    """
    
    # Student performance sequence input
    performance_input = keras.Input(shape=(None, num_topics), name='performance_history')
    
    # Topic metadata input
    topic_input = keras.Input(shape=(num_topics,), name='topic_features')
    
    # LSTM for sequential learning
    lstm_out = layers.LSTM(256, return_sequences=True)(performance_input)
    lstm_out = layers.LSTM(128)(lstm_out)
    
    # Combine with topic features
    combined = layers.concatenate([lstm_out, topic_input])
    dense = layers.Dense(256, activation='relu')(combined)
    dense = layers.Dropout(0.3)(dense)
    
    # Output: Probability distribution over next topics
    output = layers.Dense(num_topics, activation='softmax', name='next_topic')(dense)
    
    model = keras.Model(inputs=[performance_input, topic_input], outputs=output)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    return model
```

**Training Data Format:**
```json
{
  "performance_history": [
    [0.8, 0.6, 0.0, ...],  // Topic scores (0 if not attempted)
    [0.9, 0.7, 0.5, ...],
    [0.85, 0.75, 0.6, ...]
  ],
  "topic_features": [0.5, 0.7, 0.3, ...],  // Difficulty, prerequisite coverage
  "next_topic": 42  // Optimal next topic ID (label)
}
```

### 3.2 Question Generation Model

**Model Type:** Fine-tuned LLM (Gemini via Vertex AI)  
**Input:** Lesson content, topic metadata  
**Output:** Multiple-choice questions with explanations

**Implementation:**
```python
# question_generator.py

from vertexai.preview.language_models import TextGenerationModel

def generate_questions_from_lesson(lesson_content: str, topic: str, count: int = 5):
    """
    Auto-generate practice questions from lesson content
    """
    
    model = TextGenerationModel.from_pretrained("text-bison@002")
    
    prompt = f"""
    Generate {count} multiple-choice questions based on the following lesson content.
    
    TOPIC: {topic}
    
    LESSON CONTENT:
    {lesson_content}
    
    FORMAT (JSON):
    {{
      "questions": [
        {{
          "question_text": "...",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "correct_option": "A",
          "explanation": "...",
          "difficulty": 3.5
        }}
      ]
    }}
    
    REQUIREMENTS:
    - Questions should test understanding, not just recall
    - Include 4 options (A, B, C, D) with one correct answer
    - Provide detailed explanations
    - Vary difficulty from 2.0 (easy) to 5.0 (hard)
    - Use Indian exam question styles (NEET/JEE format)
    """
    
    response = model.predict(
        prompt,
        temperature=0.7,
        max_output_tokens=2048,
    )
    
    # Parse JSON response and insert into database
    questions = json.loads(response.text)
    return questions
```

### 3.3 Exam Score Prediction Model

**Model Type:** Gradient Boosted Trees (XGBoost via Vertex AI AutoML)  
**Input:** Student features + study patterns  
**Output:** Predicted exam score (0-100)

**Features for Prediction:**
```python
# score_prediction_features.py

prediction_features = [
    # Performance features
    'avg_practice_score_30days',
    'score_trend_slope',              # Improving or declining?
    'mock_exam_avg',
    'question_accuracy_rate',
    
    # Engagement features
    'study_hours_last_week',
    'session_frequency',
    'streak_days',
    'lessons_completed_percentage',
    
    # Content coverage
    'topics_mastered_count',
    'syllabus_coverage_percentage',
    'weak_topics_count',
    
    # Historical patterns
    'time_per_question_avg',
    'revision_session_count',
    'chatbot_interaction_count',
]

# Target variable
target = 'actual_exam_score'  # From mock_exams table
```

**Vertex AI AutoML Training:**
```python
# train_score_predictor.py

from google.cloud import aiplatform

def train_score_prediction_model(dataset_id: str):
    """
    Train exam score prediction model using Vertex AI AutoML
    """
    
    aiplatform.init(project='jeeva-learning', location='asia-south1')
    
    # Create dataset
    dataset = aiplatform.TabularDataset(dataset_id)
    
    # Configure training job
    job = aiplatform.AutoMLTabularTrainingJob(
        display_name='exam_score_predictor',
        optimization_prediction_type='regression',
        optimization_objective='minimize-rmse',
    )
    
    # Train model
    model = job.run(
        dataset=dataset,
        target_column='actual_exam_score',
        training_fraction_split=0.8,
        validation_fraction_split=0.1,
        test_fraction_split=0.1,
        budget_milli_node_hours=10000,  # ~10 hours training
        model_display_name='exam_score_predictor_v1',
    )
    
    return model
```

### 3.4 Dropout Risk Prediction Model

**Model Type:** Binary Classification (Random Forest via AutoML)  
**Input:** User engagement metrics  
**Output:** Dropout probability (0.0 - 1.0)

**Risk Indicators:**
```python
dropout_features = [
    'days_since_last_login',
    'session_count_last_7days',
    'avg_session_duration_trend',      # Decreasing = risk
    'subscription_days_remaining',
    'question_accuracy_decline_rate',  # Frustration indicator
    'chatbot_help_frequency',          # Struggling students ask more
    'lesson_completion_rate',
    'mock_exam_score_trend',           # Declining scores = risk
]

# Label: 1 if user inactive for 14+ days, else 0
target = 'is_at_risk'
```

---

## 4. Vertex AI Architecture

### 4.1 Infrastructure Setup

**Google Cloud Project Setup:**
```bash
# 1. Create GCP project
gcloud projects create jeeva-learning-ai

# 2. Enable Vertex AI APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable ml.googleapis.com
gcloud services enable bigquery.googleapis.com

# 3. Create service account
gcloud iam service-accounts create vertex-ai-service \
    --display-name="Vertex AI Service Account"

# 4. Grant permissions
gcloud projects add-iam-policy-binding jeeva-learning-ai \
    --member="serviceAccount:vertex-ai-service@jeeva-learning-ai.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

**Vertex AI Workbench (Jupyter Notebooks):**
```python
# notebook_setup.py

from google.cloud.notebooks_v1 import NotebookServiceClient
from google.cloud.notebooks_v1.types import Instance

client = NotebookServiceClient()

instance = Instance(
    name='jeeva-ml-workbench',
    vm_image={
        'project': 'deeplearning-platform-release',
        'image_family': 'tf-latest-gpu',
    },
    machine_type='n1-standard-4',
    accelerator_config={
        'type': 'NVIDIA_TESLA_T4',
        'core_count': 1,
    },
)

# Create managed notebook for ML experiments
response = client.create_instance(
    parent='projects/jeeva-learning-ai/locations/asia-south1',
    instance_id='ml-workbench-001',
    instance=instance,
)
```

### 4.2 Data Pipeline (Supabase → BigQuery → Vertex AI)

**Data Export Workflow:**
```python
# data_sync_pipeline.py

from supabase import create_client
from google.cloud import bigquery
import pandas as pd

def sync_supabase_to_bigquery():
    """
    Daily sync: Supabase → BigQuery for Vertex AI training
    """
    
    # 1. Extract from Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    practice_sessions = supabase.table('practice_sessions').select('*').execute()
    learning_completions = supabase.table('learning_completions').select('*').execute()
    mock_exams = supabase.table('mock_exams').select('*').execute()
    
    # 2. Transform to DataFrames
    ps_df = pd.DataFrame(practice_sessions.data)
    lc_df = pd.DataFrame(learning_completions.data)
    me_df = pd.DataFrame(mock_exams.data)
    
    # 3. Load to BigQuery
    bq_client = bigquery.Client(project='jeeva-learning-ai')
    
    ps_df.to_gbq('jeeva_ml_data.practice_sessions', project_id='jeeva-learning-ai', if_exists='replace')
    lc_df.to_gbq('jeeva_ml_data.learning_completions', project_id='jeeva-learning-ai', if_exists='replace')
    me_df.to_gbq('jeeva_ml_data.mock_exams', project_id='jeeva-learning-ai', if_exists='replace')
    
    print("✅ Data synced to BigQuery for Vertex AI training")

# Schedule daily sync (Cloud Scheduler + Cloud Functions)
```

### 4.3 Model Training Pipeline

**Vertex AI Pipeline (Kubeflow):**
```python
# ml_pipeline.py

from kfp.v2 import dsl
from kfp.v2.dsl import component, pipeline
from google.cloud import aiplatform

@component
def prepare_data_component(project_id: str) -> str:
    """Step 1: Prepare training data from BigQuery"""
    from google.cloud import bigquery
    
    client = bigquery.Client(project=project_id)
    query = """
        SELECT * FROM `jeeva_ml_data.training_features`
        WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    """
    dataset_uri = f'bq://{project_id}.jeeva_ml_data.training_set'
    client.query(query).to_dataframe().to_gbq(dataset_uri)
    
    return dataset_uri

@component
def train_model_component(dataset_uri: str) -> str:
    """Step 2: Train ML model using Vertex AI AutoML"""
    from google.cloud import aiplatform
    
    aiplatform.init(project='jeeva-learning-ai', location='asia-south1')
    
    dataset = aiplatform.TabularDataset.create(
        display_name='learning_path_training_data',
        bq_source=dataset_uri,
    )
    
    job = aiplatform.AutoMLTabularTrainingJob(
        display_name='adaptive_learning_model',
        optimization_prediction_type='classification',
    )
    
    model = job.run(dataset=dataset, target_column='next_topic_id')
    return model.resource_name

@component
def deploy_model_component(model_resource_name: str) -> str:
    """Step 3: Deploy model to endpoint"""
    from google.cloud import aiplatform
    
    model = aiplatform.Model(model_resource_name)
    endpoint = model.deploy(machine_type='n1-standard-4')
    
    return endpoint.resource_name

@pipeline(name='jeeva-ml-training-pipeline')
def ml_training_pipeline(project_id: str = 'jeeva-learning-ai'):
    """Complete ML training and deployment pipeline"""
    
    dataset_uri = prepare_data_component(project_id)
    model_name = train_model_component(dataset_uri)
    endpoint = deploy_model_component(model_name)

# Compile and run pipeline
from kfp.v2 import compiler

compiler.Compiler().compile(
    pipeline_func=ml_training_pipeline,
    package_path='jeeva_ml_pipeline.json'
)

# Execute pipeline
aiplatform.PipelineJob(
    display_name='jeeva-ml-pipeline',
    template_path='jeeva_ml_pipeline.json',
).run()
```

---

## 5. Model Deployment & Serving

### 5.1 Vertex AI Endpoints

**Deploy Trained Models:**
```python
# model_deployment.py

from google.cloud import aiplatform

def deploy_all_models():
    """Deploy all Phase 2 models to production endpoints"""
    
    aiplatform.init(project='jeeva-learning-ai', location='asia-south1')
    
    # 1. Adaptive Learning Path Model
    learning_path_model = aiplatform.Model('projects/.../models/adaptive_learning_v1')
    learning_path_endpoint = learning_path_model.deploy(
        endpoint=aiplatform.Endpoint.create(display_name='learning-path-endpoint'),
        machine_type='n1-standard-2',
        min_replica_count=1,
        max_replica_count=5,
    )
    
    # 2. Score Prediction Model
    score_model = aiplatform.Model('projects/.../models/score_predictor_v1')
    score_endpoint = score_model.deploy(
        endpoint=aiplatform.Endpoint.create(display_name='score-prediction-endpoint'),
        machine_type='n1-standard-2',
        min_replica_count=1,
        max_replica_count=3,
    )
    
    # 3. Dropout Risk Model
    dropout_model = aiplatform.Model('projects/.../models/dropout_risk_v1')
    dropout_endpoint = dropout_model.deploy(
        endpoint=aiplatform.Endpoint.create(display_name='dropout-risk-endpoint'),
        machine_type='n1-highmem-2',
        min_replica_count=1,
        max_replica_count=2,
    )
    
    return {
        'learning_path': learning_path_endpoint.resource_name,
        'score_prediction': score_endpoint.resource_name,
        'dropout_risk': dropout_endpoint.resource_name,
    }
```

### 5.2 Backend API Integration

**Admin Portal API Endpoints:**
```typescript
// server/routes/ml-predictions.ts

import { aiplatform } from '@google-cloud/aiplatform'

const predictionClient = new aiplatform.v1.PredictionServiceClient()

// 1. Get personalized learning path
export async function getAdaptiveLearningPath(req: Request, res: Response) {
  const { userId } = req.params
  
  // Fetch student performance data
  const studentData = await getStudentFeatures(userId)
  
  // Call Vertex AI endpoint
  const [response] = await predictionClient.predict({
    endpoint: process.env.LEARNING_PATH_ENDPOINT,
    instances: [studentData],
  })
  
  const nextTopics = response.predictions[0].topicRecommendations
  
  return res.json({ recommendedTopics: nextTopics })
}

// 2. Predict exam score
export async function predictExamScore(req: Request, res: Response) {
  const { userId } = req.params
  
  const studentData = await getStudentFeatures(userId)
  
  const [response] = await predictionClient.predict({
    endpoint: process.env.SCORE_PREDICTION_ENDPOINT,
    instances: [studentData],
  })
  
  const predictedScore = response.predictions[0].value
  const confidence = response.predictions[0].confidence
  
  return res.json({ 
    predictedScore: Math.round(predictedScore),
    confidence: confidence,
    message: `You're on track to score ${Math.round(predictedScore)}% based on your current performance`
  })
}

// 3. Check dropout risk
export async function checkDropoutRisk(req: Request, res: Response) {
  const { userId } = req.params
  
  const engagementData = await getEngagementFeatures(userId)
  
  const [response] = await predictionClient.predict({
    endpoint: process.env.DROPOUT_RISK_ENDPOINT,
    instances: [engagementData],
  })
  
  const riskScore = response.predictions[0].probability
  
  // Trigger intervention if high risk
  if (riskScore > 0.7) {
    await sendReEngagementEmail(userId)
    await notifyAdminOfRisk(userId, riskScore)
  }
  
  return res.json({ 
    riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
    riskScore: riskScore,
  })
}
```

---

## 6. Auto-Content Generation

### 6.1 Question Generation Service

**Automated Question Creation:**
```typescript
// server/services/question-generator.ts

import { VertexAI } from '@google-cloud/vertexai'

export async function generateQuestionsFromLesson(
  lessonId: string,
  count: number = 10
) {
  // Fetch lesson content
  const lesson = await supabase
    .from('lessons')
    .select('*, topics(title), modules(title)')
    .eq('id', lessonId)
    .single()
  
  // Initialize Vertex AI Gemini
  const vertexAI = new VertexAI({
    project: 'jeeva-learning-ai',
    location: 'asia-south1',
  })
  
  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.5-pro',
  })
  
  const prompt = `
Generate ${count} NEET/JEE style multiple-choice questions from this lesson.

MODULE: ${lesson.modules.title}
TOPIC: ${lesson.topics.title}
LESSON: ${lesson.title}

CONTENT:
${lesson.content}

OUTPUT FORMAT (JSON Array):
[
  {
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_option": "A",
    "explanation": "...",
    "difficulty_level": 3.5,
    "estimated_time_seconds": 90
  }
]

REQUIREMENTS:
- Questions must test conceptual understanding
- Use Indian exam format and terminology
- Include detailed explanations
- Vary difficulty (2.0 to 5.0)
- Make distractors plausible but clearly wrong
`
  
  const result = await model.generateContent(prompt)
  const generatedQuestions = JSON.parse(result.response.text())
  
  // Insert into database
  const insertedQuestions = await Promise.all(
    generatedQuestions.map(async (q: any) => {
      const { data: question } = await supabase
        .from('questions')
        .insert({
          topic_id: lesson.topic_id,
          question_text: q.question_text,
          question_type: 'multiple_choice',
          difficulty_level: q.difficulty_level,
          explanation: q.explanation,
          is_ai_generated: true,
        })
        .select()
        .single()
      
      // Insert options
      await supabase.from('question_options').insert([
        { question_id: question.id, option_text: q.option_a, is_correct: q.correct_option === 'A' },
        { question_id: question.id, option_text: q.option_b, is_correct: q.correct_option === 'B' },
        { question_id: question.id, option_text: q.option_c, is_correct: q.correct_option === 'C' },
        { question_id: question.id, option_text: q.option_d, is_correct: q.correct_option === 'D' },
      ])
      
      return question
    })
  )
  
  return insertedQuestions
}

// Automated nightly question generation
export async function autoGenerateQuestions() {
  // Find lessons with <10 questions
  const lessonsNeedingQuestions = await supabase
    .from('lessons')
    .select(`
      id, title,
      questions(count)
    `)
    .having('questions.count', 'lt', 10)
  
  for (const lesson of lessonsNeedingQuestions) {
    const needed = 10 - (lesson.questions.count || 0)
    await generateQuestionsFromLesson(lesson.id, needed)
  }
}
```

### 6.2 Flashcard Auto-Generation

```typescript
// server/services/flashcard-generator.ts

export async function generateFlashcardsFromLesson(
  lessonId: string,
  count: number = 15
) {
  const lesson = await supabase
    .from('lessons')
    .select('*, topics(id, title)')
    .eq('id', lessonId)
    .single()
  
  const vertexAI = new VertexAI({ project: 'jeeva-learning-ai', location: 'asia-south1' })
  const model = vertexAI.preview.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `
Extract ${count} key concepts from this lesson and create flashcards.

LESSON: ${lesson.title}
CONTENT: ${lesson.content}

FORMAT (JSON):
[
  {
    "front_text": "What is photosynthesis?",
    "back_text": "Process by which plants convert light energy into chemical energy",
    "difficulty_level": 2,
    "memory_tip": "Photo = light, synthesis = making"
  }
]

REQUIREMENTS:
- Focus on key definitions, formulas, concepts
- Front: Clear question or term
- Back: Concise answer (1-2 sentences)
- Include memory tips for complex concepts
`
  
  const result = await model.generateContent(prompt)
  const flashcards = JSON.parse(result.response.text())
  
  // Insert into database
  await supabase.from('flashcards').insert(
    flashcards.map((fc: any) => ({
      topic_id: lesson.topics.id,
      front_text: fc.front_text,
      back_text: fc.back_text,
      difficulty_level: fc.difficulty_level,
      is_ai_generated: true,
    }))
  )
  
  return flashcards
}
```

---

## 7. Database Schema Extensions

### 7.1 New Tables for Phase 2

```sql
-- AI-generated content tracking
CREATE TABLE ai_generated_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    generation_model VARCHAR(100),        -- e.g., 'gemini-1.5-pro'
    generation_prompt TEXT,
    human_reviewed BOOLEAN DEFAULT false,
    quality_score DECIMAL(3,2),          -- 0.00 to 5.00
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning path predictions
CREATE TABLE adaptive_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommended_topics JSONB,            -- [{"topic_id": "...", "priority": 0.9}]
    prediction_model VARCHAR(100),
    confidence_score DECIMAL(3,2),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    user_followed BOOLEAN DEFAULT false
);

-- Exam score predictions
CREATE TABLE score_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_type VARCHAR(50),               -- NEET, JEE, etc.
    predicted_score INT,
    confidence_interval JSONB,           -- {"lower": 65, "upper": 75}
    prediction_date TIMESTAMPTZ DEFAULT NOW(),
    actual_score INT,                    -- Filled after real exam
    prediction_accuracy DECIMAL(3,2)     -- Calculated post-exam
);

-- Dropout risk tracking
CREATE TABLE dropout_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    risk_score DECIMAL(3,2),             -- 0.00 to 1.00
    risk_factors JSONB,                  -- {"low_engagement": 0.8, "declining_scores": 0.6}
    intervention_triggered BOOLEAN DEFAULT false,
    intervention_type VARCHAR(50),       -- 'email', 'notification', 'call'
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML model performance tracking
CREATE TABLE ml_model_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    metric_type VARCHAR(50),             -- 'accuracy', 'precision', 'rmse'
    metric_value DECIMAL(5,4),
    training_date TIMESTAMPTZ,
    evaluation_date TIMESTAMPTZ DEFAULT NOW()
);

-- Feature store (for ML predictions)
CREATE TABLE student_feature_vectors (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    feature_vector JSONB,                -- All calculated features
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_feature_updated (last_updated)
);
```

### 7.2 Feature Vector Example

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "feature_vector": {
    "performance": {
      "avg_practice_score_30days": 72.5,
      "score_trend_slope": 0.15,
      "mock_exam_avg": 68.0,
      "question_accuracy_rate": 0.74
    },
    "engagement": {
      "study_hours_last_week": 12.5,
      "session_frequency": 5,
      "streak_days": 14,
      "lessons_completed_percentage": 0.65
    },
    "content_coverage": {
      "topics_mastered_count": 12,
      "syllabus_coverage_percentage": 0.58,
      "weak_topics_count": 4
    },
    "behavioral": {
      "time_per_question_avg": 125,
      "revision_session_count": 8,
      "chatbot_interaction_count": 23,
      "preferred_study_hour": 21
    }
  },
  "last_updated": "2025-10-11T14:30:00Z"
}
```

---

## 8. Cost Management & Optimization

### 8.1 Vertex AI Cost Breakdown

**Monthly Cost Estimates (10,000 active users):**

| Component | Usage | Cost (INR/month) |
|-----------|-------|-----------------|
| **Model Training** | 50 hours GPU/month | ₹25,000 |
| **Predictions (Batch)** | 1M predictions/month | ₹8,000 |
| **Predictions (Online)** | 5M predictions/month | ₹35,000 |
| **Endpoints (Always-on)** | 3 endpoints × n1-standard-2 | ₹15,000 |
| **BigQuery Storage** | 500 GB | ₹4,000 |
| **BigQuery Queries** | 5 TB processed/month | ₹12,000 |
| **Vertex AI Workbench** | 1 instance × 160 hrs/month | ₹8,000 |
| **Gemini API (Question Gen)** | 500K requests/month | ₹20,000 |

**Total: ~₹1,27,000/month ($1,500 USD)**

### 8.2 Cost Optimization Strategies

**1. Batch Predictions:**
```python
# Run predictions in batches (cheaper than online)
def batch_predict_learning_paths():
    """
    Run once daily instead of real-time (10x cost savings)
    """
    all_users = await supabase.from('users').select('id').eq('is_active', true)
    
    # Batch prediction job
    batch_job = aiplatform.BatchPredictionJob.create(
        job_display_name='daily-learning-path-predictions',
        model_name='projects/.../models/adaptive_learning_v1',
        instances_format='jsonl',
        gcs_source='gs://jeeva-ml/user-features.jsonl',
        gcs_destination_prefix='gs://jeeva-ml/predictions/',
        machine_type='n1-standard-4',
    )
    
    # Cache results in Supabase
    results = batch_job.get_batch_prediction_results()
    await cache_predictions_in_db(results)
```

**2. Model Caching:**
```typescript
// Cache predictions for 24 hours
const cachedPredictions = new Map<string, any>()

export async function getCachedLearningPath(userId: string) {
  const cacheKey = `learning_path_${userId}`
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return JSON.parse(cached)  // Avoid Vertex AI call
  }
  
  const prediction = await callVertexAI(userId)
  await redis.setex(cacheKey, 86400, JSON.stringify(prediction))  // 24h cache
  
  return prediction
}
```

**3. Preemptible VMs for Training:**
```python
# Use cheaper preemptible instances for training (80% cost savings)
job = aiplatform.CustomTrainingJob(
    display_name='score_predictor_training',
    script_path='train.py',
    container_uri='gcr.io/cloud-aiplatform/training/tf-cpu.2-8:latest',
    machine_type='n1-standard-4',
    replica_count=1,
    use_preemptible_workers=True,  # 80% cheaper
)
```

---

## 9. Implementation Roadmap

### 9.1 Phase 2 Timeline (12 weeks)

**Weeks 1-2: Data Preparation**
- [ ] Export Supabase data to BigQuery
- [ ] Build feature engineering pipeline
- [ ] Validate data quality (>10K practice sessions)
- [ ] Create training/test splits

**Weeks 3-4: Model Development**
- [ ] Train adaptive learning path model (LSTM)
- [ ] Train score prediction model (AutoML)
- [ ] Train dropout risk model (Random Forest)
- [ ] Validate model accuracy on test set

**Weeks 5-6: Content Generation**
- [ ] Implement question generation service
- [ ] Implement flashcard generation service
- [ ] Human review workflow for AI content
- [ ] Quality assurance testing

**Weeks 7-8: Deployment**
- [ ] Deploy models to Vertex AI endpoints
- [ ] Build backend API integrations
- [ ] Implement caching layer (Redis)
- [ ] Load testing and optimization

**Weeks 9-10: Mobile App Integration**
- [ ] Update mobile app with AI features UI
- [ ] Integrate adaptive learning path screen
- [ ] Add score prediction dashboard
- [ ] Test end-to-end workflows

**Weeks 11-12: Monitoring & Launch**
- [ ] Set up model monitoring dashboards
- [ ] Implement A/B testing framework
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Collect user feedback and iterate

### 9.2 Success Metrics

**Model Performance:**
- Adaptive learning path acceptance rate >60%
- Score prediction RMSE <10 points
- Dropout prediction AUC >0.80
- AI question quality rating >4.0/5.0

**Business Impact:**
- 30% improvement in student retention
- 15% increase in avg study time
- 20% boost in exam scores
- 50% reduction in content creation time

---

## 10. Security & Compliance

### 10.1 Data Privacy

**Student Data Protection:**
```python
# Anonymize data for ML training
def anonymize_training_data(df: pd.DataFrame):
    """
    Remove PII before uploading to BigQuery
    """
    # Hash user IDs
    df['user_id_hash'] = df['user_id'].apply(lambda x: hashlib.sha256(x.encode()).hexdigest())
    
    # Remove identifying columns
    df = df.drop(['email', 'phone_number', 'full_name'], axis=1)
    
    # Aggregate small cohorts to prevent re-identification
    df = df.groupby(['user_id_hash', 'topic_id']).agg({
        'score': 'mean',
        'session_duration': 'mean'
    }).reset_index()
    
    return df
```

### 10.2 Model Bias Auditing

```python
# Check for bias in predictions
def audit_model_fairness(model_predictions: pd.DataFrame):
    """
    Ensure no discrimination by gender, region, or socioeconomic status
    """
    # Group by demographics
    bias_report = model_predictions.groupby('user_demographics').agg({
        'predicted_score': 'mean',
        'actual_score': 'mean',
        'prediction_error': 'mean'
    })
    
    # Flag if any group has >10% higher error rate
    max_error = bias_report['prediction_error'].max()
    min_error = bias_report['prediction_error'].min()
    
    if (max_error - min_error) / min_error > 0.1:
        alert_admins("Model bias detected - requires retraining")
    
    return bias_report
```

---

## 11. Next Steps

### 11.1 Prerequisites for Phase 2

**Before starting Phase 2 implementation:**
1. ✅ Phase 1 (JeevaBot) must be live and stable
2. ✅ Collect 6+ months of user interaction data
3. ✅ Achieve 10,000+ practice sessions minimum
4. ✅ Budget approval for Vertex AI costs (~₹1.5L/month)
5. ✅ GCP project setup with Vertex AI enabled
6. ✅ ML engineer hired or trained

### 11.2 Documentation to Create Next

After Phase 2 approval, create:
- `AI_PHASE2_VERTEX_AI_SETUP.md` - Detailed GCP setup guide
- `AI_PHASE2_DATA_PIPELINE.md` - Supabase → BigQuery sync
- `AI_PHASE2_MODEL_TRAINING.md` - Step-by-step training guide
- `AI_PHASE2_API_INTEGRATION.md` - Backend API implementation
- `AI_PHASE2_MOBILE_UI.md` - Mobile app AI features

---

## Summary

**Phase 2 Capabilities:**
- 🤖 Adaptive learning paths using LSTM models
- 📊 Exam score predictions with 90%+ accuracy
- ⚠️ Dropout risk detection and intervention
- 🎯 Auto-generated questions and flashcards
- 📈 Advanced analytics and insights

**Investment Required:**
- **Time:** 12 weeks development + 4 weeks testing
- **Cost:** ₹1,27,000/month ongoing (after initial setup)
- **Team:** 1 ML engineer + 1 backend dev + 1 QA

**Expected ROI:**
- 30% retention improvement = ₹50L+ annual revenue
- 50% content creation savings = ₹20L+ cost reduction
- Better student outcomes = Higher conversion rates

**This document serves as the blueprint for Phase 2. Actual implementation will begin only after Phase 1 proves successful and sufficient training data is collected.**

---

**Related Documents:**
- `AI_PHASE1_CHATBOT.md` - Phase 1 implementation guide
- `AI_PHASE1_DATA_CONTEXT.md` - Phase 1 data requirements
- `AI_PHASE2_ROADMAP.md` - High-level Phase 2 vision
- `AI_SECURITY.md` - Security best practices
