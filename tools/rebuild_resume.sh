#!/bin/sh
# Edit data/profile.json, then run this from the project folder.
# Needs Node (npm i docx) and LibreOffice for the PDF.
node tools/build_resume_docx.js && (cd assets && soffice --headless --convert-to pdf Rizbi_Islam_Resume.docx && cp Rizbi_Islam_Resume.pdf resume.pdf)
