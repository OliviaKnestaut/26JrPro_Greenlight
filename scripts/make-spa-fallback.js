/*
    Copies build/client/index.html into subfolders for specific client routes so direct navigation works
    Usage: node scripts/make-spa-fallback.js
*/
import fs from 'fs/promises';
import path from 'path';

const buildDir = path.resolve('build/client');
const indexPath = path.join(buildDir, 'index.html');

const routes = [
    'database-dump',
    'antd-example',
    'event-submissions',
    'purchase-requests',
    'budget',
    'resources',
    'calendar',
    'org-members',
    'login',
    'test-form'
];

async function ensureDirAndCopy(route) {
    const targetDir = path.join(buildDir, route);
    const targetIndex = path.join(targetDir, 'index.html');
    try {
        await fs.mkdir(targetDir, { recursive: true });
        await fs.copyFile(indexPath, targetIndex);
        console.log(`Copied index.html -> ${path.join(route, 'index.html')}`);
    } catch (err) {
        console.error(`Failed to copy for route ${route}:`, err);
        throw err;
    }
}

async function main() {
    try {
        await fs.access(indexPath);
    } catch (err) {
        console.error('build/client/index.html not found. Run `npm run build` first.');
        process.exit(2);
    }

    for (const r of routes) {
        await ensureDirAndCopy(r);
    }

    console.log('SPA fallback index copies created for routes:', routes.join(', '));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
