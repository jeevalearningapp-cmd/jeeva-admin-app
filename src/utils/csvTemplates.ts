// CSV Template Generators for Bulk Upload

export interface CSVTemplate {
  filename: string
  headers: string[]
  sampleData: string[][]
  notes: string[]
}

// Question CSV Template
export const questionTemplate: CSVTemplate = {
  filename: 'questions_template.csv',
  headers: [
    'question_text',
    'question_type',
    'difficulty',
    'points',
    'explanation',
    'image_url',
    'option_1',
    'option_1_correct',
    'option_2',
    'option_2_correct',
    'option_3',
    'option_3_correct',
    'option_4',
    'option_4_correct'
  ],
  sampleData: [
    [
      'What is the capital of France?',
      'multiple_choice',
      'easy',
      '1',
      'Paris is the capital and most populous city of France',
      '',
      'London',
      'false',
      'Paris',
      'true',
      'Berlin',
      'false',
      'Madrid',
      'false'
    ],
    [
      'Is the Earth flat?',
      'true_false',
      'easy',
      '1',
      'The Earth is approximately spherical in shape',
      '',
      'True',
      'false',
      'False',
      'true',
      '',
      '',
      '',
      ''
    ],
    [
      'What is 2 + 2?',
      'short_answer',
      'easy',
      '1',
      'Basic arithmetic addition',
      '',
      '4',
      'true',
      '',
      '',
      '',
      '',
      '',
      ''
    ]
  ],
  notes: [
    'INSTRUCTIONS FOR QUESTIONS CSV:',
    '1. question_type must be one of: multiple_choice, true_false, short_answer',
    '2. difficulty must be one of: easy, medium, hard',
    '3. points must be a positive integer',
    '4. For multiple_choice: provide 2-4 options with one marked as correct',
    '5. For true_false: provide True/False options with one correct',
    '6. For short_answer: provide the correct answer in option_1',
    '7. option_X_correct must be "true" or "false" (lowercase)',
    '8. Leave unused option fields empty',
    '9. image_url is optional',
    '10. All text fields support basic formatting'
  ]
}

// Lesson/Notes CSV Template
export const lessonTemplate: CSVTemplate = {
  filename: 'lessons_template.csv',
  headers: [
    'title',
    'content',
    'video_url',
    'audio_url',
    'duration'
  ],
  sampleData: [
    [
      'Introduction to Photosynthesis',
      'Photosynthesis is the process used by plants and other organisms to convert light energy into chemical energy. This process involves the absorption of light by chlorophyll.',
      'https://example.com/video/photosynthesis.mp4',
      '',
      '300'
    ],
    [
      'Basic Algebra Concepts',
      'Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities. Learn the fundamentals of solving equations.',
      '',
      'https://example.com/audio/algebra-basics.mp3',
      '600'
    ],
    [
      'World War II Overview',
      'World War II was a global war that lasted from 1939 to 1945. It involved the vast majority of the world\'s countries and is considered the deadliest conflict in human history.',
      'https://example.com/video/wwii.mp4',
      'https://example.com/audio/wwii-podcast.mp3',
      '900'
    ]
  ],
  notes: [
    'INSTRUCTIONS FOR LESSONS CSV:',
    '1. title: Short, descriptive lesson title (required)',
    '2. content: Full lesson content/notes in text format (required)',
    '3. video_url: Optional URL to video content (mp4, webm, etc.)',
    '4. audio_url: Optional URL to audio/podcast (mp3, wav)',
    '5. duration: Lesson duration in seconds (optional)',
    '6. Content field supports long text with formatting',
    '7. Can include both video_url and audio_url for hybrid content',
    '8. Duration helps track learning progress',
    '9. All URLs must be publicly accessible',
    '10. Leave optional fields empty if not needed'
  ]
}

// Flashcard CSV Template
export const flashcardTemplate: CSVTemplate = {
  filename: 'flashcards_template.csv',
  headers: [
    'front',
    'back',
    'image_url'
  ],
  sampleData: [
    [
      'What is Photosynthesis?',
      'The process by which plants use sunlight, water and carbon dioxide to create oxygen and energy in the form of sugar',
      ''
    ],
    [
      'Capital of Japan',
      'Tokyo',
      ''
    ],
    [
      'E = mc²',
      'Einstein\'s mass-energy equivalence equation. Energy equals mass times the speed of light squared',
      'https://example.com/einstein.jpg'
    ]
  ],
  notes: [
    'INSTRUCTIONS FOR FLASHCARDS CSV:',
    '1. front: The question or prompt (required)',
    '2. back: The answer or explanation (required)',
    '3. image_url: Optional URL to an image',
    '4. Keep text concise for better learning',
    '5. Use simple, clear language',
    '6. One concept per flashcard',
    '7. All fields support basic formatting'
  ]
}

// CSV Generation Functions
export const generateCSV = (template: CSVTemplate): string => {
  const rows: string[] = []
  
  // Add headers
  rows.push(template.headers.join(','))
  
  // Add sample data
  template.sampleData.forEach(row => {
    const escapedRow = row.map(cell => {
      // Escape cells that contain commas, quotes, or newlines
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    })
    rows.push(escapedRow.join(','))
  })
  
  return rows.join('\n')
}

export const downloadCSV = (template: CSVTemplate) => {
  const csvContent = generateCSV(template)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', template.filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const getTemplateNotes = (template: CSVTemplate): string => {
  return template.notes.join('\n')
}

// Parse CSV string to array
export const parseCSV = (csvText: string): string[][] => {
  // Normalize line endings: replace CRLF with LF and handle standalone CR
  const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let insideQuotes = false
  
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i]
    const nextChar = normalizedText[i + 1]
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim())
      currentCell = ''
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim())
      rows.push(currentRow)
      currentRow = []
      currentCell = ''
    } else {
      currentCell += char
    }
  }
  
  // Add last cell and row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    rows.push(currentRow)
  }
  
  return rows.filter(row => row.some(cell => cell.length > 0))
}
