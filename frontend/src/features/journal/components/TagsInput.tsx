import { useState, type KeyboardEvent } from 'react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagsInput({ tags, onChange }: TagsInputProps) {
  const [input, setInput] = useState('');

  function commit() {
    const newTags = input
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && !tags.includes(t));
    if (newTags.length > 0) {
      onChange([...tags, ...newTags]);
    }
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-paper-raised) px-3 py-2 focus-within:border-(--color-sage) transition-colors">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-(--color-sage-soft) px-2.5 py-0.5 text-xs font-medium text-(--color-sage)"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag "${tag}"`}
            className="ml-0.5 text-(--color-sage) hover:text-(--color-ink) transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={tags.length === 0 ? 'Add tags (comma or enter)' : ''}
        className="min-w-[120px] flex-1 border-0 bg-transparent text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-soft)/50"
      />
    </div>
  );
}
