# Rules

## Board Setup

The board has 5 rows and 11 columns. The rows are numbered from 1 to 5, and the columns are lettered from A to K. The board is set up as follows:


|   | A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | f | - | - | - | - | - | - | - | - | - | f |
| 2 | f | - | - | - | - | - | - | - | - | - | f |
| 3 | h | - | - | - | - | - | - | - | - | - | h |
| 4 | f | - | - | - | - | - | - | - | - | - | f |
| 5 | f | - | - | - | - | - | - | - | - | - | f |

The board is set up with the following pieces:

- `f`: Fish
- `h`: Hunter

### Safe Zones

Columns `A` and `K` are safe zones. Opponents cannot move into these columns.

### Beaches

Columns `E` and `G` are beaches, each team can only have two pieces on each beach at a time.

### River

Column `F` is a river, each team can only have one piece in the river at a time.

## Movement

You can choose to move either two fish, or the hunter. You cannot jump pieces.

### Fish

Fish can move up to two squares in any direction

### Hunter

A hunter can move one square in straight lines.

## Capture

When capturing a piece, you gain that piece for yourself and it gets sent to your safe zone. If a piece moves into a location where it would be captured, such as two hunters touching, the mover is captured.

### Fish

To capture a piece with a fish, you must have a piece either side of one of your opponents. In the following example, the two fish labelled `1` will capture a piece labelled `2`:

Will Capture:
|   |   |   |
|---|---|---|
| 1 | 2 | 1 |

|   |
|---|
| 1 |
| 2 |
| 1 |

> Diagonals to be decided on balance

### Hunter

Hunters will capture any piece within the 8 squares around them. In the following example, the hunter labelled `1` will capture any pieces in the squares labelled `2`:

Will Capture:

|   |   |   |
|---|---|---|
| 2 | 2 | 2 |
| 2 | 1 | 2 |
| 2 | 2 | 2 |

# Svelte Stuff

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
