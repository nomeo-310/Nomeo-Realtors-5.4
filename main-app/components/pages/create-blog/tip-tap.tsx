'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align'
import ToolBar from './tool-bar';


type tiptapProps = {
  onChange: (content: string) => void;
  clearContent?: boolean
  edit?:boolean
  content?:string
}

const TipTap = ({onChange, clearContent, edit, content}:tiptapProps) => {

  const handleChange = (content:string) => {
    onChange(content);
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline, TextAlign],
    editorProps: {
      attributes: {
        class: 'flex flex-col px-4 py-3 min-h-56 lg:min-h-60 xl:min-h-72 justify-start border-b border-r border-l border-black/60 dark:border-white/60 items-start w-full gap-3 font-medium text-base pt-4 rounded-bl-md rounded-br-md outline-none'
      },
    },
    onUpdate : ({editor}) => {
      handleChange(editor.getHTML());
    },

  });

 //enable the update of tip with previous document
  React.useEffect(() => {
    if (editor && edit) {
      editor.commands.setContent(content ? content : '');
    }
  }, [editor, edit]);

  //clear content when the document is successfully submitted
  React.useEffect(() => {
    if (editor && clearContent) {
      editor.commands.clearContent(true)
    }
  }, [editor, clearContent]);

  return (
    <div className="w-full">
      <ToolBar editor={editor} />
      <EditorContent editor={editor} style={{whiteSpace: 'pre-line', wordWrap: 'break-word'}} />
    </div>
  )
};

export default TipTap