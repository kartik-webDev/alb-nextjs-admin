/*eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Color } from '@/assets/colors';

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
interface AnnouncementPageEditorProps {
  initialContent: string;
  createEndpoint: string;
  announcementId?: string;
  editMode?: boolean;
  loading?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface InputFieldError {
  description?: string;
}

interface ApiPayload {
  description: string;
  announcementId?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  announcement?: {
    _id: string;
    description: string;
    astrologerId: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

// ---------------------------------------------------------------------
// Icons (SVG Inline - Replace with your SVG components or icons)
// ---------------------------------------------------------------------
const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h14l-3 12H7z" />
  </svg>
);

const StrikethroughIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5" />
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const UnderlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const AlignLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h12M4 18h16" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
  </svg>
);

const AlignRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h12M4 18h16" />
  </svg>
);

const AlignJustifyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ListBulletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ListNumberIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0h.01M4 6h1v1h1v1h-1v1H4V8H3V7h1V6zm0 6h1v1h1v1h-1v1H4v-1H3v-1h1v-1zm0 6h1v1h1v1h-1v1H4v-1H3v-1h1v-1z" />
  </svg>
);

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h2l-1 6h2l-1-6h2m7 0h2l-1 6h2l-1-6h2" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.414-1.414m5.657-5.656l-1.414 1.414a4 4 0 105.656 5.656l4-4a4 4 0 00-5.656-5.656z" />
  </svg>
);

const UnlinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.414-1.414m5.657-5.656l-1.414 1.414a4 4 0 105.656 5.656l4-4a4 4 0 00-5.656-5.656z M3 3l18 18" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UndoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const RedoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6" />
  </svg>
);

// ---------------------------------------------------------------------
// Main Editor Component
// ---------------------------------------------------------------------
const AnnouncementPageEditor: React.FC<AnnouncementPageEditorProps> = ({
  initialContent,
  createEndpoint,
  announcementId,
  editMode = false,
  loading: externalLoading = false,
  onSuccess,
  onCancel,
}) => {
  const [description, setDescription] = useState<string>('');
  const [inputFieldError, setInputFieldError] = useState<InputFieldError>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentFormat, setCurrentFormat] = useState<string>('Normal');
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInputFieldError = (input: keyof InputFieldError, value: string | undefined) => {
    setInputFieldError((prev) => ({ ...prev, [input]: value }));
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
    });
  };

  const handleBold = () => executeCommand('bold');
  const handleItalic = () => executeCommand('italic');
  const handleUnderline = () => executeCommand('underline');
  const handleStrikethrough = () => executeCommand('strikethrough');
  const handleAlignLeft = () => executeCommand('justifyLeft');
  const handleAlignCenter = () => executeCommand('justifyCenter');
  const handleAlignRight = () => executeCommand('justifyRight');
  const handleAlignJustify = () => executeCommand('justifyFull');
  const handleBulletList = () => executeCommand('insertUnorderedList');
  const handleNumberList = () => executeCommand('insertOrderedList');

  const handleQuote = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    const blockquote = document.createElement('blockquote');
    blockquote.style.borderLeft = '4px solid #ccc';
    blockquote.style.marginLeft = '0';
    blockquote.style.paddingLeft = '16px';
    blockquote.style.color = '#666';
    blockquote.style.fontStyle = 'italic';
    blockquote.textContent = selectedText;

    range.deleteContents();
    range.insertNode(blockquote);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleCode = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    const codeBlock = document.createElement('pre');
    const code = document.createElement('code');
    codeBlock.style.backgroundColor = '#f5f5f5';
    codeBlock.style.padding = '12px';
    codeBlock.style.borderRadius = '4px';
    codeBlock.style.border = '1px solid #ddd';
    codeBlock.style.overflow = 'auto';
    codeBlock.style.fontFamily = 'monospace';
    code.textContent = selectedText;
    codeBlock.appendChild(code);

    range.deleteContents();
    range.insertNode(codeBlock);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleUndo = () => executeCommand('undo');
  const handleRedo = () => executeCommand('redo');
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) executeCommand('createLink', url);
  };
  const handleUnlink = () => executeCommand('unlink');
  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) executeCommand('insertImage', url);
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value;
    setCurrentFormat(format);
    const blockMap: { [key: string]: string } = {
      'Heading 1': 'h1',
      'Heading 2': 'h2',
      'Heading 3': 'h3',
      'Heading 4': 'h4',
      'Heading 5': 'h5',
      'Heading 6': 'h6',
      'Normal': 'p',
    };
    executeCommand('formatBlock', `<${blockMap[format] || 'p'}>`);
  };

  const handleValidation = (): boolean => {
    let isValid = true;
    const stripped = description.replace(/<[^>]*>/g, '').trim();
    if (!stripped || description === '<p><br></p>' || description === '') {
      handleInputFieldError('description', 'Please Enter Announcement Description');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!handleValidation()) return;

    try {
      setSubmitting(true);
      const payload: ApiPayload = { description };
      if (editMode && announcementId) payload.announcementId = announcementId;

      const response = await fetch(createEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save announcement');
      }

      const result: ApiResponse = await response.json();
      if (result.success) {
        onSuccess?.() || alert(result.message || (editMode ? 'Updated!' : 'Created!'));
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setDescription(content);
      if (inputFieldError.description) handleInputFieldError('description', undefined);
    }
  };

  useEffect(() => {
    if (initialContent && initialContent !== description) {
      setDescription(initialContent);
      if (editorRef.current) editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  useEffect(() => {
    const handleSelection = () => {
      if (editorRef.current?.contains(document.activeElement)) {
        updateActiveFormats();
      }
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const getButtonClass = (isActive: boolean = false) =>
    `p-1.5 min-w-9 h-9 border rounded-md flex items-center justify-center transition-colors ${
      isActive
        ? 'bg-gray-300 text-gray-900 border-gray-400'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
    }`;

  if (externalLoading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading announcement editor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-md">
        {/* Text Formatting */}
        <button onClick={handleBold} title="Bold" className={getButtonClass(activeFormats.bold)}>
          <BoldIcon />
        </button>
        <button onClick={handleItalic} title="Italic" className={getButtonClass(activeFormats.italic)}>
          <ItalicIcon />
        </button>
        <button onClick={handleStrikethrough} title="Strikethrough" className={getButtonClass(activeFormats.strikethrough)}>
          <StrikethroughIcon />
        </button>
        <button onClick={handleCode} title="Code Block" className={getButtonClass()}>
          <CodeIcon />
        </button>
        <button onClick={handleUnderline} title="Underline" className={getButtonClass(activeFormats.underline)}>
          <UnderlineIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <button onClick={handleAlignLeft} title="Align Left" className={getButtonClass()}>
          <AlignLeftIcon />
        </button>
        <button onClick={handleAlignCenter} title="Align Center" className={getButtonClass()}>
          <AlignCenterIcon />
        </button>
        <button onClick={handleAlignRight} title="Align Right" className={getButtonClass()}>
          <AlignRightIcon />
        </button>
        <button onClick={handleAlignJustify} title="Justify" className={getButtonClass()}>
          <AlignJustifyIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button onClick={handleBulletList} title="Bullet List" className={getButtonClass()}>
          <ListBulletIcon />
        </button>
        <button onClick={handleNumberList} title="Numbered List" className={getButtonClass()}>
          <ListNumberIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Quote */}
        <button onClick={handleQuote} title="Quote" className={getButtonClass()}>
          <QuoteIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <button onClick={handleLink} title="Insert Link" className={getButtonClass()}>
          <LinkIcon />
        </button>
        <button onClick={handleUnlink} title="Remove Link" className={getButtonClass()}>
          <UnlinkIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Image */}
        <button onClick={handleImage} title="Insert Image" className={getButtonClass()}>
          <ImageIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Format Dropdown */}
        <select
          value={currentFormat}
          onChange={handleFormatChange}
          className="min-w-[120px] h-9 px-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Normal">Normal</option>
          <option value="Heading 1">Heading 1</option>
          <option value="Heading 2">Heading 2</option>
          <option value="Heading 3">Heading 3</option>
          <option value="Heading 4">Heading 4</option>
          <option value="Heading 5">Heading 5</option>
          <option value="Heading 6">Heading 6</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button onClick={handleUndo} title="Undo" className={getButtonClass()}>
          <UndoIcon />
        </button>
        <button onClick={handleRedo} title="Redo" className={getButtonClass()}>
          <RedoIcon />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        onFocus={() => handleInputFieldError('description', undefined)}
        className={`
          min-h-[400px] p-4 border ${inputFieldError.description ? 'border-red-500' : 'border-gray-200'}
          rounded-b-md bg-white outline-none text-sm leading-relaxed font-sans
          ${!inputFieldError.description && 'border-t-0'}
        `}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {inputFieldError.description && (
        <p className="text-red-600 text-sm pl-3 pt-1">{inputFieldError.description}</p>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`
            px-5 py-2.5 text-sm font-medium text-white rounded-md transition-colors
            ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default AnnouncementPageEditor;