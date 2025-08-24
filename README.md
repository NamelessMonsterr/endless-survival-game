# Endless Survival Game (Phaser 3)

Atmospheric silhouette endless survival game with mobile joystick + desktop controls.

## Run locally

Because we use ES modules, you must run a local server (opening file:// won’t work). Easiest options:

### Option A: Python
```bash
cd endless-survival-game
python3 -m http.server 8080
# open http://localhost:8080
```

### Option B: Node
```bash
npx http-server -p 8080
# open http://localhost:8080
```

## Controls
- **Desktop**: Arrow keys / WASD to move, **Space/Up** to jump.
- **Mobile**: Left **virtual joystick** to move, tap right side to **jump**, hold to **dash**.

## Host for free

### GitHub Pages
1. Create a new repo and push the project.
2. In repo settings → Pages → Source: **Deploy from branch**, select `main` and `/ (root)`.
3. Wait for the green check, your game will be live at the Pages URL.

### Netlify
1. Drag & drop the folder on app.netlify.com or connect your Git repo.
2. Build command: _none_ (static), Publish directory: `/`.
3. Deploy and share your URL.

## Assets
All images are simple silhouette placeholders; replace them with your own art.
Audio files are basic generated tones; replace with your own SFX/BGM for polish.
