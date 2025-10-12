"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Button } from './ui/button';

const LOCAL_STORAGE_KEY = 'tempnote-content-v2';

export function RichTextEditor() {
  const [content, setContent] = useState('');
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
        const initialContent = '<p>Start writing...</p>';
        setContent(initialContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = initialContent;
        }
      }
    } catch (error) {
      console.error('Failed to load note from localStorage', error);
    }
  }, []);
  
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
      } catch (error) {
        console.error('Failed to save note to localStorage', error);
      }
    }
  }, []);

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
    // Also remove alignment by setting it to left
    document.execCommand('justifyLeft', false);
    handleContentChange();
  };

  return (
    <div className="flex flex-col min-h-[500px] bg-card text-card-foreground transition-colors duration-300 rounded-lg border shadow-xl">
      <header className="flex justify-between items-center p-2 border-b">
        <Toolbar onFormat={handleFormat} isApplied={isApplied} onClearFormat={clearFormatting} />
        <ThemeToggle />
      </header>
      
      <main className="flex-grow flex flex-col p-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="w-full h-full flex-grow text-base md:text-lg bg-transparent focus:outline-none leading-relaxed prose dark:prose-invert max-w-none"
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
    <div className="flex items-center gap-1 flex-wrap">
      <ToggleGroup type="multiple">
        <Button variant="ghost" size="icon" onClick={() => onFormat('undo')} aria-label="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onFormat('redo')} aria-label="Redo">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClearFormat} aria-label="Clear formatting">
          <Eraser className="h-4 w-4" />
        </Button>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="multiple" value={['bold', 'italic', 'underline', 'strikethrough'].filter(cmd => isApplied(cmd === 'strikethrough' ? 'strikeThrough' : cmd))}>
        <ToggleGroupItem
          value="bold"
          aria-label="Toggle bold"
          onClick={() => onFormat('bold')}
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Toggle italic"
          onClick={() => onFormat('italic')}
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          aria-label="Toggle underline"
          onClick={() => onFormat('underline')}
        >
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem
          value="strikethrough"
          aria-label="Toggle strikethrough"
          onClick={() => onFormat('strikeThrough')}
        >
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="multiple" value={['insertUnorderedList', 'insertOrderedList'].filter(cmd => isApplied(cmd))}>
        <ToggleGroupItem
          value="bulletList"
          aria-label="Toggle bullet list"
          onClick={() => onFormat('insertUnorderedList')}
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="orderedList"
          aria-label="Toggle ordered list"
          onClick={() => onFormat('insertOrderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
       <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="single" defaultValue="left" value={['justifyLeft', 'justifyCenter', 'justifyRight'].find(cmd => isApplied(cmd))?.replace('justify', '').toLowerCase() || 'left'}>
        <ToggleGroupItem
          value="left"
          aria-label="Align left"
          onClick={() => onFormat('justifyLeft')}
        >
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="center"
          aria-label="Align center"
          onClick={() => onFormat('justifyCenter')}
        >
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="right"
          aria-label="Align right"
          onClick={() => onFormat('justifyRight')}
        >
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
