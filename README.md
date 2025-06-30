<p align="center"><img src="https://raw.githubusercontent.com/MercuryWorkshop/scramjet/main/assets/scramjet.png" height="200"></p>

<h1 align="center">Scramjet Demo</h1>

The deployable all-in-one bundle for [Ultraviolet](https://github.com/titaniumnetwork-dev/Ultraviolet), a highly sophisticated proxy used for evading internet censorship or accessing websites in a controlled sandbox using the power of service-workers and more!

Demo app of using Scramjet, an experimental interception based web proxy that aims to be the successor to Ultraviolet. It is designed with security, developer friendliness, and performance in mind. Scramjet strives to have a clean, organized codebase to improve maintainability. Scramjet is made to evade internet censorship and bypass arbitrary web browser restrictions.

## Deployment

Install dependencies
```
pnpm install
```
To get the latest Scramjet build, download it from the [GitHub Releases page on the Scramjet repositor](https://github.com/MercuryWorkshop/scramjet/releases/tag/latest). Move the contents to the `scramjet/` folder in the root directory of this project.

Run the server
```
pnpm start
```

<!-- [![Run on Replit](https://binbashbanana.github.io/deploy-buttons/buttons/remade/replit.svg)](https://github.com/titaniumnetwork-dev/Ultraviolet-App/wiki/Run-on-Replit)
[![Deploy on Railway](https://binbashbanana.github.io/deploy-buttons/buttons/remade/railway.svg)](https://github.com/titaniumnetwork-dev/Ultraviolet-App/wiki/Deploy-on-Railway)
[![Remix on Glitch](https://binbashbanana.github.io/deploy-buttons/buttons/remade/glitch.svg)](https://github.com/titaniumnetwork-dev/Ultraviolet-App/wiki/Remix-on-Glitch)
[![Deploy to Koyeb](https://binbashbanana.github.io/deploy-buttons/buttons/remade/koyeb.svg)](https://github.com/titaniumnetwork-dev/Ultraviolet-App/wiki/Deploy-to-Koyeb)

If you are deploying to an alternative service or to a server, refer to [Deploy via terminal](https://github.com/titaniumnetwork-dev/Ultraviolet-App/wiki/Deploy-via-terminal).

Additional information such as [customizing your frontend](https://github.com/titaniumnetwork-dev/Ultraviolet-App/wiki/Customizing-your-frontend) can be found on the [wiki](https://github.com/titaniumnetwork-dev/Ultraviolet-App/wiki).

Support and updates can be found in our [Discord Server](discord.gg/unblock).

> [!IMPORTANT]  
> Until deployed on a domain with a valid SSL certificate, Firefox will not be able to load the site. Use chromium for testing on localhost -->

### HTTP Transport

The example uses [EpoxyTransport](https://github.com/MercuryWorkshop/EpoxyTransport) to fetch proxied data encrypted.

You may also want to use [CurlTransport](https://github.com/MercuryWorkshop/CurlTransport), a different way of fetching encrypted data.

See the [bare-mux](https://github.com/MercuryWorkshop/bare-mux) documentation for more information.
