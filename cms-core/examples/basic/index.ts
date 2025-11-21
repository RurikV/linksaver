/**
 * Basic CMS Usage Example
 * Demonstrates fundamental CMS functionality
 */

import {
  IoCContainer,
  ServiceLifetime,
  BaseComponent,
  ComponentMetadata,
  RenderContext,
  RenderResult,
  PageBuilder
} from '../../src';

// Example Service
class ConfigService {
  private config: Record<string, any> = {
    siteName: 'My CMS Site',
    theme: 'modern',
    author: 'CMS Team'
  };

  get(key: string): any {
    return this.config[key];
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }
}

// Example Component
class HeaderComponent extends BaseComponent {
  async render(context: RenderContext): Promise<RenderResult> {
    const siteName = context.services.getConfig('siteName', 'Default Site');

    return {
      html: `
        <header class="site-header">
          <h1>${siteName}</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
        </header>
      `,
      css: `
        .site-header {
          background: #2c3e50;
          color: white;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .site-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .site-header nav a {
          color: white;
          text-decoration: none;
          margin-left: 1rem;
        }
        .site-header nav a:hover {
          text-decoration: underline;
        }
      `
    };
  }
}

// Content Component
class ContentComponent extends BaseComponent {
  async render(context: RenderContext): Promise<RenderResult> {
    const content = this.getConfig('content', 'Default content goes here...');

    return {
      html: `
        <main class="site-content">
          <div class="content-wrapper">
            ${content}
          </div>
        </main>
      `,
      css: `
        .site-content {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        .content-wrapper {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `
    };
  }
}

// Footer Component
class FooterComponent extends BaseComponent {
  async render(context: RenderContext): Promise<RenderResult> {
    const author = context.services.getConfig('author', 'CMS Author');

    return {
      html: `
        <footer class="site-footer">
          <p>&copy; 2024 ${author}. All rights reserved.</p>
          <div class="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </footer>
      `,
      css: `
        .site-footer {
          background: #34495e;
          color: white;
          text-align: center;
          padding: 2rem 1rem;
          margin-top: 2rem;
        }
        .footer-links {
          margin-top: 1rem;
        }
        .footer-links a {
          color: white;
          text-decoration: none;
          margin: 0 1rem;
        }
        .footer-links a:hover {
          text-decoration: underline;
        }
      `
    };
  }
}

// Main function to demonstrate CMS usage
async function runCMSExample(): Promise<void> {
  console.log('🚀 Starting CMS Example...\n');

  // 1. Initialize IoC Container
  const container = new IoCContainer();
  console.log('✅ IoC Container initialized');

  // 2. Register services
  container.register('ConfigService', ConfigService, ServiceLifetime.Singleton);
  const configService = container.resolve<ConfigService>('ConfigService');
  console.log('✅ ConfigService registered and resolved');

  // 3. Create page builder
  const pageBuilder = new PageBuilder();
  console.log('✅ PageBuilder created');

  // 4. Build a page
  const page = pageBuilder
    .setTitle('Welcome to Universal CMS')
    .setMetadata({
      locale: 'en-US',
      seo: {
        description: 'A demonstration of the Universal CMS framework',
        keywords: ['cms', 'typescript', 'framework']
      }
    })
    .addComponent('header', HeaderComponent)
    .addComponent('content', ContentComponent, {
      content: `
        <h2>Welcome to Universal CMS</h2>
        <p>This is a demonstration of the Universal Content Management System framework.</p>
        <ul>
          <li>✅ Modular component architecture</li>
          <li>✅ Dependency injection container</li>
          <li>✅ TypeScript support</li>
          <li>✅ Extensible plugin system</li>
        </ul>
      `
    })
    .addComponent('footer', FooterComponent)
    .build();

  console.log('✅ Page built with components');

  // 5. Render the page
  const renderContext = {
    services: configService,
    request: { url: '/', method: 'GET' },
    response: { headers: {}, statusCode: 200 }
  };

  const result = await page.render(renderContext);
  console.log('✅ Page rendered successfully');

  // 6. Display results
  console.log('\n📄 Generated HTML:');
  console.log('─'.repeat(50));
  console.log(result.html);
  console.log('─'.repeat(50));

  console.log('\n🎨 Generated CSS:');
  console.log('─'.repeat(50));
  console.log(result.css);
  console.log('─'.repeat(50));

  // 7. Cleanup
  container.dispose();
  console.log('\n🧹 Cleanup completed');
}

// Run the example if this file is executed directly
if (require.main === module) {
  runCMSExample()
    .then(() => {
      console.log('\n🎉 CMS Example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error running CMS Example:', error);
      process.exit(1);
    });
}

export {
  ConfigService,
  HeaderComponent,
  ContentComponent,
  FooterComponent,
  runCMSExample
};