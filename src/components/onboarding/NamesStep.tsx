'use client';

import Input from '../ui/Input';

interface NamesStepProps {
  partySize: 2 | 3 | 4;
  value: string[];
  onChange: (value: string[]) => void;
  defaultUserName: string;
}

export default function NamesStep({
  partySize,
  value,
  onChange,
  defaultUserName,
}: NamesStepProps) {
  // Ensure we have correct number of names in state
  const handleNameChange = (index: number, name: string) => {
    const updated = [...value];
    while (updated.length < partySize) {
      updated.push('');
    }
    updated[index] = name;
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gradient-rose">
          PARTICIPANT NAMES
        </h2>
        <p className="text-muted text-sm mt-2 font-sans font-light">
          Provide participant names for role assignments in card templates.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: partySize }).map((_, index) => {
          const nameVal = value[index] || (index === 0 ? defaultUserName : '');

          return (
            <Input
              key={index}
              label={`Player ${index + 1}`}
              placeholder={
                index === 0
                  ? 'Your name'
                  : index === 1
                  ? "Partner's name"
                  : `Player ${index + 1}'s name`
              }
              value={nameVal}
              onChange={(e) => handleNameChange(index, e.target.value)}
            />
          );
        })}
      </div>
    </div>
  );
}
