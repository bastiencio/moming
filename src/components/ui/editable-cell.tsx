import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type EditableCellProps = {
  value: number;
  onValueChange: (newValue: number) => void;
  formatter?: (value: number) => string;
  className?: string;
  prefix?: string;
  onClick?: () => void;
};

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onValueChange,
  formatter = (val) => val.toLocaleString(),
  className,
  prefix = '',
  onClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(value.toString());
    onClick?.();
  };

  const handleSave = () => {
    const numValue = parseFloat(editValue.replace(/,/g, ''));
    if (!isNaN(numValue)) {
      onValueChange(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value.toString());
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn("h-8 px-2 text-right font-mono", className)}
        type="text"
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "cursor-pointer hover:bg-accent/50 rounded px-2 py-1 transition-colors",
        "text-right font-mono select-none",
        className
      )}
      title="Click to edit"
    >
      {prefix}{formatter(value)}
    </div>
  );
};