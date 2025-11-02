/**
 * Fixed Learning Module Structure for NMC CBT Exam
 * 
 * This defines the 8 core topics and their subtopics that make up
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
    subtopics: [
      { 
        id: '1.1', 
        title: 'Dosage Calculations', 
        description: 'Tablets, liquids, IV medications' 
      },
      { 
        id: '1.2', 
        title: 'Unit Conversions', 
        description: 'mg ↔ mcg, kg ↔ lbs, mL ↔ L' 
      },
      { 
        id: '1.3', 
        title: 'IV Flow Rate Calculations', 
        description: 'Drip rates, infusion times' 
      },
      { 
        id: '1.4', 
        title: 'Fluid Balance', 
        description: 'Fluid charts, BMI, nutrition' 
      }
    ]
  },
  {
    id: '22222222-2222-0002-0000-000000000002',
    title: 'The NMC Code',
    description: 'Professional standards of practice and behaviour',
    subtopics: [
      { 
        id: '2.1', 
        title: 'Prioritise People', 
        description: 'Patient dignity, consent, advocacy' 
      },
      { 
        id: '2.2', 
        title: 'Practice Effectively', 
        description: 'Evidence-based care, delegation, continuous learning' 
      },
      { 
        id: '2.3', 
        title: 'Preserve Safety', 
        description: 'Risk reporting, infection control, safeguarding' 
      },
      { 
        id: '2.4', 
        title: 'Promote Professionalism', 
        description: 'Social media ethics, accountability, revalidation' 
      }
    ]
  },
  {
    id: '22222222-2222-0003-0000-000000000003',
    title: 'Mental Capacity Act',
    description: 'Understanding mental capacity and decision-making',
    subtopics: [
      { 
        id: '3.1', 
        title: 'Presumption of Capacity', 
        description: 'Assume capacity unless proven otherwise' 
      },
      { 
        id: '3.2', 
        title: 'Assessing Capacity', 
        description: '2-stage test (understanding, retaining, weighing, communicating)' 
      },
      { 
        id: '3.3', 
        title: 'Best Interests Decisions', 
        description: 'Involving families, advanced care plans' 
      },
      { 
        id: '3.4', 
        title: 'Advanced Care Planning', 
        description: 'Living wills, lasting power of attorney' 
      }
    ]
  },
  {
    id: '22222222-2222-0004-0000-000000000004',
    title: 'Safeguarding',
    description: 'Protecting vulnerable individuals from harm',
    subtopics: [
      { 
        id: '4.1', 
        title: 'Recognising Abuse', 
        description: 'Physical, emotional, financial abuse in adults/children' 
      },
      { 
        id: '4.2', 
        title: 'Reporting Protocols', 
        description: 'Care Act 2014, whistleblowing, escalation' 
      },
      { 
        id: '4.3', 
        title: 'Child Protection', 
        description: 'Children Act 1989, signs of neglect' 
      }
    ]
  },
  {
    id: '22222222-2222-0005-0000-000000000005',
    title: 'Consent & Confidentiality',
    description: 'Patient rights and information governance',
    subtopics: [
      { 
        id: '5.1', 
        title: 'Valid Consent', 
        description: 'Informed, voluntary, capacitous consent' 
      },
      { 
        id: '5.2', 
        title: 'GDPR & Confidentiality', 
        description: 'Data protection, sharing information' 
      },
      { 
        id: '5.3', 
        title: 'Confidentiality vs. Safeguarding', 
        description: 'Disclosing info without consent for protection' 
      }
    ]
  },
  {
    id: '22222222-2222-0006-0000-000000000006',
    title: 'Equality & Diversity',
    description: 'Promoting equality in healthcare',
    subtopics: [
      { 
        id: '6.1', 
        title: 'Equality Act 2010', 
        description: 'Protected characteristics, non-discrimination' 
      },
      { 
        id: '6.2', 
        title: 'Cultural Competence', 
        description: 'Religious dietary needs, prayer times' 
      },
      { 
        id: '6.3', 
        title: 'Reasonable Adjustments', 
        description: 'Disability access, communication aids' 
      }
    ]
  },
  {
    id: '22222222-2222-0007-0000-000000000007',
    title: 'Duty of Candour',
    description: 'Being open and honest when things go wrong',
    subtopics: [
      { 
        id: '7.1', 
        title: 'Transparency After Errors', 
        description: 'Apologising, explaining harm, documentation' 
      },
      { 
        id: '7.2', 
        title: 'NHS Incident Reporting', 
        description: 'DATIX forms, root cause analysis' 
      }
    ]
  },
  {
    id: '22222222-2222-0008-0000-000000000008',
    title: 'Cultural Adaptation',
    description: 'Working effectively in a multicultural healthcare environment',
    subtopics: [
      { 
        id: '8.1', 
        title: 'Autonomy vs. Family Decisions', 
        description: 'UK patient-led vs. India family-led care' 
      },
      { 
        id: '8.2', 
        title: 'UK Communication Styles', 
        description: 'Assertiveness, multidisciplinary teamwork' 
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
    if (topic.subtopics.length === 0) {
      throw new Error(`Topic "${topic.title}" has no subtopics. All topics must have subtopics.`);
    }
    
    topic.subtopics.forEach(subtopic => {
      subtopics.push({
        id: subtopic.id,
        title: subtopic.title,
        topicTitle: topic.title,
        displayLabel: `${topic.title} → ${subtopic.id} ${subtopic.title}`
      });
    });
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
