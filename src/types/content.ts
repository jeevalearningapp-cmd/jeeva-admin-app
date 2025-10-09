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
  duration?: number
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateLessonInput {
  topicId?: string
  title?: string
  content?: string
  videoUrl?: string
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
}

// Flashcard Types
export interface Flashcard {
  id: string
  lessonId: string
  front: string
  back: string
  imageUrl?: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateFlashcardInput {
  lessonId: string
  front: string
  back: string
  imageUrl?: string
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateFlashcardInput {
  lessonId?: string
  front?: string
  back?: string
  imageUrl?: string
  isActive?: boolean
  displayOrder?: number
}
