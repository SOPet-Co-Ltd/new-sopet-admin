import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductDescriptionMarkdown } from '@/lib/markdown/product-description-markdown';

describe('ProductDescriptionMarkdown', () => {
  it('renders plain text as a markdown paragraph', () => {
    render(<ProductDescriptionMarkdown description="Durable rubber chew toy for medium dogs." />);

    expect(screen.getByTestId('product-description-preview-content')).toBeInTheDocument();
    expect(screen.getByText('Durable rubber chew toy for medium dogs.')).toBeInTheDocument();
  });

  it('renders markdown headings and lists', () => {
    render(
      <ProductDescriptionMarkdown description={'## Features\n\n- Durable\n- **Safe** for dogs'} />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Features' })).toBeInTheDocument();
    expect(screen.getByText('Durable')).toBeInTheDocument();
    expect(screen.getByText('Safe')).toBeInTheDocument();
  });

  it('renders sanitized HTML when markup is present', () => {
    render(
      <ProductDescriptionMarkdown description="<p>Safe for <strong>medium</strong> dogs</p>" />,
    );

    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.queryByText('<strong>')).not.toBeInTheDocument();
  });

  it('strips script tags from HTML markup', () => {
    render(<ProductDescriptionMarkdown description="<script>alert(1)</script><p>Safe</p>" />);

    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.queryByText('alert(1)')).not.toBeInTheDocument();
  });

  it('renders images, quotes, and dividers from markdown', () => {
    render(
      <ProductDescriptionMarkdown
        description={'> Soft chew\n\n---\n\n![Chew toy](https://cdn.example.com/products/toy.webp)'}
      />,
    );

    expect(screen.getByText('Soft chew')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Chew toy' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/products/toy.webp',
    );
  });
});
