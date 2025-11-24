# Greenlight: IDM 371-372 Junior Project

Live Site: [https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/](https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/)

Status Post Framer Site: [https://26jrprojgreenlight.framer.website](https://26jrprojgreenlight.framer.website)


## React Support

[React Router Docs](https://reactrouter.com/)

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

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Using Ant Design (v5)

This project uses Ant Design v5 and imports the `reset.css` file which exposes
design tokens as CSS variables. To make fine-grained, CSS-driven customizations
you can edit `app/antd-custom.css` (already imported by `app/root.tsx`).

Quick start:

1. Install dependencies (if you haven't already):

```bash
npm install
```

2. Start the dev server and visit `/antd-example` to see the sample component:

```bash
npm run dev
```

3. Edit `app/antd-custom.css` to override token variables (examples included).

Notes:
- `app/antd-custom.css` is intentionally small and contains a primary color
	example (`--ant-primary-color`) — use browser devtools to discover other
	`--ant-...` CSS variables you can override.
- If you need programmatic token control or runtime theme switching, we can
	reintroduce `ConfigProvider` token overrides; CSS variables are best for
	static, CSS-first overrides.

 <!--
## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

-->
