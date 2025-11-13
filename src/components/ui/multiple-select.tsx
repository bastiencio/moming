'use client';

import {
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import * as React from 'react';

export type TTag = {
  key: string;
  name: string;
};

type MultipleSelectProps = {
  tags: TTag[];
  customTag?: (item: TTag) => ReactNode | string;
  onChange?: (value: TTag[]) => void;
  defaultValue?: TTag[];
};

export const MultipleSelect = ({
  tags,
  customTag,
  onChange,
  defaultValue,
}: MultipleSelectProps) => {
  const [selected, setSelected] = useState<TTag[]>(defaultValue ?? []);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update internal state when defaultValue changes
  useEffect(() => {
    setSelected(defaultValue ?? []);
  }, [defaultValue]);

  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.scrollBy({
        left: containerRef.current?.scrollWidth,
        behavior: 'smooth',
      });
    }
    onChange?.(selected);
  }, [selected, onChange]);

  const onSelect = (item: TTag) => {
    setSelected((prev) => [...prev, item]);
  };

  const onDeselect = (item: TTag) => {
    setSelected((prev) => prev.filter((i) => i !== item));
  };

  return (
    <AnimatePresence mode={'popLayout'}>
      <div className={'flex w-full flex-col gap-2'}>
        <motion.div
          layout
          ref={containerRef}
          className='selected no-scrollbar flex h-12 w-full items-center overflow-x-scroll scroll-smooth rounded-md border border-solid border-border bg-muted p-2'
        >
          <motion.div layout className='flex items-center gap-2'>
            {selected?.map((item) => (
              <Tag
                name={item?.key}
                key={item?.key}
                className={'bg-background shadow'}
              >
                <div className='flex items-center gap-2'>
                  <motion.span layout className={'text-nowrap text-foreground'}>
                    {item?.name}
                  </motion.span>
                  <button className={''} onClick={() => onDeselect(item)}>
                    <X size={14} className="text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </Tag>
            ))}
          </motion.div>
        </motion.div>
        {tags?.length > selected?.length && (
          <div className='flex w-full flex-wrap gap-2 rounded-md border border-solid border-border p-2 bg-card'>
            {tags
              ?.filter((item) => !selected?.some((i) => i.key === item.key))
              .map((item) => (
                <Tag
                  name={item?.key}
                  onClick={() => onSelect(item)}
                  key={item?.key}
                >
                  {customTag ? (
                    customTag(item)
                  ) : (
                    <motion.span layout className={'text-nowrap text-foreground'}>
                      {item?.name}
                    </motion.span>
                  )}
                </Tag>
              ))}
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

type TagProps = PropsWithChildren &
  Pick<HTMLAttributes<HTMLDivElement>, 'onClick'> & {
    name?: string;
    className?: string;
  };

export const Tag = ({ children, className, name, onClick }: TagProps) => {
  return (
    <motion.div
      layout
      layoutId={name}
      onClick={onClick}
      className={`cursor-pointer rounded-md bg-secondary px-2 py-1 text-sm hover:bg-secondary/80 transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
};