// Builds the ATS-friendly resume (DOCX) from data/profile.json. Single column, no tables, no header/footer.
// Usage: node tools/build_resume_docx.js   (requires: npm i docx)
const fs = require('fs'), path = require('path');
const { Document, Packer, Paragraph, TextRun, LevelFormat, AlignmentType, BorderStyle } = require('docx');
const root = path.join(__dirname, '..');
const rawTxt = fs.readFileSync(path.join(root, 'data', 'profile.json'), 'utf8');
const d = JSON.parse(rawTxt);
const p = d.personal;
const FONT = 'Arial', SZ = 20; // 10pt
const dash = s => s.replace(/ - /g, ' – ');
const run = (t, o = {}) => new TextRun({ text: t, font: FONT, size: SZ, ...o });
const para = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], spacing: { after: 40, line: 252 }, ...o });
const heading = t => new Paragraph({ spacing: { before: 170, after: 70 }, keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 2 } },
  children: [new TextRun({ text: t, font: FONT, size: 21, bold: true, color: '000000' })] });
const bullet = t => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 30, line: 252 }, children: [run(t)] });
const clean = u => u.replace('https://', '');

const kids = [];
kids.push(new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: p.name.toUpperCase(), font: FONT, size: 36, bold: true })] }));
kids.push(para(new TextRun({ text: p.tagline, font: FONT, size: SZ, bold: true, color: '000000' }), { spacing: { after: 30 } }));
kids.push(para(run(`Dhaka, Bangladesh | ${p.phone.replace('(+880) ', '+880 ')} | ${p.email}`, { color: '000000', size: 18 }), { spacing: { after: 0 } }));
kids.push(para(run(`${clean(p.social.linkedin)} | ${clean(p.social.github)} | ${clean(p.social.portfolio)}`, { color: '000000', size: 18 })));

kids.push(heading('PROFESSIONAL SUMMARY'));
kids.push(para(run(p.summary)));

kids.push(heading('SKILLS'));
const label = { 'Testing & Quality': 'Testing & QA', 'Automation': 'UI Automation', 'Data & Backend': 'Database & Data', 'Languages & Tools': 'Tools & Languages' };
d.skills.groups.forEach(g => {
  const items = g.items.filter(i => i.tier !== 'Learning').map(i => i.name);
  if (items.length) kids.push(para([run((label[g.name] || g.name) + ': ', { bold: true }), run(items.join(', '))]));
});
kids.push(para([run('Currently learning: ', { bold: true }), run(d.currentlyUpskilling.map(u => u.name).join(', '))]));

kids.push(heading('PROFESSIONAL EXPERIENCE'));
d.experience.forEach(e => {
  kids.push(para(run(`${e.position} | ${e.company}`, { bold: true }), { keepNext: true, spacing: { before: 40, after: 10 } }));
  kids.push(para(run(`${dash(e.period)} | ${e.location}`, { color: '000000' }), { keepNext: true }));
  (e.assignments || []).forEach(a => {
    kids.push(para(run(`${a.title} (${dash(a.period)})`, { bold: true }), { keepNext: true, spacing: { before: 70, after: 10 } }));
    kids.push(para(run(a.org, { italics: true, color: '000000', size: 18 }), { keepNext: true }));
    a.bullets.forEach(b => kids.push(bullet(b)));
  });
  kids.push(para(run('Other QA work at RK Software', { bold: true }), { keepNext: true, spacing: { before: 70, after: 10 } }));
  e.achievements.forEach(b => kids.push(bullet(b)));
});

kids.push(heading('PROJECTS'));
d.projects.filter(x => x.resume).forEach(x => {
  const [title, tech, text] = x.resume;
  kids.push(para([run(title, { bold: true }), run(` | ${tech}`, { color: '000000' })], { keepNext: true, spacing: { before: 40, after: 10 } }));
  kids.push(para(run(text), { keepLines: true }));
});

kids.push(heading('EDUCATION'));
d.education.forEach(e => {
  kids.push(para(run(`${e.degree} | ${e.institution}, ${e.location}`, { bold: true })));
  kids.push(para(run(dash(e.period), { color: '000000' })));
});

kids.push(heading('CERTIFICATIONS'));
d.certifications.forEach(c => kids.push(bullet(`${c.name} (${c.issuer})`)));

const doc = new Document({
  creator: p.name, title: `${p.name} - SQA Engineer Resume`, description: 'ATS-friendly resume',
  styles: { default: { document: { run: { font: FONT, size: SZ } } } },
  numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 850, left: 1000, right: 1000 } } }, children: kids }]
});
Packer.toBuffer(doc).then(b => { const out = path.join(root, 'assets', 'Rizbi_Islam_Resume.docx'); fs.writeFileSync(out, b); console.log('wrote', out); });
