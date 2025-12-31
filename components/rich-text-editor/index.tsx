import { useEffect } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

import { EditorLink } from './editor-link';
import { EditorSelect } from './editor-select';
import { EditorActionButton } from './editor-action-button';

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  StrikethroughIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
} from 'lucide-react';

const TEXT_ALIGN = ['center', 'left', 'right', 'justify'] as const;

type RichTextEditorProps = {
  initialValue: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
};

export function RichTextEditor({ onChange, initialValue, readOnly }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    immediatelyRender: false,
    content: initialValue,
    editable: !readOnly,
    editorProps: {
      attributes: {
        dir: 'rtl',
        class: 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      const textAlign =
        TEXT_ALIGN.find(align => ctx.editor?.isActive({ textAlign: align })) ?? 'right';

      return {
        isBold: ctx.editor?.isActive('bold') ?? false,
        canBold: ctx.editor?.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor?.isActive('italic') ?? false,
        canItalic: ctx.editor?.can().chain().toggleItalic().run() ?? false,
        isUnderline: ctx.editor?.isActive('underline') ?? false,
        canUnderline: ctx.editor?.can().chain().toggleUnderline().run() ?? false,
        isStrike: ctx.editor?.isActive('strike') ?? false,
        canStrike: ctx.editor?.can().chain().toggleStrike().run() ?? false,
        canClearMarks: ctx.editor?.can().chain().unsetAllMarks().run() ?? false,
        heading: ctx.editor?.getAttributes('heading').level, // * heading level
        isBulletList: ctx.editor?.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor?.isActive('orderedList') ?? false,
        canUndo: ctx.editor?.can().chain().undo().run() ?? false,
        canRedo: ctx.editor?.can().chain().redo().run() ?? false,

        textAlign,
        canAlign: ctx.editor
          ?.can()
          .chain()
          .setTextAlign(textAlign ?? '')
          .run(),
      };
    },
  });

  useEffect(() => {
    if (editor && initialValue) {
      editor.commands.setContent(initialValue);
    }
  }, [editor, initialValue]);

  if (!editor) return null;

  return (
    <div className='border rounded-md'>
      {!readOnly && (
        <div className='editor-toolbar flex flex-wrap border-b'>
          <EditorActionButton
            action='bold'
            isActive={editorState?.isBold}
            disabled={!editorState?.canBold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon />
          </EditorActionButton>

          <EditorActionButton
            action='italic'
            isActive={editorState?.isItalic}
            disabled={!editorState?.canItalic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon />
          </EditorActionButton>

          <EditorActionButton
            action='underline'
            isActive={editorState?.isUnderline}
            disabled={!editorState?.canUnderline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon />
          </EditorActionButton>

          <EditorActionButton
            action='srike through'
            isActive={editorState?.isStrike}
            disabled={!editorState?.canStrike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughIcon />
          </EditorActionButton>

          <EditorLink editor={editor} />

          <EditorActionButton
            action='bullet list'
            isActive={editorState?.isBulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListIcon />
          </EditorActionButton>

          <EditorActionButton
            action='ordered list'
            isActive={editorState?.isOrderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon />
          </EditorActionButton>

          <EditorSelect
            value={(editorState?.heading ?? -1).toString()}
            onValueChange={value => {
              const level = Number(value);
              const currentLevel: number = editorState?.heading;

              if (level === -1) {
                if (level === currentLevel) return;
                // @ts-expect-error `currentLevel` is guaranteed to be a valid level
                editor?.chain().focus().toggleHeading({ level: currentLevel }).run();
                return;
              }

              // @ts-expect-error `level` is guaranteed to be a valid level
              editor?.chain().focus().toggleHeading({ level }).run();
            }}
            options={[
              {
                label: 'normal',
                value: '-1',
                icon: <p className='font-normal text-muted-foreground text-xs mt-1'>T</p>,
              },
              { label: 'h1', value: '1', icon: <Heading1Icon /> },
              { label: 'h2', value: '2', icon: <Heading2Icon /> },
              { label: 'h3', value: '3', icon: <Heading3Icon /> },
              { label: 'h4', value: '4', icon: <Heading4Icon /> },
            ]}
          />

          <EditorSelect
            value={editorState?.textAlign}
            disabled={!editorState?.canAlign}
            onValueChange={value => {
              editor?.chain().focus().setTextAlign(value).run();
            }}
            options={[
              { label: 'center', value: 'center', icon: <AlignCenterIcon /> },
              { label: 'right', value: 'right', icon: <AlignRightIcon /> },
              { label: 'left', value: 'left', icon: <AlignLeftIcon /> },
              { label: 'justify', value: 'justify', icon: <AlignJustifyIcon /> },
            ]}
          />
        </div>
      )}

      <EditorContent dir='rtl' editor={editor} className='editor-content' />
    </div>
  );
}
