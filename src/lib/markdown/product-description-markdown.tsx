import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// Parity partner: sopet-storefront/src/components/molecules/ProductMarkdownContent/ProductMarkdownContent.tsx
const productDescriptionMarkdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="font-display text-lg font-medium text-ink mt-6 mb-3 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display text-base font-medium text-ink mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="text-sm text-ink mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc pl-4 list-outside text-sm text-ink mb-3 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 list-outside text-sm text-ink mb-3 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="mb-1">{children}</li>,
  strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} className="text-brand underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export function hasHtmlMarkup(source: string): boolean {
  return /<[^>]+>/.test(source);
}

export function getProductDescriptionRehypePlugins(description: string) {
  return hasHtmlMarkup(description) ? [rehypeRaw, rehypeSanitize] : [rehypeSanitize];
}

type ProductDescriptionMarkdownProps = {
  description: string;
  testId?: string;
  regionLabel?: string;
};

export function ProductDescriptionMarkdown({
  description,
  testId = 'product-description-preview-content',
  regionLabel = 'ตัวอย่างรายละเอียดสินค้า',
}: ProductDescriptionMarkdownProps) {
  return (
    <div
      data-testid={testId}
      role="region"
      aria-label={regionLabel}
      className="product-description-markdown"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={getProductDescriptionRehypePlugins(description)}
        components={productDescriptionMarkdownComponents}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
}
