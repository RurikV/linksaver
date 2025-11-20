const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Default route
app.get('/view', async (req, res) => {
    res.redirect('/view/home');
});

// Main viewer route
app.get('/view/:slug', async (req, res) => {
    const slug = req.params.slug;
    const userId = req.query.user || 'demo_user';
    const lang = req.query.lang || 'en';

    try {
        // Get page from composer
        const composerResponse = await fetch(`http://localhost:7781/v1/pages/${slug}`, {
            headers: {
                'X-User-ID': userId,
                'Accept-Language': lang
            }
        });

        if (!composerResponse.ok) {
            throw new Error(`Page not found: ${slug}`);
        }

        const pageData = await composerResponse.json();

        // Render page
        const renderResponse = await fetch('http://localhost:7782/v1/render', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/html'
            },
            body: JSON.stringify({ page: pageData })
        });

        const htmlContent = await renderResponse.text();

        // Create a full HTML page
        const fullHtml = `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pageData.meta.title} - CMS Viewer</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .controls { background: #e9ecef; padding: 15px; border-radius: 4px; margin-bottom: 10px; }
                .controls a { margin-right: 15px; color: #007bff; text-decoration: none; }
                .controls a:hover { text-decoration: underline; }
                .debug { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CMS Page Viewer</h1>
                <div class="controls">
                    <strong>Quick Links:</strong>
                    <a href="/view/home">Home</a>
                    <a href="/view/home?lang=es">Home (Spanish)</a>
                    <a href="/view/home?user=vip123">Home (VIP User)</a>
                    <a href="/debug/${slug}">Debug JSON</a>
                </div>
                <div class="debug">
                    <strong>Context:</strong> User: ${userId} | Language: ${lang} | A/B Test: ${pageData.meta.ab || 'N/A'}
                </div>
            </div>

            <div class="content">
                ${htmlContent}
            </div>
        </body>
        </html>`;

        res.send(fullHtml);

    } catch (error) {
        res.status(404).send(`
            <h1>Page Not Found</h1>
            <p>Could not load page "${slug}": ${error.message}</p>
            <p><a href="/view/home">Try the home page</a></p>
        `);
    }
});

// Debug route to see raw JSON
app.get('/debug/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
        const response = await fetch(`http://localhost:7781/v1/pages/${slug}`, {
            headers: {
                'X-User-ID': req.query.user || 'debug_user',
                'Accept-Language': req.query.lang || 'en'
            }
        });

        const data = await response.json();

        res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Debug - ${slug}</title></head>
        <body>
            <h1>Debug Info for Page: ${slug}</h1>
            <pre>${JSON.stringify(data, null, 2)}</pre>
            <p><a href="/view/${slug}">View rendered page</a></p>
        </body>
        </html>
        `);
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><pre>${error.message}</pre>`);
    }
});

// Home page with instructions
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>CMS Viewer</title></head>
    <body>
        <h1>CMS Page Viewer</h1>
        <p>View your CMS pages in the browser:</p>
        <ul>
            <li><a href="/view/home">Home Page</a></li>
            <li><a href="/view/home?lang=es">Home Page (Spanish)</a></li>
            <li><a href="/view/home?user=vip123&lang=es">Home Page (VIP, Spanish)</a></li>
            <li><a href="/debug/home">Debug JSON</a></li>
        </ul>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 CMS Viewer running at http://localhost:${PORT}`);
    console.log(`📖 Main viewer: http://localhost:${PORT}/view/home`);
    console.log(`🔍 Debug mode: http://localhost:${PORT}/debug/home`);
});