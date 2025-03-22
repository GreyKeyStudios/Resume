# ☁️ Cloud Resume Challenge

A cloud-based professional resume project built to demonstrate front-end skills, cloud development, DevOps, and CI/CD practices.

## 📄 Project Overview

Welcome to my take on the [Cloud Resume Challenge](https://cloudresumechallenge.dev/)! This project combines front-end design, Azure cloud services, and serverless functions to create a fully deployed, interactive web resume.

🔗 **Live Site**: [https://resume.greykeystudios.com](https://resume.greykeystudios.com)  
📄 **Download Resume (PDF)**: [MichaelWalton-TechResume-2025.pdf](./MichaelWalton-TechResume-2025.pdf)


This project is a response to the [Cloud Resume Challenge](https://cloudresumechallenge.dev/), designed to showcase proficiency in:

- **Cloud infrastructure** (Azure)
- **Static site hosting**
- **Serverless computing**
- **CI/CD pipelines**
- **Frontend and backend integration**
- **Version control and GitHub workflows**

## 🔧 Tech Stack

| Area                | Technology                        |
|---------------------|------------------------------------|
| Frontend            | HTML, CSS                         |
| Hosting             | Azure Blob Storage (Static Website) |
| Backend API         | Azure Functions (JavaScript)      |
| Database            | Azure Cosmos DB (or Table Storage)* |
| CI/CD               | GitHub + Azure Deployment         |
| CDN & Security      | Cloudflare                        |
| Version Control     | Git + GitHub                      |

> \* Your live visitor count logic can be wired to Cosmos DB or Table Storage depending on your implementation needs.

## 💼 Features

- 🌐 Static resume site hosted on Azure
- 📈 Live visitor count powered by serverless Azure Function
- 🔐 Secure HTTP headers and caching via Cloudflare
- 🚀 CI/CD pipeline via `Azure Functions Core Tools` and GitHub
- 📄 PDF version of the resume hosted privately

## 📁 Project Structure
CloudResume/
├── index.html                         # Main resume HTML
├── style.css                          # Stylesheet
├── MichaelWalton-TechResume-2025.pdf # PDF resume
├── .gitignore                         # Git ignore rules
├── resume-counter/                    # Azure Function app
│   ├── .funcignore
│   ├── host.json
│   ├── package.json
│   ├── package-lock.json
│   └── updateVisitorCount/
│       ├── index.js
│       ├── updateVisitorCount.js
│       └── function.json
└── .github/                           # (optional) CI/CD workflows

## 🔒 Security Features Implemented

- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: frame-ancestors 'none';`
- `Cache-Control: public, max-age=86400`
- Charset explicitly defined for all content-types

## 🔗 Live Demo

Visit the static site here:  
🔹 [https://resume.greykeystudios.com](https://resume.greykeystudios.com)

> 📌 Note: The PDF resume is available on the site 

## 🧠 Lessons Learned

- How to configure and deploy Azure Functions
- Use of Cloudflare for performance & security tuning
- Integrating Git version control and deployment pipelines
- Writing clean backend logic for counting visits
- Debugging deployment and header-related issues

## 📌 Future Improvements

- Add GitHub Actions for automatic deployment
- Convert visitor count from GET to POST
- Migrate backend to Python or C# for stronger typing

---

### ✅ Completed Cloud Resume Challenge Checklist

- [x] HTML resume
- [x] Styled with CSS
- [x] Hosted via Azure Blob Storage
- [x] HTTPS and CDN via Cloudflare
- [x] Azure Function for visit count
- [x] JSON-based API
- [x] JavaScript frontend fetch
- [x] Git source control
- [x] GitHub-hosted repo
- [x] CI/CD via CLI
- [x] Clean `.gitignore` and folder structure
- [x] Updated README

---

## 🙌 Author

**Michael Walton**  
🎧 [Grey Key Studios](https://greykeystudios.com)  
🌍 Based in Minneapolis  
🛠 Building with AI, music, and code  

