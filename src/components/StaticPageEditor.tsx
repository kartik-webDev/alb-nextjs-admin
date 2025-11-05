'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Color } from '@/assets/colors';
import Swal from 'sweetalert2';

// Types
interface StaticPageEditorProps {
  title: string;
  initialContent: string;
  createEndpoint: string;
  hasTypeSelector?: boolean;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  loading?: boolean;
}

interface InputFieldError {
  type?: string;
  description?: string;
}

interface ApiPayload {
  type?: string;
  description: string;
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

const StaticPageEditor: React.FC<StaticPageEditorProps> = ({
  title,
  initialContent,
  createEndpoint,
  hasTypeSelector = false,
  selectedType = 'Astrologer',
  onTypeChange,
  loading: externalLoading = false,
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

  // Handle Input Field Error
  const handleInputFieldError = (input: keyof InputFieldError, value: string | null) => {
    setInputFieldError((prev) => ({ ...prev, [input]: value }));
  };

  // Execute command
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  // Update active formats based on cursor position
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
    });
  };

  // Handle toolbar actions
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
    executeCommand('formatBlock', 'blockquote');
    handleContentChange();
  };
  
  const handleCode = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      const codeHTML = `<pre class="code-block"><code>${selectedText}</code></pre><p><br></p>`;
      document.execCommand('insertHTML', false, codeHTML);
      editorRef.current?.focus();
      handleContentChange();
    }
  };
  
  const handleUndo = () => executeCommand('undo');
  const handleRedo = () => executeCommand('redo');
  
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      let formattedUrl = url.trim();
      if (!formattedUrl.match(/^https?:\/\//i)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      executeCommand('createLink', formattedUrl);
      handleContentChange();
    }
  };

  const handleUnlink = () => executeCommand('unlink');

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) executeCommand('insertImage', url);
  };

  // Handle format dropdown change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value;
    setCurrentFormat(format);
    
    const formatMap: { [key: string]: string } = {
      'Heading 1': 'h1',
      'Heading 2': 'h2',
      'Heading 3': 'h3',
      'Heading 4': 'h4',
      'Heading 5': 'h5',
      'Heading 6': 'h6',
      'Normal': 'p',
    };
    
    const tagName = formatMap[format] || 'p';
    executeCommand('formatBlock', tagName);
    handleContentChange();
  };

  // Handle Validation
  const handleValidation = (): boolean => {
    let isValid = true;

    if (hasTypeSelector && !selectedType) {
      handleInputFieldError('type', 'Please Select type');
      isValid = false;
    }

    const strippedDescription = description.replace(/<[^>]*>/g, '').trim();
    if (!strippedDescription || description === '<p><br></p>' || description === '') {
      handleInputFieldError('description', 'Please Enter Description');
      isValid = false;
    }

    return isValid;
  };

  // Handle Submit
  const handleSubmit = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!handleValidation()) return;

    try {
      setSubmitting(true);
      const payload: ApiPayload = { description };

      if (hasTypeSelector && selectedType) {
        payload.type = selectedType;
      }

      const response = await fetch(createEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update data');

      const result = await response.json();
      console.log('Success:', result);
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Updated successfully!',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      console.error('Error updating data:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Type Change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onTypeChange) {
      onTypeChange(e.target.value);
    }
  };

  // Handle content change
  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setDescription(content);
      if (inputFieldError.description) {
        handleInputFieldError('description', null);
      }
    }
  };

  // Update editor when initialContent changes
  useEffect(() => {
    if (initialContent !== description) {
      setDescription(initialContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
      }
    }
  }, [initialContent]);

  // Track selection changes to update active formats
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current?.contains(document.activeElement)) {
        updateActiveFormats();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <div className="p-5 bg-white mb-5 shadow-sm rounded-xl">
      <div className="pb-7 text-2xl font-medium text-black">
        {title}
      </div>

      {externalLoading ? (
        <div className="py-10 text-center text-gray-500">
          Loading content...
        </div>
      ) : (
        <div className="space-y-6">
          {hasTypeSelector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Type <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                onFocus={() => handleInputFieldError('type', null)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  inputFieldError.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option disabled>---Select Type---</option>
                <option value="Customer">Customer</option>
                <option value="Astrologer">Astrologer</option>
              </select>
              {inputFieldError.type && (
                <p className="mt-1 text-xs text-red-600 font-medium pl-3">
                  {inputFieldError.type}
                </p>
              )}
            </div>
          )}

          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
              {/* Text Formatting */}
              <button
                onClick={handleBold}
                title="Bold"
                className={`p-1.5 min-w-9 h-9 border rounded text-gray-600 hover:bg-gray-200 transition-colors ${
                  activeFormats.bold ? 'bg-gray-300 text-gray-900' : 'bg-white'
                }`}
              >
                <BoldIcon />
              </button>
              <button
                onClick={handleItalic}
                title="Italic"
                className={`p-1.5 min-w-9 h-9 border rounded text-gray-600 hover:bg-gray-200 transition-colors ${
                  activeFormats.italic ? 'bg-gray-300 text-gray-900' : 'bg-white'
                }`}
              >
                <ItalicIcon />
              </button>
              <button
                onClick={handleStrikethrough}
                title="Strikethrough"
                className={`p-1.5 min-w-9 h-9 border rounded text-gray-600 hover:bg-gray-200 transition-colors ${
                  activeFormats.strikethrough ? 'bg-gray-300 text-gray-900' : 'bg-white'
                }`}
              >
                <StrikethroughIcon />
              </button>
              <button
                onClick={handleCode}
                title="Code Block"
                className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <CodeIcon />
              </button>
              <button
                onClick={handleUnderline}
                title="Underline"
                className={`p-1.5 min-w-9 h-9 border rounded text-gray-600 hover:bg-gray-200 transition-colors ${
                  activeFormats.underline ? 'bg-gray-300 text-gray-900' : 'bg-white'
                }`}
              >
                <UnderlineIcon />
              </button>

              <div className="w-px h-8 bg-gray-400 mx-1" />

              {/* Alignment */}
              <button onClick={handleAlignLeft} title="Align Left" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <AlignLeftIcon />
              </button>
              <button onClick={handleAlignCenter} title="Align Center" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <AlignCenterIcon />
              </button>
              <button onClick={handleAlignRight} title="Align Right" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <AlignRightIcon />
              </button>
              <button onClick={handleAlignJustify} title="Justify" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <AlignJustifyIcon />
              </button>

              <div className="w-px h-8 bg-gray-400 mx-1" />

              {/* Lists */}
              <button onClick={handleBulletList} title="Bullet List" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <BulletListIcon />
              </button>
              <button onClick={handleNumberList} title="Numbered List" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <NumberListIcon />
              </button>

              <div className="w-px h-8 bg-gray-400 mx-1" />

              {/* Quote */}
              <button onClick={handleQuote} title="Quote" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <QuoteIcon />
              </button>

              <div className="w-px h-8 bg-gray-400 mx-1" />

              {/* Link */}
              <button onClick={handleLink} title="Insert Link" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <LinkIcon />
              </button>
              <button onClick={handleUnlink} title="Remove Link" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <UnlinkIcon />
              </button>

              <div className="w-px h-8 bg-gray-400 mx-1" />

              {/* Image */}
              <button onClick={handleImage} title="Insert Image" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <ImageIcon />
              </button>

              <div className="w-px h-8 bg-gray-400 mx-1" />

              {/* Format Dropdown */}
              <select
                value={currentFormat}
                onChange={handleFormatChange}
                className="h-9 px-3 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Normal">Normal</option>
                <option value="Heading 1" className="text-3xl font-bold">Heading 1</option>
                <option value="Heading 2" className="text-2xl font-bold">Heading 2</option>
                <option value="Heading 3" className="text-xl font-bold">Heading 3</option>
                <option value="Heading 4" className="text-lg font-bold">Heading 4</option>
                <option value="Heading 5" className="text-base font-bold">Heading 5</option>
                <option value="Heading 6" className="text-sm font-bold">Heading 6</option>
              </select>

              <div className="w-px h-8 bg-gray-400 mx-1" />

              {/* Undo/Redo */}
              <button onClick={handleUndo} title="Undo" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
                <UndoIcon />
              </button>
              <button onClick={handleRedo} title="Redo" className="p-1.5 min-w-9 h-9 border rounded bg-white text-gray-600 hover:bg-gray-200 transition-colors">
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
              onClick={(e) => {
                const target = e.target as HTMLElement;
                
                if (target.closest('pre.code-block')) {
                  e.preventDefault();
                  const pre = target.closest('pre.code-block') as HTMLElement;
                  const selection = window.getSelection();
                  const range = document.createRange();
                  range.selectNode(pre);
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                  return;
                }
                
                if (target.tagName === 'A' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  window.open((target as HTMLAnchorElement).href, '_blank');
                }
              }}
              onFocus={() => handleInputFieldError('description', null)}
              className={`min-h-96 p-4 border-t-0 rounded-b-lg bg-white outline-none text-sm leading-relaxed font-sans ${
                inputFieldError.description ? 'border-red-500' : 'border-gray-300'
              } border rich-text-editor`}
              dangerouslySetInnerHTML={{ __html: description }}
            />
            
            {inputFieldError.description && (
              <p className="mt-1 text-xs text-red-600 pl-3">
                {inputFieldError.description}
              </p>
            )}
            
            <p className="mt-1 text-xs text-gray-500 italic pl-3">
              Tip: Hold Ctrl (or Cmd on Mac) and click on links to open them. Click on code blocks to select and delete them.
            </p>
          </div>

          <div className="flex justify-end">
            <div
              onClick={handleSubmit}
              className={`px-5 py-2.5 rounded text-white font-medium text-sm cursor-pointer transition-colors ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              style={{ pointerEvents: submitting ? 'none' : 'auto' }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .rich-text-editor ul {
          list-style-type: disc;
          padding-left: 40px;
          margin: 1em 0;
        }
        .rich-text-editor ol {
          list-style-type: decimal;
          padding-left: 40px;
          margin: 1em 0;
        }
        .rich-text-editor li {
          margin: 0.5em 0;
        }
        .rich-text-editor a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        .rich-text-editor a:hover {
          color: #1d4ed8;
        }
        .rich-text-editor blockquote {
          border-left: 4px solid #ccc;
          margin-left: 0;
          padding-left: 16px;
          color: #666;
          font-style: italic;
          margin: 1em 0;
        }
        .rich-text-editor pre {
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          overflow: auto;
          font-family: monospace;
          margin: 1em 0;
          cursor: default;
        }
        .rich-text-editor pre.code-block {
          user-select: all;
        }
        .rich-text-editor code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }
        .rich-text-editor h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        .rich-text-editor h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        .rich-text-editor h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        .rich-text-editor h4 { font-size: 1em; font-weight: bold; margin: 1em 0; }
        .rich-text-editor h5 { font-size: 0.83em; font-weight: bold; margin: 1.5em 0; }
        .rich-text-editor h6 { font-size: 0.67em; font-weight: bold; margin: 2em 0; }
      `}</style>
    </div>
  );
};

// SVG Icons (Replace with your actual SVG components or use Heroicons)
const BoldIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M15.5 9A5.5 5.5 0 1010 3.5v13a5.5 5.5 0 005.5-5.5z"/></svg>
);
const ItalicIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M15.5 4h-5l-2 12h5l2-12z"/></svg>
);
const StrikethroughIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5v3h3v2H7V8h3V5zM7 12h6v2H7z"/></svg>
);
const CodeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 8l-3 3 3 3M13 8l3 3-3 3M3 10h14"/></svg>
);
const UnderlineIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4v6a4 4 0 008 0V4M4 16h12"/></svg>
);
const AlignLeftIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14M3 8h10M3 12h14M3 16h10"/></svg>
);
const AlignCenterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14M5 8h10M3 12h14M5 16h10"/></svg>
);
const AlignRightIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14M7 8h10M3 12h14M7 16h10"/></svg>
);
const AlignJustifyIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14M3 8h14M3 12h14M3 16h14"/></svg>
);
const BulletListIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h12M5 10h12M5 16h12M2 4h1M2 10h1M2 16h1"/></svg>
);
const NumberListIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h12M3 10h12M3 16h12M1 4h1v1H1V4zM1 9h1v2H1V9zM1 15h1v1H1v-1z"/></svg>
);
const QuoteIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4h6l-2 8H7l2-8zM5 4h6l-2 8H3l2-8z"/></svg>
);
const LinkIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a4 4 0 00-4 4v1H5a4 4 0 00-4 4v1a4 4 0 004 4h1a4 4 0 004-4v-1h2a4 4 0 004-4v-1a4 4 0 00-4-4h-1z"/></svg>
);
const UnlinkIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 7h2a4 4 0 014 4v1a4 4 0 01-4 4h-2M7 13H5a4 4 0 01-4-4v-1a4 4 0 014-4h2M7 7l6 6"/></svg>
);
const ImageIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm12 2H5v8l3-3 2 2 4-4v-3z"/></svg>
);
const UndoIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 7H5v2l-3-3 3-3v2h4a4 4 0 014 4v6h-2V8a2 2 0 00-2-2H8z"/></svg>
);
const RedoIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12 7h3v2l3-3-3-3v2h-4a4 4 0 00-4 4v6h2V8a2 2 0 012-2h2z"/></svg>
);

export default StaticPageEditor;