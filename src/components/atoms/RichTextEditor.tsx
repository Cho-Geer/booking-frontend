import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useUI } from '../../contexts/UIContext';

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
  editorHeightClass = 'h-40 md:h-44',
}) => {
  const { uiState } = useUI();
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
  const darkThemeStyles = uiState.theme === 'dark' ? `
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
    }
    #${rteId} .ql-container {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
    }
    #${rteId} .ql-editor {
      height: 100%;
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
      <div className={`rich-text-editor-wrapper ${error ? 'border border-red-500 rounded-md' : ''} ${fillHeight ? 'h-full flex flex-col min-h-0' : ''}`}>
        <ReactQuill
          id={rteId}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          className={`bg-white text-gray-900 rounded-md mb-0 ${fillHeight ? 'min-h-0 h-full' : ''} ${editorHeightClass}`}
        />
      </div>
      {error && (
        <p className={`mt-1 text-sm ${uiState.theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} id={`${rteId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default RichTextEditor;
