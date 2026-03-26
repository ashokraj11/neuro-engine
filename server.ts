import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config for server-side use
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // SEO: robots.txt
  app.get("/robots.txt", async (req, res) => {
    try {
      const seoDoc = await getDoc(doc(db, "seo_config", "global"));
      if (seoDoc.exists() && seoDoc.data().robotsTxt) {
        res.type("text/plain").send(seoDoc.data().robotsTxt);
      } else {
        res.type("text/plain").send("User-agent: *\nAllow: /");
      }
    } catch (error) {
      res.type("text/plain").send("User-agent: *\nAllow: /");
    }
  });

  // SEO: sitemap.xml
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const seoDoc = await getDoc(doc(db, "seo_config", "global"));
      if (seoDoc.exists() && seoDoc.data().sitemapUrl) {
        // If sitemapUrl is provided, redirect to it or fetch it
        // For simplicity, we'll redirect if it's a full URL
        if (seoDoc.data().sitemapUrl.startsWith("http")) {
          res.redirect(seoDoc.data().sitemapUrl);
        } else {
          res.status(404).send("Sitemap not found");
        }
      } else {
        res.status(404).send("Sitemap not configured");
      }
    } catch (error) {
      res.status(500).send("Error fetching sitemap");
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    
    // In dev, we still want to inject the meta tag if possible
    // But Vite handles the index.html serving. 
    // We can use a custom middleware to transform the HTML if needed.
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', async (req, res) => {
      try {
        let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
        
        // Inject SEO config into HTML
        const seoDoc = await getDoc(doc(db, "seo_config", "global"));
        if (seoDoc.exists()) {
          const data = seoDoc.data();
          if (data.googleVerification) {
            let verificationCode = data.googleVerification;
            // Extract content if it's a full tag
            if (verificationCode.includes('<meta') && verificationCode.includes('content=')) {
              const match = verificationCode.match(/content=["']([^"']+)["']/);
              if (match && match[1]) {
                verificationCode = match[1];
              }
            }
            html = html.replace(
              '<meta name="google-site-verification" content="" />',
              `<meta name="google-site-verification" content="${verificationCode}" />`
            );
          }
        }
        
        res.send(html);
      } catch (error) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
