import { RichTextEditor } from '@/components/rich-text-editor';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <RichTextEditor />
      </div>
    </div>
  );
}
