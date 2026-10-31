# Rizbi Islam portfolio

Run locally: open a terminal in this folder, run `python -m http.server 8000`, open http://localhost:8000

## Host free (pick one)
GitHub Pages (recommended; keeps rizbi-islam.github.io/profile and your Google verification):
  put these files in the repo, Settings > Pages > Deploy from branch > main / root.
Vercel (free Hobby plan, personal use, as far as I know):
  import the repo, framework preset "Other", no build command, output folder = root.
  Then run `sh tools/set_base_url.sh https://your-name.vercel.app/` so canonical, share card and sitemap use the new address.
  The Google verification file only matches the GitHub address.

## Edit and rebuild
All content is in data/profile.json. After editing, run `sh tools/rebuild_resume.sh`
(needs Node with `npm i docx`, and LibreOffice). The resume is black text only.

## Before you publish (facts only you can confirm)
1. DNCC work: the site and resume say it was delivered through RK Software for the Bangladesh Army IT Directorate (March 2025 - September 2026). Check this against your appointment letters.
2. Naming the Army IT Directorate and "RK Courier System" publicly: confirm your contract or RK Software allows it.
3. Open https://rizbi-islam.github.io/profile/ after deploying, then click every link once.
4. Keep ONE resume. Delete older variants from LinkedIn, job portals and your drive.
