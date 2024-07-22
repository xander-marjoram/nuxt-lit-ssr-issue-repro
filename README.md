## Description of the issue

This is a minimal reproduction of an SSR issue we have been experiencing in Nuxt. The issue occurs when you have an object prop, and you use the contents of this object to alter the render output.

During SSR, the prop value is correct. During CSR, the prop is undefined.
When the prop is undefined, the render function returns `nothing`.
When the prop is defined, an element is rendered, applying a value from the prop to an attribute.

In the console you will see the following error:
> Error: Hydration value mismatch: Primitive found where TemplateResult expected. This usually occurs due to conditional rendering that resulted in a different value or template being rendered between the server and client.

This makes sense because we are in fact rendering different things on the client and the server. However, this error breaks hydration and prevents any clientside code, e.g., `firstUpdated` from running.

I noticed that if you change `type="${type}"` in the render template to simply `type="submit"`, there is no SSR error, even though the resolved value should be the same.


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
