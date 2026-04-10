import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useTheme } from '@/hooks/useTheme';

/**
 * Dynamically import ReactQuill to avoid SSR issues
 * Using react-quill-new which supports React 18/19 (avoids findDOMNode error)
 */
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

/**
 * Rich Text Editor Component
 * Wraps react-quill-new with custom styling and validation support
 */
interface RichTextEditorProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  fullWidth?: boolean;
  editorHeightClass?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  error,
  value,
  onChange,
  placeholder,
  id: propId,
  fullWidth = false,
  editorHeightClass = 'h-52 md:h-56',
}) => {
  const { theme } = useTheme();
  const [clientId, setClientId] = useState(propId);

  useEffect(() => {
    if (!propId) {
      setClientId(`rte-${Math.floor(Math.random() * 1000000)}`);
    }
  }, [propId]);

  const rteId = propId || clientId || 'rte-fallback';
  const fillHeight = editorHeightClass.split(/\s+/).includes('h-full');

  const modules = React.useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = React.useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
  ], []);

  // Custom styles for dark mode support
  const darkThemeStyles = theme === 'dark' ? `
    .ql-toolbar.ql-snow {
      border-color: #374151;
      background-color: #1f2937;
      color: #e5e7eb;
    }
    .ql-toolbar.ql-snow .ql-stroke {
      stroke: #e5e7eb;
    }
    .ql-toolbar.ql-snow .ql-fill {
      fill: #e5e7eb;
    }
    .ql-toolbar.ql-snow .ql-picker {
      color: #e5e7eb;
    }
    .ql-container.ql-snow {
      border-color: #374151;
      background-color: #111827;
      color: #e5e7eb;
    }
    .ql-editor.ql-blank::before {
      color: #9ca3af;
    }
  ` : '';
  const editorLayoutStyles = `
    #${rteId} {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 120px;
      max-height: 100%;
      overflow: hidden;
    }
    #${rteId} .ql-container {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
    }
    #${rteId} .ql-editor {
      flex: 1 1 auto;
      min-height: 0;
      height: 100%;
      max-height: 100%;
      overflow-y: scroll;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: #4b5563 #111827;
      padding-bottom: 16px;
    }
    #${rteId} .ql-editor::-webkit-scrollbar {
      width: 8px;
    }
    #${rteId} .ql-editor::-webkit-scrollbar-track {
      background: #111827;
    }
    #${rteId} .ql-editor::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 9999px;
    }
  `;

  return (
    <div id="rte-container" className={`${fullWidth ? 'w-full' : ''} ${fillHeight ? 'h-full flex flex-col min-h-0' : ''}`}>
      <style>{`${darkThemeStyles}\n${editorLayoutStyles}`}</style>
      {label && (
        <label
          htmlFor={rteId}
          className="block text-sm font-medium mb-1 text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className={`rich-text-editor-wrapper ${error ? 'border border-red-500 rounded-md' : ''} flex-1 flex flex-col min-h-0 overflow-hidden`}>
        <ReactQuill
          id={rteId}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          className={`bg-white text-gray-900 rounded-md mb-0 ${fillHeight ? 'min-h-0' : ''} ${editorHeightClass}`}
        />
      </div>
      {error && (
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} id={`${rteId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default RichTextEditor;
