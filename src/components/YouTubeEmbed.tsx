'use client'

export default function YouTubeEmbed({ videoId, title, caption }: { videoId: string; title: string; caption?: string }) {
  return (
    <div className="my-8">
      <div className="video-container">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {caption && <p className="video-caption">{caption}</p>}
    </div>
  )
}
