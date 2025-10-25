// Module Type Enums
export type ModuleType = 'practice' | 'learning' | 'mock_exam'
export type LessonType = 'video' | 'audio' | 'text' | 'quiz'
export type ExamPart = 'part_a' | 'part_b'

// Fixed Module IDs (hardcoded in database)
export const FIXED_MODULE_IDS = {
  PRACTICE: '11111111-1111-1111-1111-111111111111',
  LEARNING: '22222222-2222-2222-2222-222222222222',
  MOCK_EXAM: '33333333-3333-3333-3333-333333333333',
} as const

// Practice Module Categories and Subdivisions
export const PRACTICE_CATEGORIES = {
  NUMERACY: 'Numeracy',
  CLINICAL_KNOWLEDGE: 'Clinical Knowledge',
} as const

export const NUMERACY_SUBDIVISIONS = [
  'Dosage Calculations',
  'Unit Conversions',
  'IV Flow Rate Calculations',
  'Fluid Balance',
] as const

export const CLINICAL_SUBDIVISIONS = [
  'Medical-Surgical Nursing',
  'Pharmacology',
  'Infection Control',
  'Wound Care',
  'Palliative Care',
] as const

// Learning Module Topics
export const LEARNING_TOPICS = [
  'Numeracy',
  'The NMC Code',
  'Mental Capacity Act',
  'Safeguarding',
  'Consent & Confidentiality',
  'Equality & Diversity',
  'Duty of Candour',
  'Cultural Adaptation',
] as const

// Module Types
export interface Module {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateModuleInput {
  title: string
  description: string
  thumbnailUrl?: string
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateModuleInput {
  title?: string
  description?: string
  thumbnailUrl?: string
  isActive?: boolean
  displayOrder?: number
}

// Topic Types
export interface Topic {
  id: string
  moduleId: string
  title: string
  description: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  module?: Module
}

export interface CreateTopicInput {
  moduleId: string
  title: string
  description: string
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateTopicInput {
  moduleId?: string
  title?: string
  description?: string
  isActive?: boolean
  displayOrder?: number
}

// Lesson Types
export interface Lesson {
  id: string
  topicId: string
  title: string
  content: string
  videoUrl?: string
  audioUrl?: string
  lessonType?: LessonType
  passingScorePercentage?: number
  category?: string
  duration?: number
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  topic?: Topic
}

export interface CreateLessonInput {
  topicId: string
  title: string
  content: string
  videoUrl?: string
  audioUrl?: string
  lessonType?: LessonType
  passingScorePercentage?: number
  category?: string
  duration?: number
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateLessonInput {
  topicId?: string
  title?: string
  content?: string
  videoUrl?: string
  audioUrl?: string
  lessonType?: LessonType
  passingScorePercentage?: number
  category?: string
  duration?: number
  isActive?: boolean
  displayOrder?: number
}

// Question Types
export interface QuestionOption {
  id: string
  questionId: string
  optionText: string
  isCorrect: boolean
  displayOrder: number
}

export interface Question {
  id: string
  lessonId?: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  explanation?: string
  imageUrl?: string
  isActive: boolean
  moduleType?: ModuleType
  category?: string
  subdivision?: string
  examPart?: ExamPart
  createdAt: string
  updatedAt: string
  options?: QuestionOption[]
}

export interface CreateQuestionInput {
  lessonId?: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer'
  difficulty: 'easy' | 'medium' | 'hard'
  points?: number
  explanation?: string
  imageUrl?: string
  isActive?: boolean
  moduleType?: ModuleType
  category?: string
  subdivision?: string
  examPart?: ExamPart
  options?: {
    optionText: string
    isCorrect: boolean
    displayOrder: number
  }[]
}

export interface UpdateQuestionInput {
  lessonId?: string
  questionText?: string
  questionType?: 'multiple_choice' | 'true_false' | 'short_answer'
  difficulty?: 'easy' | 'medium' | 'hard'
  points?: number
  explanation?: string
  imageUrl?: string
  isActive?: boolean
  moduleType?: ModuleType
  category?: string
  subdivision?: string
  examPart?: ExamPart
}

// Mock Exam Configuration
export interface MockExamConfig {
  id: string
  partAQuestionCount: number
  partADurationMinutes: number
  partBQuestionCount: number
  partBDurationMinutes: number
  allowCalculator: boolean
  createdAt: string
  updatedAt: string
}

// Lesson Quiz Results
export interface LessonQuizResult {
  id: string
  userId: string
  lessonId: string
  scorePercentage: number
  passed: boolean
  completedAt: string
}

// Flashcard Types
export interface Flashcard {
  id: string
  lessonId?: string
  category?: string
  front: string
  back: string
  imageUrl?: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateFlashcardInput {
  lessonId?: string
  category?: string
  front: string
  back: string
  imageUrl?: string
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateFlashcardInput {
  lessonId?: string
  category?: string
  front?: string
  back?: string
  imageUrl?: string
  isActive?: boolean
  displayOrder?: number
}
