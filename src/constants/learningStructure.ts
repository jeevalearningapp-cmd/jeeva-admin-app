/**
 * Fixed Learning Module Structure for NMC CBT Exam
 * 
 * This defines the 7 core topics and their subtopics that make up
 * the Learning Module content hierarchy.
 */

export interface Subtopic {
  id: string;
  title: string;
  description: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
}

export const LEARNING_MODULE_ID = '22222222-2222-2222-2222-222222222222';

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: '22222222-2222-0001-0000-000000000001',
    title: 'Numeracy',
    description: 'Essential numeracy skills for nursing practice',
    subtopics: [] // Numeracy has direct lessons, no subtopics
  },
  {
    id: '22222222-2222-0002-0000-000000000002',
    title: 'The NMC Code',
    description: 'Professional standards of practice and behaviour',
    subtopics: [
      { 
        id: '1.1', 
        title: 'Prioritise People', 
        description: 'Putting patients at the center of care' 
      },
      { 
        id: '1.2', 
        title: 'Practice Effectively', 
        description: 'Maintaining competence and communication' 
      },
      { 
        id: '1.3', 
        title: 'Preserve Safety', 
        description: 'Protecting patients from harm' 
      },
      { 
        id: '1.4', 
        title: 'Promote Professionalism', 
        description: 'Upholding professional standards' 
      }
    ]
  },
  {
    id: '22222222-2222-0003-0000-000000000003',
    title: 'Mental Capacity Act',
    description: 'Understanding mental capacity and decision-making',
    subtopics: [
      { 
        id: '2.1', 
        title: 'Presumption of Capacity', 
        description: 'Assuming capacity unless proven otherwise' 
      },
      { 
        id: '2.2', 
        title: 'Assessing Capacity', 
        description: 'How to assess decision-making ability' 
      },
      { 
        id: '2.3', 
        title: 'Best Interests Decisions', 
        description: 'Making decisions for those who lack capacity' 
      },
      { 
        id: '2.4', 
        title: 'Advanced Care Planning', 
        description: 'Respecting advance decisions' 
      }
    ]
  },
  {
    id: '22222222-2222-0004-0000-000000000004',
    title: 'Safeguarding',
    description: 'Protecting vulnerable individuals from harm',
    subtopics: [
      { 
        id: '3.1', 
        title: 'Recognising Abuse', 
        description: 'Identifying signs of harm' 
      },
      { 
        id: '3.2', 
        title: 'Reporting Protocols', 
        description: 'How to report safeguarding concerns' 
      },
      { 
        id: '3.3', 
        title: 'Child Protection', 
        description: 'Specific considerations for children' 
      }
    ]
  },
  {
    id: '22222222-2222-0005-0000-000000000005',
    title: 'Consent & Confidentiality',
    description: 'Patient rights and information governance',
    subtopics: [
      { 
        id: '4.1', 
        title: 'Valid Consent', 
        description: 'Requirements for informed consent' 
      },
      { 
        id: '4.2', 
        title: 'GDPR & Confidentiality', 
        description: 'Data protection and privacy' 
      },
      { 
        id: '4.3', 
        title: 'Confidentiality vs. Safeguarding', 
        description: 'When to break confidentiality' 
      }
    ]
  },
  {
    id: '22222222-2222-0006-0000-000000000006',
    title: 'Equality & Diversity',
    description: 'Promoting equality in healthcare',
    subtopics: [
      { 
        id: '5.1', 
        title: 'Equality Act 2010', 
        description: 'Protected characteristics and legal duties' 
      },
      { 
        id: '5.2', 
        title: 'Cultural Competence', 
        description: 'Understanding diverse backgrounds' 
      },
      { 
        id: '5.3', 
        title: 'Reasonable Adjustments', 
        description: 'Supporting patients with disabilities' 
      }
    ]
  },
  {
    id: '22222222-2222-0007-0000-000000000007',
    title: 'Duty of Candour',
    description: 'Being open and honest when things go wrong',
    subtopics: [
      { 
        id: '6.1', 
        title: 'Transparency After Errors', 
        description: 'How to communicate mistakes' 
      },
      { 
        id: '6.2', 
        title: 'NHS Incident Reporting', 
        description: 'Proper incident documentation' 
      }
    ]
  },
  {
    id: '22222222-2222-0008-0000-000000000008',
    title: 'Cultural Adaptation',
    description: 'Working effectively in a multicultural healthcare environment',
    subtopics: [
      { 
        id: '7.1', 
        title: 'Autonomy vs. Family Decisions', 
        description: 'Balancing individual and family involvement' 
      },
      { 
        id: '7.2', 
        title: 'UK Communication Styles', 
        description: 'Adapting to British healthcare culture' 
      }
    ]
  }
];

/**
 * Get all subtopics flattened with their parent topic
 * Useful for dropdowns and filtering
 */
export function getAllSubtopics(): Array<{
  id: string;
  title: string;
  topicTitle: string;
  displayLabel: string;
}> {
  const subtopics: Array<{
    id: string;
    title: string;
    topicTitle: string;
    displayLabel: string;
  }> = [];

  LEARNING_TOPICS.forEach(topic => {
    if (topic.subtopics.length > 0) {
      topic.subtopics.forEach(subtopic => {
        subtopics.push({
          id: subtopic.id,
          title: subtopic.title,
          topicTitle: topic.title,
          displayLabel: `${topic.title} → ${subtopic.id} ${subtopic.title}`
        });
      });
    } else {
      // For topics without subtopics (like Numeracy), use topic title as category
      subtopics.push({
        id: topic.title,
        title: topic.title,
        topicTitle: topic.title,
        displayLabel: topic.title
      });
    }
  });

  return subtopics;
}

/**
 * Get subtopics for a specific topic
 */
export function getSubtopicsByTopic(topicTitle: string): Subtopic[] {
  const topic = LEARNING_TOPICS.find(t => t.title === topicTitle);
  return topic?.subtopics || [];
}
