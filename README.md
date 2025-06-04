## Scaffold: React + Storybook + NX + Atomic Design + MUI

### 🧱 Tooling Stack
- **NX Monorepo**
- **React** (with TypeScript)
- **Material UI (MUI)**
- **Storybook**
- **Atomic Design structure**

---

### 📁 Project Structure (simplified)

```
vibe-coding/
├── libs/
│     ├── atoms/           # Smallest UI components
|   ( ├── design-system/   # Configuration for shared storybook )
│     ├── molecules/       # Combinations of atoms
│     ├── organisms/       # Sections of UI
│     ├── templates/       # Layouts with placeholder data
│     └── pages/           # Full pages composed from templates
├── package.json
├── nx.json
└── tsconfig.base.json
```

---

### 📦 Commands to Scaffold This Project

```bash
npx create-nx-workspace@latest vibe-coding
cd vibe-coding

# Add Material UI
npm install @mui/material @emotion/react @emotion/styled

# Create UI library for atomic components
nx g @nx/react:library libs/atoms
nx g @nx/react:library libs/molecules
nx g @nx/react:library libs/organisms
nx g @nx/react:library libs/templates
nx g @nx/react:library libs/pages

# Create UI library for shared storybook for all atomic design libraries
nx g @nx/react:library libs/design-system 

# Add Storybook support
npx nx add @nx/storybook 

# Modify 
# * libs/design-system/.storybook/main.ts to include all stories

# Run shared storybook
npx nx run design-system:storybook 
```

---

### ✅ Run storybook

```bash
npm run storybook
```
### ✅ Run AI generative prompt
* 
* install dependencies for scripts 
```bash
cd scripts/storybook
mpm i
cd ../..
npm run generate:stories -- -m simple -l atoms
```
At the root of your project
```bash
touch .env
in the file:
OPENAI_API=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
* run the script to generate stories for all atomic design libraries
```bash
npm run generate:stories:lib -l atoms
```
* run the script to generate "simple prompt" stories for all atomic design libraries
```bash
npm run generate:stories:lib atoms
# same as:
npm run generate:stories -- -m simple -l atoms
```
* run the script to generate "advanced prompt" stories for all atomic design libraries
```bash
npm run generate:stories:lib atoms
# same as:
npm run generate:stories -- -m advanced -l atoms
```
