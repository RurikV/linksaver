#!/usr/bin/env node

// Demo script to show the complete integration
const axios = require('axios');
const { MongoClient } = require('mongodb');

const API_BASE = 'http://localhost:7777';
const MONGO_URI = 'mongodb://root:pass@localhost:27017/linksaver?authSource=admin';

async function runDemo() {
  console.log('🚀 LinkSaver + CMS Integration Demo');
  console.log('=====================================\n');

  try {
    // Step 1: Show current user stats
    console.log('📊 Current User Statistics:');
    const statsResponse = await axios.get(`${API_BASE}/cms-stats/user-stats`, {
      headers: { 'X-Link-Saver': '1' }
    });
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('\n');

    // Step 2: Show CMS content available
    console.log('📝 Available CMS Content:');
    const cmsPages = ['featured-links', 'user-stories', 'getting-started'];

    for (const pageSlug of cmsPages) {
      try {
        const pageResponse = await axios.get(`http://localhost:7781/v1/pages/${pageSlug}`, {
          headers: { 'X-Link-Saver': '1' }
        });

        console.log(`✅ ${pageSlug}: ${pageResponse.data.meta?.title || pageSlug}`);
        console.log(`   Description: ${pageResponse.data.meta?.description || 'No description'}`);
        console.log(`   Components: ${countComponents(pageResponse.data.root)}`);
        console.log('');
      } catch (error) {
        console.log(`❌ ${pageSlug}: Failed to load`);
      }
    }

    // Step 3: Show collection API endpoints
    console.log('📚 Collection API Endpoints:');
    console.log('GET  /collections                    - Get user collections');
    console.log('POST /collections                    - Create new collection');
    console.log('GET  /collections/:id                - Get collection details');
    console.log('PUT  /collections/:id                - Update collection');
    console.log('DELETE /collections/:id              - Delete collection');
    console.log('POST /collections/:id/like           - Like collection');
    console.log('GET  /collections/public/discover    - Discover public collections');
    console.log('GET  /collections/suggestions/generate - Get smart suggestions');
    console.log('');

    // Step 4: Test trending content
    console.log('🔥 Trending Content Test:');
    try {
      const trendingResponse = await axios.get(`${API_BASE}/cms-stats/popular-links?limit=5`, {
        headers: { 'X-Link-Saver': '1' }
      });
      console.log(`Found ${trendingResponse.data.links?.length || 0} trending links`);
    } catch (error) {
      console.log('No trending links yet (save some links first!)');
    }
    console.log('');

    // Step 5: Show Content Hub URL
    console.log('🌐 Access Your Content Hub:');
    console.log('http://localhost:5173/content-hub');
    console.log('');
    console.log('Features available:');
    console.log('• 📁 My Links - Personal bookmark management');
    console.log('• 🔍 Discover - Browse CMS content');
    console.log('• 📚 Collections - Create curated collections');
    console.log('• 🎨 Remix - Mix personal + public content');
    console.log('• 📈 Trending - See what\'s popular');
    console.log('');

    // Step 6: Instructions for testing
    console.log('🎯 How to Test the Full Integration:');
    console.log('');
    console.log('1. 📱 Save some links using the LinkSaver extension');
    console.log('2. 🌐 Open: http://localhost:5173/content-hub');
    console.log('3. 📁 Go to "My Links" tab');
    console.log('4. ➕ Click "+ Add to Remix" on some links');
    console.log('5. 🔍 Go to "Discover" tab to see CMS content');
    console.log('6. 🎨 Go to "Remix" tab to create collections');
    console.log('7. 💾 Click "Create Collection" to save your remix');
    console.log('8. 📚 Go to "Collections" tab to see your saved collections');
    console.log('');

  } catch (error) {
    console.error('❌ Demo Error:', error.message);
  }
}

function countComponents(node) {
  if (!node) return 0;
  let count = 1; // Count current node

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countComponents(child);
    }
  }

  return count;
}

// Run the demo
runDemo();