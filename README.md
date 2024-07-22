## Setup

Make sure to install the dependencies. Node and Yarn versions are listed in the Volta config in `package.json`.

```bash
# yarn
yarn install
```

## Building locally

You may need to run `npx nuxt build` to generate the `.nuxt` directory. This will then fail with a rollup error but after that you can run `yarn build` which runs rollup.

## Development Server

Start the development server on `http://localhost:3000`:

There will be some console errors (`DeprecationWarning` within `@vue/serverrenderer`, and `parse5` sourcemap warnings) but these don't seem to affect anything.

```bash
# yarn
yarn build && yarn dev
```
