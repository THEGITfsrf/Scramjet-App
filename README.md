<p align="center"><img src="https://raw.githubusercontent.com/MercuryWorkshop/scramjet/main/assets/scramjet.png" height="200"></p>

<h1 align="center">Scramjet Demo</h1>

Demo app of using Scramjet, an experimental interception based web proxy that aims to be the successor to Ultraviolet. It is designed with security, developer friendliness, and performance in mind. Scramjet strives to have a clean, organized codebase to improve maintainability. Scramjet is made to evade internet censorship and bypass arbitrary web browser restrictions.

## Setup / Usage

Install dependencies
```
pnpm install
```
To get the latest Scramjet build, download it from the [GitHub Releases page on the Scramjet repository](https://github.com/MercuryWorkshop/scramjet/releases/tag/latest) (looks like `mercuryworkshop-scramjet-x.x.x-dev.tgz`). Move the contents of the tarball to to the `scramjet/` folder in the root directory of this project.

Run the server
```
pnpm start
```

### HTTP Transport

The example uses [EpoxyTransport](https://github.com/MercuryWorkshop/EpoxyTransport) to fetch proxied data encrypted.

You may also want to use [CurlTransport](https://github.com/MercuryWorkshop/CurlTransport), a different way of fetching encrypted data.

See the [bare-mux](https://github.com/MercuryWorkshop/bare-mux) documentation for more information.
