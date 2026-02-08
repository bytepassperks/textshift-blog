'use client'

import { useMemo, useEffect, useRef } from 'react'

function addExternalLinkAttrs(html: string): string {
  return html.replace(/<a\s+href="(https?:\/\/(?!textshift\.blog)[^"]+)"(?![^>]*target=)/gi, '<a href="$1" target="_blank" rel="noopener noreferrer"')
}

export default function PostBody({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const processed = useMemo(() => {
    let html = content
    html = addExternalLinkAttrs(html)
    return html
  }, [content])

  useEffect(() => {
    if (!ref.current) return
    const ytPlaceholders = ref.current.querySelectorAll('p.yt-video[id^="yt-"]')
    ytPlaceholders.forEach((el) => {
      const id = el.getAttribute('id')
      if (!id) return
      const videoId = id.replace('yt-', '')
      const wrapper = document.createElement('div')
      wrapper.className = 'video-container'
      const iframe = document.createElement('iframe')
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`
      iframe.title = el.textContent || 'Video'
      iframe.setAttribute('frameborder', '0')
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
      iframe.setAttribute('allowfullscreen', '')
      iframe.setAttribute('loading', 'lazy')
      wrapper.appendChild(iframe)
      el.replaceWith(wrapper)
    })
  }, [processed])

  return (
    <div
      ref={ref}
      className="post-body prose prose-invert prose-lg max-w-none
        prose-headings:text-white prose-headings:font-bold
        prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-2xl
        prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-5
        prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-ul:text-gray-300 prose-ol:text-gray-300
        prose-li:text-gray-300
        prose-blockquote:border-brand-green prose-blockquote:text-gray-400
        prose-code:text-brand-green prose-code:bg-brand-card prose-code:px-1 prose-code:py-0.5 prose-code:rounded
      "
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  )
}
