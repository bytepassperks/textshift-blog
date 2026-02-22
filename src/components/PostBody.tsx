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
      className="post-body max-w-none"
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  )
}
