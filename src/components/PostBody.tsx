'use client'

import { useMemo } from 'react'

function processYouTubeEmbeds(html: string): string {
  const ytRegex = /(?:<p>)?\s*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:[^\s<]*)?\s*(?:<\/p>)?/gi
  return ytRegex[Symbol.replace](html, (_match: string, videoId: string) => {
    return `<div class="video-container"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
  })
}

function addExternalLinkAttrs(html: string): string {
  return html.replace(/<a\s+href="(https?:\/\/(?!textshift\.blog)[^"]+)"/gi, '<a href="$1" target="_blank" rel="noopener noreferrer"')
}

export default function PostBody({ content }: { content: string }) {
  const processed = useMemo(() => {
    let html = content
    html = processYouTubeEmbeds(html)
    html = addExternalLinkAttrs(html)
    return html
  }, [content])

  return (
    <div
      className="prose prose-invert prose-lg max-w-none
        prose-headings:text-white prose-headings:font-bold
        prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl prose-h2:border-b prose-h2:border-brand-border prose-h2:pb-2
        prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-xl
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-ul:text-gray-300 prose-ol:text-gray-300
        prose-li:text-gray-300
        prose-blockquote:border-brand-green prose-blockquote:text-gray-400
        prose-code:text-brand-green prose-code:bg-brand-card prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-img:rounded-xl
        prose-figcaption:text-center prose-figcaption:text-brand-muted prose-figcaption:text-sm
        [&_details]:rounded-xl [&_details]:border [&_details]:border-brand-border [&_details]:bg-brand-card [&_details]:p-4 [&_details]:mb-8
        [&_summary]:cursor-pointer [&_summary]:text-white [&_summary]:font-semibold
        [&_.toc]:mt-3 [&_.toc_ul]:space-y-1 [&_.toc_a]:text-brand-green [&_.toc_a]:text-sm
        [&_.video-container]:relative [&_.video-container]:pb-[56.25%] [&_.video-container]:h-0 [&_.video-container]:overflow-hidden [&_.video-container]:rounded-xl [&_.video-container]:my-6
        [&_.video-container_iframe]:absolute [&_.video-container_iframe]:top-0 [&_.video-container_iframe]:left-0 [&_.video-container_iframe]:w-full [&_.video-container_iframe]:h-full
        [&_figure]:my-6
        [&_figure_img]:rounded-xl [&_figure_img]:mx-auto
        [&_figure_figcaption]:text-center [&_figure_figcaption]:text-brand-muted [&_figure_figcaption]:text-sm [&_figure_figcaption]:mt-2 [&_figure_figcaption]:italic
      "
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  )
}
