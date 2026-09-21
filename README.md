# Modern Pursuit 3D Simulator

This folder is a standalone GitHub Pages site containing only the modern Three.js pursuit simulator.

## Run locally

From this folder:

```bash
python -m http.server 8000
```

Open <http://localhost:8000/>.

## Deploy to GitHub Pages

Use the contents of this folder as the root of a new GitHub repository:

```text
modern-site-repository/
├── .github/workflows/pages.yml
├── .nojekyll
├── index.html
├── modern3d.js
└── styles.css
```

Then:

1. Create a new GitHub repository.
2. Copy the contents of this folder into the repository root, including `.github`.
3. Commit and push to the `main` branch.
4. Open **Settings > Pages** in GitHub.
5. Select **GitHub Actions** as the source.
6. Wait for the deployment workflow to complete.

The published URL will be:

```text
https://YOUR-USER.github.io/YOUR-REPOSITORY/
```

The simulator loads Three.js from a CDN, so visitors need internet access for the 3D scene.
