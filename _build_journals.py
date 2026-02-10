"""Build journals.json from docx files and Excel metadata."""
import sys, io, json, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from docx import Document

# Excel metadata mapped by matching docx title to Excel title
# Excel order: Row2=Journal1, Row3=Journal2(Bach Hue), Row4=Journal3(Masks), Row5=Journal4(Origins)
# Docx order: 1=Hoi An, 2=Masks, 3=Origins, 4=Bach Hue
# We'll use docx number as journal ID and match Excel metadata by title

journals_meta = {
    1: {
        'title': 'HOI AN BAI CHOI: A CULTURAL SOUL IN THE HEART OF THE ANCIENT TOWN',
        'tags': ['Bài chòi', 'Cultural feature'],
        'date': '21.12.26',
        'author': 'Tường Vy',
        'cover': 'Journal1_Cover.png',
    },
    2: {
        'title': 'MASKS BEHIND THE FAN: SATIRE AND MORALITY IN THE \u201CV\u1EA0N\u201D CARDS OF BAI CHOI',
        'tags': ['Bài chòi', 'Feature Article'],
        'date': '21.12.27',
        'author': 'Tường Vy',
        'cover': 'Journal2_Cover.png',
    },
    3: {
        'title': 'A BRIEF LOOK INTO THE ORIGINS OF THE ART OF BAI CHOI',
        'tags': ['Bài chòi', 'Feature Article'],
        'date': '21.12.27',
        'author': 'B\u00e1o B\u00ecnh \u0110\u1ecbnh',
        'cover': 'Journal3_Cover.png',
    },
    4: {
        'title': 'B\u1ea0CH HU\u00ca AND N\u1eccC \u0110\u01af\u1edcNG: THE SACRED HARMONY OF YIN AND YANG IN BAI CHOI CULTURE',
        'tags': ['Bài chòi', 'Feature Article'],
        'date': '21.12.26',
        'author': 'Tường Vy',
        'cover': 'Journal4_Cover.png',
    },
}

def is_subheading(text):
    """Detect subheadings: short lines without ending period, not starting with quote."""
    text = text.strip()
    if len(text) > 120:
        return False
    if text.endswith('.') or text.endswith('"') or text.endswith('\u201D'):
        return False
    if text.startswith('"') or text.startswith('\u201C'):
        return False
    # Must have at least 2 words
    if len(text.split()) < 2:
        return False
    return True

def process_content(paragraphs):
    """Convert docx paragraphs to HTML content string."""
    html_parts = []

    for i, para in enumerate(paragraphs):
        text = para['text']
        is_first = (i == 0)

        # Skip the title (first bold paragraph)
        if is_first and para['bold']:
            continue

        # Check if this paragraph contains \n\n (multi-section block)
        if '\n\n' in text:
            sections = text.split('\n\n')
            for section in sections:
                section = section.strip()
                if not section:
                    continue
                if is_subheading(section):
                    html_parts.append(f'<h3>{section}</h3>')
                else:
                    html_parts.append(f'<p>{section}</p>')
        else:
            html_parts.append(f'<p>{text}</p>')

    return '\n'.join(html_parts)

# Process each journal
result = []
for i in range(1, 5):
    path = rf'D:\porfolio_django\pfl_app\static\tao_souvenir\assets\journals\Journal {i}.docx'
    doc = Document(path)
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        is_bold = any(run.bold for run in para.runs if run.text.strip())
        paragraphs.append({'text': text, 'bold': is_bold})

    meta = journals_meta[i]
    content_html = process_content(paragraphs)
    # Extract first non-title paragraph as summary
    summary = ''
    for para in paragraphs:
        if not (para['bold'] and paragraphs.index(para) == 0):
            summary = para['text'][:200] + '...'
            break

    result.append({
        'id': i,
        'title': meta['title'],
        'tags': meta['tags'],
        'date': meta['date'],
        'author': meta['author'],
        'cover': meta['cover'],
        'summary': summary,
        'content_html': content_html,
    })

output_path = r'D:\porfolio_django\pfl_app\static\tao_souvenir\assets\journals\journals.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f'Generated {len(result)} journals to {output_path}')
for j in result:
    print(f"  Journal {j['id']}: {j['title'][:60]}... ({len(j['content_html'])} chars)")
