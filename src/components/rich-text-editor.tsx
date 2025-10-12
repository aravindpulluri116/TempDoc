"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const LOCAL_STORAGE_KEY = 'tempnote-content-v2';

export function RichTextEditor() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

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
      const textContent = editorRef.current.innerText || '';
      setContent(newContent);
      setWordCount(textContent.trim().split(/\s+/).filter(Boolean).length);
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
      } catch (error) {
        console.error('Failed to save note to localStorage', error);
      }
    }
  }, []);

  const updateActiveFormats = useCallback(() => {
    const formats: string[] = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('strikeThrough')) formats.push('strikethrough');
    if (document.queryCommandState('insertUnorderedList')) formats.push('insertUnorderedList');
    if (document.queryCommandState('insertOrderedList')) formats.push('insertOrderedList');
    
    if(document.queryCommandValue('justify') === 'left') formats.push('justifyLeft');
    if(document.queryCommandValue('justify') === 'center') formats.push('justifyCenter');
    if(document.queryCommandValue('justify') === 'right') formats.push('justifyRight');

    setActiveFormats(formats);
  }, []);


  useEffect(() => {
    if (isMounted && editorRef.current) {
       const textContent = editorRef.current.innerText || '';
       setWordCount(textContent.trim().split(/\s+/).filter(Boolean).length);
    }
    const editor = editorRef.current;
    if (editor) {
      document.addEventListener('selectionchange', updateActiveFormats);
      editor.addEventListener('keyup', updateActiveFormats);
      editor.addEventListener('click', updateActiveFormats);
      return () => {
        document.removeEventListener('selectionchange', updateActiveFormats);
        editor.removeEventListener('keyup', updateActiveFormats);
        editor.removeEventListener('click', updateActiveFormats);
      }
    }
  }, [isMounted, updateActiveFormats]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
    updateActiveFormats();
  };
  
  const clearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('justifyLeft', false);
    handleContentChange();
    updateActiveFormats();
  };

  if (!isMounted) {
    return (
      <Card className="shadow-2xl border-border/50">
        <div className="h-96" />
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-border/50 w-full">
        <div className="p-2 border-b border-border/50 sticky top-16 bg-card/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-1 flex-wrap">
                <ToggleGroup type="multiple">
                    <Button variant="ghost" size="icon" onClick={() => handleFormat('undo')} aria-label="Undo" className="h-8 w-8">
                    <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleFormat('redo')} aria-label="Redo" className="h-8 w-8">
                    <Redo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={clearFormatting} aria-label="Clear formatting" className="h-8 w-8">
                    <Eraser className="h-4 w-4" />
                    </Button>
                </ToggleGroup>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <ToggleGroup type="multiple" value={activeFormats}>
                    <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => handleFormat('bold')} className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => handleFormat('italic')} className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => handleFormat('underline')} className="h-8 w-8">
                    <Underline className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough" onClick={() => handleFormat('strikeThrough')} className="h-8 w-8">
                    <Strikethrough className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <ToggleGroup type="multiple" value={activeFormats}>
                    <ToggleGroupItem value="insertUnorderedList" aria-label="Toggle bullet list" onClick={() => handleFormat('insertUnorderedList')} className="h-8 w-8">
                    <List className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="insertOrderedList" aria-label="Toggle ordered list" onClick={() => handleFormat('insertOrderedList')} className="h-8 w-8">
                    <ListOrdered className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <ToggleGroup type="single" value={activeFormats.find(f => f.startsWith('justify')) || 'justifyLeft'}>
                    <ToggleGroupItem value="justifyLeft" aria-label="Align left" onClick={() => handleFormat('justifyLeft')} className="h-8 w-8">
                    <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="justifyCenter" aria-label="Align center" onClick={() => handleFormat('justifyCenter')} className="h-8 w-8">
                    <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="justifyRight" aria-label="Align right" onClick={() => handleFormat('justifyRight')} className="h-8 w-8">
                    <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>
      <CardContent className="p-0">
        <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="w-full min-h-[calc(100vh-20rem)] p-4 sm:p-6 md:p-8 text-lg bg-transparent focus:outline-none leading-relaxed prose dark:prose-invert max-w-none"
            aria-label="Notepad"
            suppressContentEditableWarning
        />
      </CardContent>
      <div className="p-2 border-t border-border/50 text-sm text-muted-foreground">
        {wordCount} Words
      </div>
    </Card>
  );
}
