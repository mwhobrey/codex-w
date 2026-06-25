import type { SheetDefinition } from '../types';
import { totvPrompts } from './prompts';

export const totvSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'identity',
      title: 'Who you were',
      description: 'Before the hunger — fragments of a mortal life.',
      fields: [
        {
          key: 'human_name',
          label: 'Human name',
          type: 'text',
          defaultValue: '',
          placeholder: 'What they called you when your heart still beat',
        },
        {
          key: 'vampire_name',
          label: 'Vampire name',
          type: 'text',
          defaultValue: '',
          placeholder: 'What you are called now',
        },
        {
          key: 'birthplace',
          label: 'Birthplace',
          type: 'text',
          defaultValue: '',
          placeholder: 'Village, city, coast…',
        },
        {
          key: 'era_born',
          label: 'Era born',
          type: 'text',
          defaultValue: '',
          placeholder: 'Century or age when you were mortal',
        },
      ],
    },
    {
      id: 'memories',
      title: 'Memories',
      description: 'Five slots — up to three vivid moments per slot. When full, something must be forgotten.',
      fields: [
        { key: 'memory_1', label: 'Memory 1', type: 'textarea', defaultValue: '', placeholder: 'Moment · moment · moment' },
        { key: 'memory_2', label: 'Memory 2', type: 'textarea', defaultValue: '', placeholder: 'Moment · moment · moment' },
        { key: 'memory_3', label: 'Memory 3', type: 'textarea', defaultValue: '', placeholder: 'Moment · moment · moment' },
        { key: 'memory_4', label: 'Memory 4', type: 'textarea', defaultValue: '', placeholder: 'Moment · moment · moment' },
        { key: 'memory_5', label: 'Memory 5', type: 'textarea', defaultValue: '', placeholder: 'Moment · moment · moment' },
      ],
    },
    {
      id: 'capabilities',
      title: 'Skills & Resources',
      description: 'Five of each maximum. Prompts may ask you to add, spend, or lose entries.',
      fields: [
        { key: 'skill_1', label: 'Skill 1', type: 'text', defaultValue: '', placeholder: 'A talent honed over time' },
        { key: 'skill_2', label: 'Skill 2', type: 'text', defaultValue: '', placeholder: 'A talent honed over time' },
        { key: 'skill_3', label: 'Skill 3', type: 'text', defaultValue: '', placeholder: 'A talent honed over time' },
        { key: 'skill_4', label: 'Skill 4', type: 'text', defaultValue: '', placeholder: 'A talent honed over time' },
        { key: 'skill_5', label: 'Skill 5', type: 'text', defaultValue: '', placeholder: 'A talent honed over time' },
        { key: 'resource_1', label: 'Resource 1', type: 'text', defaultValue: '', placeholder: 'Wealth, refuge, relic…' },
        { key: 'resource_2', label: 'Resource 2', type: 'text', defaultValue: '', placeholder: 'Wealth, refuge, relic…' },
        { key: 'resource_3', label: 'Resource 3', type: 'text', defaultValue: '', placeholder: 'Wealth, refuge, relic…' },
        { key: 'resource_4', label: 'Resource 4', type: 'text', defaultValue: '', placeholder: 'Wealth, refuge, relic…' },
        { key: 'resource_5', label: 'Resource 5', type: 'text', defaultValue: '', placeholder: 'Wealth, refuge, relic…' },
      ],
    },
    {
      id: 'connections',
      title: 'Characters',
      description: 'Mortals and monsters who still matter — five maximum.',
      fields: [
        { key: 'character_1', label: 'Character 1', type: 'text', defaultValue: '', placeholder: 'Name and relationship' },
        { key: 'character_2', label: 'Character 2', type: 'text', defaultValue: '', placeholder: 'Name and relationship' },
        { key: 'character_3', label: 'Character 3', type: 'text', defaultValue: '', placeholder: 'Name and relationship' },
        { key: 'character_4', label: 'Character 4', type: 'text', defaultValue: '', placeholder: 'Name and relationship' },
        { key: 'character_5', label: 'Character 5', type: 'text', defaultValue: '', placeholder: 'Name and relationship' },
      ],
    },
    {
      id: 'diary',
      title: 'Diary',
      fields: [
        {
          key: 'diary',
          label: 'Diary',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Chronicle your centuries — what endures, what erodes…',
        },
      ],
    },
  ],
};

export const totvSoloEngine = {
  kind: 'prompt-journal' as const,
  scenePrompts: [
    'Where are you in time right now — century, city, season?',
    'What hunger or longing drives this chapter of your unlife?',
    'Who watches you from the shadows, and do they mean you harm?',
    'What mortal custom do you mimic badly enough to pass?',
    'Which memory do you return to when you cannot sleep?',
  ],
  promptAdvance: { minPrompt: 1, maxPrompt: totvPrompts.length },
  prompts: totvPrompts,
};
