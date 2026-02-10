import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from docx import Document

journals = []
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
    journals.append({'id': i, 'paragraphs': paragraphs})

# Output as JSON
print(json.dumps(journals, ensure_ascii=False, indent=2))
