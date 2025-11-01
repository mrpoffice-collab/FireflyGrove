/**
 * MemoryText Component
 * Renders memory text with basic markdown support for bold text
 * Handles the spark prompt formatting (centered, bold, with colon)
 */

interface MemoryTextProps {
  text: string
  className?: string
}

export default function MemoryText({ text, className = '' }: MemoryTextProps) {
  // Parse the text and convert **bold** markdown to actual bold elements
  const renderText = (content: string) => {
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0

    // Regular expression to match **bold text**
    const boldRegex = /\*\*(.*?)\*\*/g
    let match

    while ((match = boldRegex.exec(content)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      // Check if this looks like a spark prompt (ends with colon and is at start of line)
      const beforeMatch = content.substring(0, match.index).trim()
      const isSparkPrompt = match[1].endsWith(':') && (beforeMatch === '' || beforeMatch.endsWith('\n'))

      // Add the bold part with appropriate styling
      if (isSparkPrompt) {
        // This is a spark prompt - make it centered and bold
        parts.push(
          <span key={match.index} className="block text-center font-bold text-firefly-glow my-2">
            {match[1]}
          </span>
        )
      } else {
        // Regular bold text
        parts.push(
          <strong key={match.index} className="font-bold">
            {match[1]}
          </strong>
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text after the last match
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.length > 0 ? parts : content
  }

  return (
    <p className={`text-text-soft leading-relaxed whitespace-pre-wrap ${className}`}>
      {renderText(text)}
    </p>
  )
}
