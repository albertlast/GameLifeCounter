# GameLifeCounter

Is a basic life counter for games,
it can handle two persons at the same time.

You can use the setting menu to switch to fullscreen.
When android with chromebase browser is used,
you can also disable the screensaver (enable wakelock).

Support pwa -> can be installed locally on supported devices.

![App](doc/App.png)

## Requirments

Only a webserver to delifer the js files is needed,
the website runs full on client side.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```
