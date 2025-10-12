"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { useSelection } from '@/hooks/use-selection';
import { cn } from '@/lib/utils';

const LOCAL_STORAGE_KEY = 'tempnote-content-v2';

export function RichTextEditor() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const { selection, selectionRect, hasSelection } = useSelection(editorRef);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedNote = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedNote) {
        setContent(savedNote);
        if (editorRef.current) {
          editorRef.current.innerHTML = savedNote;
        }
      } else {
        // Set initial content if nothing is saved
        const initialContent = '<p><br></p>';
        setContent(initialContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = initialContent;
        }
      }
    } catch (error) {
      console.error('Failed to load note from localStorage', error);
    }
  }, []);

  const calculateWordCount = (node: Node | null) => {
    const textContent = node?.textContent || '';
    const words = textContent.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };
  
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setWordCount(calculateWordCount(editorRef.current));
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
      } catch (error) {
        console.error('Failed to save note to localStorage', error);
      }
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      setWordCount(calculateWordCount(editorRef.current));
    }
  }, [content]);

  const handleFormat = (command: string, value?: string) => {
    if (selection) {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleContentChange();
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        {/* You can add a loading spinner here if you want */}
      </div>
    );
  }

  const isApplied = (command: string) => {
    if (!isMounted) return false;
    try {
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {hasSelection && selectionRect && (
        <div
          className="fixed z-10 bg-card border rounded-md shadow-lg"
          style={{
            left: selectionRect.left + selectionRect.width / 2,
            top: selectionRect.top - 10,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <Toolbar onFormat={handleFormat} isApplied={isApplied} />
        </div>
      )}

      <header className="flex justify-between items-center p-4 sm:p-6 md:p-8 flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold text-foreground/80 tracking-tight">
          TempNote
        </h1>
        <ThemeToggle />
      </header>

      <main className="flex-grow flex flex-col px-4 sm:px-6 md:px-8">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="w-full h-full flex-grow text-base md:text-lg bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed outline-none prose dark:prose-invert max-w-none"
          aria-label="Notepad"
          suppressContentEditableWarning
        />
      </main>

      <footer className="mt-4 p-4 sm:p-6 md:p-8 text-sm text-muted-foreground flex items-center gap-2 flex-shrink-0 h-6">
        <span>Word Count: {wordCount}</span>
      </footer>
    </div>
  );
}

const Toolbar = ({
  onFormat,
  isApplied,
}: {
  onFormat: (command: string, value?: string) => void;
  isApplied: (command: string) => boolean;
}) => {
  return (
    <ToggleGroup type="multiple" className="p-1">
      <ToggleGroupItem
        value="bold"
        aria-label="Toggle bold"
        onClick={() => onFormat('bold')}
        data-state={isApplied('bold') ? 'on' : 'off'}
      >
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="italic"
        aria-label="Toggle italic"
        onClick={() => onFormat('italic')}
        data-state={isApplied('italic') ? 'on' : 'off'}
      >
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="bulletList"
        aria-label="Toggle bullet list"
        onClick={() => onFormat('insertUnorderedList')}
        data-state={isApplied('insertUnorderedList') ? 'on' : 'off'}
      >
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <Separator orientation="vertical" className="h-auto mx-1" />
      <ToggleGroupItem
        value="h1"
        aria-label="Toggle H1"
        onClick={() => onFormat('formatBlock', '<h1>')}
        data-state={document.queryCommandValue('formatBlock') === 'h1' ? 'on' : 'off'}
      >
        <Heading1 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="h2"
        aria-label="Toggle H2"
        onClick={() => onFormat('formatBlock', '<h2>')}
        data-state={document.queryCommandValue('formatBlock') === 'h2' ? 'on' : 'off'}
      >
        <Heading2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="h3"
        aria-label="Toggle H3"
        onClick={() => onFormat('formatBlock', '<h3>')}
        data-state={document.queryCommandValue('formatBlock') === 'h3' ? 'on' : 'off'}
      >
        <Heading3 className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
