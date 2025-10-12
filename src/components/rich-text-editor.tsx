"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { useSelection } from '@/hooks/use-selection';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const LOCAL_STORAGE_KEY = 'tempnote-content-v2';

export function RichTextEditor() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

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
        const initialContent = '<p>Write Your Post</p>';
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
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
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
      if (command.startsWith('justify')) {
        return document.queryCommandValue('justify') === command.substring('justify'.length).toLowerCase();
      }
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };
  
  const clearFormatting = () => {
    document.execCommand('removeFormat', false);
    handleContentChange();
  };

  return (
    <div className="flex flex-col min-h-[500px] bg-card text-card-foreground transition-colors duration-300 rounded-lg border shadow-sm">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-lg font-semibold text-foreground/80 tracking-tight">
          FREE LINKEDIN TEXT POST FORMAT EDITOR
        </h1>
        <ThemeToggle />
      </header>
      
      <div className="p-4">
        <Toolbar onFormat={handleFormat} isApplied={isApplied} onClearFormat={clearFormatting} />
      </div>

      <main className="flex-grow flex flex-col px-4 pb-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="w-full h-full flex-grow text-base md:text-lg bg-background border rounded-md p-4 resize-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 leading-relaxed outline-none prose dark:prose-invert max-w-none"
          aria-label="Notepad"
          suppressContentEditableWarning
          style={{minHeight: '250px'}}
        />
      </main>
    </div>
  );
}

const Toolbar = ({
  onFormat,
  isApplied,
  onClearFormat,
}: {
  onFormat: (command: string, value?: string) => void;
  isApplied: (command: string) => boolean;
  onClearFormat: () => void;
}) => {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
      <ToggleGroup type="multiple">
        <Button variant="ghost" size="icon" onClick={() => onFormat('undo')}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onFormat('redo')}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClearFormat}>
          <Eraser className="h-4 w-4" />
        </Button>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="multiple">
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
          value="underline"
          aria-label="Toggle underline"
          onClick={() => onFormat('underline')}
          data-state={isApplied('underline') ? 'on' : 'off'}
        >
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem
          value="strikethrough"
          aria-label="Toggle strikethrough"
          onClick={() => onFormat('strikeThrough')}
          data-state={isApplied('strikeThrough') ? 'on' : 'off'}
        >
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="multiple">
        <ToggleGroupItem
          value="bulletList"
          aria-label="Toggle bullet list"
          onClick={() => onFormat('insertUnorderedList')}
          data-state={isApplied('insertUnorderedList') ? 'on' : 'off'}
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="orderedList"
          aria-label="Toggle ordered list"
          onClick={() => onFormat('insertOrderedList')}
          data-state={isApplied('insertOrderedList') ? 'on' : 'off'}
        >
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
       <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem
          value="left"
          aria-label="Align left"
          onClick={() => onFormat('justifyLeft')}
          data-state={isApplied('justifyLeft') ? 'on' : 'off'}
        >
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="center"
          aria-label="Align center"
          onClick={() => onFormat('justifyCenter')}
           data-state={isApplied('justifyCenter') ? 'on' : 'off'}
        >
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="right"
          aria-label="Align right"
          onClick={() => onFormat('justifyRight')}
           data-state={isApplied('justifyRight') ? 'on' : 'off'}
        >
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
