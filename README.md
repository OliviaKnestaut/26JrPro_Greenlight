# Greenlight: IDM 371-372 Junior Project

Live Site: [https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/](https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/)

Status Post Framer Site: [https://26jrprojgreenlight.framer.website](https://26jrprojgreenlight.framer.website)


## Running Project Locally

[React Router Docs](https://reactrouter.com/)

### Git Commands

Git pull on personal branch and main branch:

```bash
git pull
```

If personal is behind main, on personal branch:

```bash
git merge main
```

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173/~ojk25/jrProjGreenlight/).

## Building for Production

Create a production build:

```bash
npm run build
```

## Using Ant Design (v5)

This project uses Ant Design v5 and imports the `reset.css` file which exposes
design tokens as CSS variables. To make fine-grained, CSS-driven customizations
you can edit `app/antd-custom.css` (already imported by `app/root.tsx`).

Start the dev server and visit [http://localhost:5173/~ojk25/jrProjGreenlight/antd-example](http://localhost:5173/~ojk25/jrProjGreenlight/antd-example) to see the sample component:

Edit `app/antd-custom.css` to override token variables (examples included).

Notes:
- `app/antd-custom.css` is intentionally small and contains a primary color
	example (`--ant-primary-color`) — use browser devtools to discover other
	`--ant-...` CSS variables you can override.
- If you need programmatic token control or runtime theme switching, we can
	reintroduce `ConfigProvider` token overrides; CSS variables are best for
	static, CSS-first overrides.
