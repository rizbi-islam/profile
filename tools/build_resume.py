"""Builds assets/resume.pdf from data/profile.json so site and resume never drift apart.
Usage: pip install reportlab && python tools/build_resume.py"""
import json, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem, KeepTogether

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(root, 'data', 'profile.json'), encoding='utf8'))
p = d['personal']
INK, MUTED, ACC = colors.HexColor('#111827'), colors.HexColor('#4b5563'), colors.HexColor('#047857')
def S(n, f='Helvetica', **k): return ParagraphStyle(n, fontName=f, **k)
name = S('n', 'Helvetica-Bold', fontSize=21, leading=24, textColor=INK)
sub = S('s', 'Helvetica-Bold', fontSize=10, leading=13, textColor=ACC)
con = S('c', fontSize=8.6, leading=12, textColor=MUTED)
h = S('h', 'Helvetica-Bold', fontSize=10, leading=13, textColor=ACC, spaceBefore=9, spaceAfter=2)
body = S('b', fontSize=9.2, leading=12.6, textColor=INK)
bul = S('bl', fontSize=9.1, leading=12.2, textColor=INK)
role = S('r', 'Helvetica-Bold', fontSize=9.8, leading=12.5, textColor=INK, spaceBefore=4)
meta = S('m', fontSize=8.6, leading=11.5, textColor=MUTED)
esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;')
def bullets(items):
    return ListFlowable([ListItem(Paragraph(esc(i), bul), leftIndent=11) for i in items], bulletType='bullet', start='•', leftIndent=11, bulletFontSize=8)
def section(t): return [Paragraph(t.upper(), h), HRFlowable(width='100%', thickness=.5, color=colors.HexColor('#d1d5db'), spaceAfter=3)]
strip = lambda u: u.replace('https://', '')

st = [Paragraph(p['name'].upper(), name), Paragraph(esc(p['tagline']), sub),
      Paragraph(f"{p['location']} | {p['email']} | {p['phone']}<br/>{strip(p['social']['portfolio'])} | {strip(p['social']['linkedin'])} | {strip(p['social']['github'])}", con)]
st += section('Summary') + [Paragraph(esc(p['summary']), body)]

st += section('Core skills')
for g in d['skills']['groups']:
    items = [i['name'] for i in g['items'] if i['tier'] != 'Learning']
    if items: st.append(Paragraph(f"<b>{esc(g['name'])}:</b> {esc(', '.join(items))}", body))
st.append(Paragraph('<b>Currently learning:</b> ' + esc(', '.join(u['name'] for u in d['currentlyUpskilling'])), body))

st += section('Experience')
for e in d['experience']:
    st += [Paragraph(f"{esc(e['position'])} | {esc(e['company'])}", role), Paragraph(f"{e['period']} | {esc(e['location'])}", meta), bullets(e['achievements'])]

st += section('Selected projects')
for pr in d['projects']:
    if not pr.get('featured'): continue
    st.append(KeepTogether([Paragraph(f"<b>{esc(pr['title'])}</b> ({esc(', '.join(pr['technologies']))})", bul),
                            Paragraph(esc(pr['solution']), bul), Spacer(1, 3)]))
st += section('Education')
for e in d['education']:
    st.append(Paragraph(f"<b>{esc(e['degree'])}</b>, {esc(e['institution'])}, {esc(e['location'])} ({e['period']})", body))
st += section('Certifications')
st.append(bullets([f"{c['name']} ({c['issuer']})" for c in d['certifications']]))

out = os.path.join(root, 'assets', 'resume.pdf')
SimpleDocTemplate(out, pagesize=A4, leftMargin=17*mm, rightMargin=17*mm, topMargin=14*mm, bottomMargin=14*mm,
                  title='Rizbi Islam - SQA Engineer Resume', author='Rizbi Islam').build(st)
print('wrote', out)
