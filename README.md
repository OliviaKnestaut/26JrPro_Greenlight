# amy branch

# Greenlight: IDM 371-372 Junior Project
# Maple's Branch

Live Site: [https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/](https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/)

Status Post Framer Site: [https://26jrprojgreenlight.framer.website](https://26jrprojgreenlight.framer.website)


## Running Project Locally

[React Router Docs](https://reactrouter.com/)

#### Git Commands

Git pull on personal branch and main branch:

```bash
git pull
```

If personal is behind main, on personal branch:

```bash
git merge main
```

#### Installation

Install the dependencies:

```bash
npm install
```

#### Development

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

## Using and Styling Ant Design (v5)

This project uses Ant Design v5 and imports the `reset.css` file which exposes design tokens as CSS variables. To make fine-grained, CSS-driven customizations you can edit `app/antd-custom.css` (already imported by `app/root.tsx`).

Start the dev server and visit [http://localhost:5173/~ojk25/jrProjGreenlight/antd-example](http://localhost:5173/~ojk25/jrProjGreenlight/antd-example) to see the sample component:

- Edit `app/antd-custom.css` to override token variables (examples included).
  - `app/antd-custom.css` is intentionally small — use [https://ant.design/theme-editor](https://ant.design/theme-editor) to identify CSS variables you can override.
- Also use `ConfigProvider` token overrides: example
  ```
  <ConfigProvider
	theme={{
		"components": {
			"Menu": {
			"colorBgContainer": "var(--primary)",
			"colorText": "var(--background-2)",
			"itemHoverBg": "var(--primary)",
			"itemBorderRadius": 0,
			"itemMarginInline": 0,
			"itemMarginBlock": 0,
			},
			"Button": {
				"colorText": "var(--background-2)",
			}
		}
	}} >  <ConfigProvider/>```
