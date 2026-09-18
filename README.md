# Contract Balance Watcher

I need to see a prototype web page that displays:

Rows of contracts and their details like contract id, due date, and key identifiers like Deal Number, PTD, Bill Of Lading, Invoice Numbers, and most importantly the current outstanding balance for each

The tricky part is that Contact ID and Deal Number will probably be singular values. Whereas fields like PTD, Bill of Lading, and Invoice Number may contain multiple values. There will only be one outstanding balance for each contract.

We'd also like to have the ability to view all of the Buy Transactions that were applied to the contract that have changed its balance over time. I'm not sure whether these transactions should be displayed on this list page, or in a separate detail page. I'll leave it to you to decide.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c51fe33-ca05-4fb9-a1e0-7a1a37f8b3e1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
