import parse from 'html-react-parser';

export interface SectionContentItem {
  title: string;
  body: React.ReactNode;
}

const HEADING_TAGS = ['H1','H2','H3'];

export function parseHomeHtml(html: string): SectionContentItem[] {
  if (!html || typeof html !== 'string') {
    console.error('Invalid HTML input: HTML string is required');
    return [{
      title: 'Error',
      body: 'Unable to load content. Please try again later.'
    }];
  }

  try {
    const doc = new window.DOMParser().parseFromString(html, 'text/html');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('Failed to parse HTML: Invalid HTML structure');
      return [{
        title: 'Error',
        body: 'Unable to parse content. Please try again later.'
      }];
    }

    const children = Array.from(doc.body.children);
    if (!children.length) {
      return [{
        title: 'No Content',
        body: 'No content available at this time.'
      }];
    }

    const sections: SectionContentItem[] = [];
    let i = 0;
    
    while (i < children.length) {
      const node = children[i];
      if (!node || !(node instanceof Element)) {
        i++;
        continue;
      }

      if (HEADING_TAGS.includes(node.tagName)) {
        const title = node.textContent?.replace(/[::]+$/, '').trim() || 'Untitled Section';
        let contentNodes: Element[] = [];
        let j = i + 1;
        
        while (j < children.length) {
          const nextNode = children[j];
          if (!nextNode || !(nextNode instanceof Element)) {
            j++;
            continue;
          }
          
          if (HEADING_TAGS.includes(nextNode.tagName)) {
            break;
          }
          contentNodes.push(nextNode);
          j++;
        }

        const sectionHtml = contentNodes.map(el => el.outerHTML).join('');
        // Only add section if it has visible content (not just whitespace or empty tags)
        const hasVisibleContent = /<[^>]+>\s*[^<]+|<[^>]+>\s*<[^>]+>/.test(sectionHtml) || sectionHtml.replace(/<[^>]*>/g, '').trim().length > 0;
        if (contentNodes.length > 0 && sectionHtml.trim() && hasVisibleContent) {
          sections.push({
            title,
            body: parse(sectionHtml),
          });
        } else if (contentNodes.length === 0) {
          // If there are no content nodes under the heading, show a message
          sections.push({
            title,
            body: 'No content available at this time.'
          });
        }
        i = j;
      } else {
        i++;
      }
    }
    
    return sections.length > 0 ? sections : [{
      title: 'No Sections Found',
      body: 'No sections were found in the content.'
    }];
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [{
      title: 'Error',
      body: 'An error occurred while loading the content. Please try again later.'
    }];
  }
} 