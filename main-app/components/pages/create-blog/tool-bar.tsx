'use client'

import { Editor } from "@tiptap/react";
import { Heading02Icon, Heading03Icon, Heading04Icon, LeftToRightListNumberIcon, QuoteUpIcon, Redo02Icon, Undo02Icon, SourceCodeIcon, TextBoldIcon, TextItalicIcon, TextStrikethroughIcon, TextUnderlineIcon, TextWrapIcon, LeftToRightListBulletIcon  } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";



const ToolBar = ({editor}:{editor: Editor | null}) => {

  if (!editor) {
    return null;
  }

  const active = "bg-[#d4d4d4] dark:bg-[#424242] md:p-2 p-1.5 rounded-md";
  const inactive = "p-1.5 md:p-2 hover:bg-[#d4d4d4] hover:dark:bg-[#424242] rounded-md"

  return (
    <div className="p-2 md:px-4 md:py-3 flex rounded-tl-md rounded-tr-md items-center justify-around w-full flex-wrap border border-black/60 dark:border-white/60">
      <button onClick={
        (e) => {e.preventDefault(); editor.chain().focus().toggleBold().run();}} 
        className={editor.isActive('bold') ? active : inactive } title="Text Bold">
        <HugeiconsIcon icon={TextBoldIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run();}} 
        className={editor.isActive('italic') ? active : inactive } title="Text Italic">
        <HugeiconsIcon icon={TextItalicIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run();}} 
        className={editor.isActive('strike') ? active : inactive } title="Text Strikethrough">
        <HugeiconsIcon icon={TextStrikethroughIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run();}} 
        className={editor.isActive('underline') ? active : inactive } title="Text Underline">
        <HugeiconsIcon icon={TextUnderlineIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleHeading({level: 2}).run();}} 
        className={editor.isActive('heading', {level: 2}) ? active : inactive } title="Heading Level 2">
        <HugeiconsIcon icon={Heading02Icon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleHeading({level: 3}).run();}} 
        className={editor.isActive('heading', {level: 3}) ? active : inactive } title="Heading Level 3">
        <HugeiconsIcon icon={Heading03Icon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleHeading({level: 4}).run();}} 
        className={editor.isActive('heading', {level: 4}) ? active : inactive } title="Heading Level 4">
        <HugeiconsIcon icon={Heading04Icon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().setHardBreak().run()}} 
        className={editor.isActive('hardBreak') ? active : inactive } title="Text Wrap">
        <HugeiconsIcon icon={TextWrapIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run();}} 
        className={editor.isActive('bulletList') ? active : inactive } title="Unordered List">
        <HugeiconsIcon icon={LeftToRightListBulletIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run();}} 
        className={editor.isActive('orderedList') ? active : inactive } title="Ordered List">
        <HugeiconsIcon icon={LeftToRightListNumberIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run();}} 
        className={editor.isActive('blockquote') ? active : inactive } title="Quote">
        <HugeiconsIcon icon={QuoteUpIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().setCode().run();}} 
        className={editor.isActive('code') ? active : inactive } title="Code">
        <HugeiconsIcon icon={SourceCodeIcon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().undo().run();}} 
        className={editor.isActive('undo') ? active : inactive } title="Undo">
        <HugeiconsIcon icon={Undo02Icon} className='size-4 md:size-5 lg:size-6'/>
      </button>
      <button onClick={
        (e) => { e.preventDefault(); editor.chain().focus().redo().run();}} 
        className={editor.isActive('redo') ? active : inactive } title="Redo">
        <HugeiconsIcon icon={Redo02Icon} className='size-4 md:size-5 lg:size-6'/>
      </button>
    </div>
  )
};

export default ToolBar;