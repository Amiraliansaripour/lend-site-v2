import { useEditorState, type Editor } from '@tiptap/react';

import * as z from 'zod';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { EditorActionButton } from './editor-action-button';
import { CheckIcon, Link2Icon, Link2OffIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useAppForm } from '../form';
import { useState } from 'react';

const LinkSchema = z.object({
  url: z.url('لینک نامعتبر'),
  blank: z.boolean().default(true),
});

type EditorLinkProps = { editor: Editor };

export function EditorLink({ editor }: EditorLinkProps) {
  const [open, setOpen] = useState<boolean>(false);

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isLink: ctx.editor?.isActive('link') ?? false,
      canLink: ctx.editor?.can().chain().toggleLink().run() ?? false,
    }),
  });

  const form = useAppForm<z.infer<typeof LinkSchema>>({
    defaultValues: { url: '', blank: true },
    validators: { onSubmit: LinkSchema },

    onSubmit: ({ value }) => {
      const { url: href, blank } = value;
      const ok = editor
        ?.chain()
        .focus()
        .setLink({ href, target: blank ? '_blank' : null })
        .run();

      setOpen(!ok);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset();
    setOpen(open);
  };

  return editorState.isLink ? (
    <EditorActionButton action='unlink' onClick={() => editor.chain().focus().unsetLink().run()}>
      <Link2OffIcon />
    </EditorActionButton>
  ) : (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <EditorActionButton
          action='link'
          isActive={editorState?.isLink}
          disabled={!editorState?.canLink}
        >
          <Link2Icon />
        </EditorActionButton>
      </PopoverTrigger>
      <PopoverContent className='w-fit'>
        <form
          dir='ltr'
          noValidate
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className='flex items-start gap-x-2 w-fit'>
            <form.AppField
              name='url'
              children={field => (
                <field.TextField
                  type='url'
                  dir='ltr'
                  placeholder='https://'
                  wrapperClassName='*:first:hidden *:last:[&_p]:text-right'
                />
              )}
            />

            <Button type='submit' size='icon'>
              <CheckIcon />
            </Button>
          </div>

          <form.AppField
            name='blank'
            children={field => (
              <field.CheckboxField label='New page' wrapperClassName='mt-3 [&_label]:-mb-1' />
            )}
          />
        </form>
      </PopoverContent>
    </Popover>
  );
}
