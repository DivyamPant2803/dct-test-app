import parse from 'html-react-parser';

export interface SectionContentItem {
  title: string;
  body: React.ReactNode;
}

export function parseHomeHtml(html: string): SectionContentItem[] {
  const doc = new window.DOMParser().parseFromString(html, 'text/html');
  const children = Array.from(doc.body.children);

  const sections: SectionContentItem[] = [];
  let i = 0;
  while (i < children.length) {
    const node = children[i];
    if (node.tagName === 'H3') {
      const title = node.textContent?.replace(/[::]+$/, '').trim() || '';
      let contentNodes: Element[] = [];
      let j = i + 1;
      while (j < children.length && children[j].tagName !== 'H3') {
        contentNodes.push(children[j]);
        j++;
      }
      const sectionHtml = contentNodes.map(el => el.outerHTML).join('');
      sections.push({
        title,
        body: parse(sectionHtml),
      });
      i = j;
    } else {
      i++;
    }
  }
  return sections;
} 